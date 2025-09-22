import {
  db
} from '../config.js';
import {
  ref,
  query,
  limitToFirst,
  get,
  orderByChild,
  equalTo,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

document.addEventListener('DOMContentLoaded', () => {
  showCategories5();
  showFeaturedProducts();
});

//
async function showCategories5() {
  const box = document.getElementById('home-cats');
  if (!box) return;
  box.innerHTML = loadingBox('Loading categories…');
  try {
    const snap = await get(query(ref(db, 'Categories'), limitToFirst(5)));
    const data = snap.val();

    box.innerHTML = '';
    if (!data) return box.appendChild(alertBox('No categories yet', 'warning'));

    for (const [id, c] of Object.entries(data)) {
      const name = c?.Categoryname || 'Category';
      const img = c?.Categoryimage || '';
      const link = `/Products/Products.html?cat=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;

      box.insertAdjacentHTML('beforeend', `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <a href="${link}" class="text-decoration-none d-block h-100">
            <div class="card border-0 shadow h-100">
              <img src="${img}" alt="${name}" class="card-img-top" />
              <div class="card-body text-center">
                <h3 class="h6 mb-0 text-dark">${name}</h3>
              </div>
            </div>
          </a>
        </div>`);
    }
  } catch (e) {
    console.error(e);
    box.innerHTML = '';
    box.appendChild(alertBox('Failed to load categories.', 'danger'));
  }
}

async function showFeaturedProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = loadingBox('Loading products…');

  try {

    const snap = await get(query(ref(db, 'Products'), limitToFirst(8)));
    const data = snap.val();

    grid.innerHTML = '';
    if (!data) {
      grid.appendChild(alertBox('No products found.', 'warning'));
      return;
    }

    for (const [id, p] of Object.entries(data)) {
      const title = p.ProductName || 'Product';
      const img = p.imageUrl || '';
      const price = Number(p.Price);

      grid.insertAdjacentHTML('beforeend', `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card border-0 shadow h-100 overflow-hidden">
            <img src="${img}" alt="${title}" class="card-img-top" />
            <div class="card-body text-center">
              <h3 class="h6 mb-1">${title}</h3>
              <div class="fw-bold">${isFinite(price) ? 'EGP ' + price.toLocaleString('en-EG') : ''}</div>
            </div>
          </div>
        </div>`);
    }
  } catch (e) {
    console.error('showFeaturedProducts error:', e);
    grid.innerHTML = '';
    grid.appendChild(alertBox('Failed to load products.', 'danger'));
  }
}

function loadingBox(text) {
  return `<div class="col-12"><div class="alert alert-secondary m-0">${text}</div></div>`;
}

function alertBox(text, type) {
  const el = document.createElement('div');
  el.className = 'col-12';
  el.innerHTML = `<div class="alert alert-${type} m-0">${text}</div>`;
  return el;
}


//   Burger Menu
 const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });