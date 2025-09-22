//   Burger Menu
 const toggleBtn = document.getElementById("menu-toggle");
  const leftSide = document.querySelector(".left-side");
  const rightSide = document.querySelector(".right-side");

  toggleBtn.addEventListener("click", () => {
    leftSide.classList.toggle("active");
    rightSide.classList.toggle("active");
  });