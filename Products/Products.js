import {
  child,
  get,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  db
} from "../config.js";
import {
  addtocart,
  decrease
} from "./cart.js";

function writeUserData(ProductId, ProductName, imageUrl, Price, Cost, Discount, qty, Description) {
  set(ref(db, 'Products/' + ProductId), {
      ProductName: ProductName,
      Price: Price,
      Cost: Cost,
      Discount: Discount,
      qty: qty,
      imageUrl: imageUrl,
      Description: Description
    })
    .then(() => {
      alert('success');
    })
    .catch(err => {
      console.error("Firebase error:", err);
      alert("Error: " + err.message);
    });
}

let sortKey = "";          
let sortDir = 1;           
const filters = { min: null, max: null };


function passPriceFilter(p) {
  const price = parseFloat(p?.Price);
  if (!Number.isFinite(price)) return false;
  if (filters.min != null && Number.isFinite(filters.min) && price < filters.min) return false;
  if (filters.max != null && Number.isFinite(filters.max) && price > filters.max) return false;
  return true;
}


function compareBy(p1, p2, key, dir) {
  if (!key) return 0;
  if (key === "Price" || key === "qty" || key === "Discount") {
    const n1 = parseFloat(p1?.[key]) || 0;
    const n2 = parseFloat(p2?.[key]) || 0;
    return (n1 - n2) * dir;
  }
  const s1 = (p1?.[key] || "").toString().toLowerCase();
  const s2 = (p2?.[key] || "").toString().toLowerCase();
  return s1.localeCompare(s2) * dir;
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

/********************************************Write data***************************************************************************/

/* document.getElementsByClassName("ShowProduct").addEventListener("submit", (event) => {
  event.preventDefault();

  const ProductId = Date.now().toString();
  const ProductName = document.getElementById("PN").value;
  const Price = document.getElementById("Price").value;
  const Discount = document.getElementById("Dis").value;
  const Cost = document.getElementById("cost").value;
  const qty = document.getElementById("qty").value;
  const imageUrl = document.getElementById("img").value;

  writeUserData(ProductId, ProductName, imageUrl, Price, Cost, Discount, qty);
}); */
/******************************************Read data Function*************************************************************************/

function getCategoryNameFromURL() {
  const p = new URLSearchParams(location.search);
  const name = p.get("card") || "";
  console.log(name)
  return name
}
getCategoryNameFromURL()

function getCartTotalFromLS() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  return Object.values(cart).reduce((sum, it) => sum + it.price * it.quantity, 0);
}

// function getQtyFromLS(id) {
//   const cart = JSON.parse(localStorage.getItem("cart") || "{}");
//   return cart[id]?.quantity || 0;
// }

function updateCartSummaryUI() {
  const el = document.getElementById("cart-total");
  if (el) el.textContent = getCartTotalFromLS().toFixed(2);
}

function filterProductsObject(allProducts) {
  if (!allProducts) {
    console.log("something is wrong");
    return {};
  }
  const wantedCategory = getCategoryNameFromURL();

  if (!wantedCategory) {
    return allProducts;
  }

  const result = {};
  for (let productId in allProducts) {
    const product = allProducts[productId];

    if (product && product.Categoryname === wantedCategory) {
      result[productId] = product;
    }
  }

  return result;

}
async function getProducts() {
     const all = await getAllProducts();                 
     const base = filterProductsObject(all) || {};
      let entries = Object.entries(base).filter(([_, p]) => passPriceFilter(p));
      if (sortKey) entries.sort((a, b) => compareBy(a[1], b[1], sortKey, sortDir));
      const container = document.getElementsByClassName("ShowProduct")[0];
      if (!container) return;
      container.innerHTML = "";
      for (const [id, product] of entries) {

      const card = document.createElement("div");
      card.classList.add("ShowProduct-card");

      card.innerHTML = `
        <img src="${product.imageUrl}">
        <h4>${product.ProductName}</h4>
        <p>Description:${product.Description}</p>
        <p class="price">$${product.Price}</p>
        <div class="btns">
        <button class="btn btn-success btn1">+</button>
            <span class="qty"></span>
        <button class="btn btn-danger btn2">-</button>
        </div>

      `;
      const btn1 = card.querySelector(".btn1");
      const btn2 = card.querySelector(".btn2");
      const qty = card.querySelector(".qty");

      let quantity = 0;

      btn1.addEventListener("click", () => {
        quantity++;
        qty.textContent = quantity;
      });

      btn2.addEventListener("click", () => {
        if (quantity > 0) {
          quantity--;
          qty.textContent = quantity;
        }
      });

      container.appendChild(card);

      card.querySelector(".btn1").addEventListener("click", () => {
       if (parseInt(product.qty, 10) < 1) {
    alert("This product is out of stock!");
    return;
  }
        addtocart({
          id: id,
          name: product.ProductName,
          imageUrl: product.imageUrl,
          price: parseFloat(product.Price),
          quantity: 1,
              stock: parseInt(product.qty, 10)   
        });
      });
      card.querySelector(".btn2").addEventListener("click", () => {
        decrease(id);

        updateCartSummaryUI();

        if (typeof display === "function") {
          display();
        }
      });
    }
      window.dispatchEvent(new Event("products:rendered"));
    
  
}


