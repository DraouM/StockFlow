import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";
import NotificationManager from "../notificationManager.js";
import { UtilityHelpers } from "./utilityHelpers.js";
import ShoppingList from "../ShoppingList.js"; // Import the class

const shoppingList = new ShoppingList(formManager, modalManager); // Create an instance
document.addEventListener("DOMContentLoaded", () => initializePage());

function initializePage() {
  const transactionId = getTransactionIdFromUrl();
  // Initialize features
  initializeModals();
  initializeClientSearch();
  initializeProductSearch();
  initializeProductForm();
  // initializeEventListeners();
  // Handle page context (new or update)
  handlePageContext(transactionId);

  // Initialize event listeners
  initializeEventListeners(transactionId);
}

function handlePageContext(transactionId) {
  const confirmTransactionButton = document.getElementById(
    "confirmTransactionBtn"
  );

  if (transactionId) {
    // Update mode
    populateTransactionDetails(transactionId);
    if (confirmTransactionButton) {
      confirmTransactionButton.textContent = "Update Order"; // Adjust button text
    }
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
    "confirmTransactionBtn"
  );
  if (confirmTransactionButton) {
    confirmTransactionButton.addEventListener("click", async () => {
      await handleTransaction(transactionId);
    });
  }
}

function handleShoppingListActions(event) {
  const target = event.target;
  const tempId = target.dataset.id;

  if (!tempId) return;

  if (target.classList.contains("edit-button")) {
    shoppingList.handleEditButtonClick(tempId); // Edit handler
  } else if (target.classList.contains("delete-button")) {
    shoppingList.deleteProduct(tempId); // Delete handler
  }
}

function getTransactionIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("transaction_id");
}

async function populateTransactionDetails(transactionId) {
  try {
    const transactionData = await fetchTransactionData(transactionId);
    console.log({ transactionId, transactionData });

    if (transactionData) {
      populateShoppingList(transactionData); // Populate the form with fetched data
    }
  } catch (error) {
    console.error("Error fetching transaction data:", error);
  }
}
async function fetchTransactionData(transactionId) {
  const response =
    await window.transactionsAPI.getTransactionDetailsByTransactionId(
      transactionId
    );

  if (!response.success) {
    throw new Error("Failed to fetch transaction details");
  }

  return response.transactionDetails;
}

async function populateShoppingList(transactionDetails) {
  for (const item of transactionDetails) {
    const productResponse = await window.productsAPI.fetchSingleProduct(
      item.product_id
    );

    const productDetails = {
      productName: productResponse.data.name,
      subUnits: item.quantity_selected,
      unitPrice: item.price_per_unit,
      quantityUnit: productResponse.data.subunit_in_unit,
      quantity: convertSubUnitsToQuantity(
        item.quantity_selected,
        productResponse.data.subunit_in_unit
      ),
    };

    shoppingList.addProduct(productDetails);
  }

  shoppingList.renderList();
}
// REMOUVE later!! ****
function convertSubUnitsToQuantity(subUnits, quantityUnit) {
  console.log({ subUnits, quantityUnit });

  if (!subUnits) return "0";

  const units = Math.floor(subUnits / quantityUnit);
  const remainingSubUnits = subUnits % quantityUnit;

  if (units === 0) {
    return `0 & ${remainingSubUnits}`;
  }

  if (remainingSubUnits === 0) {
    return `${units}`;
  }

  return `${units} & ${remainingSubUnits}`;
}

function initializeModals() {
  // Client Modal
  modalManager.init("client-modal");
  modalManager.open("client-modal");

  document
    .getElementById("confirm-client-btn")
    .addEventListener("click", () => {
      modalManager.close("client-modal");
    });

  // Product Modal
  modalManager.init("product-modal");
  document
    .getElementById("open-modal-btn")
    .addEventListener("click", openProductModal);
  document
    .querySelector(".close-modal-btn")
    .addEventListener("click", closeProductModal);
}

function initializeClientSearch() {
  const fetchParties = async (searchTerm) => {
    return await window.partiesAPI.searchParties({
      searchTerm: searchTerm,
      type: "customer",
      page: 1,
      limit: 50,
    });
  };

  const onPartySelected = (selectedClient) => {
    displaySelectedClient(selectedClient);
  };

  const clientSearchbar = new Searchbar(
    "search-input-client",
    "results-list-client",
    "search-form-client",
    "search-results-client",
    fetchParties,
    onPartySelected
  );
}

