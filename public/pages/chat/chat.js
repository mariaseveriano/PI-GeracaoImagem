// Dados
const conteudosPorMateria = {
  quimica: ["Tabela Periódica", "Reações Químicas", "Ligação Covalente"],
  fisica: ["Resistores", "Capacitores", "Geradores", "Blocos", "Plano Inclinado", "Roldanas"]
};

const estilosPorMateria = {
  quimica: ["Molecular", "3D", "Esquemático", "Minimalista"],
  fisica: ["3D", "Esquemático", "Minimalista"]
};

// Atualizar conteúdos e estilos
function atualizarConteudos() {
  const materiaSelecionada = document.getElementById("opcoes-materia").value;
  const conteudoSelect = document.getElementById("conteudo");
  const estiloSelect = document.getElementById("estilo-imagem");

  // Limpar selects
  conteudoSelect.innerHTML = "";
  estiloSelect.innerHTML = "";

  // Opção padrão - Conteúdo
  const opcaoPadraoConteudo = document.createElement("option");
  opcaoPadraoConteudo.value = "";
  opcaoPadraoConteudo.textContent = "Selecione o conteúdo...";
  conteudoSelect.appendChild(opcaoPadraoConteudo);

  // Adicionar conteúdos
  if (materiaSelecionada && conteudosPorMateria[materiaSelecionada]) {
    conteudosPorMateria[materiaSelecionada].forEach(conteudo => {
      const opcao = document.createElement("option");
      opcao.value = conteudo.toLowerCase().replace(/\s+/g, '-');
      opcao.textContent = conteudo;
      conteudoSelect.appendChild(opcao);
    });
  }

  // Opção padrão - Estilo
  const opcaoPadraoEstilo = document.createElement("option");
  opcaoPadraoEstilo.value = "";
  opcaoPadraoEstilo.textContent = "Selecione o Estilo...";
  estiloSelect.appendChild(opcaoPadraoEstilo);

  // Adicionar estilos
  if (materiaSelecionada && estilosPorMateria[materiaSelecionada]) {
    estilosPorMateria[materiaSelecionada].forEach(estilo => {
      const opcao = document.createElement("option");
      opcao.value = estilo.toLowerCase().replace(/\s+/g, '-');
      opcao.textContent = estilo;
      estiloSelect.appendChild(opcao);
    });
  }
}

// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  sidebar.classList.toggle("hidden");
  mainContent.classList.toggle("full-width");
}

// Event Listeners
document.getElementById("opcoes-materia").addEventListener("change", atualizarConteudos);

// Form Submit
document.getElementById("picturaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const materia = document.getElementById("opcoes-materia").value;
  const conteudo = document.getElementById("conteudo").value;
  const estilo = document.getElementById("estilo-imagem").value;
  const infoAdicional = document.getElementById("info-adicional").value;

  // Validação
  if (!materia || !conteudo || !estilo) {
    alert("Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  // Aqui você pode adicionar a lógica de envio
  console.log({
    materia,
    conteudo,
    estilo,
    infoAdicional
  });

  alert("Formulário enviado com sucesso!");
});