/*******************************Searchbar*********************************************************/
const search = document.getElementById("search-input")
const cards = document.getElementsByClassName("ShowProduct-card");
if (search) {
  search.addEventListener("input", () => {
    const unicase = search.value.toLowerCase();
    for (let i = 0; i < cards.length; i++) {
      const product = cards[i];
      const name = product.querySelector("h4").textContent.toLowerCase();
      product.style.display = name.includes(unicase) ? "" : "none";
    }
  });
}

/*
{
  const handler = () => {
    const current = parseInt(qtySpan.textContent, 10) || 0;
    if (current <= 0) return;

    decrease(id);
    const q = getQtyFromLS(id);
    qtySpan.textContent = q;
    lineAmount.textContent = (price * q).toFixed(2);
    if (q === 0) decBtn.setAttribute("disabled", "true");
    updateCartSummaryUI();
  };

  if (typeof decBtn !== "undefined" && decBtn && typeof handler === "function") {
    decBtn.addEventListener("click", handler);
  }
}
*/

window.addEventListener("load", getProducts);

/* async function renderTable() {
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
} */ ///////////////



////////////////////////
(function () {
  const PAGE_SIZE = 6;
  const container = document.getElementsByClassName("ShowProduct")[0];
  if (!container) return; // ✅ Skip pagination if no container


  let pager = document.createElement("div");
  pager.id = "pager";
  pager.className = "d-flex justify-content-between align-items-center mt-3";
  pager.style.gap = "12px";
  pager.innerHTML = `
      <button id="prevPage" class="btn btn-outline-secondary btn-sm">Prev</button>
      <span id="pageInfo" class="small text-muted"></span>
      <button id="nextPage" class="btn btn-outline-secondary btn-sm">Next</button>
    `;
  container.after(pager);


  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  let page = 1;

  const allCards = () => Array.from(container.getElementsByClassName("ShowProduct-card"));

  function rebuildAndRender() {
    const cards = allCards();
    const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    page = Math.min(Math.max(page, 1), totalPages);

    cards.forEach(c => (c.style.display = "none"));

    const start = (page - 1) * PAGE_SIZE;
    cards.slice(start, start + PAGE_SIZE).forEach(c => (c.style.display = ""));

    pageInfo.textContent = `Page ${page} / ${totalPages} • ${cards.length} items`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  }

  prevBtn.addEventListener("click", () => {
    page--;
    rebuildAndRender();
  });

  nextBtn.addEventListener("click", () => {
    page++;
    rebuildAndRender();
  });

  window.addEventListener("load", () => {
    if (allCards().length) {
      rebuildAndRender();
    }
  });

  window.addEventListener("products:rendered", rebuildAndRender);
})();


const minEl = document.getElementById("filter-min");
const maxEl = document.getElementById("filter-max");
const sortSel = document.getElementById("sort-key");  
const sortDirBtn = document.getElementById("sort-dir"); 

if (minEl) {
  minEl.addEventListener("input", () => {
    const v = parseFloat(minEl.value);
    filters.min = Number.isFinite(v) ? v : null;
    getProducts();
  });
}
if (maxEl) {
  maxEl.addEventListener("input", () => {
    const v = parseFloat(maxEl.value);
    filters.max = Number.isFinite(v) ? v : null;
    getProducts();
  });
}
if (sortSel) {
  sortSel.addEventListener("change", () => {
    sortKey = sortSel.value;          
    getProducts();
  });
}
if (sortDirBtn) {
  sortDirBtn.addEventListener("click", () => {
    sortDir = -sortDir;                // toggle
    sortDirBtn.textContent = sortDir === 1 ? "Asc" : "Desc";
    getProducts();
  });
}
