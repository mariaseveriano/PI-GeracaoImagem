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

// ========== MENU MOBILE ==========
function toggleMenuMobile() {
  const menuMobile = document.getElementById('menuMobile');
  const overlay = document.getElementById('menuMobileOverlay');

  menuMobile.classList.toggle('active');
  overlay.classList.toggle('active');

  // Prevenir scroll do body quando menu está aberto
  if (menuMobile.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

function logout() {
  // Se você salva login localmente, limpa os dados
  localStorage.removeItem('usuarioLogado');
  sessionStorage.removeItem('usuarioLogado');

  // Redireciona para a tela de login
  window.location.href = "../login/login.html";
}

// Função para abrir o pop-up e mostrar a imagem
function openPopup(imageUrl, materia, conteudo, estilo) {
  const popupOverlay = document.getElementById('popupOverlay');
  const loadingContainer = document.getElementById('loadingContainer');
  const imageResultContainer = document.getElementById('imageResultContainer');
  const generatedImage = document.getElementById('generatedImage');

  // Preencher informações
  document.getElementById('infoMateria').textContent = materia || 'Não especificada';
  document.getElementById('infoConteudo').textContent = conteudo || 'Não especificado';
  document.getElementById('infoEstilo').textContent = estilo || 'Não especificado';

  // Resetar chat
  resetChat();

  // Mostrar overlay e pop-up
  popupOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevenir scroll

  // Mostrar loading
  loadingContainer.style.display = 'flex';
  imageResultContainer.classList.remove('active');

  // Simular carregamento da imagem
  setTimeout(() => {
    generatedImage.src = imageUrl;

    // Quando a imagem carregar, esconder loading e mostrar resultado
    generatedImage.onload = () => {
      loadingContainer.style.display = 'none';
      imageResultContainer.classList.add('active');
    };

    // Se houver erro ao carregar
    generatedImage.onerror = () => {
      loadingContainer.innerHTML = `
              <i class='bx bx-error' style='font-size: 60px; color: #ff4d4d;'></i>
              <p class="loading-text" style="color: #ff4d4d;">Erro ao carregar a imagem</p>
              <button class="btn-enviar" onclick="closePopup()" style="margin-top: 20px;">Fechar</button>
          `;
    };
  }, 1000); // Simula 1 segundo de carregamento
}

// Função para fechar o pop-up
function closePopup() {
  const popupOverlay = document.getElementById('popupOverlay');
  popupOverlay.classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll

  // Resetar após a animação
  setTimeout(() => {
    const loadingContainer = document.getElementById('loadingContainer');
    const imageResultContainer = document.getElementById('imageResultContainer');
    loadingContainer.style.display = 'flex';
    loadingContainer.innerHTML = `
          <div class="loading-spinner"></div>
          <p class="loading-text">Gerando sua imagem...</p>
      `;
    imageResultContainer.classList.remove('active');
    resetChat();
  }, 500);
}

// Função para resetar o chat
function resetChat() {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = `
      <div class="chat-message">
          <div class="chat-avatar">
              <i class='bx bx-bot'></i>
          </div>
          <div class="chat-bubble">
              Olá! Gostaria de adicionar ou modificar algo na imagem? Posso ajudar a refinar detalhes, mudar cores, adicionar elementos ou ajustar o estilo!
          </div>
      </div>
  `;
  document.getElementById('chatInput').value = '';
}

// Função para enviar mensagem no chat
function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();

  if (!message) return;

  // Adicionar mensagem do usuário
  addChatMessage(message, 'user');
  chatInput.value = '';

  // Auto-resize do textarea
  chatInput.style.height = 'auto';

  // Desabilitar botão enquanto processa
  const sendBtn = document.getElementById('chatSendBtn');
  sendBtn.disabled = true;

  // Simular resposta do bot (aqui você integraria com sua API)
  setTimeout(() => {
    const botResponse = generateBotResponse(message);
    addChatMessage(botResponse, 'bot');
    sendBtn.disabled = false;

    // Aqui você poderia fazer uma nova requisição para regenerar a imagem
    // com as modificações solicitadas
  }, 1500);
}

// Função para adicionar mensagem ao chat
function addChatMessage(message, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.innerHTML = sender === 'user'
    ? '<i class="bx bx-user"></i>'
    : '<i class="bx bx-bot"></i>';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = message;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);

  // Scroll para o final
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para gerar resposta do bot (simulação)
function generateBotResponse(userMessage) {
  const responses = [
    'Entendi! Vou adicionar essas modificações à imagem. Aguarde um momento...',
    'Ótima sugestão! Estou ajustando os detalhes agora.',
    'Perfeito! Vou refinar a imagem com essas alterações.',
    'Compreendi suas solicitações. Gerando nova versão...',
    'Legal! Vou aplicar essas mudanças na imagem.'
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Auto-resize do textarea
document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');

  if (chatInput) {
    chatInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Enviar com Enter (Shift+Enter para nova linha)
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
});

// Função para baixar a imagem
function downloadImage() {
  const generatedImage = document.getElementById('generatedImage');
  const link = document.createElement('a');
  link.href = generatedImage.src;
  link.download = `pictura-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Feedback visual
  addChatMessage('✅ Imagem baixada com sucesso!', 'bot');
}

// Função para compartilhar (pode ser expandida)
function shareImage() {
  const generatedImage = document.getElementById('generatedImage');

  if (navigator.share) {
    // Se o navegador suporta Web Share API
    fetch(generatedImage.src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'pictura-image.png', { type: 'image/png' });
        navigator.share({
          title: 'Imagem Pictura',
          text: 'Confira esta imagem gerada pelo Pictura!',
          files: [file]
        }).then(() => {
          addChatMessage('✅ Imagem compartilhada!', 'bot');
        });
      })
      .catch(err => {
        addChatMessage('❌ Não foi possível compartilhar a imagem.', 'bot');
        console.error(err);
      });
  } else {
    // Fallback: copiar link
    addChatMessage('ℹ️ Funcionalidade de compartilhamento não disponível neste navegador.', 'bot');
  }
}

// Função para nova geração
function newGeneration() {
  closePopup();
  // Limpar formulário
  document.getElementById('picturaForm').reset();
}

// Fechar ao clicar no overlay
document.addEventListener('DOMContentLoaded', () => {
  const popupOverlay = document.getElementById('popupOverlay');
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        closePopup();
      }
    });
  }
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay && popupOverlay.classList.contains('active')) {
      closePopup();
    }
  }
});

// Modificar o submit do formulário para abrir o pop-up
document.getElementById('picturaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Pegar valores do formulário
  const materia = document.getElementById('opcoes-materia').value;
  const conteudo = document.getElementById('conteudo').value;
  const estilo = document.getElementById('estilo-imagem').value;
  const infoAdicional = document.getElementById('info-adicional').value;

  // Validação básica
  if (!materia || !conteudo || !estilo) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  const imageUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

  // Abrir pop-up com a imagem
  openPopup(imageUrl, materia, conteudo, estilo);
});