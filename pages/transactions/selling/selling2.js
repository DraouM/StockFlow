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

const ShoppingListManager = {
  // Store items in an array
  shoppingList: [],
  // Create a utility function
  getId(item) {
    return item.id || item.productId || item.userId;
  },

  // Add a new item
  addItem(product) {
    console.log("Item added ", product);

    // Check if the product is already in the list
    const existingItem = this.shoppingList.find(
      (item) => item.productId === this.getId(product)
    );
    console.log("Existing Item ", existingItem);
    // row.dataset.id = item.id; // Store unique identifier

    if (existingItem) {
      this.updateItem(this.getId(product), {
        quantity: existingItem.quantity + product.quantity,
        price: product.price,
      });
    } else {
      console.log("Shopping List ", this.shoppingList);

      this.shoppingList.push(product);
    }
    this.renderList();
  },

  //   // Update an existing item
  // updateItem(productId, updates) {
  //   const item = this.items.find((item) => item.id === productId);
  //   if (item) {
  //     Object.assign(item, updates); // Merge updates into the existing item
  //   }
  //   this.renderList();
  // },

  // Delete an item
  editItem(productId) {
    console.log("Item edited ", productId);
  },

  // Render the shopping list in the UI
  renderList() {
    const tableBody = document.querySelector("#shopping-list tbody");
    tableBody.innerHTML = ""; // Clear the table body

    this.shoppingList.forEach((item) => {
      const rowCount = tableBody.children.length;
      // Create a new row
      const newRow = document.createElement("tr");
      newRow.dataset.id = this.getId(item); // Store unique identifier

      // Populate row cells
      newRow.innerHTML = `
            <td><span class="number-circle">${rowCount + 1}</span></td>
            <td>${item.productName}</td>
            <td>
            <span class="main-quantity">${item.quantity}</span>
            <span class="sub-quantity highlight">${item.quantityUnit}</span>
            </td> <!-- Quantity -->
            <td>${
              item.subUnits ? item.subUnits : "N/A"
            }</td> <!-- Sub-unit or units (if there's a separate value) -->
            <td>${
              item.unitPrice
                ? UtilityHelpers.formatNumber(item.unitPrice)
                : "N/A"
            }</td> <!-- Unit Price -->
            <td>${
              item.subTotal ? UtilityHelpers.formatNumber(item.subTotal) : "N/A"
            }</td> <!-- Total Price -->
            <td>
              <button  onclick="ShoppingListManager.editItem(${this.getId(
                item
              )})" class="edit button button-secondary button-small">Edit</button>
              <button onclick="ShoppingListManager.deleteItem(${this.getId(
                item
              )})"  class="del button button-danger button-small">Del</button>
            </td>
        `;
      // Add row to the product list
      tableBody.appendChild(newRow);
    });
  },

  deleteItem(id) {
    console.log("item deleted ", id);

    this.shoppingList = this.shoppingList.filter((item) => {
      console.log(this.shoppingList, this.getId(item), id);

      return this.getId(item) != id;
    });
    this.renderList(); // Re-render list after deletion
  },
  //   // Prompt user for updates
  //   updateItemPrompt(productId) {
  //     const item = this.items.find((item) => item.id === productId);
  //     if (item) {
  //       const newQuantity = parseInt(
  //         prompt(`Enter new quantity for ${item.name}:`, item.quantity),
  //         10
  //       );
  //       const newPrice = parseFloat(
  //         prompt(`Enter new price for ${item.name}:`, item.price)
  //       );
  //       this.updateItem(productId, { quantity: newQuantity, price: newPrice });
  //     }
  //   },

  //   // Clear the entire list
  //   clearList() {
  //     this.items = [];
  //     this.renderList();
  //   },
};
// Make it globally accessible
window.ShoppingListManager = ShoppingListManager;

// // Example Usage
// ShoppingListManager.addItem({
//   id: 1,
//   name: "Product A",
//   quantity: 2,
//   price: 10,
// });
// ShoppingListManager.addItem({
//   id: 2,
//   name: "Product B",
//   quantity: 1,
//   price: 15,
// });
// ShoppingListManager.updateItem(1, { quantity: 3 });
// ShoppingListManager.deleteItem(2);

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
      productId: selectedProduct.id,
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
  ShoppingListManager.addItem(data);

  console.log("product added !!");
}
