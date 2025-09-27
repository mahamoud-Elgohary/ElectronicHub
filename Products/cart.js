import { auth, ref, get, db, set, child, runTransaction } from '../config.js';
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
  } else {
    cart[productId] = { id: productId, quantity: 1 };
  }

  saveData();
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "inc", productId } }));
  display();
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

export function updateNavbarCart() {
  const navCart = document.querySelector(".cart");
  const { totalPrice } = getAll();
  navCart.innerHTML = `<a href="./cart.html"><i class="fa-solid fa-cart-shopping"></i></a> $${totalPrice.toFixed(2)}`;
}

async function updateStock(productId, qtyToReduce) {
  const cleanId = String(productId).trim();
  const qtyRef  = ref(db, `Products/${cleanId}/qty`);

  const snap = await get(qtyRef);
  if (!snap.exists()) {
    console.warn(`[TX] ${cleanId}: qty node missing before transaction`);
    return { committed: false, reason: "missing" };
  }
  const start = Number(snap.val());
  if (!Number.isFinite(start)) {
    console.warn(`[TX] ${cleanId}: qty not numeric before transaction`, snap.val());
    return { committed: false, reason: "nonnumeric" };
  }
  if (start < qtyToReduce) {
    console.warn(`[TX] ${cleanId}: not enough stock before transaction. Have ${start}, need ${qtyToReduce}`);
    return { committed: false, reason: "insufficient", now: start };
  }

  const result = await runTransaction(
    qtyRef,
    (currentQty) => {
      const q = Number(currentQty);
      if (!Number.isFinite(q) || q < qtyToReduce) {
        return currentQty; 
      }
      return q - qtyToReduce;
    },
    { applyLocally: false }
  );

  if (!result?.committed) {
    const nowSnap = await get(qtyRef);
    const now = nowSnap.exists() ? Number(nowSnap.val()) : null;
    return { committed: false, now };
  }

  const after = Number(result.snapshot?.val());
  return { committed: true, after };
}



async function isUserVerified() {
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

    return true;
  } catch (err) {
    console.error("Error checking user verification:", err);
    return false;
  }
}
export async function getProductQuantity(productId) {
  const snap = await get(ref(db, `Products/${productId}/qty`));
  return snap.exists() ? Number(snap.val()) : null;
}

async function validateCartQuantity() {
  const cart = JSON.parse(localStorage.getItem("cart")) || {};
  let isValid = true;

  for (const [id, item] of Object.entries(cart)) {
    const productSnap = await get(ref(db, `Products/${id}`));
    if (!productSnap.exists()) continue;
    const available = Number(productSnap.val()?.qty ?? 0);
    if (item.quantity > available) {
      showMessage(`Not enough stock for ${item.name}. Only ${available} available.`, "error");
      isValid = false;
    }
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.disabled = !isValid;
    checkoutBtn.innerHTML = isValid ? "Pay Now" : "Quantity Exceeds Available Stock";
  }
  return isValid; 
}
async function ensureQtyField(productId) {
  const productRef = ref(db, `Products/${productId}`);
  const snap = await get(productRef);
  if (!snap.exists()) {
    console.warn(`ensureQtyField: Product ${productId} not found`);
    return false; 
  }

  const product = snap.val() || {};
  const qtyRaw = product.qty;
  const stockRaw = product.stock; 

  const qtyNum = Number(qtyRaw);
  if (Number.isFinite(qtyNum) && qtyNum >= 0) {
    return true;
  }

  const stockNum = Number(stockRaw);
  if (Number.isFinite(stockNum) && stockNum >= 0) {
    await set(ref(db, `Products/${productId}/qty`), stockNum);
    console.info(`ensureQtyField: Migrated stock -> qty for ${productId}: ${stockNum}`);
    return true;
  }

  console.error(`ensureQtyField: Invalid/missing qty for ${productId}. qty=`, qtyRaw, 'stock=', stockRaw);
  return false;
}


export async function checkout() {
  const { totalPrice, totalQty } = getAll();
  if (totalQty === 0) { showMessage("Cart is empty!", "warning"); return; }

  const user = auth.currentUser;
  if (!user) { showMessage("You must be logged in to checkout!", "warning"); return; }

  const verified = await isUserVerified();
  if (!verified) { showMessage("You must verify your email before proceeding to payment!", "warning"); return; }

  for (const item of Object.values(cart)) {
    const ok = await ensureQtyField(item.id);
    if (!ok) {
      showMessage(`Product ${item.id} has invalid stock. Please contact support.`, "error");
      return;
    }
  }


  const ok = await validateCartQuantity();
  if (!ok) return;

  for (const item of Object.values(cart)) {
    const dbRef = ref(db, `Products/${item.id}`);
    const snap = await get(dbRef);
    if (!snap.exists()) {
      await createPost("Posts", {
        type: "product_missing",
        userId: auth.currentUser?.uid || null,
        productId: item.id,
        productName: item.name,
        requestedQty: item.quantity,
        note: "Product was not found during checkout pre-check"
      });
      showMessage(`Product ${item.name} no longer exists.`, "error");
      return;
    }

    const dbProduct = snap.val();
    if (item.quantity > Number(dbProduct.qty ?? 0)) {
      showMessage(`Not enough stock for ${item.name}. Only ${dbProduct.qty} available.`, "error");
      return;
    }
  }
 




  
  const succeeded = [];
  for (const item of Object.values(cart)) {
    const res = await updateStock(item.id, item.quantity);

    if (!res?.committed) {
      for (const prev of succeeded) {
        await runTransaction(ref(db, `Products/${prev.id}/qty`), (q) => {
          const n = Number(q);
          return Number.isFinite(n) ? n + prev.quantity : q;
        }, { applyLocally: false });
      }

      const snap = await get(ref(db, `Products/${item.id}/qty`));
      const now = snap.exists() ? Number(snap.val()) : null;

      if (Number.isFinite(now)) {
        if (now <= 0) {
          delete cart[item.id];
          showMessage(`${item.name} is now out of stock. It was removed from your cart.`, "warning");
        } else {
          cart[item.id].quantity = Math.min(cart[item.id].quantity, now);
          showMessage(`${item.name} only has ${now} in stock. Your cart was updated.`, "warning");
        }
        saveData();
        display();
        updateNavbarCart();
      } else {
        showMessage(`Checkout failed: ${item.name} stock changed. Please try again.`, "error");
      }
      return; 
    }

    succeeded.push(item);
  }

  try {
    await saveOrderSnapshot();

    const updatedQtyMap = {};
    for (const item of Object.values(cart)) {
      updatedQtyMap[item.id] = await getProductQuantity(item.id);
    }

    cart = {};
    saveData();
    display();
    updateNavbarCart();

    window.dispatchEvent(new CustomEvent("products:qty-updated", { detail: updatedQtyMap }));

    const stripeBaseUrl = "https://buy.stripe.com/test_28E28q3XjeV230dbWgfMA00";
    const url = `${stripeBaseUrl}?amount=${totalPrice.toFixed(2)}&items=${totalQty}`;
    window.open(url, "_blank");

    showMessage("Order placed successfully!", "success");

    setTimeout(() => {
      window.location.href = "OrderHistory.html";
    }, 3000);


  } catch (error) {
    console.error("❌ Error during checkout:", error);
    alert("Error updating stock or saving order. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", validateCartQuantity);

