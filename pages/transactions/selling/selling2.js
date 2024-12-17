import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";
import NotificationManager from "../notificationManager.js";
import { UtilityHelpers } from "./utilityHelpers.js";
import ShoppingListManager from "../ShoppingListManager.js"; // Import the class

const shoppingListManager = new ShoppingListManager(formManager, modalManager); // Create an instance

document.addEventListener("DOMContentLoaded", function () {
  initializeModals();
  initializeClientSearch();
  initializeProductSearch();
  initializeProductForm();

  // Event delegation for edit and delete buttons
  document
    .querySelector("#shopping-list tbody")
    .addEventListener("click", (event) => {
      const tempId = event.target.dataset.id;
      console.log({ tempId });

      if (event.target.classList.contains("edit-button")) {
        shoppingListManager.handleEditButtonClick(tempId); // Call the edit handler
      } else if (event.target.classList.contains("delete-button")) {
        shoppingListManager.deleteProduct(tempId); // Call the delete handler
      }
    });

  document
    .getElementById("confirmTransactionBtn")
    .addEventListener("click", async (event) => {
      await handleTransaction();
    });
});

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
      shoppingListManager.addProduct(product); // Use the class instance
    },

    onUpdate: (product) => {
      const form = document.getElementById(productFormId);
      const itemId = form.getAttribute("data-item-id");
      shoppingListManager.updateProduct(itemId, product); // Use the class instance
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

async function createTransaction(transactionData) {
  try {
    const response = await window.transactionsAPI.createTransaction(
      transactionData
    );
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
}

async function handlePayment(transactionId, paymentAmount) {
  try {
    const response = await window.transactionsAPI.handlePayment(
      transactionId,
      paymentAmount
    );
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error handling payment:", error);
  }
}

async function cancelTransaction(transactionId) {
  try {
    await window.transactionsAPI.cancelTransaction(transactionId);
  } catch (error) {
    console.error("Error canceling transaction:", error);
  }
}

async function fetchTransactionHistory() {
  try {
    const response = await window.transactionsAPI.getTransactionHistory();
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error fetching transaction history:", error);
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

async function fetchProductDetails(productId) {
  try {
    const response = await window.productsAPI.getProductDetails(productId);
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

async function fetchOrderDetails(orderId) {
  try {
    const response = await window.ordersAPI.getOrderDetails(orderId);
    return response.data; // Handle the response as needed
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
}

async function onSubmitSellingForm(formData) {
  const transactionData = {
    clientId: formData.clientId,
    items: shoppingListManager.shoppingList, // Use the class instance
    totalAmount: calculateTotalAmount(shoppingListManager.shoppingList), // Use the class instance
  };

  const transactionResponse = await createTransaction(transactionData);
  if (transactionResponse) {
    shoppingListManager.shoppingList.forEach((item) => {
      updateInventory(item.productId, item.quantity);
    });
    shoppingListManager.clearList(); // Use the class instance
    NotificationManager.showNotification(
      "Transaction completed successfully!",
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
  }
}

function calculateTotalAmount(shoppingList) {
  return shoppingList.reduce((total, item) => total + item.subTotal, 0);
}

async function handleTransaction() {
  try {
    const clientId = document.getElementById("clientName").dataset.clientId;
    if (!clientId) {
      throw new Error("Please select a client.");
    }

    if (shoppingListManager.shoppingList.length === 0) {
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

    for (const item of shoppingListManager.shoppingList) {
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
