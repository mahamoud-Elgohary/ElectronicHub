// Mobile menu toggle
const menu = document.getElementById('menu');
const toggleBtn = document.getElementById('toggleMenu');
if (toggleBtn && menu) {
  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    menu.classList.toggle('-translate-y-4');
    menu.classList.toggle('opacity-0');
    toggleBtn.setAttribute('aria-expanded', !menu.classList.contains('hidden'));
  });
}

// Slider functionality
const slides = [...document.querySelectorAll('#slider .slide')];
let idx = 0;
const show = (n) => slides.forEach((s, i) => s.classList.toggle('hidden', i !== n));
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
if (prevBtn && nextBtn && slides.length) {
  prevBtn.onclick = () => show((idx = (idx - 1 + slides.length) % slides.length));
  nextBtn.onclick = () => show((idx = (idx + 1) % slides.length));
  setInterval(() => nextBtn.click(), 4000);
}

// Define custom element ProductCard
customElements.define(
  'product-card',
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = document.getElementById('Card').innerHTML;
    }
  },
);

// Populate product grid
document.addEventListener('DOMContentLoaded', () => {
  const products = [
    { icon: '&#128267;', title: 'Bluetooth Headset', desc: 'Noise Canceling', price: '$199' },
    { icon: '&#128241;', title: 'SmartPhone X', desc: '256GB, Triple Camera', price: '$899' },
    { icon: '&#128187;', title: 'Gaming PC Rig', desc: 'RTX 4080, 32GB', price: '$2499' },
    { icon: '&#128269;', title: '4K Monitor', desc: '27-inch, 144Hz', price: '$349' },
    { icon: '&#128421;', title: 'Mechanical Keyboard', desc: 'RGB, Blue Switch', price: '$129' },
    { icon: '&#128421;', title: 'Wireless Mouse', desc: 'Ergonomic, 16000 DPI', price: '$79' },
  ];

  const grid = document.getElementById('productGrid');
  products.forEach((p) => {
    const card = document.createElement('product-card');
    card.innerHTML = card.innerHTML
      .replace(
        '<slot name="icon"></slot>',
        `<span slot="icon" class="text-4xl text-primary">${p.icon}</span>`,
      )
      .replace('<slot name="title"></slot>', p.title)
      .replace('<slot name="desc"></slot>', p.desc)
      .replace('<slot name="price"></slot>', p.price);
    grid.appendChild(card);
  });
});

// Modal logic
const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
if (modal && openModalBtn && closeModalBtn) {
  openModalBtn.onclick = () => modal.classList.replace('hidden', 'flex');
  closeModalBtn.onclick = () => modal.classList.replace('flex', 'hidden');
  modal.onclick = (e) => e.target === modal && modal.classList.replace('flex', 'hidden');
}
