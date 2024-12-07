// // // Simulating frontend call to all transactions methods

// // // Creation
// // (async () => {
// //   const newTransaction = {
// //     party_id: 2, // Example party_id (client or supplier ID)
// //     total_amount: 200.0,
// //     discount: 10.0,
// //     transaction_date: "2024-09-02",
// //     transaction_type: "selling", // or "buying"
// //     notes: "Payment for services",
// //     settled: 1, // 0 for unsettled, 1 for settled
// //   };

// //   try {
// //     const result = await window.electronAPI.transactions.create(newTransaction);
// //     console.log("Transaction created successfully:", result);
// //   } catch (error) {
// //     console.error("Error creating transaction:", error);
// //   }
// // })();

// // //   updating
// // (async () => {
// //   const transactionId = 3; // ID of the transaction to be updated
// //   const updateData = {
// //     total_amount: 1800.0,
// //     discount: 40.0,
// //     transaction_date: "2024-09-04",
// //     transaction_type: "buying",
// //     notes: "Updated transaction",
// //     settled: 1,
// //   };

// //   try {
// //     console.log(
// //       "Data being passed to window.electronAPI.transactions.update:",
// //       transactionId,
// //       updateData
// //     );
// //     const result = await window.electronAPI.transactions.update(
// //       transactionId,
// //       updateData
// //     );

// //     console.log("Transaction updated successfully:", result);
// //   } catch (error) {
// //     console.log("Transaction update Failed:");
// //     console.error("Error updating transaction:", error);
// //   }
// // })();

// // //   deleting
// // (async () => {
// //   const transactionId = 1; // ID of the transaction to be deleted

// //   try {
// //     const result = await window.electronAPI.transactions.delete(transactionId);
// //     console.log("Transaction deleted successfully:", result);
// //   } catch (error) {
// //     console.error("Error deleting transaction:", error);
// //   }
// // })();

// // //   List all
// // (async () => {
// //   try {
// //     const transactions = await window.electronAPI.transactions.getAll();
// //     console.log("All Transactions:", transactions);
// //   } catch (error) {
// //     console.error("Error fetching transactions:", error);
// //   }
// // })();

// // //   get by id
// // (async () => {
// //   const transactionId = 6; // ID of the transaction to retrieve

// //   try {
// //     const transaction = await window.electronAPI.transactions.getById(
// //       transactionId
// //     );
// //     console.log("Transaction details:", transaction);
// //   } catch (error) {
// //     console.error(`Error fetching transaction ${transactionId}:`, error);
// //   }
// // })();

// // //   get by date range
// // (async () => {
// //   const startDate = "2024-09-04";
// //   const endDate = "2024-09-05";

// //   try {
// //     const transactions = await window.electronAPI.transactions.getByDateRange(
// //       startDate,
// //       endDate
// //     );
// //     console.log(
// //       `Transactions between ${startDate} and ${endDate}:`,
// //       transactions
// //     );
// //   } catch (error) {
// //     console.error(
// //       `Error fetching transactions for date range ${startDate} to ${endDate}:`,
// //       error
// //     );
// //   }
// // })();

// // //
// // (async () => {
// //   const transactionType = "selling"; // Can be 'buying' or 'selling'

// //   try {
// //     const totalAmount =
// //       await window.electronAPI.transactions.getTotalAmountByType(
// //         transactionType
// //       );
// //     console.log(`Total amount for ${transactionType}:`, totalAmount);
// //   } catch (error) {
// //     console.error(`Error fetching total amount for ${transactionType}:`, error);
// //   }
// // })();

// // //
// // (async () => {
// //   const transactionId = 1; // ID of the transaction to settle

// //   try {
// //     const result = await window.electronAPI.transactions.settle(transactionId);
// //     console.log("Transaction settled successfully:", result);
// //   } catch (error) {
// //     console.error(`Error settling transaction ${transactionId}:`, error);
// //   }
// // })();

// // //
// // (async () => {
// //   const partyId = 2; // Optional: party ID (client or supplier)

// //   try {
// //     const unsettledTransactions =
// //       await window.electronAPI.transactions.getUnsettled(partyId);
// //     console.log("Unsettled Transactions:", unsettledTransactions);
// //   } catch (error) {
// //     console.error("Error fetching unsettled transactions:", error);
// //   }
// // })();

// //   updating
// (async () => {
//   const transactionId = 6; // ID of the transaction to be updated
//   const updateData = {
//     total_amount: 1300.0,
//     discount: 40.0,
//     transaction_date: "2024-09-04",
//     transaction_type: "buying",
//     notes: "Updated transaction",
//     settled: 1,
//   };

//   console.log(
//     "STEP A => Before sending to preload script:",
//     transactionId,
//     updateData
//   );
//   try {
//     const result = await window.electronAPI.transactions.update(
//       transactionId,
//       updateData
//     );
//     console.log("Transaction updated successfully:", result);
//   } catch (error) {
//     console.log("Transaction update Failed:");
//     console.error("Error updating transaction:", error);
//   }
// })();
// Import the transactions API

function fetchTransactions() {
  return transactionsAPI.getAllTransactions();
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

    // clear an existing rows
    tableBody.innerHTML = "";

    // Use a document fragment to improve performance
    const fragment = document.createDocumentFragment();

    // Fetch all the transactions using the exposed API
    // const transactions = fetchTransactions();
    // Get all transactions
    transactionsAPI
      .getAllTransactions()
      .then(async (transactions) => {
        console.log("All Transactions:", transactions);
        // Update UI or perform further actions

        // Iterate over each product and add a row to the fragment
        for (const transaction of transactions) {
          const party = await window.electronAPI.parties.getById(
            transaction.party_id
          );

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${transaction.transaction_id}</td>
            <td>${party.name}</td>
            <td>${transaction.transaction_date}</td>
            <td>${transaction.transaction_type}</td>
            <td>${transaction.total_amount}</td>
            <td>${transaction.discount}</td>
            <td>${transaction.notes}</td>
            <td>${transaction.settled}</td>
            <td><button class="button button-small button-secondary edit-button" data-id="${transaction.transaction_id}">Edit</button> 
            `;

          // Append the fragment to the table body
          fragment.appendChild(row);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch transactions:", error);
        // Handle error in UI (show error message, etc.)
      });

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
    // // Optionally handle the case where no products are available
    // if (transactions.length === 0) {
    //   transactionsTable.checkTableEmpty(0);
    // }
  } catch (error) {
    console.error("Error fetching transactions:", error);

    spinner.hide(); // Hide spinner in case of an error
  }
});
