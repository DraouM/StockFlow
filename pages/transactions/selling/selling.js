// Function to handle printing and redirecting to the delivery note
function handlePrintButton() {
  console.log("Print");

  // Collect shopping list data
  const shoppingList = [];
  const rows = document.querySelectorAll("#shopping-list tbody tr");
  rows.forEach((row) => {
    const productName = row.cells[1].textContent;
    const quantity = row.cells[2].querySelector(".main-quantity").textContent;
    const unitPrice = row.cells[4].textContent;
    const subTotal = row.cells[5].textContent;
    shoppingList.push({ productName, quantity, unitPrice, subTotal });
  });

  // Get client details
  const clientId = document.getElementById("clientName").dataset.clientId; // Assuming you store the client ID in a data attribute
  const totalAmount = parseFloat(
    document.getElementById("finalAmount").textContent
  );
  const discount = parseFloat(document.getElementById("discount").value) || 0;

  // Create transaction object
  const transaction = {
    party_id: parseInt(clientId),
    total_amount: totalAmount,
    discount: discount,
    items: shoppingList,
  };

  // Log the transaction to console
  console.log("New Transaction:", transaction);

  // Redirect to delivery note with transaction data
  sessionStorage.setItem("transactionData", JSON.stringify(transaction));
  window.location.href =
    "/home/mohamed/Documents/Projects/StockFlow/pages/transactions/deleveryNote.html";
}

// Attach the handlePrintButton function to the print button
document
  .getElementById("printBtn")
  .addEventListener("click", handlePrintButton);
