// // Import the TransactionsModel
// const TransactionsModel = require("../database/models/transactionsModel");

// // Create an instance of TransactionsModel
// const transactionsModel = new TransactionsModel();

// // Function to get all transactions
// exports.getAllTransactions = async () => {
//   try {
//     return await transactionsModel.listTransactions();
//   } catch (error) {
//     console.error("Error getting all transactions:", error);
//     throw error;
//   }
// };

// // Function to get a transaction by its ID
// exports.getTransactionById = async (event, transactionId) => {
//   try {
//     const result = await transactionsModel.getById(transactionId);
//     console.log("hello from transactions handlers", result);

//     return result;
//   } catch (error) {
//     console.error(`Error getting transaction ${transactionId}:`, error);
//     throw error;
//   }
// };

// // Function to create a new transaction
// exports.createTransaction = async (transactionData) => {
//   console.log("Transaction data received in handler:", transactionData); // Log the data in the handler

//   try {
//     return await transactionsModel.create(transactionData);
//   } catch (error) {
//     console.error("Error creating transaction:", error);
//     throw error;
//   }
// };

// // Function to update a transaction by its ID
// exports.updateTransaction = async (event, transactionId, updateData) => {
//   try {
//     console.log("Transaction ID:", transactionId); // Should be a valid ID
//     console.log("Update Data:", updateData); // Should contain the update data object
//     return await transactionsModel.update(transactionId, updateData);
//   } catch (error) {
//     console.error(`Error updating transaction ${transactionId}:`, error);
//     throw error;
//   }
// };

// // Function to delete a transaction by its ID
// exports.deleteTransaction = async (event, transactionId) => {
//   try {
//     return await transactionsModel.delete(transactionId);
//   } catch (error) {
//     console.error(`Error deleting transaction ${transactionId}:`, error);
//     throw error;
//   }
// };

// // Function to get transactions by date range
// exports.getTransactionsByDateRange = async (
//   event,
//   startDate,
//   endDate,
//   transactionType
// ) => {
//   try {
//     return await transactionsModel.getTransactionsByDateRange(
//       startDate,
//       endDate,
//       transactionType
//     );
//   } catch (error) {
//     console.error(
//       `Error getting transactions between ${startDate} and ${endDate}:`,
//       error
//     );
//     throw error;
//   }
// };

// // Function to get total amount by transaction type
// exports.getTotalAmountByType = async (
//   event,
//   transactionType,
//   startDate,
//   endDate
// ) => {
//   try {
//     return await transactionsModel.getTotalAmountByType(
//       transactionType,
//       startDate,
//       endDate
//     );
//   } catch (error) {
//     console.error(`Error getting total amount for ${transactionType}:`, error);
//     throw error;
//   }
// };

// // Function to mark a transaction as settled
// exports.settleTransaction = async (event, transactionId) => {
//   try {
//     return await transactionsModel.settleTransaction(transactionId);
//   } catch (error) {
//     console.error(`Error settling transaction ${transactionId}:`, error);
//     throw error;
//   }
// };

// // Function to get all unsettled transactions (optionally filtered by partyId)
// exports.getUnsettledTransactions = async (event, partyId = null) => {
//   try {
//     return await transactionsModel.getUnsettledTransactions(partyId);
//   } catch (error) {
//     console.error("Error getting unsettled transactions:", error);
//     throw error;
//   }
// };

const TransactionsModel = require("../database/models/transactionsModel");

const transactionModel = new TransactionsModel();

class TransactionController {
  // Create a new transaction
  async createTransaction(transaction) {
    try {
      const result = await this.transactionModel.createTransaction(transaction);
      return {
        success: true,
        message: "Transaction created successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all transactions with optional pagination
  async getAllTransactions(page = 1, limit = 50) {
    try {
      const transactions = await this.transactionModel.getAllTransactions(
        page,
        limit
      );
      return { success: true, transactions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const transaction = await this.transactionModel.getById(transactionId);
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update transaction by ID
  async updateTransaction(transactionId, updates) {
    try {
      const result = await this.transactionModel.updateTransaction(
        transactionId,
        updates
      );
      return {
        success: true,
        message: "Transaction updated successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete transaction by ID
  async deleteTransaction(transactionId) {
    try {
      const result = await this.transactionModel.deleteTransaction(
        transactionId
      );
      return {
        success: true,
        message: "Transaction deleted successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /** Transaction Details */
  // Create a new transaction detail
  async createTransactionDetail(transactionDetail) {
    try {
      const result = await this.transactionDetailsModel.createTransactionDetail(
        transactionDetail
      );
      return {
        success: true,
        message: "Transaction detail created successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all transaction details with optional pagination
  async getAllTransactionDetails(page = 1, limit = 50) {
    try {
      const transactionDetails =
        await this.transactionDetailsModel.getAllTransactionDetails(
          page,
          limit
        );
      return { success: true, transactionDetails };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get transaction details by transaction ID
  async getTransactionDetailsByTransactionId(transactionId) {
    try {
      const transactionDetails =
        await this.transactionDetailsModel.getByTransactionId(transactionId);
      return { success: true, transactionDetails };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update transaction detail by ID
  async updateTransactionDetail(transactionDetailId, updates) {
    try {
      const result = await this.transactionDetailsModel.updateTransactionDetail(
        transactionDetailId,
        updates
      );
      return {
        success: true,
        message: "Transaction detail updated successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete transaction detail by ID
  async deleteTransactionDetail(transactionDetailId) {
    try {
      const result = await this.transactionDetailsModel.deleteTransactionDetail(
        transactionDetailId
      );
      return {
        success: true,
        message: "Transaction detail deleted successfully",
        result,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = TransactionController;
