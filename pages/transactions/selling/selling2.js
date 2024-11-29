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
      // Manually append the span value
      const quantityUnit = document.getElementById("quantityUnit").textContent;
      formData.append("quantityUnit", quantityUnit);

      // Convert FormData to plain object
      const data = Object.fromEntries(formData);
      console.log("Data ", data);
      // Now you can use the data object
      productFormOnSubmit(data);
    },
  });

  const fetchProducts = async (searchTerm) => {
    return await window.productsAPI.searchProduct(searchTerm);
  };

  const onProductSelected = (selectedProduct) => {
    console.log("Product selected:", selectedProduct);
    // You can add custom behavior for what happens when a product is selected.
    // For example, you might want to fill another input field or redirect the user.
    const productDataEx = {
      productName: selectedProduct.name,
      //   quantity: selectedProduct.total_stock,
      //   subUnits: selectedProduct.subunit_in_unit,
      unitPrice: selectedProduct.selling_price,
      quantityUnit: selectedProduct.subunit_in_unit,
      //   subTotal: subUnits * unitPrice,
    };

    // Add quantityUnit dynamically (because it is NOT an input)
    // ensure the value of quantityUnit is always displayed as a two-digit format (e.g., 08, 01, or 12)
    document.getElementById("quantityUnit").textContent =
      productDataEx.quantityUnit.toString().padStart(2, "0");
    // Populate the other input with the form
    formManager.populate(productFormId, productDataEx);
  };

  // Create an instance of the Searchbar class
  const productSearchbar = new Searchbar(
    "search-product-input", // Input field ID
    "product-results-list", // Results list ID
    "search-product-form", // Search form ID
    "search-product-results", // Results div ID
    fetchProducts, // Fetch function for searching products
    onProductSelected // Callback when a product is selected
  );
});

function productFormOnSubmit(data) {
  console.log("form submited!! ", data);
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
