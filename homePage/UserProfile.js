import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBWW6-aR7jfNOjNEtJORxEsqjjMJ0cOk3w",
  authDomain: "electronichub-22676.firebaseapp.com",
  projectId: "electronichub-22676",
  storageBucket: "electronichub-22676.appspot.com",
  messagingSenderId: "104130323974",
  appId: "1:104130323974:web:9495c1c28539ad872cc587",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM
const form = document.getElementById("profileForm");
const displayNameInput = document.getElementById("displayName");
const currentEmailInput = document.getElementById("currentEmail");
const currentPasswordInput = document.getElementById("currentPassword");
const newEmailInput = document.getElementById("newEmail");
const newPasswordInput = document.getElementById("newPassword");
const msgDiv = document.getElementById("msg");
const updateBtn = document.getElementById("updateBtn");
const backHomeBtn = document.getElementById("backHomeBtn");

// Messages
const showMessage = (txt, success = true) => {
  msgDiv.textContent = txt;
  msgDiv.className = `mt-4 text-center text-sm p-2 rounded-lg ${
    success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }`;
  msgDiv.classList.remove("hidden");
};

// Prefill
onAuthStateChanged(auth, (user) => {
  if (!user) {
    showMessage(" Please log in first.", false);
    return;
  }
  displayNameInput.value = user.displayName || "";
  currentEmailInput.value = user.email || "";
});

// Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return showMessage(" No user signed in.", false);

  updateBtn.disabled = true;
  updateBtn.textContent = "Updating...";

  try {
    // Re-auth with current password
    const cred = EmailAuthProvider.credential(user.email, currentPasswordInput.value);
    await reauthenticateWithCredential(user, cred);

    // Name
    if (displayNameInput.value.trim() && displayNameInput.value !== user.displayName) {
      await updateProfile(user, {
        displayName: displayNameInput.value.trim()
      });
    }

    // Email (direct)
    if (newEmailInput.value.trim() && newEmailInput.value !== user.email) {
      await updateEmail(user, newEmailInput.value.trim());
      currentEmailInput.value = newEmailInput.value.trim();
    }

    // Password
    if (newPasswordInput.value.trim()) {
      await updatePassword(user, newPasswordInput.value.trim());
    }

    showMessage("Profile updated successfully!");
    backHomeBtn.classList.remove("hidden"); // show Back button
  } catch (err) {
    let msg = err.message;
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
      msg = "Wrong current password.";
    if (err.code === "auth/email-already-in-use") msg = " Email already in use.";
    if (err.code === "auth/weak-password") msg = " Weak password.";
    if (err.code === "auth/requires-recent-login") msg = "Please log in again.";
    showMessage(msg, false);
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = "Update";
  }
});

// Back to Home
backHomeBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (user && user.email.endsWith("@electronichub.com")) {
    window.location.href = "/homePage/AdminPanel.html"; // admin
  } else {
    window.location.href = "/homePage/home.html"; // regular user
  }
});
