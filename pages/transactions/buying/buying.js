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

  // Handle page context (new or update)
  handlePageContext(transactionId);

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

function handlePageContext(transactionId) {
  const confirmTransactionButton = document.getElementById(
    "confirmTransactionBtn"
  );

  if (transactionId) {
    console.log("CHECK LATER THIS PART");

    // Update mode
    // populateTransactionDetails(transactionId);
    // if (confirmTransactionButton) {
    //   confirmTransactionButton.textContent = "Update Order"; // Adjust button text
    //   confirmTransactionButton.style.background = "green"; // Adjust button text
    // }
  } else {
    // Create mode
    if (confirmTransactionButton) {
      confirmTransactionButton.textContent = "Confirm Order"; // Default button text
    }
  }
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

async function handleTransaction(transactionId = null) {
  if (transactionId) {
    console.log("CHECK THIS PART LATER!!");

    // updateTransaction();
    // console.log(transactionId, "Transaction Updated !!");
    // await updateTransaction(transactionId);
  } else {
    createNewTransaction();
  }
}

async function createNewTransaction() {
  try {
    let clientId = document.getElementById("clientName").dataset.clientId;
    if (!clientId) {
      // throw new Error("Please select a client.");
      clientId = "1";
      console.log("THE BUYER WITH THE FIRST CLIENT");
    }

    if (shoppingListManager.shoppingList.length === 0) {
      // Use the class instance
      throw new Error("Your shopping list is empty.");
    }

    const transactionData = {
      party_id: clientId, // Use the client ID as party_id
      transaction_type: "buy", // Assuming this is a buying transaction
      discount: 0, // Set discount if applicable
    };

    const transactionResponse = await window.transactionsAPI.createTransaction(
      transactionData
    );

    if (!transactionResponse.success) {
      throw new Error(transactionResponse.error);
    }

    const transactionId = transactionResponse.result;

    for (const item of shoppingListManager.shoppingList.shoppingList) {
      console.log({ item });

      // Use the class instance
      const itemDetail = {
        product_id: item.productId, // Assuming productId is available in the item
        quantity_selected: item.subUnits,
        unit_price: item.buyingPrice,
      };

      const detailResponse =
        await window.transactionsAPI.createTransactionDetail({
          transactionId,
          ...itemDetail,
        });

      if (!detailResponse.success) {
        throw new Error(detailResponse.error);
      }
    }

    shoppingListManager.clearList(); // Use the class instance

    NotificationManager.showNotification(
      "Transaction completed successfully!",
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
  } catch (error) {
    console.error("Transaction error:", error);
    NotificationManager.showNotification(
      error.message || "Transaction failed. Please try again.",
      NotificationManager.NOTIFICATION_TYPES.ERROR
    );
  }
}

/* Helper Functions */
function openProductModal() {
  modalManager.open("product-modal");
}

function closeProductModal() {
  modalManager.close("product-modal");
  formManager.reset("selling-form"); // Reset the form when closing the modal
}
