import modalManager from "../modalManager.js";

const formManager = {
  forms: {}, // Store forms and their configurations

  init(formId, config) {
    this.forms[formId] = config; // Register form with its config
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener("submit", (event) =>
        this.handleSubmit(event, formId)
      );
    }
  },

  validate(formId) {
    const { rules } = this.forms[formId];
    let isValid = true;
    // Iterate and validate fields based on rules
    Object.keys(rules).forEach((fieldName) => {
      const input = document.querySelector(`[name="${fieldName}"]`);
      const rule = rules[fieldName];
      if (rule.required && !input.value.trim()) {
        isValid = false;
        this.showError(input, `${fieldName} is required`);
      }
    });
    return isValid;
  },

  handleSubmit(event, formId) {
    event.preventDefault();
    if (this.validate(formId)) {
      const { onSubmit } = this.forms[formId];
      if (onSubmit) onSubmit(new FormData(event.target));
    }
  },

  // Display an error message for a specific input
  showError(input, message) {
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains("error-message")) {
      errorElement.textContent = message;
    } else {
      const newErrorElement = document.createElement("div");
      newErrorElement.className = "error-message";
      newErrorElement.textContent = message;
      input.parentNode.insertBefore(newErrorElement, input.nextSibling);
    }
  },
};

document.addEventListener("DOMContentLoaded", function () {
  /** MODAL */
  // Select open and close buttons
  const closeModalBtn = document.querySelector(".close-modal-btn");
  const openModalBtn = document.getElementById("open-modal-btn");

  // Initialize modal
  modalManager.init("product-modal");

  // Open modal button logic
  openModalBtn.addEventListener("click", (event) => modalManager.open(event));

  // Close modal button logic
  closeModalBtn.addEventListener("click", (event) => modalManager.close(event));

  // The overlay click is already handled in modalManager (window.addEventListener inside init).

  /** PRODUCT FORM */
  // Select form
  const productFormId = "selling-form";

  formManager.init(productFormId, {
    rules: {
      productName: { required: true },
      quantity: { required: true },
      subUnits: { required: true },
      price: { required: true },
    },
    onSubmit: (data) => {
      productFormOnSubmit(data);
    },

    getData() {
      const form = this.forms[formId];
      if (!form) {
        console.error(`Form with ID "${formId}" is not registered.`);
        return {};
      }

      const formData = {};
      const inputs = form.querySelectorAll("[name]");

      inputs.forEach((input) => {
        formData[input.name] = input.value.trim();
      });

      console.log(formData);
    },
  });
});

function productFormOnSubmit(data) {}
