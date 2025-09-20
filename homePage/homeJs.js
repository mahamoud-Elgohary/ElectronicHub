import {
  db
} from '../config.js';
import {
  ref,
  query,
  limitToFirst,
  get
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';


document.addEventListener('DOMContentLoaded', () => renderHome());


async function renderHome() {
  const box = document.getElementById('home-cats');
  if (!box) return;
  box.innerHTML = `<div class="col-12"><div class="alert alert-secondary m-0">Loading…</div></div>`;
  try {
    const snap = await get(query(ref(db, 'Categories'), limitToFirst(5)));
    const data = snap.val() || {};
    box.innerHTML = '';
    for (const [id, c] of Object.entries(data)) {
      const name = esc(c?.Categoryname || 'Category');
      const img = esc(c?.Categoryimage || '');
      const link = `/Products/Products.html?cat=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
      box.insertAdjacentHTML('beforeend', `
<div class="col-12 col-sm-6 col-md-4 col-lg-3">
<a href="${link}" class="text-decoration-none d-block h-100">
<div class="card border-0 shadow h-100 overflow-hidden">
<img src="${img}" alt="${name}" class="card-img-top" />
<div class="card-body text-center">
<h3 class="h6 mb-0 text-dark">${name}</h3>
</div>
</div>
</a>
</div>`);
    }
  } catch (e) {
    console.error('renderHome error:', e);
    box.innerHTML = `<div class="col-12"><div class="alert alert-danger m-0">Failed to load categories.</div></div>`;
  }
}


function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
