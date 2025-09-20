import { db } from "../config.js";

import{ ref, onValue ,set} from"https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js"

function CreateCategory(Category_id, Categoryname, Categoryimage) {
    set(ref(db, 'Categories/' + Category_id), {
        Categoryname: Categoryname,
        Categoryimage: Categoryimage
    })
    .then(() => {
        console.log("Category created successfully!");
    })
    .catch((error) => {
        console.error("Error creating category:", error);
    });
}
document.getElementById("create-Category").addEventListener("submit", (event) => {
  event.preventDefault();

  const Category_id = Date.now().toString(); 
  const Categoryname = document.getElementById("CN").value;
  const Categoryimage = document.getElementById("img").value;

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
  const categoriesRef = ref(db, "Categories");

  onValue(categoriesRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Updated Categories:", data);

    const container = document.getElementById("categories-list");
    container.innerHTML = "";
  Object.values(data).forEach((category) => {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="ShowProduct-card">
      <img src="${category.Categoryimage}" alt="${category.Categoryname}" />
      <h3>${category.Categoryname}</h3>
    </div>
  `;
  container.appendChild(div);
});
  });
}


ListenToCategories();