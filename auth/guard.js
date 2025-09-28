import { auth } from "../config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    setTimeout(() => {
        if (user) {
            window.location.href = "../homePage/home.html";
        }
    }, 3000); // 3 seconds delay
});
