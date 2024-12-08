const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const TransactionController = require("../controllers/transactionController");

const transactionController = new TransactionController();

// Create the ipcMain events for transaction management

function setupTransactionsIPC() {
  // Create a new transaction
  ipcMain.handle("create-transaction", async (event, transaction) => {
    return await transactionController.createTransaction(transaction);
  });

  // Get all transactions
  ipcMain.handle("get-all-transactions", async (event, page, limit) => {
    return await transactionController.getAllTransactions(page, limit);
  });

  // Get transaction by ID
  ipcMain.handle("get-transaction-by-id", async (event, transactionId) => {
    return await transactionController.getTransactionById(transactionId);
  });

  // Update transaction by ID
  ipcMain.handle(
    "update-transaction",
    async (event, transactionId, updates) => {
      return await transactionController.updateTransaction(
        transactionId,
        updates
      );
    }
  );

  // Delete transaction by ID
  ipcMain.handle("delete-transaction", async (event, transactionId) => {
    return await transactionController.deleteTransaction(transactionId);
  });

  // Create a new transaction detail
  ipcMain.handle(
    "create-transaction-detail",
    async (event, transactionDetail) => {
      return await transactionController.createTransactionDetail(
        transactionDetail
      );
    }
  );

  // Get all transaction details
  ipcMain.handle("get-all-transaction-details", async (event, page, limit) => {
    return await transactionController.getAllTransactionDetails(page, limit);
  });

  // Get transaction details by transaction ID
  ipcMain.handle(
    "get-transaction-details-by-transaction-id",
    async (event, transactionId) => {
      return await transactionController.getTransactionDetailsByTransactionId(
        transactionId
      );
    }
  );

  // Update transaction detail by ID
  ipcMain.handle(
    "update-transaction-detail",
    async (event, transactionDetailId, updates) => {
      return await transactionController.updateTransactionDetail(
        transactionDetailId,
        updates
      );
    }
  );

  // Delete transaction detail by ID
  ipcMain.handle(
    "delete-transaction-detail",
    async (event, transactionDetailId) => {
      return await transactionController.deleteTransactionDetail(
        transactionDetailId
      );
    }
  );
}

module.exports = { setupTransactionsIPC };
