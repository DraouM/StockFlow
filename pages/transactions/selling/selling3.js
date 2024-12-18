async function fetchTransactionDetails() {
  try {
    const transactionId = getTransactionIdFromUrl();

    if (!transactionId) {
      throw new Error("Invalid Transaction ID");
    }

    const transactionDetails = await fetchTransactionData(transactionId);
    await populateShoppingList(transactionDetails);
  } catch (error) {
    handleTransactionFetchError(error);
  }
}

function getTransactionIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("transaction_id");
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

    ShoppingListManager.addItem(productDetails);
  }

  ShoppingListManager.renderList();
}

function handleTransactionFetchError(error) {
  console.error("Error fetching transaction details:", error);
  NotificationManager.showError("Unable to load transaction details");
}

/** */
// Ensure these are defined or imported
import EditableShoppingListManager from "../EditableShoppingListManager.js";

// Utility function for unit conversion
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

// Notification Manager
const NotificationManager = {
  showError: (message) => {
    console.error(message);
    const errorContainer = document.getElementById("error-container");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    }
  },
  showSuccess: (message) => {
    console.log(message);
    const successContainer = document.getElementById("success-container");
    if (successContainer) {
      successContainer.textContent = message;
      successContainer.style.display = "block";
    }
  },
};
async function fetchTransactionDetailsForEditing() {
  try {
    const transactionId = getTransactionIdFromUrl();

    if (!transactionId) {
      throw new Error("Invalid Transaction ID");
    }

    // Create an instance of EditableShoppingListManager
    const editableListManager = new EditableShoppingListManager();

    // Fetch transaction details
    const transactionDetails = await fetchTransactionData(transactionId);

    // Populate initial list (original state)
    await populateEditableShoppingList(editableListManager, transactionDetails);

    // Set up event listeners for tracking changes
    setupChangeTrackingListeners(editableListManager);

    // Return the manager for further use
    return editableListManager;
  } catch (error) {
    handleTransactionFetchError(error);
  }
}

async function populateEditableShoppingList(
  editableListManager,
  transactionDetails
) {
  for (const item of transactionDetails) {
    const productResponse = await window.productsAPI.fetchSingleProduct(
      item.product_id
    );

    const productDetails = {
      tempId: `transaction-item-${item.id}`, // Unique identifier
      productId: item.product_id,
      productName: productResponse.data.name,
      subUnits: item.quantity_selected,
      unitPrice: item.price_per_unit,
      quantityUnit: productResponse.data.subunit_in_unit,
      quantity: convertSubUnitsToQuantity(
        item.quantity_selected,
        productResponse.data.subunit_in_unit
      ),
      originalTransactionItem: item, // Keep original transaction item for reference
    };

    // Use the editable manager to add items
    editableListManager.addProduct(productDetails);
  }

  // Render the initial list
  editableListManager.renderList();
}

function setupChangeTrackingListeners(editableListManager) {
  // Example: Track changes when confirm button is clicked
  const confirmButton = document.getElementById("confirmTransactionBtn");
  confirmButton.addEventListener("click", () => {
    // Get change history
    const changeLog = editableListManager.getChangeHistory();

    // Display or process changes
    displayTransactionChanges(changeLog);
  });

  // Optional: Add real-time change tracking
  editableListManager.on("productAdded", (product) => {
    console.log("Product Added:", product);
    // Additional logic for product addition
  });

  editableListManager.on("productUpdated", (update) => {
    console.log("Product Updated:", update);
    // Additional logic for product update
  });

  editableListManager.on("productDeleted", (product) => {
    console.log("Product Deleted:", product);
    // Additional logic for product deletion
  });
}

function displayTransactionChanges(changeLog) {
  const changesContainer = document.getElementById("transactionChanges");

  // Ensure the container exists
  if (!changesContainer) {
    console.warn("Changes container not found");
    return;
  }

  // Clear previous changes
  changesContainer.innerHTML = "";

  // Render changes
  changeLog.forEach((change) => {
    const changeElement = document.createElement("div");
    changeElement.classList.add("change-item");
    changeElement.innerHTML = `
      <span>Type: ${change.type}</span>
      <span>Timestamp: ${change.timestamp}</span>
      <pre>${JSON.stringify(change.details, null, 2)}</pre>
    `;
    changesContainer.appendChild(changeElement);
  });
}
// Add this function or remove the call if not needed
function setupAdditionalEditing(editableListManager) {
  // Optional: Add any additional setup for editing
  console.log("Setting up additional editing", editableListManager);

  // Example: Add more specific configurations
  // You can customize this based on your specific requirements
  const editControls = {
    // Example configurations
    allowQuantityEdit: true,
    allowPriceEdit: true,
    trackChanges: true,
  };

  // Optional: Set up any specific event listeners or configurations
  editableListManager.on("productUpdated", (update) => {
    console.log("Additional editing - Product updated", update);
    // Add any specific logic for additional editing
  });

  return editControls;
}

// Modify your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const editableListManager = await fetchTransactionDetailsForEditing();

    // Optional: Additional setup
    if (editableListManager) {
      // Use the function if it exists, otherwise provide a default implementation
      const additionalSetup =
        typeof setupAdditionalEditing === "function"
          ? setupAdditionalEditing(editableListManager)
          : null;

      console.log("Additional editing setup:", additionalSetup);
    }
  } catch (error) {
    console.error("Error in DOMContentLoaded:", error);
    NotificationManager.showError("Failed to initialize transaction editing");
  }
});
