import NotificationManager from "./notificationManager.js";
import { UtilityHelpers } from "./selling/utilityHelpers.js";

class ShoppingList {
  constructor(formManager, modalManager) {
    this.shoppingList = []; // Initialize an empty shopping list
    this.formManager = formManager; // Store the formManager instance
    this.modalManager = modalManager; // Store the modalManager instance
    this.tableBody = document.querySelector("#shopping-list tbody"); // Reference to the table body
  }

  // Method to add a new product to the shopping list
  addProduct(product) {
    const newItem = this.createNewItem(product);
    this.shoppingList.push(newItem);
    this.renderList();
    NotificationManager.showNotification(
      `Added ${product.quantity} ${product.productName}`,
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
    this.checkForDuplicateProducts(product);
  }

  // Method to create a new item object
  createNewItem(product) {
    const subTotal = product.subUnits * product.unitPrice;
    return {
      tempId: crypto.randomUUID(), // Generate a unique ID using crypto
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      subUnits: product.subUnits,
      subTotal: subTotal,
      quantityUnit: product.quantityUnit,
    };
  }

  // Method to check for duplicate products
  checkForDuplicateProducts(product) {
    const similarProducts = this.shoppingList.filter(
      (item) => item.productName === product.productName
    );
    if (similarProducts.length > 1) {
      NotificationManager.showNotification(
        `Note: You've added multiple entries for ${product.productName}`,
        NotificationManager.NOTIFICATION_TYPES.WARNING
      );
    }
  }

  // Method to update an existing item in the shopping list
  updateProduct(itemId, updatedItem) {
    console.log({ itemId, updatedItem });

    this.shoppingList = this.shoppingList.map((item) =>
      item.tempId === itemId ? { ...item, ...updatedItem } : item
    );
    this.renderList();
  }

  // Method to render the shopping list in the UI
  renderList() {
    this.tableBody.innerHTML = ""; // Clear the table body

    this.shoppingList.forEach((item, index) => {
      const newRow = this.createTableRow(item, index + 1);
      this.tableBody.appendChild(newRow);
    });
  }

  // Method to create a table row for the shopping list
  createTableRow(item, rowCount) {
    const newRow = document.createElement("tr");
    newRow.dataset.id = item.tempId; // Store unique identifier

    newRow.innerHTML = `
      <td><span class="number-circle">${rowCount}</span></td>
      <td>${item.productName}</td>
      <td>
        <span class="main-quantity">${item.quantity}</span>
        <span class="sub-quantity highlight">${item.quantityUnit}</span>
      </td>
      <td>${item.subUnits || "N/A"}</td>
      <td>${
        item.unitPrice ? UtilityHelpers.formatNumber(item.unitPrice) : "N/A"
      }</td>
      <td>${
        item.subTotal ? UtilityHelpers.formatNumber(item.subTotal) : "N/A"
      }</td>
       <td>
        <button class="button button-small button-secondary edit-button" data-id="${
          item.tempId
        }">Edit</button>
        <button class="button button-small button-danger delete-button" data-id="${
          item.tempId
        }">Delete</button>
      </td>
    `;
    return newRow;
  }

  // Method to handle edit button click
  handleEditButtonClick(tempId) {
    console.log("Shopping List ", this.shoppingList);

    const itemToEdit = this.shoppingList.find((item) => item.tempId === tempId);
    console.log({ itemToEdit, tempId });

    if (itemToEdit) {
      // Populate the form with the item's details for editing
      this.formManager.populate("selling-form", itemToEdit);
      // Optionally, you can set a flag to indicate that the form is in edit mode
      document
        .getElementById("selling-form")
        .setAttribute("data-operation", "update");
      document
        .getElementById("selling-form")
        .setAttribute("data-item-id", tempId);

      // Open the product modal
      this.modalManager.open("product-modal"); // Ensure modalManager is accessible
    }
  }

  // Method to handle delete button click
  deleteProduct(tempId) {
    const indexToRemove = this.shoppingList.findIndex(
      (item) => item.tempId === tempId
    );
    if (indexToRemove !== -1) {
      const removedProduct = this.shoppingList[indexToRemove].productName;
      this.shoppingList.splice(indexToRemove, 1);
      this.renderList();
      NotificationManager.showNotification(
        `Removed ${removedProduct}`,
        NotificationManager.NOTIFICATION_TYPES.INFO
      );
    }
  }

  // Method to populate the shopping list from fetched transaction details
  populate(items) {
    this.shoppingList = items.map((item) => this.createNewItem(item));
    this.renderList();
  }
}

export default ShoppingList;
