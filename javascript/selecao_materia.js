const conteudosPorMateria = {
  quimica: ["Tabela Periódica", "Reações Químicas", "Ligação Covalente"],
  fisica: ["Resistores", "Capacitores", "Geradores", "Blocos", "Plano Inclinado", "Roldanas"]
};

const estilosPorMateria = {
  quimica: ["Molecular", "3D", "Esquemático", "Minimalista"],
  fisica: ["Mecânica", " Óptica", "Eletricidade", "Termodinâmica"]
};

function atualizarConteudos() {
  const materiaSelecionada = document.getElementById("opcoes-materia").value;
  const conteudoSelect = document.getElementById("conteudo");
  const estiloSelect = document.getElementById("estilo-imagem")


  conteudoSelect.innerHTML = "";
  estiloSelect.innerHTML = "";

  const opcaoPadraoConteudo = document.createElement("option");
  opcaoPadraoConteudo.value = "";
  opcaoPadraoConteudo.textContent = "Selecione o conteúdo...";
  conteudoSelect.appendChild(opcaoPadraoConteudo);

  if (materiaSelecionada && conteudosPorMateria[materiaSelecionada]) {
    conteudosPorMateria[materiaSelecionada].forEach(conteudo => {
      const opcao = document.createElement("option");
      opcao.value = conteudo.toLowerCase().replace(/\s+/g, '-');
      opcao.textContent = conteudo;
      conteudoSelect.appendChild(opcao);
    });
  }

  // -------------------
  // Preencher ESTILOS
  // -------------------
  const opcaoPadraoEstilo = document.createElement("option");
  opcaoPadraoEstilo.value = "";
  opcaoPadraoEstilo.textContent = "Selecione o Estilo...";
  estiloSelect.appendChild(opcaoPadraoEstilo);

  if (materiaSelecionada && estilosPorMateria[materiaSelecionada]) {
    estilosPorMateria[materiaSelecionada].forEach(estilo => {
      const opcao = document.createElement("option");
      opcao.value = estilo.toLowerCase().replace(/\s+/g, '-');
      opcao.textContent = estilo;
      estiloSelect.appendChild(opcao);
    });
  }
}

