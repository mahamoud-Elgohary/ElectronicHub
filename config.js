// Import Firebase
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
   GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";



// Your Firebase config
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


onAuthStateChanged(auth, (user) => {
  const profileA = document.querySelector("#profile a");
  const leftUl = document.querySelector(".left-side ul");
  const rightUl = document.querySelector(".right-side ul");

  const attachSignout = () => {
    const signoutBtns = document.querySelectorAll("#signout-btn-left, #signout-btn-right");
    signoutBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          sessionStorage.removeItem("userId");
          window.location.href = "../homePage/home.html";
        } catch (err) {
          console.error("Sign out error:", err);
          alert("Logout failed: " + err.message);
        }
      });
    });
  };

  const setLoggedInUI = (u) => {
    const name = u && u.email ? u.email.split("@")[0] : "User";

    if (profileA) {
      profileA.textContent = `Welcome ${name}`;
      profileA.href = "../homePage/UserProfile.html"; 
    }

    if (leftUl) {
      leftUl.innerHTML = `
        <li id="profile"><a href="./UserProfile.html">Welcome ${name}</a><span></span></li>
        <li><a href="../homePage/home.html">Home </a><span>|</span></li>
        <li><a href="../Products/Products.html">Products</a></li>
      `;
    }

    if (rightUl) {
      rightUl.innerHTML = `
              <li><a href="../Products/OrderHistory.html" id="Orders-btn-right">My Orders</a></li><span>|</span></li>
        <li><a href="../LandingPage/Support.html">Support </a><span>|</span></li>
                <li><a href="../LandingPage/AboutUs.html">About Us </a><span>|</span></li>

        <li><a href="#" id="signout-btn-right">Sign out</a></li>

      `;
    }

    attachSignout();
  };

  // Logged-out UI
  const setLoggedOutUI = () => {
    if (profileA) {
      profileA.textContent = "Login";
      profileA.href = "../auth/login.html";
    }

    if (leftUl) {
      leftUl.innerHTML = `
        <li id="profile"><a href="/UserProfile.html"></a><span></span></li>
        <li><a href="../homePage/home.html">Home </a><span>|</span></li>
        <li><a href="../LandingPage/AboutUs.html">About Us </a><span>|</span></li>
        <li><a href="../Products/Products.html">Products</a></li>
      `;
    }

    if (rightUl) {
      rightUl.innerHTML = `
        <li><a href="../LandingPage/Support.html">Support </a><span>|</span></li>
        <li><a href="../auth/login.html">Login </a> <span>|</span></li>
        <li><a href="../auth/signup.html">Sign up </a></li>
      `;
    }
  };

  // keep sessionStorage in sync (optional)
  if (user) {
    sessionStorage.setItem("userId", user.uid);
    setLoggedInUI(user);
  } else {
    sessionStorage.removeItem("userId");
    setLoggedOutUI();
  }
});

export {
  auth,
  db,   GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,signOut,createUserWithEmailAndPassword,onAuthStateChanged
};


/*const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert(" Account created for: " + userCredential.user.email);
        form.reset();
        // You can redirect: window.location.href = "dashboard.html";
    } catch (error) {
        alert(" Error: " + error.message);
    }
});*/
