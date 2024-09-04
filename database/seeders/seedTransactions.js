const TransactionsModel = require("../models/transactionsModel");
const transactionsModel = new TransactionsModel();
// // Example usage:
// transactions.createTransaction({
//   party_id: 1,
//   total_amount: 150.00,
//   discount: 10.00,
//   transaction_date: '2024-09-01',
//   transaction_type: 'selling',
//   notes: 'First transaction'
// }).then((transactionId) => {
//   console.log('Transaction created with ID:', transactionId);
// }).catch((error) => {
//   console.error(error);
// });

// async function createNewTransaction(transactionData) {
//   try {
//     const newTransactionId = await transactionModel.create(transactionData);
//     console.log(`New transaction created with ID: ${newTransactionId}`);
//   } catch (error) {
//     console.error("Error creating transaction:", error);
//   }
// }
// const data = {
//   party_id: 1,
//   total_amount: 150.0,
//   discount: 10.0,
//   transaction_date: "2024-09-01",
//   transaction_type: "selling",
//   notes: "First transaction",
// };
// createNewTransaction(data);

async function seedTransactions() {
  try {
    // Insert example transactions
    await transactionsModel.create({
      party_id: 1,
      total_amount: 200.0,
      discount: 10.0,
      transaction_date: "2024-09-02",
      transaction_type: "selling",
      notes: "First transaction",
    });

    await transactionsModel.create({
      party_id: 2,
      total_amount: 150.0,
      discount: 5.0,
      transaction_date: "2024-09-03",
      transaction_type: "buying",
      notes: "Second transaction",
    });

    console.log("Transactions inserted successfully.");

    // Update an existing transaction
    const updateSuccess = await transactionsModel.update(5, {
      total_amount: 210.0,
      discount: 15.0,
      transaction_date: "2024-09-02",
      transaction_type: "selling",
      notes: "Updated first transaction",
      settled: 1,
    });

    console.log("Transaction updated:", updateSuccess);

    // Query transactions by date range
    const transactions = await transactionsModel.getTransactionsByDateRange(
      "2024-09-01",
      "2024-09-03"
    );
    console.log("Transactions in date range:", transactions);

    // Get total amount by transaction type
    const totalSelling = await transactionsModel.getTotalAmountByType(
      "selling",
      "2024-09-01",
      "2024-09-03"
    );
    console.log("Total selling amount:", totalSelling);

    const totalBuying = await transactionsModel.getTotalAmountByType(
      "buying",
      "2024-09-01",
      "2024-09-03"
    );
    console.log("Total buying amount:", totalBuying);

    // Settle a transaction
    const settleSuccess = await transactionsModel.settleTransaction(2);
    console.log("Transaction settled:", settleSuccess);

    // Get unsettled transactions
    const unsettledTransactions =
      await transactionsModel.getUnsettledTransactions();
    console.log("Unsettled transactions:", unsettledTransactions);

    // Delete a transaction
    const deleteSuccess = await transactionsModel.delete(1);
    console.log("Transaction deleted:", deleteSuccess);

    // Final transactions list
    const finalTransactions =
      await transactionsModel.getTransactionsByDateRange(
        "2024-09-01",
        "2024-09-03"
      );
    console.log("Final transactions list:", finalTransactions);
  } catch (error) {
    console.error("Error seeding transactions:", error);
  } finally {
    transactionsModel.close();
  }
}

seedTransactions();
