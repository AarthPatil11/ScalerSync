const CATEGORIES = ["CRITICAL", "EVENT", "NEWS"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "feed-card";
  card.innerHTML = `
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.description)}</p>
    <div class="feed-meta">
      <span>${escapeHtml(item.timestamp || "No date")}</span>
      <span>${escapeHtml(item.source || "unknown")}</span>
    </div>
  `;
  return card;
}

function renderCards(items) {
  const grouped = { CRITICAL: [], EVENT: [], NEWS: [] };

  for (const item of items) {
    const category = String(item.category || "").toUpperCase();
    if (grouped[category]) grouped[category].push(item);
  }

  for (const category of CATEGORIES) {
    const list = document.getElementById(`list-${category}`);
    const count = document.getElementById(`count-${category}`);
    list.innerHTML = "";

    if (!grouped[category].length) {
      list.innerHTML = `<p class="empty-state">Nothing in this column yet.</p>`;
    } else {
      grouped[category].forEach((item) => list.appendChild(createCard(item)));
    }

    count.textContent = String(grouped[category].length);
  }
}

function setStatus(text) {
  const pill = document.getElementById("status-pill");
  if (pill) pill.textContent = text;
}

async function loadDashboard() {
  setStatus("Loading");
  try {
    const response = await fetch("final_data.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error("final_data.json is not an array");
    renderCards(items);
    setStatus(`${items.length} items`);
  } catch (err) {
    renderCards([]);
    setStatus("Failed to load");
    console.error("Could not fetch final_data.json", err);
  }
}

function bindNav() {
  const links = document.querySelectorAll("[data-filter]");
  const columns = {
    CRITICAL: document.getElementById("critical"),
    EVENT: document.getElementById("events"),
    NEWS: document.getElementById("news"),
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((el) => el.classList.remove("is-active"));
      link.classList.add("is-active");
      const filter = link.dataset.filter;
      Object.entries(columns).forEach(([key, column]) => {
        column.classList.toggle("is-dimmed", filter !== "ALL" && filter !== key);
      });
    });
  });
}

function bindMobileNav() {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
    sidebar.classList.toggle("hidden");
    sidebar.classList.toggle("flex");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindNav();
  bindMobileNav();
  loadDashboard();
});
