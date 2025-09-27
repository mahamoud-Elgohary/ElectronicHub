
async function loadNavbar() {
  try {
    const res = await fetch("../Navbar/nav.html");
    if (!res.ok) throw new Error("Failed to load navbar");

    const html = await res.text();
    document.getElementById("nav-bar").innerHTML = html;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/Navbar/nav.css";
    document.head.appendChild(link);


    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        console.log("Menu toggled!");
      });
    }

  } catch (err) {
    console.error("Error loading Navbar:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadNavbar);





//   Burger Menu
 const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });