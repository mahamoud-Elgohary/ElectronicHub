
import { auth } from "../config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const form = document.getElementById("forgot-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    alert(" Password reset email sent! Check Your Mail");
    form.reset();
  // Redirect To Login Page 
    window.location.href = "./login.html";
  } catch (error) {
    alert(" Error: " + error.message);
  }
});

// keep same toggle menu logic if UI needs it
const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
  leftSide.classList.toggle("active");
  rightSide.classList.toggle("active");
});