import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Replace with your Firebase config
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

const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Account created for: " + userCredential.user.email);
        form.reset();
        // Redirect to dashboard if you want:
        // window.location.href = "dashboard.html";
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
});
