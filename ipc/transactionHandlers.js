// Import the TransactionsModel
const TransactionsModel = require("../database/models/transactionsModel");

// Create an instance of TransactionsModel
const transactionsModel = new TransactionsModel();

// Function to get all transactions
exports.getAllTransactions = async () => {
  try {
    return await transactionsModel.listTransactions();
  } catch (error) {
    console.error("Error getting all transactions:", error);
    throw error;
  }
};

// Function to get a transaction by its ID
exports.getTransactionById = async (event, transactionId) => {
  try {
    return await transactionsModel.getById(transactionId);
  } catch (error) {
    console.error(`Error getting transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to create a new transaction
exports.createTransaction = async (event, transactionData) => {
  try {
    return await transactionsModel.create(transactionData);
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

// Function to update a transaction by its ID
exports.updateTransaction = async (event, transactionId, updateData) => {
  try {
    return await transactionsModel.update(transactionId, updateData);
  } catch (error) {
    console.error(`Error updating transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to delete a transaction by its ID
exports.deleteTransaction = async (event, transactionId) => {
  try {
    return await transactionsModel.delete(transactionId);
  } catch (error) {
    console.error(`Error deleting transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to get transactions by date range
exports.getTransactionsByDateRange = async (
  event,
  startDate,
  endDate,
  transactionType
) => {
  try {
    return await transactionsModel.getTransactionsByDateRange(
      startDate,
      endDate,
      transactionType
    );
  } catch (error) {
    console.error(
      `Error getting transactions between ${startDate} and ${endDate}:`,
      error
    );
    throw error;
  }
};

// Function to get total amount by transaction type
exports.getTotalAmountByType = async (
  event,
  transactionType,
  startDate,
  endDate
) => {
  try {
    return await transactionsModel.getTotalAmountByType(
      transactionType,
      startDate,
      endDate
    );
  } catch (error) {
    console.error(`Error getting total amount for ${transactionType}:`, error);
    throw error;
  }
};

// Function to mark a transaction as settled
exports.settleTransaction = async (event, transactionId) => {
  try {
    return await transactionsModel.settleTransaction(transactionId);
  } catch (error) {
    console.error(`Error settling transaction ${transactionId}:`, error);
    throw error;
  }
};

// Function to get all unsettled transactions (optionally filtered by partyId)
exports.getUnsettledTransactions = async (event, partyId = null) => {
  try {
    return await transactionsModel.getUnsettledTransactions(partyId);
  } catch (error) {
    console.error("Error getting unsettled transactions:", error);
    throw error;
  }
};
