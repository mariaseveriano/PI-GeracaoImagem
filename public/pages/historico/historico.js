// VARIÁVEIS GLOBAIS
let historicoAtual = [];
let paginaAtual = 1;
const itensPorPagina = 12;

// CARREGAR HISTÓRICO DO SERVIDOR
async function carregarHistorico(pagina = 1) {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      mostrarMensagem('⚠️ Você precisa estar logado para ver o histórico', 'warning');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
      return;
    }

    mostrarLoading(true);

    const response = await fetch(`http://localhost:3000/api/history?page=${pagina}&limit=${itensPorPagina}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '../login/login.html';
        return;
      }
      throw new Error('Erro ao carregar histórico');
    }

    const data = await response.json();
    historicoAtual = data.data;
    paginaAtual = data.page;

    renderizarHistorico(historicoAtual);
    renderizarPaginacao(data.page, data.totalPages);

    mostrarLoading(false);

    if (historicoAtual.length === 0) {
      mostrarMensagem('📭 Nenhuma imagem gerada ainda. Vá para o Chat e crie sua primeira imagem!', 'info');
    }

  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    mostrarMensagem('❌ Erro ao carregar histórico: ' + error.message, 'error');
    mostrarLoading(false);
  }
}

// RENDERIZAR HISTÓRICO
function renderizarHistorico(itens) {
  const container = document.getElementById('historyList');

  if (!container) {
    console.error('Container historyList não encontrado');
    return;
  }

  if (itens.length === 0) {
    container.innerHTML = '<p class="texto-vazio">Nenhuma imagem no histórico</p>';
    return;
  }

  container.innerHTML = itens.map((item, index) => `
    <div class="history-card" data-id="${item._id}">
      <div class="history-image-container">
        <img 
          src="${item.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}" 
          alt="${item.conteudo}"
          class="history-image"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text x=%2250%%22 y=%2250%%22>❌</text></svg>'"
        />
        ${item.status === 'error' ? '<div class="error-badge">Erro</div>' : ''}
      </div>
      <div class="history-info">
        <h3 class="history-title">${item.conteudo}</h3>
        <div class="history-meta">
          <span class="meta-item">
            <i class='bx bx-book'></i>
            ${item.materia}
          </span>
          <span class="meta-item">
            <i class='bx bx-palette'></i>
            ${item.estilo}
          </span>
        </div>
        <div class="history-date">
          <i class='bx bx-time'></i>
          ${formatarData(item.createdAt)}
        </div>
      </div>
      <div class="history-actions">
        <button onclick="visualizarImagem('${item._id}')" class="btn-action btn-view" title="Visualizar">
          <i class='bx bx-show'></i>
        </button>
        <button onclick="baixarImagem('${item._id}')" class="btn-action btn-download" title="Baixar">
          <i class='bx bx-download'></i>
        </button>
        <button onclick="deletarItem('${item._id}')" class="btn-action btn-delete" title="Deletar">
          <i class='bx bx-trash'></i>
        </button>
      </div>
    </div>
  `).join('');
}

// FORMATAR DATA
function formatarData(dataString) {
  const data = new Date(dataString);
  const agora = new Date();
  const diff = agora - data;

  const segundos = Math.floor(diff / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 7) {
    return data.toLocaleDateString('pt-BR');
  } else if (dias > 0) {
    return `${dias} dia${dias > 1 ? 's' : ''} atrás`;
  } else if (horas > 0) {
    return `${horas} hora${horas > 1 ? 's' : ''} atrás`;
  } else if (minutos > 0) {
    return `${minutos} minuto${minutos > 1 ? 's' : ''} atrás`;
  } else {
    return 'Agora mesmo';
  }
}

// VISUALIZAR IMAGEM
async function visualizarImagem(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/history/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erro ao buscar imagem');

    const { data } = await response.json();

    // Abrir modal com a imagem
    abrirModal(data);

  } catch (error) {
    console.error('Erro ao visualizar:', error);
    mostrarMensagem('❌ Erro ao visualizar imagem', 'error');
  }
}

// MODAL DE VISUALIZAÇÃO
function abrirModal(item) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="fecharModal()">
        <i class='bx bx-x'></i>
      </button>
      <div class="modal-body">
        <img src="${item.imageData || item.imageUrl}" alt="${item.conteudo}" class="modal-image"/>
        <div class="modal-info">
          <h2>${item.conteudo}</h2>
          <div class="modal-details">
            <p><strong>Matéria:</strong> ${item.materia}</p>
            <p><strong>Estilo:</strong> ${item.estilo}</p>
            ${item.infoAdicional ? `<p><strong>Info Adicional:</strong> ${item.infoAdicional}</p>` : ''}
            <p><strong>Prompt:</strong> ${item.prompt}</p>
            <p><strong>Data:</strong> ${new Date(item.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <div class="modal-actions">
            <button onclick="baixarImagemModal('${item._id}')" class="btn-modal">
              <i class='bx bx-download'></i> Baixar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function fecharModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// BAIXAR IMAGEM
async function baixarImagem(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/history/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erro ao buscar imagem');

    const { data } = await response.json();

    const link = document.createElement('a');
    link.href = data.imageData || data.imageUrl;
    link.download = `pictura-${data.conteudo}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarMensagem('✅ Imagem baixada com sucesso!', 'success');

  } catch (error) {
    console.error('Erro ao baixar:', error);
    mostrarMensagem('❌ Erro ao baixar imagem', 'error');
  }
}

