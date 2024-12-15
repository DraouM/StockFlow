async function fetchTransactionDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get("transaction_id");

  console.log(`Transaction ID from URL: ${transactionId}`);

  if (!transactionId) {
    console.error("Transaction ID not found in URL");
    return;
  }

  try {
    const transactionDetailsResponse =
      await window.transactionsAPI.getTransactionDetailsByTransactionId(
        transactionId
      );
    console.log({ transactionDetailsResponse });

    if (!transactionDetailsResponse.success) {
      throw new Error("Failed to fetch transaction details");
    }

    const transactionDetails = transactionDetailsResponse.transactionDetails; // Access the transaction details data
    // Add transaction details to the shopping list
    for (const item of transactionDetails) {
      const productResponse = await window.productsAPI.fetchSingleProduct(
        item.product_id
      );
      console.log({ productResponse });

      const productName = productResponse.data.name; // Assuming the response contains product_name
      const quantityUnit = productResponse.data.subunit_in_unit; // Assuming the response contains unit

      ShoppingListManager.addItem({
        productName: productName,
        subUnits: item.quantity_selected,
        unitPrice: item.price_per_unit,
        quantityUnit: quantityUnit,
        quantity: convertSubUnitsToQuantity(
          item.quantity_selected,
          quantityUnit
        ),
      });
    }

    ShoppingListManager.renderList(); // Render the updated shopping list
  } catch (error) {
    console.error("Error fetching transaction details:", error);
  }
}

let previousShoppingList = []; // Variable to store the previous state of the shopping list

function trackChanges(currentShoppingList) {
  const changes = {
    updated: [],
    removed: [],
    added: [],
  };

  // Check for updated and removed items
  originalShoppingList.forEach((originalItem) => {
    const currentItem = currentShoppingList.find(
      (item) => item.id === originalItem.id
    );
    if (currentItem) {
      // Check for updates
      if (
        currentItem.quantity !== originalItem.quantity ||
        currentItem.unitPrice !== originalItem.unitPrice
      ) {
        changes.updated.push({ id: originalItem.id, updatedItem: currentItem });
      }
    } else {
      // Item was removed
      changes.removed.push(originalItem);
    }
  });

  // Check for added items
  currentShoppingList.forEach((currentItem) => {
    const originalItem = originalShoppingList.find(
      (item) => item.id === currentItem.id
    );
    if (!originalItem) {
      changes.added.push(currentItem);
    }
  });

  return changes;
}

// Function to display transaction details on the page
function displayTransactionDetails(details) {
  const detailsContainer = document.getElementById("transactionDetails");
  detailsContainer.innerHTML = `
        <p>Transaction ID: ${details.transaction_id}</p>
        <p>Party Name: ${details.party_name}</p>
        <p>Transaction Date: ${details.transaction_date}</p>
        <p>Transaction Type: ${details.transaction_type}</p>
        <p>Total Amount: ${details.total_amount}</p>
        <p>Discount: ${details.discount}</p>
        <!-- Add more details as needed -->
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchTransactionDetails();

  // Add event listener for the confirm button
  const confirmButton = document.getElementById("confirmTransactionBtn");
  confirmButton.addEventListener("click", () => {
    const currentShoppingList = ShoppingListManager.shoppingList; // Accessing the shopping list directly
    const changes = trackChanges(currentShoppingList);
    displayChanges(changes);
  });
});

function convertSubUnitsToQuantity(subUnits, qauntityUnit) {
  console.log({ subUnits, qauntityUnit });

  console.log("Subunits ", subUnits, qauntityUnit);

  if (!subUnits) return "0";

  const units = Math.floor(subUnits / qauntityUnit);
  const remainingSubUnits = subUnits % qauntityUnit;

  console.log("Check this ", units, remainingSubUnits);

  // If we only have sub-units (less than one full unit)
  if (units === 0) {
    return `0 & ${remainingSubUnits}`;
  }

  // If we have exact units (no remaining sub-units)
  if (remainingSubUnits === 0) {
    return `${units}`;
  }

  // If we have both units and sub-units
  return `${units} & ${remainingSubUnits}`;
}

async function loadTransactionForEditing(transactionId) {
  const transactionDetails = await fetchTransactionDetails(transactionId);
  if (transactionDetails) {
    // Populate the form fields with existing transaction data
    document.getElementById("clientName").textContent =
      transactionDetails.clientName;
    document.getElementById("totalAmount").value =
      transactionDetails.totalAmount;
    document.getElementById("discount").value = transactionDetails.discount;
    document.getElementById("finalAmount").value =
      transactionDetails.finalAmount;

    // Populate the shopping list
    transactionDetails.items.forEach((item) => {
      ShoppingListManager.addItem(item); // Assuming addItem can handle existing items
    });

    // Set the form to edit mode
    const form = document.getElementById("selling-form");
    form.setAttribute("data-operation", "edit");
    form.setAttribute("data-transaction-id", transactionId);
  }
}

let originalShoppingList = []; // Store the original shopping list

// Call this function whenever the shopping list is modified
function onShoppingListChange(currentShoppingList) {
  const changes = trackChanges(currentShoppingList);
  console.log("Changes detected:", changes);
}

// Example usage when rendering the shopping list
function renderList() {
  // Existing rendering logic...
  originalShoppingList = [...currentShoppingList]; // Update original list after rendering
}
