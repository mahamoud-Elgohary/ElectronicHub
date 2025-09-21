import {
  db
} from "../config.js";
import {
  ref,
  set,
  get,
  child,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const tbody = document.getElementById("productsBody");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const newProductBtn = document.getElementById("newProductBtn");
const formEl = document.getElementById("productForm");
const modalEl = document.getElementById("productModal");
const modalTitle = document.getElementById("productModalLabel");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const PAGE_SIZE = 5;
let allProducts = [];
let filtered = [];
let page = 1;

function asNumber(v, fallback = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function idNow() {
  return Date.now().toString();
}

function money(v) {
  const n = asNumber(v);
  return `$${n.toFixed(2)}`;
}

async function fetchAll() {
  const snap = await get(child(ref(db), "Products"));
  if (!snap.exists()) return [];
  const obj = snap.val();
  return Object.entries(obj).map(([id, p]) => ({
    id,
    ...p
  }));
}

function renderTable(list) {
  tbody.innerHTML = "";
  list.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-truncate" title="${p.id}">${p.id.slice(-6)}</td>
      <td>${p.ProductName || "-"}</td>
      <td>${money(p.Price)}</td>
      <td>${money(p.Cost)}</td>
      <td>${asNumber(p.Discount).toFixed(2)}</td>
      <td>${asNumber(p.qty)}</td>
      <td>${p.Categoryname || "-"}</td>
      <td>
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.ProductName || "img"}" style="max-width:80px;max-height:60px">` : "-"}
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group" aria-label="Actions">
          <button class="btn btn-outline-primary" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn btn-outline-danger" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function applySearch() {
  const q = (searchInput?.value || "").toLowerCase().trim();
  filtered = !q ? [...allProducts] :
    allProducts.filter((p) => {
      const name = (p.ProductName || "").toLowerCase();
      const cat = (p.Categoryname || "").toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  page = 1;
  renderPage();
}

function renderPage() {
  const start = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  renderTable(slice);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  pageInfo.textContent = `Page ${page} / ${totalPages} • ${filtered.length} items`;
  prevPageBtn.disabled = page <= 1;
  nextPageBtn.disabled = page >= totalPages;
}

async function loadProducts() {
  allProducts = await fetchAll();
  applySearch();
}

let bsModal;

function showModal(title) {
  if (!bsModal) bsModal = new bootstrap.Modal(modalEl);
  modalTitle.textContent = title;
  bsModal.show();
}

function hideModal() {
  bsModal?.hide();
}

function fillForm(p) {
  document.getElementById("field_id").value = p?.id || "";
  document.getElementById("field_name").value = p?.ProductName || "";
  document.getElementById("field_price").value = p?.Price ?? "";
  document.getElementById("field_cost").value = p?.Cost ?? "";
  document.getElementById("field_discount").value = p?.Discount ?? "0";
  document.getElementById("field_qty").value = p?.qty ?? "0";
  document.getElementById("field_cat").value = p?.Categoryname || ""; // موحّد مع HTML
  document.getElementById("field_image").value = p?.imageUrl || "";
  document.getElementById("field_desc").value = p?.Description || "";
}

async function createProduct(data) {
  const id = idNow();
  await set(ref(db, `Products/${id}`), data);
  return id;
}
async function updateProduct(id, data) {
  await update(ref(db, `Products/${id}`), data);
}
async function deleteProduct(id) {
  await remove(ref(db, `Products/${id}`));
}

function readForm() {
  const id = document.getElementById("field_id").value.trim();
  const ProductName = document.getElementById("field_name").value.trim();
  const Price = asNumber(document.getElementById("field_price").value);
  const Cost = asNumber(document.getElementById("field_cost").value);
  const Discount = asNumber(document.getElementById("field_discount").value);
  const qty = parseInt(document.getElementById("field_qty").value || "0", 10);
  const Categoryname = document.getElementById("field_cat").value.trim();
  const imageUrl = document.getElementById("field_image").value.trim();
  const Description = document.getElementById("field_desc").value.trim();

  const errors = [];
  if (!ProductName) errors.push("Name is required");
  if (Price < 0) errors.push("Price must be ≥ 0");
  if (Cost < 0) errors.push("Cost must be ≥ 0");
  if (!imageUrl) errors.push("Image URL is required");
  if (errors.length) {
    alert(errors.join("\n"));
    return null;
  }

  return {
    id,
    data: {
      ProductName,
      Price,
      Cost,
      Discount,
      qty,
      Categoryname,
      imageUrl,
      Description
    }
  };
}

newProductBtn.addEventListener("click", () => {
  fillForm(null);
  showModal("New Product");
});

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = readForm();
  if (!res) return;
  const {
    id,
    data
  } = res;

  try {
    if (id) await updateProduct(id, data);
    else await createProduct(data);
    hideModal();
    await loadProducts();
  } catch (err) {
    console.error(err);
    alert("Firebase error: " + err.message);
  }
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const {
    action,
    id
  } = btn.dataset;

  if (action === "edit") {
    const p = allProducts.find((x) => x.id === id);
    fillForm(p);
    showModal("Edit Product");
    return;
  }

  if (action === "delete") {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Firebase error: " + err.message);
    }
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  applySearch();
});
searchInput?.addEventListener("input", applySearch);

prevPageBtn.addEventListener("click", () => {
  page = Math.max(1, page - 1);
  renderPage();
});
nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(totalPages, page + 1);
  renderPage();
});

window.addEventListener("load", loadProducts);
