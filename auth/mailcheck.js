import { auth, db, ref, update } from "../config.js";
import { applyActionCode } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

async function handleVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode"); // Firebase sends this in the link

    if (!oobCode) return alert("Invalid verification link.");

    try {
        // Apply the email verification code
        await applyActionCode(auth, oobCode);
        alert("✅ Your email has been verified! Please log in again.");

        // Optionally redirect to login page
        window.location.href = "../auth/login.html";

    } catch (err) {
        console.error(err);
        alert("Verification failed. The link may have expired.");
    }
}

handleVerification();
