const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const TransactionController = require("../controllers/transactionController");

const transactionController = new TransactionController();

// Create the ipcMain events for transaction management
function setupTransactionsIPC() {
  // Get all transactions
  ipcMain.handle("get-all-transactions", async (event, args) => {
    try {
      const transactions = await transactionController.getTransactions();
      console.log({ transactions });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return { error: "Failed to get transactions." };
    }
  });

  // Get a transaction by ID
  ipcMain.handle("get-transaction-by-id", async (event, transactionId) => {
    try {
      const transaction = await transactionController.getTransactionById(
        transactionId
      );
      if (!transaction) {
        return { error: "Transaction not found." };
      }
      return transaction;
    } catch (error) {
      console.error("Error getting transaction:", error);
      return { error: "Failed to get transaction." };
    }
  });

  // Create a new transaction
  ipcMain.handle("create-transaction", async (event, transactionData) => {
    try {
      const newTransactionId = await transactionController.createTransaction(
        transactionData
      );
      return {
        message: "Transaction created successfully.",
        id: newTransactionId,
      };
    } catch (error) {
      console.error("Error creating transaction:", error);
      return { error: "Failed to create transaction." };
    }
  });

  // Update a transaction
  ipcMain.handle("update-transaction", async (event, transactionData) => {
    try {
      await transactionController.updateTransaction(transactionData);
      return { message: "Transaction updated successfully." };
    } catch (error) {
      console.error("Error updating transaction:", error);
      return { error: "Failed to update transaction." };
    }
  });

  // Delete a transaction
  ipcMain.handle("delete-transaction", async (event, transactionId) => {
    try {
      await transactionController.deleteTransaction(transactionId);
      return { message: "Transaction deleted successfully." };
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return { error: "Failed to delete transaction." };
    }
  });

  // Get all transaction details for a specific transaction
  ipcMain.handle("get-transaction-details", async (event, transactionId) => {
    try {
      const details = await transactionController.getTransactionDetails(
        transactionId
      );
      return details;
    } catch (error) {
      console.error("Error getting transaction details:", error);
      return { error: "Failed to get transaction details." };
    }
  });

  // Create a new transaction detail
  ipcMain.handle("create-transaction-detail", async (event, detailData) => {
    try {
      const newDetailId = await transactionController.createTransactionDetail(
        detailData
      );
      return {
        message: "Transaction detail created successfully.",
        id: newDetailId,
      };
    } catch (error) {
      console.error("Error creating transaction detail:", error);
      return { error: "Failed to create transaction detail." };
    }
  });

  // Update a transaction detail
  ipcMain.handle("update-transaction-detail", async (event, detailData) => {
    try {
      await transactionController.updateTransactionDetail(detailData);
      return { message: "Transaction detail updated successfully." };
    } catch (error) {
      console.error("Error updating transaction detail:", error);
      return { error: "Failed to update transaction detail." };
    }
  });

  // Delete a transaction detail
  ipcMain.handle("delete-transaction-detail", async (event, detailId) => {
    try {
      await transactionController.deleteTransactionDetail(detailId);
      return { message: "Transaction detail deleted successfully." };
    } catch (error) {
      console.error("Error deleting transaction detail:", error);
      return { error: "Failed to delete transaction detail." };
    }
  });
}

module.exports = { setupTransactionsIPC };
