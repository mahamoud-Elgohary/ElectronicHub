import { db, auth } from "../config.js";
import { ref, get, child, push, set }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "{}");
}
function clearCart() {
  localStorage.removeItem("cart");
}

export async function saveOrderSnapshot() {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to place an order.");
    return;
  }

  // Check if the user's email is verified
  if (!user.emailVerified) {
    alert("Please verify your email before making a purchase.");
    return;
  }

  const cart = getCart();
  if (!cart || Object.keys(cart).length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let totalCartPrice = 0;
  const products = Object.entries(cart).map(([id, item]) => {
    const total = item.price * item.quantity;
    totalCartPrice += total;
    return {
      id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total,
      imageUrl: item.imageUrl || null
    };
  });

  const orderId = push(ref(db, `Orders/${user.uid}`)).key;

  const orderData = {
    orderId,
    userId: user.uid,
    createdAt: new Date().toISOString(),
    items: products,
    totalPrice: totalCartPrice,
    status: "paid"
  };

  await set(ref(db, `Orders/${user.uid}/${orderId}`), orderData);

  clearCart();
  alert("Paid Successfully");
  window.location.href = "./OrderHistory.html";
}
onAuthStateChanged(auth, (user) => {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (user && checkoutBtn) {
    if (!user.emailVerified) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = "Please Verify Your Email First"; // You can change the button text to something like this
    } else {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = "Pay Now"; // Reset the button text when email is verified
    }
  }
});

async function loadOrders(userId) {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `Orders/${userId}`));
  if (snapshot.exists()) {
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
  
        <ul>
          ${order.items.map(it => `<li>${it.name} - ${it.quantity} × $${it.price} = $${it.total}</li>`).join("")}
        </ul>
        <p>Total: $${order.totalPrice.toFixed(2)}</p>
        <hr>
      `;
      container.appendChild(div);
    });
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadOrders(user.uid);
  } else {
    if (window.location.pathname.includes("OrderHistory.html")) {
      window.location.href = "../auth/login.html";
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", saveOrderSnapshot);
  }
});
