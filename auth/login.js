import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,  GoogleAuthProvider,  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
  authDomain: "electronichub-22676.firebaseapp.com",
  projectId: "electronichub-22676",
  storageBucket: "electronichub-22676.appspot.com",
  messagingSenderId: "104130323974",
  appId: "1:104130323974:web:9495c1c28539ad872cc587",
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const form = document.getElementById("login-form");

// Google login button
const googleBtn = document.getElementById("google-login");

googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    alert("Welcome " + user.displayName);

    // redirect same as email login
    if (user.email.endsWith("@electronichub.com")) {
      window.location.href = "/homePage/AdminPanel.html";
    } else {
      window.location.href = "/homePage/home.html";
    }
  } catch (error) {
    alert("Google login failed: " + error.message);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert(" Welcome back " + user.email);
    form.reset();

    if (user.email.endsWith("@electronichub.com")) {
      window.location.href = "/homePage/AdminPanel.html";

    } else {
      window.location.href = "/homePage/home.html";
    }

  } catch (error) {
    window.alert("Login failed: " + error.message);
  }

});



const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
  leftSide.classList.toggle("active");
  rightSide.classList.toggle("active");
});
