import { child, get, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { db } from "../config.js";
import { addtocart, decrease } from "./cart.js";

function writeUserData(ProductId, ProductName, imageUrl, Price, Cost, Discount, qty, Description) {
  return set(ref(db, "Products/" + ProductId), {
    ProductName, Price, Cost, Discount, qty, imageUrl, Description,
  })
    .then(() => alert("success"))
    .catch((err) => {
      console.error("Firebase error:", err);
      alert("Error: " + err.message);
    });
}

export async function getAllProducts() {
  try {
    const snap = await get(child(ref(db), "Products"));
    if (snap.exists()) return snap.val();
    console.log("No products found");
    return null;
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
}

function getCategoryNameFromURL() {
  const p = new URLSearchParams(location.search);
  return p.get("card") || "";
}
function toArray(obj) {
  const arr = [];
  for (const id in obj) arr.push({ id, ...obj[id] });
  return arr;
}
function num(v, d = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

function getCartTotalFromLS() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return Object.values(cart).reduce((sum, it) => sum + it.price * it.quantity, 0);
}
function updateCartSummaryUI() {
  const el = document.getElementById("cart-total");
  if (el) el.textContent = getCartTotalFromLS().toFixed(2);
}

// نفس الممسك القديم
const sidebarBox = document.getElementById("sidebar-categories");

// استبدل الدالة كلها بهذا التنفيذ البسيط
function renderSidebarCategories(allProducts) {
  if (!sidebarBox || !allProducts) return;

  const cats = [...new Set(
    Object.values(allProducts)
      .map(p => String(p?.Categoryname || "Uncategorized").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  sidebarBox.innerHTML = `
    <div class="list-group">
      <a href="${location.pathname}" class="list-group-item list-group-item-action">All</a>
      ${cats.map(c =>
        `<a href="?card=${encodeURIComponent(c)}" class="list-group-item list-group-item-action">${c}</a>`
      ).join("")}
    </div>
  `;
}


let ALL = null;
let searchTerm = "";
let filters = { min: null, max: null };
let sortKey = "";
let sortDir = 1;
const PAGE_SIZE = 6;

const sortSel  = document.getElementById("sort-key");
const minEl    = document.getElementById("filter-min");
const maxEl    = document.getElementById("filter-max");
const applyBtn = document.getElementById("filter-apply");
const clearBtn = document.getElementById("filter-clear");
const searchFormEl = document.getElementById("search-form");
const searchInput  = document.getElementById("search-input");

function pipeline(allObj) {
  if (!allObj) return [];
  let list = toArray(allObj);

  const wanted = getCategoryNameFromURL();
  if (wanted) list = list.filter(p => String(p.Categoryname) === wanted);

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    list = list.filter(p => (p.ProductName || "").toLowerCase().includes(q));
  }

  const min = filters.min;
  const max = filters.max;
  if (min != null) list = list.filter(p => num(p.Price) >= min);
  if (max != null) list = list.filter(p => num(p.Price) <= max);

  if (sortKey) {
    const K = sortKey;
    list.sort((a, b) => {
      let av, bv;
      if (K === "price")    { av = num(a.Price);      bv = num(b.Price); }
      else if (K === "name"){ av = (a.ProductName || "").toLowerCase(); bv = (b.ProductName || "").toLowerCase(); }
      else if (K === "discount"){ av = num(a.Discount); bv = num(b.Discount); }
      else if (K === "qty") { av = num(a.qty);        bv = num(b.qty); }
      else { av = 0; bv = 0; }

      if (av < bv) return -1 * sortDir;
      if (av > bv) return  1 * sortDir;
      const an = (a.ProductName || "").toLowerCase();
      const bn = (b.ProductName || "").toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return  1;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
  }

  return list;
}

function render(list) {
  const container = document.getElementsByClassName("ShowProduct")[0];
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<div class="alert alert-warning">No products match your filters.</div>`;
    window.dispatchEvent(new Event("products:reset"));
    return;
  }

  const fr = document.createDocumentFragment();

  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "ShowProduct-card";
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.ProductName || "Product"}" />
      <h4>${product.ProductName || "Product"}</h4>
      <p>Description: ${product.Description || ""}</p>
      <p class="price">$${num(product.Price).toFixed(2)}</p>
      <div class="btns d-flex align-items-center gap-2">
        <button class="btn btn-success btn1" aria-label="Add one">+</button>
        <span class="qty" aria-live="polite">0</span>
        <button class="btn btn-danger btn2" aria-label="Remove one">-</button>
      </div>
    `;

    const incBtn = card.querySelector(".btn1");
    const decBtn = card.querySelector(".btn2");
    const qtyEl  = card.querySelector(".qty");
    let localQty = 0;

    incBtn.addEventListener("click", () => {
      localQty++;
      qtyEl.textContent = localQty;
      addtocart({
        id: product.id,
        name: product.ProductName,
        imageUrl: product.imageUrl,
        price: num(product.Price),
        quantity: 1,
      });
      updateCartSummaryUI();
      if (typeof window.display === "function") window.display();
    });

    decBtn.addEventListener("click", () => {
      if (localQty > 0) {
        localQty--;
        qtyEl.textContent = localQty;
      }
      decrease(product.id);
      updateCartSummaryUI();
      if (typeof window.display === "function") window.display();
    });

    fr.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(fr);
  window.dispatchEvent(new Event("products:reset"));
}

function rebuildUI(resetPage = true) {
  const list = pipeline(ALL || {});
  render(list);
  if (!resetPage) window.dispatchEvent(new Event("products:rebuild"));
}

if (searchFormEl) searchFormEl.addEventListener("submit", (e) => e.preventDefault());
if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchTerm = (searchInput.value || "").trim().toLowerCase();
    rebuildUI(true);
  });
}

if (sortSel) {
  sortSel.addEventListener("change", () => {
    const v = sortSel.value || "";
    if (!v) {
      sortKey = "";
      sortDir = 1;
    } else {
      const [k, d] = v.split("-");
      sortKey = k || "";
      sortDir = d === "desc" ? -1 : 1;
    }
    rebuildUI(true);
  });
}

function applyPriceFilter() {
  const minV = minEl?.value?.trim();
  const maxV = maxEl?.value?.trim();
  const min = minV === "" ? null : num(minV, null);
  const max = maxV === "" ? null : num(maxV, null);
  if (min != null && max != null && min > max) {
    filters = { min: max, max: min };
    if (minEl) minEl.value = String(filters.min);
    if (maxEl) maxEl.value = String(filters.max);
  } else {
    filters = { min, max };
  }
  rebuildUI(true);
}
applyBtn?.addEventListener("click", applyPriceFilter);
[minEl, maxEl].forEach((input) => {
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPriceFilter();
    }
  });
});
clearBtn?.addEventListener("click", () => {
  if (minEl) minEl.value = "";
  if (maxEl) maxEl.value = "";
  filters = { min: null, max: null };
  rebuildUI(true);
});

