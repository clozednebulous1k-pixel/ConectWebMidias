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

function writeLocal(list) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

const localApi = {
  mode: "local",
  async save(lead) {
    const list = readLocal();
    list.unshift({ ...lead, criadoEm: new Date().toISOString() });
    writeLocal(list);
    window.dispatchEvent(new CustomEvent("leads:changed"));
  },
  subscribe(callback) {
    const push = () => callback(readLocal());
    window.addEventListener("leads:changed", push);
    push();
    return () => window.removeEventListener("leads:changed", push);
  },
  async login(user, pass) {
    if (user.trim() !== LOCAL_ADMIN.user || pass !== LOCAL_ADMIN.pass) {
      throw new Error("Usuário ou senha incorretos.");
    }
    return { email: LOCAL_ADMIN.user };
  },
  async logout() {},
  async clear() {
    localStorage.removeItem(LOCAL_KEY);
    window.dispatchEvent(new CustomEvent("leads:changed"));
  },
};

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
    async save(lead) {
      await store.addDoc(leads, { ...lead, criadoEm: store.serverTimestamp() });
    },
    subscribe(callback) {
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
        () => callback([])
      );
    },
    async login(user, pass) {
      const email = user.includes("@") ? user.trim() : window.ADMIN_EMAIL;
      const cred = await auth.signInWithEmailAndPassword(session, email, pass);
      return cred.user;
    },
    async logout() {
      await auth.signOut(session);
    },
    async clear() {
      throw new Error("No modo Firebase, apague os registros pelo console.");
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
    console.warn("Firebase indisponível, usando modo local.", error);
    window.Leads = localApi;
    return localApi;
  }
})();
