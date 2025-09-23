// Import Firebase
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
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
  const welcome = document.querySelector("#profile a");
  if (welcome) {
    if (user) {
      const userName = user.email.split("@")[0];
      welcome.textContent = `Welcome ${userName}`;
    } else {
      welcome.textContent = "Login";
      welcome.href = "/auth/login.html";
    }
  }
});

export {
  auth,
  db
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
