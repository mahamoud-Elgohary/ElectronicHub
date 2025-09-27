  import {auth,GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, ref ,get,db,update } from "../config.js"


  const provider = new GoogleAuthProvider();

  const form = document.getElementById("login-form");

  const googleBtn = document.getElementById("google-login");


  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      alert("Welcome " + user.displayName);

      // redirect same as email login
       const snap = await get(ref(db, "users/" + user.uid));
const role = snap.exists() ? snap.val().role : "user";

if (role === "admin") {
  window.location.href = "../homePage/AdminPanel.html";
} else {
  window.location.href = "../homePage/home.html";
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
if (user.emailVerified) {
            // Update database
            await update(ref(db, "users/" + user.uid), {
                verified_at: Date.now()
            });
            window.location.href = "../homePage/home.html";}
   

    
    sessionStorage.setItem("userId", user.uid);
    alert("Welcome back " + user.email);

    const snap = await get(ref(db, "users/" + user.uid));
    const role = snap.exists() ? snap.val().role : "user";

    if (role === "admin") {
      window.location.href = "../homePage/AdminPanel.html";
    } else {
      window.location.href = "../homePage/home.html";
    }

  } catch (error) {
    alert("Login failed: " + error.message);
  }
});




  const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });
  