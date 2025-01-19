import NotificationManager from "./notificationManager.js";
import { UtilityHelpers } from "./selling/utilityHelpers.js";

class BuyingShoppingList {
  constructor(formManager, modalManager) {
    this.shoppingList = []; // Initialize an empty shopping list
    this.formManager = formManager;
    this.modalManager = modalManager;
    this.tableBody = document.querySelector("#shopping-list-body");
    this.totalPriceElement = document.querySelector("#total-price");
  }

  // Method to add a new product to the shopping list
  addProduct(product) {
    const newItem = this.createNewItem(product);
    this.shoppingList.push(newItem);
    this.renderList();
    this.calculateTotalPrice();
    NotificationManager.showNotification(
      `Added ${product.quantity} ${product.productName}`,
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
    this.checkForDuplicateProducts(product);
  }

  // Method to create a new item object for buying
  createNewItem(product) {
    const subTotalBuyingPrice = product.subUnits * product.buyingPrice;

    const totalBuyingPrice =
      product.subUnits * product.buyingPrice * (1 + product.taxes / 100);

    return {
      tempId: product.tempId || crypto.randomUUID(),
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity,
      subUnits: product.subUnits,
      quantityUnit: product.quantityUnit,
      buyingPrice: product.buyingPrice,
      taxes: product.taxes,
      subTotalBuyingPrice: subTotalBuyingPrice,
      totalBuyingPrice: totalBuyingPrice,
      sellingPrice: product.sellingPrice,
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
      item.tempId === itemId ? { ...item, ...updatedItem } : item
    );
    this.renderList();
    this.calculateTotalPrice();
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
    console.log({ item });

    const newRow = document.createElement("tr");
    newRow.dataset.id = item.tempId;

    newRow.innerHTML = `
      <td>${item.productName}</td>
      <td>
        <span class="main-quantity">${item.quantity}</span>
        <span class="sub-quantity highlight">${item.quantityUnit || ""}</span>
      </td>
      <td>${item.subUnits || "N/A"}</td>
      <td>${UtilityHelpers.formatNumber(item.buyingPrice)}</td>
      <td>${UtilityHelpers.formatNumber(item.subTotalBuyingPrice)}</td>
      <td>${UtilityHelpers.formatNumber(item.taxes)}</td>
      <td>${UtilityHelpers.formatNumber(item.totalBuyingPrice)}</td>
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

  // Method to calculate total price of all items
  calculateTotalPrice() {
    const totalPrice = this.shoppingList.reduce(
      (total, item) => total + item.totalBuyingPrice,
      0
    );
    this.totalPriceElement.textContent = `Total: ${UtilityHelpers.formatNumber(
      totalPrice
    )}`;

    // Optionally, update the total amount input in the purchase form
    const totalAmountInput = document.getElementById("totalAmount");
    if (totalAmountInput) {
      totalAmountInput.value = totalPrice.toFixed(2);
    }
  }

  // Method to handle edit button click
  handleEditButtonClick(tempId) {
    const itemToEdit = this.shoppingList.find((item) => item.tempId === tempId);

    if (itemToEdit) {
      // Populate the form with the item's details for editing
      this.formManager.populate("product-details-form", itemToEdit);

      // Set form in update mode
      document
        .getElementById("product-details-form")
        .setAttribute("data-operation", "update");
      document
        .getElementById("product-details-form")
        .setAttribute("data-item-id", tempId);

      // Open the product modal
      this.modalManager.open("product-modal");
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
      this.calculateTotalPrice();
      NotificationManager.showNotification(
        `Removed ${removedProduct}`,
        NotificationManager.NOTIFICATION_TYPES.INFO
      );
    }
  }

  // Method to clear the entire shopping list
  clearList() {
    this.shoppingList = [];
    this.renderList();
    this.calculateTotalPrice();
    NotificationManager.showNotification(
      "Shopping list cleared",
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
  }

  // Method to populate the shopping list from fetched transaction details
  populate(items) {
    this.shoppingList = items.map((item) => this.createNewItem(item));
    this.renderList();
    this.calculateTotalPrice();
  }

  // Method to get all products in the shopping list
  getProducts() {
    return this.shoppingList;
  }
}

export default BuyingShoppingList;
