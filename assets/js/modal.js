/* hundle the model openning and closing */
// Open modal
document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const modalId = button.getAttribute("data-modal");
    document.getElementById(modalId).style.display = "block";
  });
});

// Close modal
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", (event) => {
    closeBtn.closest(".modal").style.display = "none";
  });
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});
