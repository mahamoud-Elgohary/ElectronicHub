import { db } from "../config.js";
import{ref, set,get,child}from"https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js"

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
/******************************************Read data Function*************************************************************************/

async function getAllProducts() {
  try {
    const dbRef = ref(db);
    const item = await get(child(dbRef, 'Products'));
    
    if (item.exists()) {
      const data = item.val();
      console.log("Products data:", data);
      return data; 
    } else {
      console.log("No products found");
      return null;
    }
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
}


async function renderTable() {
  const products = await getAllProducts();
  const tbody = document
    .getElementById("products-table")
    .getElementsByTagName("tbody")[0];

  tbody.innerHTML = "";
  Object.entries(products).forEach(([id, product]) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${id}</td>
      <td>${product.ProductName}</td>
      <td>${product.Price}</td>
      <td>${product.Cost}</td>
      <td>${product.Discount}</td>
      <td>${product.qty}</td>
      <td><img src="${product.imageUrl}" width="50" height="50" alt="${product.ProductName}"></td>`;
    tbody.appendChild(row);
  });
}
document.getElementById("load-products").addEventListener("click", renderTable);