import { auth, ref, get, db } from '../config.js';
import { getAllProducts } from './Products.js';
import { saveOrderSnapshot } from './OrderHistory.js'; 


function showMessage(message, type = "info") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  let bg = "bg-primary";
  if (type === "success") bg = "bg-success";
  if (type === "warning") bg = "bg-warning text-dark";
  if (type === "error") bg = "bg-danger";

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white ${bg} border-0 show mb-2`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}


let cart = JSON.parse(localStorage.getItem("cart")) || {};

function loadData() {
  cart = JSON.parse(localStorage.getItem("cart")) || {};
}

function saveData() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Get product names and prices
export async function getNamesAndPrices() {
  const products = await getAllProducts();
  if (!products) return [];

  return Object.entries(products).map(([id, product]) => ({
    id,
    name: product.ProductName,
    imageUrl: product.imageUrl,
    price: parseFloat(product.Price)
  }));
}

// Add to cart
export function addtocart(product) {
  const exs = cart[product.id];
  // Update in cart only 

  if (exs) {
  exs.quantity += product.quantity || 1;
} else {
  cart[product.id] = {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    quantity: product.quantity || 1,
    stock: product.stock
  };
}

  saveData();
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "add", productId: product.id } }));
}

// Get cart totals
export function getAll() {
  const values = Object.values(cart);
  const totalQty = values.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getTotal();
  return { totalPrice, totalQty, totalItems: values.length };
}

function getTotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function increase(productId) {
  if (cart[productId]) {
    cart[productId].quantity++;
    saveData();
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "inc", productId } }));
    display();
  }
}

export function decrease(productId) {
  if (cart[productId] && cart[productId].quantity > 1) {
    cart[productId].quantity--;
  } else {
    removeFromCart(productId);
  }
  saveData();
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "dec", productId } }));
  display();
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
    saveData();
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "remove", productId } }));
    display();
  }
  return cart;
}

// Display cart
export function display() {
  loadData();
  const container = document.getElementById("cart-container");
  if (!container) return;
  container.innerHTML = "";

  Object.values(cart).forEach(item => {
    container.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100 card-control">
          <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text text-muted mb-1">Price: $${item.price}</p>
            <div class="d-flex align-items-center justify-content-between my-2">
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-primary btn-inc" data-id="${item.id}">+</button>
                <span class="px-3 fw-bold">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-warning btn-dec" data-id="${item.id}">-</button>
              </div>
              <span class="fw-semibold">Total: $${item.price * item.quantity}</span>
            </div>
            <button class="btn btn-sm btn-danger mt-auto btn-remove" data-id="${item.id}">
              <i class="bi bi-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".btn-inc").forEach(btn => btn.addEventListener("click", () => increase(btn.dataset.id)));
  document.querySelectorAll(".btn-dec").forEach(btn => btn.addEventListener("click", () => decrease(btn.dataset.id)));
  document.querySelectorAll(".btn-remove").forEach(btn => btn.addEventListener("click", () => removeFromCart(btn.dataset.id)));
}

// Navbar cart
export function updateNavbarCart() {
  const navCart = document.querySelector(".cart");
  const { totalPrice } = getAll();
  navCart.innerHTML = `<a href="./cart.html"><i class="fa-solid fa-cart-shopping"></i></a> $${totalPrice.toFixed(2)}`;
}async function isUserVerified() {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user is logged in");
    return false;
  }

  try {
    const snap = await get(ref(db, "users/" + user.uid));
    if (!snap.exists()) {
      console.log("User data not found in the database");
      return false;
    }

    const verifiedAt = snap.val().verified_at;
    console.log("User's verified_at:", verifiedAt);

    if (!verifiedAt || verifiedAt === null) {
      console.log("User is not verified");
      return false;
    }

    console.log("User is verified");
    return true;
  } catch (err) {
    console.error("Error checking user verification:", err);
    return false;
  }
}

export async function checkout() {
  const { totalPrice, totalQty } = getAll();

  if (totalQty === 0) {
  showMessage("Cart is empty!", "warning"); 
  return;
}

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to checkout!");
    return;
  }

  const verified = await isUserVerified();
  if (!verified) {
    alert("You must verify your email before proceeding to payment!");
    return; 
  }

  const allProducts = await getAllProducts();
  for (let item of Object.values(cart)) {
    const dbProduct = allProducts.find(p => p.id === item.id);
    if (!dbProduct) {
      alert(`Product ${item.name} no longer exists.`);
      return;
    }
    if (dbProduct.qty < item.quantity) {
      alert(`Not enough stock for ${item.name}. Available: ${dbProduct.qty}`);
      return;
    }
  }

  console.log("Proceeding to checkout...");
const stripeBaseUrl = "https://buy.stripe.com/test_28E28q3XjeV230dbWgfMA00";
  const url = `${stripeBaseUrl}?amount=${totalPrice.toFixed(2)}&items=${totalQty}`;
  window.open(url, "_blank");

  await saveOrderSnapshot();

  cart = {};
  saveData();
  display();
  updateNavbarCart();

  
  window.location.href = "orderhistory.html";
}
window.addEventListener("cart:updated", () => {
  updateNavbarCart();
});

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  display();
  updateNavbarCart();
});
document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await checkout(); 
    });
  }
});