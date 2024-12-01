const modalManager = {
  modals: {},

  /**
   * Initialize the modal manager with a modal and setup event listeners.
   * @param {string} modalId - The ID of the modal element.
   */
  init(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`Modal with ID "${modalId}" not found.`);
      return;
    }
    // Default modal hidden state and accessibility setup
    this.modals[modalId] = modal;
    this.modals[modalId].style.display = "none";
    this.modals[modalId].setAttribute("aria-hidden", "true");

    // Add a close event listener to the modal overlay (optional enhancement)
    window.addEventListener("click", (event) => {
      if (event.target === this.modals[modalId]) this.close(modalId);
    });
  },

  /**
   * Open the modal and attach close handlers dynamically.
   */

  open(modalId) {
    const modal = this.modals[modalId];

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    // Add a key listener for ESC to close the modal
    document.addEventListener("keydown", this.handleEscKey.bind(this));
  },

  /**
   * Close the modal and remove dynamic event listeners.
   */
  close(modalId) {
    const modal = this.modals[modalId];

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    // Clean up the ESC key listener
    document.removeEventListener("keydown", this.handleEscKey.bind(this));
  },

  /**
   * Handle the ESC key to close the modal.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  handleEscKey(event) {
    if (event.key === "Escape") {
      this.close(event);
    }
  },
};

export default modalManager;
