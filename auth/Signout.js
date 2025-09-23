import { auth, createUserWithEmailAndPassword } from "../config.js";

const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Account created for: " + userCredential.user.email);
    form.reset();
    window.location.href = "./login.html"; 
  } catch (error) {
    alert("Error: " + error.message);
  }
});
