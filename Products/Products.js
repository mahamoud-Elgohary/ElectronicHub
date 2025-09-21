import { db } from "../config.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { addtocart, increase, decrease } from "./cart.js";

function writeUserData(ProductId, ProductName, imageUrl, Price, Cost, Discount, qty, Description) {
  set(ref(db, "Products/" + ProductId), {
    ProductName,
    Price,
    Cost,
    Discount,
    qty,
    imageUrl,
    Description,
  })
    .then(() => { alert("success"); })
    .catch((err) => {
      console.error("Firebase error:", err);
      alert("Error: " + err.message);
    });
}

export async function getAllProducts() {
  try {
    const dbRef = ref(db);
    const item = await get(child(dbRef, "Products"));
    if (item.exists()) {
      return item.val();
    } else {
      console.log("No products found");
      return null;
    }
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
}

function getCartTotalFromLS() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return Object.values(cart).reduce((sum, it) => sum + it.price * it.quantity, 0);
}

function getQtyFromLS(id) {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return cart[id]?.quantity || 0;
}

function updateCartSummaryUI() {
  const el = document.getElementById("cart-total");
  if (el) el.textContent = getCartTotalFromLS().toFixed(2);
}

async function getProducts() {
  const params = new URLSearchParams(location.search);
  const cat = params.get("card"); // اسم التصنيف القادم من URL

  const products = await getAllProducts();
  const container = document.getElementsByClassName("ShowProduct")[0];
  if (!container || !products) return;

  const filtered = {};
  if (cat) {
    for (const id in products) {
      if (!products.hasOwnProperty(id)) continue;
      const p = products[id];
      if (p?.Categoryname === cat) filtered[id] = p;
    }
  } else {
    Object.assign(filtered, products);
  }

  container.innerHTML = "";

  for (const id in filtered) {
    if (!filtered.hasOwnProperty(id)) continue;

    const product = filtered[id];
    const price = parseFloat(product.Price) || 0;
    const qtyInitial = getQtyFromLS(id);
    const lineInitial = price * qtyInitial;

    const card = document.createElement("div");
    card.classList.add("ShowProduct-card");
    card.dataset.id = id;

    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.ProductName}">
      <h4>${product.ProductName}</h4>
      <p>Description: ${product.Description || ""}</p>
      <p class="price">Price: $${price.toFixed(2)}</p>

      <div class="qty-controls" data-id="${id}" aria-label="quantity controls">
        <button class="btn-dec btn btn-warning" data-id="${id}" ${qtyInitial === 0 ? "disabled" : ""}>-</button>
        <span class="qty" data-id="${id}" aria-live="polite">${qtyInitial}</span>
        <button class="btn-inc btn btn-primary" data-id="${id}">+</button>
      </div>

      <p class="line-total">Total for this item: $<span class="line-amount" data-id="${id}">${lineInitial.toFixed(2)}</span></p>
    `;

    container.appendChild(card);

    const incBtn = card.querySelector(`.btn-inc[data-id="${id}"]`);
    const decBtn = card.querySelector(`.btn-dec[data-id="${id}"]`);
    const qtySpan = card.querySelector(`.qty[data-id="${id}"]`);
    const lineAmount = card.querySelector(`.line-amount[data-id="${id}"]`);

    incBtn.addEventListener("click", () => {
      const current = parseInt(qtySpan.textContent, 10) || 0;
      if (current === 0) {
        addtocart({ id, name: product.ProductName, imageUrl: product.imageUrl, price, quantity: 1 });
      } else {
        increase(id);
      }
      const newQty = current + 1;
      qtySpan.textContent = newQty;
      decBtn.removeAttribute("disabled");
      lineAmount.textContent = (price * newQty).toFixed(2);
      updateCartSummaryUI();
    });

    decBtn.addEventListener("click", () => {
      const current = parseInt(qtySpan.textContent, 10) || 0;
      if (current <= 0) return;

      decrease(id);
      const newQty = current - 1;
      qtySpan.textContent = newQty;
      lineAmount.textContent = (price * newQty).toFixed(2);
      if (newQty === 0) decBtn.setAttribute("disabled", "true");
      updateCartSummaryUI();
    });
  }

  updateCartSummaryUI();
}

window.addEventListener("load", getProducts);

const search = document.querySelector(".search-bar-form input[type='text']");
const cardsLive = () => document.getElementsByClassName("ShowProduct-card");

if (search) {
  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    const list = cardsLive();
    for (let i = 0; i < list.length; i++) {
      const card = list[i];
      const name = card.querySelector("h4")?.textContent.toLowerCase() || "";
      card.style.display = name.includes(q) ? "" : "none";
    }
  });
}
