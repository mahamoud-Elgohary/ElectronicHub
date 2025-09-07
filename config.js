// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


// Your Firebase config (replace with your actual values from Firebase Console)
const firebaseConfig = {
     apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
    authDomain: "electronichub-22676.firebaseapp.com",
    databaseURL:"https://electronichub-22676-default-rtdb.firebaseio.com",
    projectId: "electronichub-22676",
    storageBucket: "electronichub-22676.appspot.com",
    messagingSenderId: "104130323974",
    appId: "1:104130323974:web:9495c1c28539ad872cc587"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export{db,auth};


/*const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Account created for: " + userCredential.user.email);
        form.reset();
        // You can redirect: window.location.href = "dashboard.html";
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
});*/
