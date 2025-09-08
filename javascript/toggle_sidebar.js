function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main"); // <- corrigido aqui

    sidebar.classList.toggle("hidden");
    main.classList.toggle("full-width");
}
