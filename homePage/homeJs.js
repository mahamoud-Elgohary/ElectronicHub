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
