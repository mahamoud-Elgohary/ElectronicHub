// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  onValue,
  child,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
  authDomain: "electronichub-22676.firebaseapp.com",
  databaseURL: "https://electronichub-22676-default-rtdb.firebaseio.com",
  projectId: "electronichub-22676",
  storageBucket: "electronichub-22676.appspot.com",
  messagingSenderId: "104130323974",
  appId: "1:104130323974:web:9495c1c28539ad872cc587"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Navbar UI update function
async function updateNavbar(user) {
  const profileA = document.querySelector("#profile a");
  const leftUl = document.querySelector(".left-side ul");
  const rightUl = document.querySelector(".right-side ul");

  if (!user) {
    // Logged out UI
    if (profileA) {
      profileA.textContent = "Login";
      profileA.href = "../auth/login.html";
    }
    if (leftUl) leftUl.innerHTML = `
      <li id="profile"><a href="/UserProfile.html"></a></li>
      <li><a href="../homePage/home.html">Home</a></li>
      <li><a href="../LandingPage/AboutUs.html">About Us</a></li>
      <li><a href="../Products/Products.html">Products</a></li>
    `;
    if (rightUl) rightUl.innerHTML = `
      <li><a href="../LandingPage/Support.html">Support</a></li>
      <li><a href="../auth/login.html">Login</a></li>
      <li><a href="../auth/signup.html">Sign up</a></li>
    `;
    return;
  }

  // Get role from database
  let role = "user";
  try {
    const snap = await get(ref(db, "users/" + user.uid));
    if (snap.exists()) role = snap.val().role || "user";
  } catch (err) {
    console.error("Failed to get user role:", err);
  }

  const name = user.email.split("@")[0];

  // Build navbar
  if (role === "admin") {
    if (leftUl) leftUl.innerHTML = `
      <li id="profile"><a href="../homePage/UserProfile.html">Welcome ${name}</a></li>
      <li><a href="../homePage/AdminPanel.html">Admin Panel</a></li>
      <li><a href="../homePage/admin-support.html">Technical Support</a></li>
    `;
    if (rightUl) rightUl.innerHTML = `
      <li><a href="../LandingPage/Support.html">Support</a></li>
      <li><a href="#" id="signout-btn-right">Sign out</a></li>
    `;
  } else {
    if (leftUl) leftUl.innerHTML = `
      <li id="profile"><a href="../homePage/UserProfile.html">Welcome ${name}</a></li>
      <li><a href="../homePage/home.html">Home</a></li>
      <li><a href="../Products/Products.html">Products</a></li>
    `;
    if (rightUl) rightUl.innerHTML = `
      <li><a href="../Products/OrderHistory.html">My Orders</a></li>
      <li><a href="../LandingPage/Support.html">Support</a></li>
      <li><a href="../LandingPage/AboutUs.html">About Us</a></li>
      <li><a href="#" id="signout-btn-right">Sign out</a></li>
    `;
  }

  // Attach signout
  document.querySelectorAll("#signout-btn-left, #signout-btn-right").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.preventDefault();
      try {
        await signOut(auth);
        sessionStorage.removeItem("userId");
        window.location.href = "../homePage/home.html";
      } catch (err) {
        alert("Logout failed: " + err.message);
      }
    });
  });
}

// Listen to auth changes
onAuthStateChanged(auth, user => {
  sessionStorage.setItem("userId", user ? user.uid : null);
  updateNavbar(user);
});

export {
  app, auth, db,
  onAuthStateChanged, GoogleAuthProvider,
  signInWithEmailAndPassword, signInWithPopup,
  signOut, createUserWithEmailAndPassword,
  sendEmailVerification, reauthenticateWithCredential,
  updateEmail, updatePassword, updateProfile,
  EmailAuthProvider,
  ref, get, set, update, push, onValue, child, runTransaction
};