(function () {
  const container = document.getElementsByClassName("ShowProduct")[0];
  if (!container) return;

  const pager = document.createElement("div");
  pager.id = "pager";
  pager.className = "d-flex justify-content-between align-items-center mt-3";
  pager.style.gap = "12px";
  pager.innerHTML = `
    <button id="prevPage" class="btn btn-outline-secondary btn-sm">Prev</button>
    <span id="pageInfo" class="small text-muted"></span>
    <button id="nextPage" class="btn btn-outline-secondary btn-sm">Next</button>
  `;
  container.after(pager);

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  let page = 1;

  const allCards = () => Array.from(container.getElementsByClassName("ShowProduct-card"));

  function rebuildAndRender() {
    const cards = allCards();
    const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    page = Math.min(Math.max(page, 1), totalPages);

    cards.forEach((c) => (c.style.display = "none"));
    const start = (page - 1) * PAGE_SIZE;
    cards.slice(start, start + PAGE_SIZE).forEach((c) => (c.style.display = ""));

    pageInfo.textContent = `Page ${page} / ${totalPages} • ${cards.length} items`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  }

  prevBtn.addEventListener("click", () => { page--; rebuildAndRender(); });
  nextBtn.addEventListener("click", () => { page++; rebuildAndRender(); });

  window.addEventListener("products:rebuild", rebuildAndRender);
  window.addEventListener("products:reset",   () => { page = 1; rebuildAndRender(); });

  window.addEventListener("load", () => {
    if (allCards().length) rebuildAndRender();
  });
})();

async function boot() {
  ALL = await getAllProducts();
  renderSidebarCategories(ALL);
  rebuildUI(true);
}
window.addEventListener("load", boot);
