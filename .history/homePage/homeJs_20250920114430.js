import { db } from '..config.js';
import {
  get,
  limitToFirst,
  query,
  ref,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
import { ListenToCategories } from '../Products/Category.js';

document.addEventListener('DOMContentLoaded', () => {
  // Only run realtime Categories page if its container exists
  if (document.getElementById('categories-list')) {
    ListenToCategories();
  }

  // Home: show exactly 5 categories
  show5Categories();

  // UI widgets
  initSwiper();
  initMenuToggle();
  initSearchForm();
});

function initSwiper() {
  if (typeof Swiper === 'undefined') return;
  new Swiper('.mySwiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: { el: '.swiper-pagination', clickable: true },
  });
}

function initMenuToggle() {
  const toggleBtn = document.getElementById('menu-toggle');
  const leftSide = document.querySelector('.left-side');
  const rightSide = document.querySelector('.right-side');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', () => {
    leftSide?.classList.toggle('active');
    rightSide?.classList.toggle('active');
  });
}

function initSearchForm() {
  const form = document.getElementById('search-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Searching…');
  });
}

async function show5Categories() {
  const container = document.getElementById('home-cats');
  if (!container) return; // not Home page

  try {
    const q = query(ref(db, 'Categories'), limitToFirst(5));
    const snap = await get(q);
    const data = snap.val();

    container.innerHTML = '';
    if (!data) {
      container.textContent = 'No categories yet';
      return;
    }

    Object.values(data).forEach((c) => {
      const card = document.createElement('div');
      card.className = 'ShowProduct-card';
      card.innerHTML = `
        <img src="${c?.Categoryimage || ''}" alt="${c?.Categoryname || 'Category'}" />
        <h3>${c?.Categoryname || 'Category'}</h3>`;
      container.appendChild(card);
    });
  } catch (e) {
    console.error('show5Categories error:', e);
  }
}
