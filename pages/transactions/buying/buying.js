// INIT
import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";
import NotificationManager from "../notificationManager.js";
// import { UtilityHelpers } from "./utilityHelpers.js";
import BuyingShoppingList from "../buyingShoppingList.js"; // Import the class
import ShoppingListManager from "../ShoppingListManager.js"; // Import the class

const shoppingList = new BuyingShoppingList(formManager, modalManager); // Create an instance
const shoppingListManager = new ShoppingListManager(shoppingList); // Create an instance

// Extend the shopping list to handle buying-specific fields

document.addEventListener("DOMContentLoaded", () => initializePage());

function initializePage() {
  // Initialize the Modals
  initializeModals();
  // Initialize the product search fucntion
  initializeProductSearch();
  // Initialize the shopping list form
  initializeProductForm();

  const transactionId = getTransactionIdFromUrl();
  // Initialize event listeners
  initializeEventListeners(transactionId);
}

function initializeModals() {
  // Product Modal
  modalManager.init("product-modal");
  document
    .getElementById("product-modal-btn")
    .addEventListener("click", openProductModal);
  document
    .querySelector(".close-modal-btn")
    .addEventListener("click", closeProductModal);
}

function initializeProductSearch() {
  const searchProducts = async (searchTerm) => {
    return await window.productsAPI.searchProduct(searchTerm);
  };

  const onProductSelected = (selectedProduct) => {
    console.log({ selectedProduct });

    const productDataEx = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantityUnit: selectedProduct.subunit_in_unit, // for the span
      // quantityInUnit: selectedProduct.total_stock,
      stockQuantity: selectedProduct.subunit_in_unit, // for the text field
      buyingPrice: selectedProduct.buying_price,
      taxes: selectedProduct.tax_rate,
      sellingPrice: selectedProduct.selling_price,
    };

    formManager.populate("product-details-form", productDataEx);
  };

  const productSearchbar = new Searchbar(
    "search-product-input",
    "product-results-list",
    "search-product-form",
    "search-product-results",
    searchProducts,
    onProductSelected
  );
}

function initializeProductForm() {
  const productFormId = "product-details-form";

  formManager.init(productFormId, {
    rules: {
      productName: { required: true, minLength: 2 },
      // quantity: { required: true, min: 1 },
      // subUnits: { required: true, min: 1 },
      // unitPrice: { required: true, min: 0.01 },
    },

    onAdd: (formData) => {
      console.log({ formData });

      // const quantityUnit = document.getElementById("quantityUnit").textContent;
      const product = {
        productId: formData.productId,
        productName: formData.productName,
        quantity: formData.quantity,
        quantityUnit: formData.stockQuantity,
        subUnits: formData.subUnits,
        sellingPrice: formData.sellingPrice,
        buyingPrice: formData.buyingPrice,
        taxes: formData.taxes,
      };

      shoppingListManager.addProduct(product);
    },

    onUpdate: (product) => {
      console.log({ product });

      const form = document.getElementById(productFormId);
      const itemId = form.getAttribute("data-item-id");
      shoppingListManager.updateProduct(itemId, product); // Use the class instance
      form.setAttribute("data-operation", "add");
    },
  });
}

function initializeEventListeners(transactionId) {
  // Handle shopping list table actions
  const shoppingListTable = document.querySelector("#shopping-list tbody");
  if (shoppingListTable) {
    shoppingListTable.addEventListener("click", handleShoppingListActions);
  }

  // Handle confirm transaction button
  const confirmTransactionButton = document.getElementById(
    "confirm-transaction-btn"
  );
  if (confirmTransactionButton) {
    confirmTransactionButton.addEventListener("click", async () => {
      await handleTransaction(transactionId);
    });
  }
}

function handleShoppingListActions(event) {
  console.log("Hnadling shopping list actions");

  const target = event.target;
  const tempId = target.dataset.id;

  if (!tempId) return;

  if (target.classList.contains("edit-button")) {
    shoppingListManager.shoppingList.handleEditButtonClick(tempId); // Edit handler
  } else if (target.classList.contains("delete-button")) {
    shoppingListManager.deleteProduct(tempId); // Delete handler
  }
}

function getTransactionIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("transaction_id");
}

async function handleTransaction(transaction_id = null) {
  console.log("Transaction Submitted");
}

/* Helper Functions */
function openProductModal() {
  modalManager.open("product-modal");
}

function closeProductModal() {
  modalManager.close("product-modal");
  formManager.reset("selling-form"); // Reset the form when closing the modal
}
