import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";
import NotificationManager from "../notificationManager.js";
import { UtilityHelpers } from "./utilityHelpers.js";

const ShoppingListManager = {
  shoppingList: [],

  getId(item) {
    return item.id || item.productId || item.userId;
  },

  addItem(product) {
    console.log("Item added ", product);
    const newItem = this.createNewItem(product);
    this.shoppingList.push(newItem);
    this.renderList();
    NotificationManager.showNotification(
      `Added ${product.quantity} ${product.productName}`,
      NotificationManager.NOTIFICATION_TYPES.INFO
    );
    this.checkForDuplicateProducts(product);
  },

  createNewItem(product) {
    const subTotal = product.subUnits * product.unitPrice;
    return {
      ...product,
      id: Date.now().toString(),
      subTotal: subTotal,
    };
  },

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
  },

  updateItem(itemId, updatedItem) {
    console.log("Shopping List ", this.shoppingList);
    this.shoppingList = this.shoppingList.map((item) =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    );
    this.renderList();
    console.log("Update 2 ", { itemId, updatedItem });
  },

  editItem(itemId) {
    console.log({ itemId });
    const itemToEdit = this.shoppingList.find((item) => item.id == itemId);

    if (itemToEdit) {
      this.populateEditForm(itemId, itemToEdit);
      openProductModal();
    } else {
      console.error("Item not found for editing");
    }
  },

  populateEditForm(itemId, itemToEdit) {
    const form = document.getElementById("selling-form");
    form.setAttribute("data-operation", "update");
    form.setAttribute("data-item-id", itemId); // Store the specific ID
    console.log({ itemId, itemToEdit });

    formManager.populate("selling-form", itemToEdit);
    document.getElementById("quantityUnit").textContent =
      itemToEdit.quantityUnit;
    document.getElementById("subTotal").value = itemToEdit.subTotal.toFixed(2); // Ensure subTotal input is populated with two decimal places
  },

  renderList() {
    const tableBody = document.querySelector("#shopping-list tbody");
    tableBody.innerHTML = ""; // Clear the table body

    this.shoppingList.forEach((item, index) => {
      const newRow = this.createTableRow(item, index + 1);
      tableBody.appendChild(newRow);
    });
  },

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
        <button onclick="ShoppingListManager.editItem('${
          item.id
        }')" class="edit button button-secondary button-small">Edit</button>
        <button onclick="ShoppingListManager.deleteItem('${this.getId(
          item
        )}')" class="del button button-danger button-small">Del</button>
      </td>
    `;
    return newRow;
  },

  deleteItem(id) {
    const indexToRemove = this.shoppingList.findIndex((item) => item.id == id);
    console.log("Index To remove ", indexToRemove);

    if (indexToRemove !== -1) {
      const removedProduct = this.shoppingList[indexToRemove].productName;
      this.shoppingList.splice(indexToRemove, 1);
      this.renderList();
      NotificationManager.showNotification(
        `Removed ${removedProduct}`,
        NotificationManager.NOTIFICATION_TYPES.INFO
      );
    }
  },

  clearList() {
    this.shoppingList = [];
    this.renderList();
  },
};

// Make it globally accessible
window.ShoppingListManager = ShoppingListManager;

document.addEventListener("DOMContentLoaded", function () {
  initializeModals();
  initializeClientSearch();
  initializeProductSearch();
  initializeProductForm();

  // Example of how to call handleTransaction when the form is submitted
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
    console.log({ searchTerm });
    return await window.partiesAPI.searchParties({
      searchTerm: searchTerm,
      type: "customer",
      page: 1,
      limit: 50,
    });
  };

  const onPartySelected = (selectedClient) => {
    console.log("Client selected:", selectedClient);
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
    console.log("Product selected:", selectedProduct);
    const productDataEx = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitPrice: selectedProduct.selling_price,
      quantityUnit: selectedProduct.subunit_in_unit,
    };

    // Update the quantity unit display
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

    onAdd: (data) => {
      const quantityUnit = document.getElementById("quantityUnit").textContent;
      data.quantityUnit = quantityUnit;
      console.log("Adding item: ", data);
      ShoppingListManager.addItem(data);
    },

    onUpdate: (product) => {
      const form = document.getElementById(productFormId);
      const itemId = form.getAttribute("data-item-id");
      ShoppingListManager.updateItem(itemId, product);
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
  // Ensure the form is reset when clicking outside the modal
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("product-modal");
    if (event.target === modal) {
      formManager.reset("selling-form");
    }
  });
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

async function updateInventory(productId, quantitySold) {
  try {
    await window.productsAPI.updateProductQuantity(productId, quantitySold);
  } catch (error) {
    console.error("Error updating inventory:", error);
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
    items: ShoppingListManager.shoppingList,
    totalAmount: calculateTotalAmount(ShoppingListManager.shoppingList),
  };

  const transactionResponse = await createTransaction(transactionData);
  if (transactionResponse) {
    ShoppingListManager.shoppingList.forEach((item) => {
      updateInventory(item.productId, item.quantity);
    });
    ShoppingListManager.clearList(); // Clear the list after successful transaction
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
    // Step 1: Validate Input
    const clientId = document.getElementById("clientName").dataset.clientId;
    if (!clientId) {
      throw new Error("Please select a client.");
    }

    if (ShoppingListManager.shoppingList.length === 0) {
      throw new Error("Your shopping list is empty.");
    }

    // Prepare transaction data
    const transactionData = {
      party_id: clientId, // Use the client ID as party_id
      transaction_type: "sell", // Assuming this is a selling transaction
      discount: 0, // Set discount if applicable
    };
    console.log({ transactionData });

    // Step 1: Create Transaction
    const transactionResponse = await window.transactionsAPI.createTransaction(
      transactionData
    );

    console.log({ transactionResponse });

    if (!transactionResponse.success) {
      throw new Error(transactionResponse.error);
    }

    const transactionId = transactionResponse.result;
    console.log({ transactionId });

    // Step 2: Add Transaction Details
    for (const item of ShoppingListManager.shoppingList) {
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

    // Step 3: Clear Shopping List
    ShoppingListManager.clearList();

    // Step 4: Show Notification
    // Step 5: Show Success Notification
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
