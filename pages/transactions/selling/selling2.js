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

  populate(formId, data) {
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
      productName: { required: true, minLength: 2 },
      quantity: { required: true, min: 1 },
      subUnits: { required: true, min: 1 },
      unitPrice: { required: true, min: 0.01 },
    },
    onSubmit: (formData) => {
      // Convert FormData to plain object
      const data = Object.fromEntries(formData);
      console.log(data);
      // Now you can use the data object
      productFormOnSubmit(data);
    },
  });

  const productDataEx = {
    productName: "Test",
    quantity: "150",
    subUnits: "150",
    unitPrice: "150.00",
    subTotal: "1500.00",
  };

  formManager.populate(productFormId, productDataEx);
});

function productFormOnSubmit(data) {
  console.log("form submited!!");
  addProductToList(data);
  console.log("product added !!");
}

function addProductToList(product) {
  const tableBody = document.querySelector("#shopping-list tbody");
  const rowCount = tableBody.children.length;
  // Create a new row
  const newRow = document.createElement("tr");
  // Populate row cells
  newRow.innerHTML = `
      <td><span class="number-circle">${rowCount + 1}</span></td>
      <td>${product.productName}</td>
      <td>
      <span class="main-quantity">${product.quantity}</span>
      <span class="sub-quantity highlight">${product.quantityUnit}</span>
      </td> <!-- Quantity -->
      <td>${
        product.subUnits ? product.subUnits : "N/A"
      }</td> <!-- Sub-unit or units (if there's a separate value) -->
      <td>${
        product.unitPrice ? product.unitPrice : "N/A"
      }</td> <!-- Unit Price -->
      <td>${
        product.subTotal ? product.subTotal : "N/A"
      }</td> <!-- Total Price -->
      <td>
        <button class="edit button button-secondary button-small">Edit</button>
        <button class="del button button-danger button-small">Del</button>
      </td>
  `;

  // Add row to the product list
  tableBody.appendChild(newRow);

  // Add event listeners for Edit and Delete buttons
  // newRow
  //   .querySelector(".edit")
  //   .addEventListener("click", () => editProduct(newRow));
  newRow
    .querySelector(".del")
    .addEventListener("click", () => deleteProduct(newRow));
}
