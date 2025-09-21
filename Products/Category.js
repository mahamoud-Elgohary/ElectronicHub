import { db } from '../config.js';

import { onValue, ref, set } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

function CreateCategory(Category_id, Categoryname, Categoryimage) {
  set(ref(db, 'Categories/' + Category_id), {
    Categoryname: Categoryname,
    Categoryimage: Categoryimage,
  })
    .then(() => {
      console.log('Category created successfully!');
    })
    .catch((error) => {
      console.error('Error creating category:', error);
    });
}
document.getElementById('create-Category').addEventListener('submit', (event) => {
  event.preventDefault();

  const Category_id = Date.now().toString();
  const Categoryname = document.getElementById('CN').value;
  const Categoryimage = document.getElementById('img').value;

  CreateCategory(Category_id, Categoryname, Categoryimage);
});

/*function createdb(){
        Category_id="123456"
        Categoryname="Mobile";
        Categoryimage="https://img.global.news.samsung.com/in/wp-content/uploads/2019/01/Galaxy-10yrs_High-Res..jpg";

        CreateCategory(Category_id,Categoryname,Categoryimage)

}

createdb()
*/
function ListenToCategories() {
  const categoriesRef = ref(db, 'Categories');

  onValue(categoriesRef, (snapshot) => {
    const data = snapshot.val();
    console.log('Updated Categories:', data);

    const container = document.getElementById('categories-list');
    if (!container) return; 
       container.innerHTML = '';

    if (!data) { 
      container.innerHTML = '<p class="text-muted">No categories.</p>';
      return;
    }

    Object.entries(data).forEach(([id, category]) => {
      const name = category?.Categoryname || '';
      const img = category?.Categoryimage || '';

      console.log(img, name);

      const div = document.createElement('div');
      div.innerHTML = `
        <a href="./Products.html?card=${encodeURIComponent(name)}" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card h-100 shadow-sm">
            <div class="ratio ratio-16x9">
              <img src="${img}" alt="${name}" />
            </div>
            <div class="card-body text-center">
              <h3 class="card-title">${name}</h3>
            </div>
          </div>
        </a>
      `;
      container.appendChild(div);
    });
  });
}



ListenToCategories();
export { ListenToCategories };

