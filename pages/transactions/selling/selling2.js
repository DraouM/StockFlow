import modalManager from "../modalManager.js";
import formManager from "../formsManager.js";

const NOTIFICATION_TYPES = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};

const ShoppingListManager = {
  shoppingList: [],

  getId(item) {
    return item.id || item.productId || item.userId;
  },

  showNotification(message, type = NOTIFICATION_TYPES.INFO) {
    let notificationContainer = document.getElementById(
      "notification-container"
    );

    if (!notificationContainer) {
      notificationContainer = this.createNotificationContainer();
      document.body.appendChild(notificationContainer);
    }

    const notification = this.createNotificationElement(message, type);
    notificationContainer.appendChild(notification);
    this.fadeInNotification(notification);
  },

  createNotificationContainer() {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    `;
    return container;
  },

  createNotificationElement(message, type) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      background-color: ${this.getNotificationColor(type)};
      color: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    `;
    notification.textContent = message;
    return notification;
  },

  getNotificationColor(type) {
    switch (type) {
      case NOTIFICATION_TYPES.WARNING:
        return "#ffcc00";
      case NOTIFICATION_TYPES.ERROR:
        return "#ff4444";
      default:
        return "#4CAF50";
    }
  },

  fadeInNotification(notification) {
    notification.offsetHeight; // Trigger reflow
    notification.style.opacity = "1";

    setTimeout(() => {
      this.fadeOutNotification(notification);
    }, 3000);
  },

  fadeOutNotification(notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
      const container = notification.parentNode;
      container.removeChild(notification);

      if (container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  },

  addItem(product) {
    console.log("Item added ", product);
    const newItem = this.createNewItem(product);
    this.shoppingList.push(newItem);
    this.renderList();
    this.showNotification(
      `Added ${product.quantity} ${product.productName}`,
      NOTIFICATION_TYPES.INFO
    );
    this.checkForDuplicateProducts(product);
  },

  createNewItem(product) {
    const subTotal = product.quantity * product.unitPrice;
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
      this.showNotification(
        `Note: You've added multiple entries for ${product.productName}`,
        NOTIFICATION_TYPES.WARNING
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
    formManager.populate("selling-form", itemToEdit);
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
      this.showNotification(
        `Removed ${removedProduct}`,
        NOTIFICATION_TYPES.INFO
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
      // event.preventDefault(); // Prevent default form submission
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
  const clientNameInput = document.getElementById("clientName");
  const clientAddressInput = document.getElementById("clientAddress");
  const clientPhoneInput = document.getElementById("clientPhone");
  const clientDebtInput = document.getElementById("clientDebt");

  clientNameInput.dataset.clientId = client.id;
  clientNameInput.value = client.name || "";
  clientAddressInput.value = client.address || "";
  clientPhoneInput.value = client.phone || "";
  clientDebtInput.value = client.total_debt || 0.0;
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
    ShoppingListManager.showNotification(
      "Transaction completed successfully!",
      NOTIFICATION_TYPES.INFO
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
    ShoppingListManager.showNotification(
      "Transaction completed successfully!",
      NOTIFICATION_TYPES.INFO
    );
  } catch (error) {
    console.error("Transaction error:", error);
    ShoppingListManager.showNotification(
      error.message || "Transaction failed. Please try again.",
      NOTIFICATION_TYPES.ERROR
    );
  }
}
