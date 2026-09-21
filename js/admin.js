(() => {
  const login = document.querySelector("[data-login]");
  const painel = document.querySelector("[data-painel]");
  const formLogin = document.querySelector("[data-login-form]");
  const campoEmail = document.querySelector("[data-login-email]");
  const campoSenha = document.querySelector("[data-login-pass]");
  const lembrar = document.querySelector("[data-login-remember]");
  const erroLogin = document.querySelector("[data-login-error]");
  const avisoModo = document.querySelector("[data-login-mode]");
  const botaoEntrar = document.querySelector("[data-login-submit]");
  const erroPainel = document.querySelector("[data-painel-error]");
  const linhas = document.querySelector("[data-linhas]");
  const vazio = document.querySelector("[data-vazio]");
  const busca = document.querySelector("[data-busca]");
  const filtroOrigem = document.querySelector("[data-filtro-origem]");
  const contagem = document.querySelector("[data-contagem]");
  const conta = document.querySelector("[data-conta]");

  const EMAIL_KEY = "conect.admin.email";
  let api = null;
  let todos = [];
  let cancelarLeitura = null;

  const mostrarErro = (el, texto) => {
    el.textContent = texto;
    el.hidden = !texto;
  };

  const traduzir = (error) => {
    const codigo = error?.code || "";
    if (codigo.includes("invalid-credential") || codigo.includes("wrong-password") || codigo.includes("user-not-found")) {
      return "E-mail ou senha incorretos.";
    }
    if (codigo.includes("invalid-email")) return "E-mail inválido.";
    if (codigo.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
    if (codigo.includes("network")) return "Sem conexão com o servidor.";
    if (codigo.includes("unauthorized-domain")) return "Este domínio não está autorizado no Firebase.";
    return error?.message || "Não foi possível entrar.";
  };

  const dataBonita = (iso) => {
    if (!iso) return "agora";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
  };

  const soDigitos = (valor) => String(valor || "").replace(/\D/g, "");

  // Monta cada celula com textContent: nada do que o visitante digitou
  // volta para a pagina como HTML.
  const celula = (texto, classe) => {
    const td = document.createElement("td");
    td.textContent = texto == null || texto === "" ? "—" : String(texto);
    if (classe) td.className = classe;
    return td;
  };

  const desenhar = () => {
    const termo = busca.value.trim().toLowerCase();
    const origem = filtroOrigem.value;

    const lista = todos.filter((lead) => {
      if (origem && lead.origem !== origem) return false;
      if (!termo) return true;
      return [lead.nome, lead.telefone, lead.email, lead.empresa, lead.secao, lead.frente, lead.sinal]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });

    linhas.replaceChildren();

    lista.forEach((lead) => {
      const tr = document.createElement("tr");
      tr.append(
        celula(dataBonita(lead.criadoEm), "col-data"),
        celula(lead.nome),
        celula(lead.telefone),
        celula(lead.origem),
        celula(lead.secao || lead.frente || lead.sinal),
        celula(lead.empresa),
        celula(lead.email),
        celula(lead.contexto || lead.brief, "col-texto")
      );

      const acoes = document.createElement("td");
      acoes.className = "col-acoes";
      const telefone = soDigitos(lead.telefone);
      if (telefone) {
        const zap = document.createElement("a");
        zap.className = "mini";
        zap.href = `https://wa.me/${telefone.length > 11 ? telefone : "55" + telefone}`;
        zap.target = "_blank";
        zap.rel = "noopener noreferrer";
        zap.textContent = "WhatsApp";
        acoes.append(zap);
      }
      tr.append(acoes);
      linhas.append(tr);
    });

    vazio.hidden = lista.length > 0;
    contagem.textContent = `${lista.length} de ${todos.length} ${todos.length === 1 ? "lead" : "leads"}`;
  };

  const atualizarResumo = () => {
    const agora = Date.now();
    const dia = 24 * 60 * 60 * 1000;
    const hoje = new Date().toDateString();

    const emHoras = (lead, horas) => {
      const t = new Date(lead.criadoEm).getTime();
      return !Number.isNaN(t) && agora - t <= horas;
    };

    const contadorOrigem = {};
    todos.forEach((lead) => {
      const chave = lead.origem || "site";
      contadorOrigem[chave] = (contadorOrigem[chave] || 0) + 1;
    });
    const top = Object.entries(contadorOrigem).sort((a, b) => b[1] - a[1])[0];

    document.querySelector("[data-total]").textContent = String(todos.length);
    document.querySelector("[data-hoje]").textContent = String(
      todos.filter((l) => new Date(l.criadoEm).toDateString() === hoje).length
    );
    document.querySelector("[data-semana]").textContent = String(todos.filter((l) => emHoras(l, 7 * dia)).length);
    document.querySelector("[data-origem-top]").textContent = top ? top[0] : "—";

    const atuais = new Set(todos.map((l) => l.origem).filter(Boolean));
    const selecionado = filtroOrigem.value;
    filtroOrigem.replaceChildren();
    const todasOpcao = document.createElement("option");
    todasOpcao.value = "";
    todasOpcao.textContent = "Todas as origens";
    filtroOrigem.append(todasOpcao);
    [...atuais].sort().forEach((valor) => {
      const op = document.createElement("option");
      op.value = valor;
      op.textContent = valor;
      filtroOrigem.append(op);
    });
    filtroOrigem.value = atuais.has(selecionado) ? selecionado : "";
  };

  const abrirPainel = (usuario) => {
    login.hidden = true;
    painel.hidden = false;
    conta.textContent = usuario?.email || "sessão local";
    mostrarErro(erroPainel, "");

    cancelarLeitura?.();
    cancelarLeitura = api.subscribe(
      (lista) => {
        todos = lista;
        atualizarResumo();
        desenhar();
      },
      (error) => {
        const semPermissao = String(error?.code || "").includes("permission-denied");
        mostrarErro(
          erroPainel,
          semPermissao
            ? "Esta conta está autenticada, mas não está na lista de administradores das regras do Firestore."
            : "Não foi possível carregar os leads: " + (error?.message || "erro desconhecido")
        );
      }
    );
  };

  const fecharPainel = () => {
    cancelarLeitura?.();
    cancelarLeitura = null;
    todos = [];
    painel.hidden = true;
    login.hidden = false;
    campoSenha.value = "";
  };

  document.querySelector("[data-toggle-pass]").addEventListener("click", (e) => {
    const botao = e.currentTarget;
    const mostrando = campoSenha.type === "text";
    campoSenha.type = mostrando ? "password" : "text";
    botao.setAttribute("aria-pressed", String(!mostrando));
    botao.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
    botao.querySelector("[data-eye-on]").hidden = !mostrando;
    botao.querySelector("[data-eye-off]").hidden = mostrando;
    campoSenha.focus();
  });

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarErro(erroLogin, "");
    botaoEntrar.disabled = true;
    botaoEntrar.textContent = "Entrando...";

    try {
      const usuario = await api.login(campoEmail.value, campoSenha.value, lembrar.checked);
      if (lembrar.checked) {
        localStorage.setItem(EMAIL_KEY, campoEmail.value.trim());
      } else {
        localStorage.removeItem(EMAIL_KEY);
      }
      campoSenha.value = "";
      abrirPainel(usuario);
    } catch (error) {
      mostrarErro(erroLogin, traduzir(error));
    } finally {
      botaoEntrar.disabled = false;
      botaoEntrar.textContent = "Entrar";
    }
  });

  document.querySelector("[data-logout]").addEventListener("click", async () => {
    await api.logout();
    fecharPainel();
  });

  document.querySelector("[data-csv]").addEventListener("click", () => {
    if (!todos.length) return;
    const colunas = ["criadoEm", "origem", "nome", "telefone", "empresa", "email", "secao", "frente", "sinal", "faturamento", "contexto", "brief"];
    // O prefixo protege contra formulas maliciosas ao abrir no Excel.
    const seguro = (v) => {
      const texto = String(v ?? "");
      const comEscape = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
      return `"${comEscape.replace(/"/g, '""')}"`;
    };
    const csv = [colunas.join(";"), ...todos.map((l) => colunas.map((c) => seguro(l[c])).join(";"))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `conect-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  busca.addEventListener("input", desenhar);
  filtroOrigem.addEventListener("change", desenhar);

  window.LeadsReady.then((pronto) => {
    api = pronto;

    const salvo = localStorage.getItem(EMAIL_KEY);
    if (salvo) campoEmail.value = salvo;

    if (api.mode === "local") {
      avisoModo.textContent = "Modo local: Firebase não configurado. Entre com adm e a senha provisória.";
      campoEmail.type = "text";
      campoEmail.placeholder = "adm";
    } else if (api.mode === "offline") {
      avisoModo.textContent = "Sem conexão com o Firebase. Recarregue a página.";
    } else {
      avisoModo.textContent = "";
    }

    api.onAuth((usuario) => {
      if (usuario) abrirPainel(usuario);
      else fecharPainel();
    });
  });
})();
