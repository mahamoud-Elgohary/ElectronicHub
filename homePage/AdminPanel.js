import {
  child,
  get,
  ref,
  remove,
  set,
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  db
} from "../config.js";


const tbody = document.getElementById("productsBody");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const newProductBtn = document.getElementById("newProductBtn");
const formEl = document.getElementById("productForm");
const productModal = document.getElementById("productModal");
const modalLabel = document.getElementById("productModalLabel");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const PAGE_SIZE = 5;
let allProducts = [];
let shownProducts = []
let filtered = [];
let currentPage = 1;
let openCloseModel;

//function asNumber(v, fallback = 0) {
// const n = parseFloat(v);
//return Number.isFinite(n) ? n : fallback;
//}

function newId() {
  return Date.now().toString();
}

//function money(v) {
// const n = asNumber(v);
//return `$${n.toFixed(2)}`;
//}

async function fetchAll() {
  const fetchId = await get(child(ref(db), "Products"));
  if (!fetchId.exists()) return [];
  const obj = fetchId.val();
  const list = []
  for (const id in obj) {
    list.push({
      id,
      ...obj[id]
    })
  }
  return list;
}


function renderTable(list) {
  const rows = list.map((element) => {
    const price = Number(element.Price).toFixed(2);
    const cost = Number(element.Cost).toFixed(2);
    const discount = Number(element.Discount).toFixed(2);
    const qty = Number(element.qty);

    return `
      <tr>
        <td title="${element.id}">${element.id }</td>
        <td>${element.ProductName }</td>
        <td>${price}</td>
        <td>${cost}</td>
        <td>${discount}</td>
        <td>${qty}</td>
        <td>${element.Categoryname }</td>
        <td>
          ${element.imageUrl
            ? `<img src="${element.imageUrl}" alt="${element.ProductName || 'img'}" style="max-width:80px;max-height:60px">`
            : "-"}
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${element.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger"  data-action="delete" data-id="${element.id}">Delete</button>
        </td>
      </tr>`;
  }).join("");

  tbody.innerHTML = rows;
}

function applySearch() {
  const searchTerm = (searchInput && searchInput.value ? searchInput.value : "").toLowerCase().trim();
  if (!searchTerm) {
    shownProducts = allProducts.slice();
  } else {
    shownProducts = allProducts.filter(function (element) {
      const name = (element.ProductName || "").toLowerCase();
      const catego = (element.Categoryname || "").toLowerCase();
      return name.includes(searchTerm) || catego.includes(searchTerm);
    })
  }
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = shownProducts.slice(start, start + PAGE_SIZE);
  renderTable(slice);
  const totalPages = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
  pageInfo.textContent = `
  Page ${currentPage} / ${totalPages} • ${shownProducts.length} items`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

}

async function loadProducts() {
  allProducts = await fetchAll();
  applySearch();
}



function showModal(title) {
  if (!openCloseModel) openCloseModel = new bootstrap.Modal(productModal);
  modalLabel.textContent = title;
  openCloseModel.show();
}

function hideModal() {
  if (openCloseModel) openCloseModel.hide();
}

function fillForm(p) {
  if (!p) {
    document.getElementById("field_id").value = "";
    document.getElementById("field_name").value = "";
    document.getElementById("field_price").value = "";
    document.getElementById("field_cost").value = "";
    document.getElementById("field_discount").value = "";
    document.getElementById("field_qty").value = "";
    document.getElementById("field_cat").value = "";
    document.getElementById("field_image").value = "";
    document.getElementById("field_desc").value = "";
    return;
  }

  document.getElementById("field_id").value = p.id;
  document.getElementById("field_name").value = p.ProductName;
  document.getElementById("field_price").value = p.Price;
  document.getElementById("field_cost").value = p.Cost;
  document.getElementById("field_discount").value = p.Discount;
  document.getElementById("field_qty").value = p.qty;
  document.getElementById("field_cat").value = p.Categoryname;
  document.getElementById("field_image").value = p.imageUrl;
  document.getElementById("field_desc").value = p.Description;

}

async function createProduct(data) {
  const id = newId();
  await set(ref(db, `Products/${id}`), data);

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
  const Price = Number(document.getElementById("field_price").value);
  const Cost = Number(document.getElementById("field_cost").value);
  const Discount = Number(document.getElementById("field_discount").value);
  const qty = parseInt(document.getElementById("field_qty").value, 10);
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

newProductBtn.addEventListener("click", function () {
  fillForm(null);
  showModal("New Product");
});

formEl.addEventListener("submit", async function (event) {
  event.preventDefault();
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

tbody.addEventListener("click", async function (event) {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");

  if (action === "edit") {
    const pro = allProducts.find(function (edit) {
      return edit.id === id
    });
    fillForm(pro);

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

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  applySearch();
});
if (searchInput) {
  searchInput.addEventListener("input", applySearch);
}
prevPageBtn.addEventListener("click", function () {
  currentPage = Math.max(1, currentPage - 1);
  renderPage();
});
nextPageBtn.addEventListener("click", function () {
  const totalPages = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
  currentPage = Math.min(totalPages, currentPage + 1);
  renderPage();
});

window.addEventListener("load", async function () {
  await loadProducts()
  applySearch();
});


//   Burger Menu
const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
  leftSide.classList.toggle("active");
  rightSide.classList.toggle("active");
});
