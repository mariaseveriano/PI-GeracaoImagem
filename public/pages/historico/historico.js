document.addEventListener("DOMContentLoaded", loadHistory);

function addSearch() {
  const input = document.getElementById("searchInput");
  const term = input.value.trim();
  const container = document.querySelector(".search-container");

  if (term) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift(term);
    history = history.slice(0, 10);
    localStorage.setItem("history", JSON.stringify(history));

    loadHistory();
    input.value = "";

    container.classList.add("active");
  }
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const list = document.getElementById("historyList");
  const clearBtn = document.getElementById("clearBtn");

  list.innerHTML = "";

  if (history.length > 0) {
    clearBtn.style.display = "inline-block";
  } else {
    clearBtn.style.display = "none";
  }

  history.forEach(term => {
    const li = document.createElement("li");
    li.textContent = term;
    li.onclick = () => {
      document.getElementById("searchInput").value = term;
    };
    list.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem("history");
  loadHistory();
}


