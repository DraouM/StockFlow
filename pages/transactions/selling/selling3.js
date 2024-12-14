const urlParams = new URLSearchParams(window.location.search);

const transactionId = urlParams.get("transaction_id");
console.log(`Transaction ID from URL: ${transactionId}`);

// Function to fetch and display transaction details
async function fetchTransactionDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get("transaction_id");

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

// Fetch transaction details when the page loads
document.addEventListener("DOMContentLoaded", fetchTransactionDetails);

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
