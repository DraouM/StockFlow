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

  populate(formId, data) {
    console.log("Data to populate ", data);

    const form = document.getElementById(formId);

    Object.keys(data).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
      }
    });
  },

  validate(formId) {
    const { rules } = this.forms[formId];
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const input = document.querySelector(`[name="${fieldName}"]`);
      const rule = rules[fieldName];
      const value = input.value.trim();

      // Clear previous errors
      input.classList.remove("invalid");
      const existingError = input.parentElement.querySelector(".error-message");
      if (existingError) existingError.remove();

      // Required check
      if (rule.required && !value) {
        isValid = false;
        this.showError(input, `${fieldName} is required`);
      }

      // Min length check
      if (rule.minLength && value.length < rule.minLength) {
        isValid = false;
        this.showError(input, `Minimum ${rule.minLength} characters required`);
      }

      // Min value check for numeric fields
      if (rule.min !== undefined && Number(value) < rule.min) {
        isValid = false;
        this.showError(input, `Minimum value is ${rule.min}`);
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

  // Optional: Add method to reset form
  reset(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      // Clear any existing error messages
      form.querySelectorAll(".error-message").forEach((el) => el.remove());
    }
  },

  // Optional: Add custom validation method
  addCustomValidation(formId, fieldName, validationFn, errorMessage) {
    if (!this.forms[formId].customValidations) {
      this.forms[formId].customValidations = {};
    }
    this.forms[formId].customValidations[fieldName] = {
      validate: validationFn,
      message: errorMessage,
    };
  },

  // Update validate method to include custom validations
  //   validate(formId) {
  //     // ... existing validation logic ...

  //     // Add custom validation support
  //     if (this.forms[formId].customValidations) {
  //       Object.entries(this.forms[formId].customValidations).forEach(
  //         ([fieldName, customValidation]) => {
  //           const input = document.querySelector(`[name="${fieldName}"]`);
  //           const value = input.value.trim();

  //           if (!customValidation.validate(value)) {
  //             isValid = false;
  //             this.showError(input, customValidation.message);
  //           }
  //         }
  //       );
  //     }

  //     return isValid;
  //   },
  getData(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`Form with ID "${formId}" not found.`);
      return null;
    }

    const formData = {};

    // Fetch all inputs, selects, and textareas
    const inputs = form.querySelectorAll(
      "input, select, textarea, [data-custom-field]"
    );

    inputs.forEach((input) => {
      const name = input.name || input.dataset.customField;
      if (name) {
        if (input.type === "checkbox") {
          formData[name] = input.checked; // Handle checkboxes
        } else if (input.type === "radio") {
          if (input.checked) {
            formData[name] = input.value; // Get value of checked radio
          }
        } else {
          formData[name] = input.value; // Default to value property
        }
      }
    });

    return formData;
  },
};

export default formManager;
