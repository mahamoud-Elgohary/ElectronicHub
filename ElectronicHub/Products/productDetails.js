

import { child, get, ref } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { db } from "../config.js";              // config.js is one level up
import { addtocart, decrease } from "./cart.js"; // cart.js is in the same folder

const getParam = (name) => new URLSearchParams(location.search).get(name) || "";

const toMoney = (n) => {
  const v = parseFloat(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

const priceAfterDiscount = (price, discount) => {
  const p = parseFloat(price) || 0;
  const d = parseFloat(discount) || 0;
  return Math.max(0, p - (p * d) / 100);
};

function getCartTotalFromLS() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return Object.values(cart).reduce((sum, it) => sum + it.price * it.quantity, 0);
}

function updateCartSummaryUI() {
  const el = document.getElementById("cart-total");
  if (el) el.textContent = getCartTotalFromLS().toFixed(2);
}

function getQtyFromLS(id) {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return cart[id]?.quantity || 0;
}

function flash(message, type = "info") {
  const box = document.getElementById("pdFeedback");
  if (!box) return;
  box.className = `alert alert-${type} py-2 px-3 mb-0`;
  box.textContent = message;
  box.hidden = false;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => (box.hidden = true), 1500);
}

async function fetchAllProducts() {
  try {
    const snap = await get(child(ref(db), "Products")); 
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.error("Error reading Products:", err);
    return null;
  }
}

// ---------------- Main render ----------------
async function renderDetails() {
  const id = getParam("id"); 

  const box = document.getElementById("product-details");
  const loader = document.getElementById("loader");
  const notFound = document.getElementById("not-found");

  updateCartSummaryUI();

  loader.classList.remove("d-none");
  box.classList.add("d-none");
  notFound.classList.add("d-none");

  const all = await fetchAllProducts();
  const p = all && id ? all[id] : null;

  loader.classList.add("d-none");

  if (!p) {
    notFound.classList.remove("d-none");
    return;
  }

  const title = p.ProductName || "Product";
  const img = p.imageUrl || "../placeholder.png"; 
 const Categoryname = p.Categoryname  || ""
  const price = parseFloat(p.Price) || 0;
  const discount = parseFloat(p.Discount) || 0;
  const stock = parseInt(p.qty, 10) || 0;
  const finalPrice = priceAfterDiscount(price, discount);

  console.log(Categoryname);
 
  box.innerHTML = `
    <div class="col-12 col-lg-5">
      <div class="card shadow-sm">
        <img src="${img}" class="card-img-top" alt="${title}" />
        <div class="card-body">
          <div class="d-flex gap-2 flex-wrap">
            <span class="badge bg-${stock > 0 ? "success" : "secondary"}">
              ${stock > 0 ? "In Stock" : "Out of Stock"} : ${stock}
            </span>
              <span class="right ms-auto small text-muted">
    ${p.Categoryname || ""}
  </span>
            ${discount > 0 ? `<span class="badge bg-warning text-dark">${discount}% OFF</span>` : ""}
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-7">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h4 mb-2">${title}</h1>
          <p class="text-muted small mb-3">${p.Description || "No description available."}</p>

          <div class="mb-3">
            ${
              discount > 0
                ? `<div class="d-flex align-items-baseline gap-2">
                     <span class="fs-5 fw-bold">$${toMoney(finalPrice)}</span>
                     <del class="text-muted">$${toMoney(price)}</del>
                   </div>`
                : `<span class="fs-5 fw-bold">$${toMoney(price)}</span>`
            }
          </div>

          <div class="d-flex align-items-center gap-2 mb-3">
            <button id="incBtn" class="btn btn-success" aria-label="Add one">+</button>
            <span id="qtySpan" class="px-2" aria-live="polite">0</span>
            <button id="decBtn" class="btn btn-danger" aria-label="Remove one">-</button>
          </div>

          <!-- inline feedback (no blocking alerts) -->
          <div id="pdFeedback" class="alert alert-info py-2 px-3 mb-0" role="status" hidden></div>

          <div class="d-grid d-sm-flex gap-2 mt-3">
            <a href="./Products.html" class="btn btn-outline-secondary">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
  `;

  box.classList.remove("d-none");

  // Actions
  const qtySpan = document.getElementById("qtySpan");
  const incBtn = document.getElementById("incBtn");
  const decBtn = document.getElementById("decBtn");
  const addBtn = document.getElementById("addToCartBtn");

 
  qtySpan.textContent = getQtyFromLS(id);

  
  incBtn.addEventListener("click", () => {
    if (stock <= 0) return flash("This product is out of stock!", "warning");
    const current = getQtyFromLS(id);
    if (current >= stock) return flash("Reached available stock.", "warning");

    addtocart({ id, name: title, imageUrl: img, price: finalPrice, quantity: 1, stock });
    qtySpan.textContent = getQtyFromLS(id);
    updateCartSummaryUI();
    flash("Added 1 to cart.", "success");
  });

 
  decBtn.addEventListener("click", () => {
    const current = getQtyFromLS(id);
    if (current <= 0) return; 
    decrease(id);
    qtySpan.textContent = getQtyFromLS(id);
    updateCartSummaryUI();
    flash("Removed 1 from cart.", "secondary");
  });

  

}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderDetails);
} else {
  renderDetails();
}
