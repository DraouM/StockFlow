const modalManager = {
  modal: null,

  /**
   * Initialize the modal manager with a modal and setup event listeners.
   * @param {string} modalId - The ID of the modal element.
   */
  init(modalId) {
    this.modal = document.getElementById(modalId);
    if (!this.modal) {
      console.error(`Modal with ID "${modalId}" not found.`);
      return;
    }
    // Default modal hidden state and accessibility setup
    this.modal.style.display = "none";
    this.modal.setAttribute("aria-hidden", "true");

    // Add a close event listener to the modal overlay (optional enhancement)
    window.addEventListener("click", (event) => {
      if (event.target === this.modal) this.close(event);
    });
  },

  /**
   * Open the modal and attach close handlers dynamically.
   * @param {Event} [event] - Optional event to prevent default behavior.
   */
  open(event) {
    if (event) event.preventDefault();
    if (!this.modal) {
      console.error("Modal not initialized. Call init() first.");
      return;
    }
    this.modal.style.display = "flex";
    this.modal.setAttribute("aria-hidden", "false");

    // Add a key listener for ESC to close the modal
    document.addEventListener("keydown", this.handleEscKey.bind(this));
  },

  /**
   * Close the modal and remove dynamic event listeners.
   * @param {Event} [event] - Optional event to prevent default behavior.
   */
  close(event) {
    if (event) event.preventDefault();
    if (!this.modal) {
      console.error("Modal not initialized. Call init() first.");
      return;
    }
    this.modal.style.display = "none";
    this.modal.setAttribute("aria-hidden", "true");

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
