import {getAllProducts} from './Products.js'

console.log( await getAllProducts())

let cart= JSON.parse(localStorage.getItem("cart")) || {}
console.log(cart)
function saveData(){
    localStorage.setItem("cart",JSON.stringify(cart))
}

export async function getNamesAndPrices() {
  const products = await getAllProducts();
  if (!products) return [];

  return Object.entries(products).map(([id, product]) => ({
    id,
    name: product.ProductName,
    imageUrl:product.imageUrl,
    price: parseFloat(product.Price)
  }));
}


export function addtocart(product){
    const exs=cart[product.id]
    console.log(exs)
        if(exs){
            exs.quantity +=product.quantity || 1;

        }else{
          cart[product.id]={
                id:product.id,
                name:product.name,
                imageUrl:product.imageUrl,
                price:product.price,
                quantity:product.quantity? product.quantity :1
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

export function increase(productId){
if(cart[productId]){
cart[productId].quantity++
saveData()
display()
}
}

export function decrease(productId){
  if(cart[productId] && cart[productId].quantity>1){
    cart[productId].quantity--
  }else{
    removeFromCart(productId);
  }
   saveData();
  display();
}
function getTotal(){
const res= Object.values(cart).reduce((sum ,item) =>{
   return sum + item.price * item.quantity
},0)
console.log(res)
return res
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
    saveData();
    console.log(`Removed product ${productId}`);
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
  const container = document.getElementById("container");
  if (!container) return;
  container.innerHTML = "";

  const values = Object.values(cart);

  values.forEach(item => {
    container.innerHTML += `
      <div class="ShowProduct-card">
        <img src="${item.imageUrl}" alt="${item.name}" />
        <h4>${item.name}</h4>
        <p>Price: $${item.price}</p>
        <p>
          <button class="btn-inc" data-id="${item.id}">+</button>
          Qty: ${item.quantity}
          <button class="btn-dec" data-id="${item.id}">-</button>
        </p>
        <p>Total: $${item.price * item.quantity}</p>
        <button class="btn-remove" data-id="${item.id}">Remove</button>
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

document.addEventListener("DOMContentLoaded", display);

