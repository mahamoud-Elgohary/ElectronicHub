// Import Firebase
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push } from
  "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
  authDomain: "electronichub-22676.firebaseapp.com",
  databaseURL: "https://electronichub-22676-default-rtdb.firebaseio.com",
  projectId: "electronichub-22676",
  storageBucket: "electronichub-22676.firebasestorage.app",
  messagingSenderId: "104130323974",
  appId: "1:104130323974:web:9495c1c28539ad872cc587"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);



const contactForm = document.getElementById('support-form');
const fnameInput = document.getElementById('support-Fname');
const lnameInput = document.getElementById('support-Lname');
const phoneInput = document.getElementById('support-phone');
const emailInput = document.getElementById('support-email');
const messageInput = document.getElementById('support-message');
const supportStatus = document.getElementById('support-status');


if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    supportStatus.textContent = "Sending message...";
    supportStatus.style.color = "#4a5568";

    const newMessage = {
      fname: fnameInput.value,
      lname: lnameInput.value,
      phone: phoneInput.value,
      email: emailInput.value,
      message: messageInput.value,
      timestamp: new Date().toISOString()
    };
    try {
      
      await push(ref(db, 'support_messages'), newMessage);

      supportStatus.textContent = " Thank you! Your message has been sent.";
      supportStatus.style.color = "#0d0724";
      contactForm.reset();
    } catch (error) {
      console.error("Error writing to database: ", error);
      supportStatus.textContent = " Error sending message. Try again.";
      supportStatus.style.color = "#e74c3c";
    }
  });
}


//   Burger Menu
const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
  leftSide.classList.toggle("active");
  rightSide.classList.toggle("active");
});