import {auth,createUserWithEmailAndPassword} from "../config.js"
const form = document.getElementById("signup-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Account created for: " + userCredential.user.email);
        form.reset();

    } catch (error) {
        alert(" Error: " + error.message);
    }
});

const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
});
