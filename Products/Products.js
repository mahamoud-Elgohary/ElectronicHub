import { db } from "../config.js";
import{ref, set}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js"

function writeUserData(ProductId, ProductName, imageUrl, Price,Cost, Discount ,qty) {
  set(ref(db, 'Products/' + ProductId), {
    ProductName:ProductName,
    Price:Price,
    Cost:Cost,  
    Discount:Discount,
    qty:qty,
    imageUrl : imageUrl
  })
  .then(()=>{alert('success')})

.catch(err => {
  console.error("Firebase error:", err);
  alert("Error: " + err.message);
});
}


document.getElementById("create-product").addEventListener("submit", (event) => {
  event.preventDefault();

  const ProductId = Date.now().toString(); 
  const ProductName = document.getElementById("PN").value;
  const Price = document.getElementById("Price").value;
  const Discount = document.getElementById("Dis").value;
  const Cost = document.getElementById("cost").value;
  const qty = document.getElementById("qty").value;
  const imageUrl = document.getElementById("img").value;

  writeUserData(ProductId, ProductName, imageUrl, Price, Cost, Discount, qty);
});