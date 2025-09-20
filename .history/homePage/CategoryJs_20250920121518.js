
window.addEventListener('DOMContentLoaded', async () => {
  const hasCategoryUI =
    document.getElementById('categories-list') ||
    document.getElementById('create-Category');

  if (!hasCategoryUI) return; // Not a Category page → do nothing

  try {
    const mod = await import('../Products/Category.js'); // vendor file
    if (typeof mod.ListenToCategories === 'function') {
      mod.ListenToCategories();
    }
  } catch (err) {
    console.error('Failed to load Products/Category.js:', err);
  }
});
