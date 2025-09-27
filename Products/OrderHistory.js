import { db, auth, ref, get, child, set, push, onAuthStateChanged } from "../config.js";


function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "{}");
}
function clearCart() {
  localStorage.removeItem("cart");
}

export async function saveOrderSnapshot() {
  const user = auth.currentUser;
  if (!user) { alert("You must be logged in to place an order."); return; }
  if (!user.emailVerified) { alert("Please verify your email before making a purchase."); return; }

  const cart = getCart();
  if (!cart || Object.keys(cart).length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let totalCartPrice = 0;
  const items = Object.entries(cart).map(([id, item]) => {
    const total = item.price * item.quantity;
    totalCartPrice += total;
    return {
      id, name: item.name, price: item.price, quantity: item.quantity,
      total, imageUrl: item.imageUrl || null
    };
  });

  const orderId = push(ref(db, `Orders/${user.uid}`)).key;
  const orderData = {
    orderId,
    userId: user.uid,
    createdAt: new Date().toISOString(),
    items,
    totalPrice: totalCartPrice,
    status: "paid"
  };

  await set(ref(db, `Orders/${user.uid}/${orderId}`), orderData);

  // DO NOT update stock here — already done via transactions in checkout()

  clearCart();
  // No redirect here; checkout() manages the final redirect with a timeout
}

onAuthStateChanged(auth, (user) => {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (user && checkoutBtn) {
    checkoutBtn.disabled = !user.emailVerified;
    checkoutBtn.innerHTML = user.emailVerified ? "Pay Now" : "Please Verify Your Email First";
  }
});

async function loadOrders(userId) {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `Orders/${userId}`));
  if (!snapshot.exists()) return;

  const orders = snapshot.val();
  const container = document.getElementById("List");
  if (!container) return;

  container.innerHTML = "";
  Object.values(orders).forEach(order => {
    const div = document.createElement("div");
    div.classList.add("order-card");
    div.innerHTML = `
      <h3>Order #${order.orderId}</h3>
      <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
      <ul>${order.items.map(it => `<li>${it.name} - ${it.quantity} × $${it.price} = $${it.total}</li>`).join("")}</ul>
      <p>Total: $${Number(order.totalPrice).toFixed(2)}</p>
      <hr>
    `;
    container.appendChild(div);
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadOrders(user.uid);
  } else if (window.location.pathname.includes("OrderHistory.html")) {
    window.location.href = "../auth/login.html";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    // checkoutBtn.addEventListener("click", saveOrderSnapshot);
  }
});
