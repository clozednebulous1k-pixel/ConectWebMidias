const CDN = "https://www.gstatic.com/firebasejs/10.12.2";
const LOCAL_KEY = "conect.leads";
const LOCAL_ADMIN = { user: "adm", pass: "conect2026" };

const config = window.FIREBASE_CONFIG || {};
const useFirebase = Boolean(config.apiKey && config.projectId);

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function limpar(valor, limite) {
  if (valor == null) return "";
  return String(valor).replace(/[\u0000-\u001f\u007f]/g, "").slice(0, limite);
}

// Mantem apenas os campos previstos e corta tamanhos antes de sair do navegador.
// As mesmas regras existem no Firestore, aqui e so para evitar trafego inutil.
function sanitizar(lead) {
  const limites = {
    nome: 80,
    telefone: 30,
    email: 120,
    empresa: 120,
    frente: 60,
    sinal: 60,
    secao: 60,
    faturamento: 60,
    contexto: 1500,
    brief: 1500,
    origem: 40,
  };
  const saida = {};
  Object.keys(limites).forEach((campo) => {
    if (lead[campo] === undefined) return;
    saida[campo] = limpar(lead[campo], limites[campo]);
  });
  return saida;
}

const localApi = {
  mode: "local",
  async save(lead) {
    const list = readLocal();
    list.unshift({ ...sanitizar(lead), criadoEm: new Date().toISOString() });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("leads:changed"));
  },
  subscribe(callback) {
    const push = () => callback(readLocal());
    window.addEventListener("leads:changed", push);
    push();
    return () => window.removeEventListener("leads:changed", push);
  },
  async login(user, pass) {
    if (String(user).trim() !== LOCAL_ADMIN.user || pass !== LOCAL_ADMIN.pass) {
      throw new Error("Usuário ou senha incorretos.");
    }
    const conta = { email: LOCAL_ADMIN.user };
    localApi.usuario = conta;
    return conta;
  },
  async logout() {
    localApi.usuario = null;
  },
  onAuth(callback) {
    callback(localApi.usuario || null);
    return () => {};
  },
  async clear() {
    localStorage.removeItem(LOCAL_KEY);
    window.dispatchEvent(new CustomEvent("leads:changed"));
  },
  usuario: null,
};

// Fallback usado quando o Firebase esta configurado mas nao carregou.
// Continua guardando o lead no navegador para nao perder o contato,
// mas nunca libera o painel com a senha provisoria.
function apiDegradada() {
  return {
    ...localApi,
    mode: "offline",
    async login() {
      throw new Error("Sem conexão com o servidor. Tente novamente em instantes.");
    },
    subscribe(callback) {
      callback([]);
      return () => {};
    },
  };
}

async function buildFirebase() {
  const [{ initializeApp }, store, auth] = await Promise.all([
    import(`${CDN}/firebase-app.js`),
    import(`${CDN}/firebase-firestore.js`),
    import(`${CDN}/firebase-auth.js`),
  ]);

  const app = initializeApp(config);
  const db = store.getFirestore(app);
  const session = auth.getAuth(app);
  const leads = store.collection(db, "leads");

  return {
    mode: "firebase",
    get usuario() {
      return session.currentUser;
    },
    async save(lead) {
      await store.addDoc(leads, { ...sanitizar(lead), criadoEm: store.serverTimestamp() });
    },
    subscribe(callback, onError) {
      const q = store.query(leads, store.orderBy("criadoEm", "desc"), store.limit(500));
      return store.onSnapshot(
        q,
        (snap) => {
          callback(
            snap.docs.map((doc) => {
              const data = doc.data();
              const stamp = data.criadoEm?.toDate?.();
              return { id: doc.id, ...data, criadoEm: stamp ? stamp.toISOString() : "" };
            })
          );
        },
        (error) => {
          callback([]);
          onError?.(error);
        }
      );
    },
    async login(user, pass, manterConectado) {
      const email = String(user).includes("@") ? String(user).trim() : window.ADMIN_EMAIL || "";
      await auth.setPersistence(
        session,
        manterConectado ? auth.browserLocalPersistence : auth.browserSessionPersistence
      );
      const cred = await auth.signInWithEmailAndPassword(session, email, pass);
      return cred.user;
    },
    async logout() {
      await auth.signOut(session);
    },
    onAuth(callback) {
      return auth.onAuthStateChanged(session, callback);
    },
    async remover(id) {
      await store.deleteDoc(store.doc(db, "leads", id));
    },
    async clear() {
      throw new Error("Apague os registros pelo console do Firebase.");
    },
  };
}

window.LeadsReady = (async () => {
  if (!useFirebase) {
    window.Leads = localApi;
    return localApi;
  }
  try {
    const api = await buildFirebase();
    window.Leads = api;
    return api;
  } catch (error) {
    console.warn("Firebase indisponível.", error);
    const api = apiDegradada();
    window.Leads = api;
    return api;
  }
})();