function displaySelectedClient(client) {
  const clientNameElement = document.getElementById("clientName");
  const clientAddressElement = document.getElementById("clientAddress");
  const clientPhoneElement = document.getElementById("clientPhone");
  const clientDebtElement = document.getElementById("clientDebt");

  clientNameElement.dataset.clientId = client.id;
  clientNameElement.textContent = client.name || "Unknown Client";
  clientAddressElement.textContent = `Address: ${client.address || "N/A"}`;
  clientPhoneElement.textContent = `Phone: ${client.phone || "N/A"}`;
  clientDebtElement.textContent = `Debt: $${client.total_debt || 0.0}`;
}

function initializeProductSearch() {
  const searchProducts = async (searchTerm) => {
    return await window.productsAPI.searchProduct(searchTerm);
  };

  const onProductSelected = (selectedProduct) => {
    const productDataEx = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitPrice: selectedProduct.selling_price,
      quantityUnit: selectedProduct.subunit_in_unit,
    };

    document.getElementById("quantityUnit").textContent =
      productDataEx.quantityUnit.toString().padStart(2, "0");
    formManager.populate("selling-form", productDataEx);
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
  const productFormId = "selling-form";

  formManager.init(productFormId, {
    rules: {
      productName: { required: true, minLength: 2 },
      quantity: { required: true, min: 1 },
      subUnits: { required: true, min: 1 },
      unitPrice: { required: true, min: 0.01 },
    },

    onAdd: (formData) => {
      console.log({ formData });

      const quantityUnit = document.getElementById("quantityUnit").textContent;
      const product = {
        productId: formData.productId,
        productName: formData.productName,
        quantity: formData.quantity,
        subUnits: formData.subUnits,
        unitPrice: formData.unitPrice,
        quantityUnit,
      };
      shoppingList.addProduct(product); // Use the class instance
    },

    onUpdate: (product) => {
      const form = document.getElementById(productFormId);
      const itemId = form.getAttribute("data-item-id");
      shoppingList.updateProduct(itemId, product); // Use the class instance
      form.setAttribute("data-operation", "add");
    },
  });
}

function openProductModal() {
  modalManager.open("product-modal");
}

function closeProductModal() {
  modalManager.close("product-modal");
  formManager.reset("selling-form"); // Reset the form when closing the modal
}

async function createNewTransaction() {
  try {
    const clientId = document.getElementById("clientName").dataset.clientId;
    if (!clientId) {
      throw new Error("Please select a client.");
    }

    if (shoppingList.shoppingList.length === 0) {
      // Use the class instance
      throw new Error("Your shopping list is empty.");
    }

    const transactionData = {
      party_id: clientId, // Use the client ID as party_id
      transaction_type: "sell", // Assuming this is a selling transaction
      discount: 0, // Set discount if applicable
    };

    const transactionResponse = await window.transactionsAPI.createTransaction(
      transactionData
    );

    if (!transactionResponse.success) {
      throw new Error(transactionResponse.error);
    }

    const transactionId = transactionResponse.result;

    for (const item of shoppingList.shoppingList) {
      // Use the class instance
      const itemDetail = {
        product_id: item.productId, // Assuming productId is available in the item
        quantity_selected: item.quantity,
        unit_price: item.unitPrice,
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

    shoppingList.clearList(); // Use the class instance

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

async function fetchTransactionDetails(transactionId) {
  try {
    const response = await window.transactionsAPI.getTransactionDetails(
      transactionId
    );
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error fetching transaction details:", error);
  }
}

async function handleTransaction(transactionId = null) {
  if (transactionId) {
    // updateTransaction();
    console.log(transactionId, "Transaction Updated !!");
  } else {
    createNewTransaction();
  }
}

/** EDITING a transaction */
function openTransactionModal(transactionId = null) {
  modalManager.open("transaction-modal");

  if (transactionId) {
    // Load existing transaction details
    loadTransaction(transactionId);
    document.getElementById("transactionId").value = transactionId; // Set the transaction ID
    document
      .getElementById("transaction-form")
      .setAttribute("data-operation", "update");
  } else {
    // Prepare for a new transaction
    document.getElementById("transaction-form").reset(); // Reset the form
    document.getElementById("transactionId").value = ""; // Clear the transaction ID
    document
      .getElementById("transaction-form")
      .setAttribute("data-operation", "create");
  }
}

async function loadTransaction(transactionId) {
  const transactionDetails = await fetchTransactionDetails(transactionId);

  // Populate the form fields with the transaction data
  document.getElementById("clientName").value = transactionDetails.clientName;
  document.getElementById("productName").value = transactionDetails.productName;
  document.getElementById("quantity").value = transactionDetails.quantity;

  // Load the shopping list into the ShoppingList
  shoppingList.populate(transactionDetails.items);
}