async function baixarImagemModal(id) {
  await baixarImagem(id);
  fecharModal();
}

// DELETAR ITEM
async function deletarItem(id) {
  if (!confirm('Tem certeza que deseja deletar esta imagem?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/history/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erro ao deletar');

    mostrarMensagem('✅ Imagem deletada com sucesso!', 'success');
    carregarHistorico(paginaAtual);

  } catch (error) {
    console.error('Erro ao deletar:', error);
    mostrarMensagem('❌ Erro ao deletar imagem', 'error');
  }
}

// LIMPAR TODO HISTÓRICO
async function clearHistory() {
  if (!confirm('⚠️ Tem certeza que deseja limpar TODO o histórico? Esta ação não pode ser desfeita!')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/history', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Erro ao limpar histórico');

    const data = await response.json();
    mostrarMensagem(`✅ ${data.deletedCount} imagens deletadas com sucesso!`, 'success');
    carregarHistorico(1);

  } catch (error) {
    console.error('Erro ao limpar:', error);
    mostrarMensagem('❌ Erro ao limpar histórico', 'error');
  }
}

// PAGINAÇÃO
function renderizarPaginacao(paginaAtual, totalPaginas) {
  const container = document.getElementById('pagination');
  if (!container) return;

  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="pagination-controls">';

  if (paginaAtual > 1) {
    html += `<button onclick="carregarHistorico(${paginaAtual - 1})" class="btn-page">Anterior</button>`;
  }

  html += `<span class="page-info">Página ${paginaAtual} de ${totalPaginas}</span>`;

  if (paginaAtual < totalPaginas) {
    html += `<button onclick="carregarHistorico(${paginaAtual + 1})" class="btn-page">Próxima</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// UTILITÁRIOS
function mostrarLoading(show) {
  let loading = document.getElementById('loading');

  if (show) {
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loading';
      loading.className = 'loading-overlay';
      loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Carregando histórico...</p>
      `;
      document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
  } else {
    if (loading) {
      loading.style.display = 'none';
    }
  }
}

function mostrarMensagem(texto, tipo = 'info') {
  const mensagem = document.createElement('div');
  mensagem.className = `mensagem mensagem-${tipo}`;
  mensagem.textContent = texto;

  document.body.appendChild(mensagem);

  setTimeout(() => {
    mensagem.classList.add('show');
  }, 10);

  setTimeout(() => {
    mensagem.classList.remove('show');
    setTimeout(() => mensagem.remove(), 300);
  }, 3000);
}

// SIDEBAR E MENU MOBILE
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.querySelector(".main");
  sidebar.classList.toggle("hidden");
  main.classList.toggle("full-width");
}

function toggleMenuMobile() {
  const menuMobile = document.getElementById('menuMobile');
  const overlay = document.getElementById('menuMobileOverlay');

  menuMobile.classList.toggle('active');
  overlay.classList.toggle('active');

  if (menuMobile.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = "../login/login.html";
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", function () {
  console.log('🎨 Página de histórico carregada');

  // Verificar se está logado
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarMensagem('⚠️ Você precisa estar logado', 'warning');
    setTimeout(() => {
      window.location.href = '../login/login.html';
    }, 2000);
    return;
  }

  // Carregar histórico
  carregarHistorico();

  // Adicionar listener ao botão de limpar
  const btnClear = document.getElementById('clearBtn');
  if (btnClear) {
    btnClear.onclick = clearHistory;
  }
});