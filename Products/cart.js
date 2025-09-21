import { getAllProducts } from './Products.js'

console.log(await getAllProducts())

let cart = JSON.parse(localStorage.getItem("cart")) || {};
console.log(cart)
function loadData() {

  cart = JSON.parse(localStorage.getItem("cart")) || {};
}
function saveData() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


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


export function addtocart(product) {
  const exs = cart[product.id]
  console.log(exs)
  if (exs) {
    exs.quantity += product.quantity || 1;

  } else {
    cart[product.id] = {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: product.quantity ? product.quantity : 1
    }
  }
  saveData()
  window.dispatchEvent(new CustomEvent("cart:updated", {
    detail: { type: "add", productId: product.id }
  }));
}
export function getAll() {
  const values = Object.values(cart);
  const totalQty = values.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
  const totalPrice = getTotal();

  return {
    totalPrice: totalPrice,
    totalQty: totalQty,
    totalItems: values.length
  };
}

export function increase(productId) {
  if (cart[productId]) {
    cart[productId].quantity++
    saveData()
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "inc", productId } }));

    display()
  }
}

export function decrease(productId) {
  if (cart[productId] && cart[productId].quantity > 1) {
    cart[productId].quantity--
  } else {
    removeFromCart(productId);
  }
  saveData();
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "dec", productId } }));

  display();
}
function getTotal() {
  const res = Object.values(cart).reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
  console.log(res)
  return res
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
    saveData();
    console.log(`Removed product ${productId}`);
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type: "remove", productId } }));

    display();

  }

  return cart
}



(async () => {
  const simpleProducts = await getNamesAndPrices();
  console.log(simpleProducts);
})();



getTotal()

export function display() {
  loadData();
  const container = document.getElementById("cart-container");
  if (!container) return;
  container.innerHTML = "";

  const values = Object.values(cart);

  values.forEach(item => {
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


  document.querySelectorAll(".btn-inc").forEach(btn =>
    btn.addEventListener("click", () => increase(btn.dataset.id))
  );
  document.querySelectorAll(".btn-dec").forEach(btn =>
    btn.addEventListener("click", () => decrease(btn.dataset.id))
  );
  document.querySelectorAll(".btn-remove").forEach(btn =>
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id))
  );
}



export function updateNavbarCart() {
  const navCart = document.querySelector(".cart");
  if (!navCart) return;

  const { totalPrice, totalQty } = getAll();
  navCart.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> $${totalPrice.toFixed(2)} (${totalQty} items)`;
}

document.addEventListener("DOMContentLoaded", updateNavbarCart);


///////////////////////////Stripe integration////////////////////////////////////
export function checkout() {
  const { totalPrice, totalQty } = getAll();

  if (totalQty === 0) {
    alert("Cart is empty!");
    return;
  }

  // Fake Stripe test link
  const stripeBaseUrl = "https://buy.stripe.com/test_28E28q3XjeV230dbWgfMA00";

  // Append mock info as query params
  const url = `${stripeBaseUrl}?amount=${totalPrice.toFixed(2)}&items=${totalQty}`;

  window.open(url, "_blank"); // open in new tab
}
