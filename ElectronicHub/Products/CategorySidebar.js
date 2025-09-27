import { db } from "../config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

function getParam(name) {
  const p = new URLSearchParams(location.search);
  return p.get(name) || "";
}

function renderCategoriesSidebar(dataObj) {
  const boxes = Array.from(document.querySelectorAll("#sidebar-categories"));
  if (!boxes.length) return;

  const current = getParam("card");
  const list = dataObj
    ? Object.values(dataObj)
        .map(c => ({ name: c.Categoryname || "Category" }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : null;

  const html = !list
    ? `<div class="text-muted small">No categories.</div>`
    : `
      <div class="list-group list-group-flush">
        <a href="./Products.html" class="list-group-item list-group-item-action ${current ? "" : "active"}">All</a>
        ${list
          .map(c => `
            <a href="./Products.html?card=${encodeURIComponent(c.name)}"
               class="list-group-item list-group-item-action ${current === c.name ? "active" : ""}">
              ${c.name}
            </a>`)
          .join("")}
      </div>`;

  boxes.forEach(b => (b.innerHTML = html));
}


function initCategorySidebar() {
  const categoriesRef = ref(db, "Categories");
  onValue(
    categoriesRef,
    snap => renderCategoriesSidebar(snap.val()),
    err => {
      console.error("Categories listen error:", err);
      const box = document.getElementById("sidebar-categories");
      if (box) box.innerHTML = `<div class="text-danger small">Failed to load categories.</div>`;
    }
  );
}

initCategorySidebar();
export { initCategorySidebar };

