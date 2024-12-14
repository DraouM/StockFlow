function fetchTransactions() {
  return transactionsAPI.getAllTransactions();
}

async function fetchPartyById(partyId) {
  const response = await window.partiesAPI.getPartyById(partyId);
  return response; // Return the entire response object
}

document.addEventListener("DOMContentLoaded", async () => {
  const { transactionsAPI } = window;

  const spinner = new LoadingSpinner("transactionsTable", {
    message: "Loading products...",
  });

  try {
    spinner.show(); // Show spinner before data fetching

    // Get the table body element
    const tableBody = document.querySelector("#transactionsTable tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Fetch all the transactions using the exposed API
    const response = await fetchTransactions(); // Await the promise to get the resolved value
    console.log({ response });

    // Check if the response contains transactions and if it's an array
    if (
      !response ||
      !response.transactions ||
      !Array.isArray(response.transactions)
    ) {
      throw new Error("Fetched transactions is not an array");
    }

    const transactions = response.transactions; // Access the transactions array

    // Iterate over each transaction and add a row to the fragment
    for (const transaction of transactions) {
      console.log({ transaction });

      // Fetch the party by ID
      console.log(`Fetching party for ID: ${transaction.party_id}`);

      const partyResponse = await fetchPartyById(transaction.party_id);
      console.log({ partyResponse });

      // Check if the party response is valid and contains data
      if (!partyResponse.success) {
        throw new Error(`Party not found for ID: ${transaction.party_id}`);
      }

      const party = partyResponse.data; // Access the party data

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${transaction.transaction_id}</td>
        <td>${party.name}</td>
        <td>${transaction.transaction_date}</td>
        <td>${transaction.transaction_type}</td>
        <td>${transaction.total_amount}</td>
        <td>${transaction.discount}</td>
        <td><button class="button button-small button-secondary edit-button" data-id="${transaction.transaction_id}">Edit</button></td>
      `;

      // Add click event listener to the row
      row.addEventListener("click", () => {
        console.log(`Transaction ID clicked: ${transaction.transaction_id}`);
        // Navigate to selling.html, passing the transaction ID as a query parameter
        window.location.href = `selling/selling.html?transaction_id=${transaction.transaction_id}`;
      });

      // Append the row to the fragment
      fragment.appendChild(row);
    }

    // Append the fragment to the table body
    tableBody.appendChild(fragment);

    spinner.hide(); // Hide spinner after data fetching is done

    // Initialize the EnhancedTable
    const transactionsTable = new EnhancedTable("transactionsTable", {
      searchable: true,
      sortable: true,
      searchInputId: "table-search-input", // Link the search input by ID
      emptyMessage: "No Item found",
      emptyImageSrc: "../assets/empty-table.png",
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    spinner.hide(); // Hide spinner in case of an error
  }
});
