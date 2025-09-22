window.addEventListener('DOMContentLoaded', async () => {
  const hasCategoryUI =
    document.getElementById('categories-list') ||
    document.getElementById('create-Category');

  if (!hasCategoryUI) return;

  try {
    const mod = await import('../Products/Category.js');
    if (typeof mod.ListenToCategories === 'function') {
      mod.ListenToCategories();
    }
  } catch (err) {
    console.error('Failed to load Products/Category.js:', err);
  }
});


//   Burger Menu
 const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });
