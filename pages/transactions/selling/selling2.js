import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";

const ShoppingListManager = {
  // Store items in an array
  shoppingList: [],
  // Create a utility function
  getId(item) {
    return item.id || item.productId || item.userId;
  },

  // Notification system
  showNotification(message, type = "info") {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById(
      "notification-container"
    );
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notification-container";
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
      `;
      document.body.appendChild(notificationContainer);
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
      background-color: ${
        type === "warning"
          ? "#ffcc00"
          : type === "error"
          ? "#ff4444"
          : "#4CAF50"
      };
      color: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    notification.textContent = message;

    // Add to container
    notificationContainer.appendChild(notification);

    // Trigger reflow to enable transition
    notification.offsetHeight;

    // Fade in
    notification.style.opacity = "1";

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        notificationContainer.removeChild(notification);

        // Remove container if no notifications
        if (notificationContainer.children.length === 0) {
          document.body.removeChild(notificationContainer);
        }
      }, 300);
    }, 3000);
  },

  // Add a new item
  addItem(product) {
    console.log("Item added ", product);

    // Calculate subtotal
    const subTotal = product.quantity * product.unitPrice;

    // Always create a new item with a unique ID
    const newItem = {
      ...product,
      id: Date.now().toString(), // Generate unique ID
      subTotal: subTotal,
    };

    // Add the new item to the list
    this.shoppingList.push(newItem);

    // Render the list
    this.renderList();

    // Show notification
    this.showNotification(
      `Added ${product.quantity} ${product.productName}`,
      "info"
    );

    // Optional: Check if this is a duplicate product
    const similarProducts = this.shoppingList.filter(
      (item) => item.productName === product.productName
    );

    if (similarProducts.length > 1) {
      this.showNotification(
        `Note: You've added multiple entries for ${product.productName}`,
        "warning"
      );
    }
  },

  // Update an existing item

  updateItem(updatedItem) {
    console.log("Item Update ", updatedItem);
    console.log("Shopping List ", this.shoppingList);

    this.shoppingList = this.shoppingList.map(
      (item) => {
        if (item.id === updatedItem.id) {
          console.log("Match found for ID:", item.id);
          return updatedItem;
        } else {
          console.log("Match not found for ID:", item.id);

          return item;
        }
      }
      // item.id === updatedItem.id ? updatedItem : item
    );
    this.renderList();
  },

  // Edit an item
  editItem(itemId) {
    const itemIndex = this.shoppingList.findIndex((item) => item.id == itemId);
    if (itemIndex !== -1) {
      const itemToEdit = this.shoppingList[itemIndex];
      console.log("Item to Edit ", itemToEdit);

      // Populate form with the selected item
      formManager.populate("selling-form", itemToEdit);
      const form = document.getElementById("selling-form");
      form.setAttribute("data-operation", "update");
      // Handle form submission

      // Show the modal for editing
      openProductModal();
    } else {
      console.error("Item not found for editing");
    }
  },
  // Render the shopping list in the UI
  renderList() {
    const tableBody = document.querySelector("#shopping-list tbody");
    tableBody.innerHTML = ""; // Clear the table body

    this.shoppingList.forEach((item) => {
      const rowCount = tableBody.children.length;
      // Create a new row
      const newRow = document.createElement("tr");
      newRow.dataset.id = item.id; // Store unique identifier

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
    // Find the index of the item with the specific ID
    const indexToRemove = this.shoppingList.findIndex((item) => item.id == id);
    console.log("Index To remove ", indexToRemove);

    if (indexToRemove !== -1) {
      // Store the product name for notification
      const removedProduct = this.shoppingList[indexToRemove].productName;

      // Remove only the specific item using its unique ID
      this.shoppingList.splice(indexToRemove, 1);

      // Render the updated list
      this.renderList();

      // Show notification
      this.showNotification(`Removed ${removedProduct}`, "info");
    }
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
  openModalBtn.addEventListener("click", openProductModal);

  // Close modal button logic
  closeModalBtn.addEventListener("click", closeProductModal);

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

    // onSubmit: (formData) => {
    //   // Manually append the span value
    //   const quantityUnit = document.getElementById("quantityUnit").textContent;
    //   formData.append("quantityUnit", quantityUnit);

    //   // Convert FormData to plain object
    //   const data = Object.fromEntries(formData);
    //   console.log("Data ", data);
    //   // Now you can use the data object
    //   productFormOnSubmit(data);
    // },
    onAdd: (data) => {
      // Include the span value in the data object
      const quantityUnit = document.getElementById("quantityUnit").textContent;
      data.quantityUnit = quantityUnit;

      console.log("Adding item: ", data);
      ShoppingListManager.addItem(data);

      // Use the data object to add the new item
      // productFormOnSubmit(data); // Assuming this handles adding the item
    },

    onUpdate: (product) => {
      ShoppingListManager.updateItem(product);
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

function openProductModal() {
  modalManager.open("product-modal"); // Opens the modal
}

function closeProductModal() {
  modalManager.close("product-modal"); // Closes the modal
}
