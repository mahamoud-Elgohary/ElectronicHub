/* import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { db } from "../config.js";

// List of categories you wanted
const categories = [
  "laptops",
  "Phones",
  "consoles",
  "Games",
  "accessories",
  "Mobile accessories"
];

// **You must collect a list of ~20–30 image URLs** from the free sources above.
// Example imageUrls (you should replace these with real URLs you pick from Pexels / Unsplash / Pixabay):
const imageUrls = [
  "https://images.pexels.com/photos/247676/pexels-photo-247676.jpeg",   // laptop
  "https://images.pexels.com/photos/2587937/pexels-photo-2587937.jpeg", // phone
  "https://images.pexels.com/photos/84527/pexels-photo-84527.jpeg",     // console / controller
  "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg",   // accessory
  "https://images.pexels.com/photos/226770/pexels-photo-226770.jpeg",   // mobile accessories
  "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg", // laptop + phone
  "https://images.pexels.com/photos/1334592/pexels-photo-1334592.jpeg", // gamer console
  "https://images.pexels.com/photos/365220/pexels-photo-365220.jpeg",
  "https://images.pexels.com/photos/508256/pexels-photo-508256.jpeg",
  "https://images.pexels.com/photos/3144/technology-laptop-notebook-office-3144.jpg",
  // … add more as needed
];

// helper for random integer in [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedProducts(count = 200) {
  for (let i = 1; i <= count; i++) {
    const productId = `prod_${String(i).padStart(4, "0")}`;  // e.g., prod_0001
    const productName = `Product ${i}`;
    const price = (randInt(50, 2000) + randInt(0,99)/100).toFixed(2); // e.g., 123.45
    const cost = (randInt(20, price - 1) + randInt(0,99)/100).toFixed(2);
    const discount = randInt(0, 50);     // percent
    const qty = randInt(1, 100);
    const imageUrl = imageUrls[randInt(0, imageUrls.length - 1)];
    const description = `A description for ${productName}. High quality product in ${productId}.`;
    const category = categories[randInt(0, categories.length -1)];

    const productData = {
      ProductName: productName,
      Price: price,
      Cost: cost,
      Discount: discount,
      qty: qty,
      imageUrl: imageUrl,
      Description: description,
      Categoryname: category
    };

    try {
      await set(ref(db, `Products/${productId}`), productData);
      console.log(`Added: ${productId} (${category})`);
    } catch (err) {
      console.error(`Error adding ${productId}:`, err);
    }
  }
  console.log(`${count} products seeded.`);
}

// Run
seedProducts(200); */