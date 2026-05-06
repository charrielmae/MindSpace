// JavaScript functionality for MindSpace landing page buttons

document.addEventListener("DOMContentLoaded", function () {
  // Get all button elements
  const signUpBtn = document.querySelector(".btn-outline");
  const loginBtn = document.querySelector(".btn-primary");
  const getStartedBtn = document.querySelector(".btn-gradient");

  // Add click event listeners
  if (signUpBtn) {
    signUpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Sign up button clicked");
      // Navigate to registration page
      window.location.href = "registration.html";
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Log in button clicked");
      // Navigate to login page
      window.location.href = "index.html";
    });
  }

  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Get Started button clicked");
      // Navigate to registration page
      window.location.href = "registration.html";
    });
  }

  // Optional: Add smooth scrolling for navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    });
  });
});

// Additional functionality can be added here
function handleButtonClick(action) {
  console.log(`${action} button clicked`);

  // You can add more complex logic here
  switch (action) {
    case "signup":
      // Handle signup logic
      break;
    case "login":
      // Handle login logic
      break;
    case "getstarted":
      // Handle get started logic
      break;
    default:
      console.log("Unknown action");
  }
}
