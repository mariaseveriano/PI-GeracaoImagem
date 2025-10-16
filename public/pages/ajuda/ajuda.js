function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.querySelector(".main");
  sidebar.classList.toggle("hidden");
  main.classList.toggle("full-width");
}

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
