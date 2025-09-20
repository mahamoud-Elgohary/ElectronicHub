import {
  get,
  limitToFirst,
  query,
  ref,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
import { db } from '../Products/config.js';

import { ListenToCategories } from '../Products/Category.js';

document.addEventListener('DOMContentLoaded', () => {
  ListenToCategories();
});

var swiper = new Swiper('.mySwiper', {
  slidesPerView: 1,
  spaceBetween: 20,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
});

const toggleBtn = document.getElementById('menu-toggle');
const leftSide = document.querySelector('.left-side');
const rightSide = document.querySelector('.right-side');

toggleBtn.addEventListener('click', () => {
  leftSide.classList.toggle('active');
  rightSide.classList.toggle('active');
});

document.getElementById('search-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Searching…');
});
ListenToCategories();

window.addEventListener('DOMContentLoaded', () => {
  show5Categories();
});

async function show5Categories() {
  const container = document.getElementById('home-cats');
  if (!container) return;

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
