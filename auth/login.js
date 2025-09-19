import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Same Firebase config as signup.js
const firebaseConfig = {
    apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
    authDomain: "electronichub-22676.firebaseapp.com",
    projectId: "electronichub-22676",
    storageBucket: "electronichub-22676.appspot.com",
    messagingSenderId: "104130323974",
    appId: "1:104130323974:web:9495c1c28539ad872cc587"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Welcome back " + userCredential.user.email);
        form.reset();
        // Redirect to dashboard
        //window.location.href = "dashboard.html";
        window.alert("Login Succesfully!!")
    } catch (error) {
        window.alert("❌ Login failed: " + error.message);
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