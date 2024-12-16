// ShoppingListManager.js
import NotificationManager from "./notificationManager.js";
import { UtilityHelpers } from "./selling/utilityHelpers.js";

class ShoppingListManager {
  constructor() {
    this.shoppingList = []; // Initialize an empty shopping list
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
      id: Date.now().toString(), // Unique ID for the item
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
    this.shoppingList = this.shoppingList.map((item) =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    );
    this.renderList();
  }

  // Method to delete an item from the shopping list
  deleteProduct(id) {
    const indexToRemove = this.shoppingList.findIndex((item) => item.id === id);
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

  // Method to render the shopping list in the UI
  renderList() {
    const tableBody = document.querySelector("#shopping-list tbody");
    tableBody.innerHTML = ""; // Clear the table body

    this.shoppingList.forEach((item, index) => {
      const newRow = this.createTableRow(item, index + 1);
      tableBody.appendChild(newRow);
    });
  }

  // Method to create a table row for the shopping list
  createTableRow(item, rowCount) {
    const newRow = document.createElement("tr");
    newRow.dataset.id = item.id; // Store unique identifier

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
        <button onclick="shoppingListManager.editItem (item.id)">Edit</button>
        <button onclick="shoppingListManager.deleteProduct('${
          item.id
        }')">Delete</button>
      </td>
    `;
    return newRow;
  }

  // Method to populate the shopping list from fetched transaction details
  populateShoppingList(items) {
    this.shoppingList = items.map((item) => this.createNewItem(item));
    this.renderList();
  }
}

export default ShoppingListManager;
