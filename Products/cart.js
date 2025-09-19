

let cart= JSON.parse(localStorage.getItem("cart")) || {}
console.log(cart)
function saveData(){
    localStorage.setItem("cart",JSON.stringify(cart))
}

function addtocart(product){
    const exs=cart[product.id]
    console.log(exs)
        if(exs){
            exs.quantity +=product.quantity || 1;

        }else{
          cart[product.id]={
                id:product.id,
                name:product.name,
                price:product.price,
                quantity:product.quantity? product.quantity :1
            }
        }
        saveData()
    }
function getAll() {
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

function increase(productId){
if(cart[productId]){
cart[productId].quantity++
saveData()
display()
}
}

function decrease(productId){
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
       
  }
 
   return cart
}






getTotal()

function display() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  const values = Object.values(cart);

  values.forEach(item => {
    container.innerHTML += `
    <div class="ShowProduct-grid">
      <div class="ShowProduct-card">
        <img src="https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Video-Gallery-Surface-Laptop-6-004?wid=1600&hei=900&fit=crop"  alt="${item.name}" />
        <h4>${item.name}</h4>
        <p>Price: $${item.price}</p>
        <button onclick="increase('${item.id}')">+</button>
        <p>Qty: ${item.quantity}</p>
        <button onclick="decrease('${item.id}')">-</button>
        <p>Total: $${item.price * item.quantity}</p>
        <button onclick="removeFromCart(${item.id}); display();">Remove</button>
      </div>
      </div>
    `;
  });
}

display()
