import { auth, db, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, ref, get, set ,update} from "../config.js";

const form = document.getElementById("login-form");
const googleBtn = document.getElementById("google-login");
const provider = new GoogleAuthProvider();

console.log("🔥 login.js loaded");

// Ensure user exists in DB
async function ensureUserInDB(user) {
  const userRef = ref(db, "users/" + user.uid);
  const snap = await get(userRef);

  if (!snap.exists()) {
    await set(userRef, {
      email: user.email,
      role: "user",
      created_at: Date.now()
    });
    console.log("Created new user record in DB");
  }
  return (await get(userRef)).val();
}

// Redirect based on role
function redirectByRole(role) {
  if (role === "admin") window.location.href = "../homePage/AdminPanel.html";
  else window.location.href = "../homePage/home.html";
}

// ----------------------------
// Google Login
// ----------------------------
googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Signed in with Google:", user.uid, user.email);

    const dbUser = await ensureUserInDB(user);
    console.log("DB snapshot:", dbUser);

    sessionStorage.setItem("userId", user.uid);
    alert("Welcome " + (user.displayName || user.email));

    redirectByRole(dbUser.role || "user");
  } catch (error) {
    console.error("Google login failed:", error);
    alert("Google login failed: " + error.message);
  }
});

// ----------------------------
// Email/Password Login
// ----------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Signed in with Email:", user.uid, user.email, "emailVerified:", user.emailVerified);

    if (user.emailVerified) {
      await update(ref(db, "users/" + user.uid), { verified_at: Date.now() });
    }

    const dbUser = await ensureUserInDB(user);
    console.log("DB snapshot:", dbUser);

    sessionStorage.setItem("userId", user.uid);
    alert("Welcome back " + user.email);

    redirectByRole(dbUser.role || "user");
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed: " + error.message);
  }
});

// ----------------------------
// Burger menu
// ----------------------------
const toggleBtn = document.getElementById("menu-toggle");
const leftSide = document.querySelector(".left-side");
const rightSide = document.querySelector(".right-side");

toggleBtn.addEventListener("click", () => {
  leftSide.classList.toggle("active");
  rightSide.classList.toggle("active");
});
