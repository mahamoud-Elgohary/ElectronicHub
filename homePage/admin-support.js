// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

const ticketsContainer = document.getElementById("tickets-container");

const supportRef = ref(db, "support_messages");

onValue(supportRef, (snapshot) => {
  ticketsContainer.innerHTML = ""; 

  snapshot.forEach((child) => {
    const ticketId = child.key;
    const data = child.val();

    const div = document.createElement("div");
    div.classList.add("ticket");

    div.innerHTML = `
      <h3>${data.fname} ${data.lname}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Received:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p><span class="status ${data.status || 'open'}">${data.status || 'open'}</span></p>
      <button data-id="${ticketId}" class="close-btn">Make IT Closed</button>
    `;

    ticketsContainer.appendChild(div);
  });

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await update(ref(db, "support_messages/" + id), { status: "closed" });
    });
  });
});



//   Burger Menu
 const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });