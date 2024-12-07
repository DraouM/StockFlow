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

const transactionDB = new TransactionsModel();

class TransactionController {
  // Get all transactions
  async getTransactions() {
    try {
      const transactions = await transactionDB.getTransactions();
      return transactions;
    } catch (error) {
      console.error("Error getting transactions:", error);
      return { error: "Failed to get transactions." };
    }
  }

  // Get a transaction by ID
  async getTransactionById(req, res) {
    const transactionId = req.params.transactionId;
    try {
      const transaction = await transactionDB.getTransactionById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found." });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transaction." });
    }
  }

  // Create a new transaction
  async createTransaction(req, res) {
    const { partyId, transactionType, totalAmount, discount, status } =
      req.body;
    try {
      const newTransactionId = await transactionDB.createTransaction(
        partyId,
        transactionType,
        totalAmount,
        discount,
        status
      );
      res.status(201).json({
        message: "Transaction created successfully.",
        id: newTransactionId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction." });
    }
  }

  // Update a transaction
  async updateTransaction(req, res) {
    const transactionId = req.params.transactionId;
    const { partyId, transactionType, totalAmount, discount, status } =
      req.body;
    try {
      await transactionDB.updateTransaction(
        transactionId,
        partyId,
        transactionType,
        totalAmount,
        discount,
        status
      );
      res.json({ message: "Transaction updated successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction." });
    }
  }

  // Delete a transaction
  async deleteTransaction(req, res) {
    const transactionId = req.params.transactionId;
    try {
      await transactionDB.deleteTransaction(transactionId);
      res.json({ message: "Transaction deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction." });
    }
  }

  // Get all transaction details for a specific transaction
  async getTransactionDetails(req, res) {
    const transactionId = req.params.transactionId;
    try {
      const details = await transactionDB.getTransactionDetails(transactionId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transaction details." });
    }
  }

  // Create a new transaction detail
  async createTransactionDetail(req, res) {
    const transactionId = req.params.transactionId;
    const { productId, quantitySelected, pricePerUnit, taxRate } = req.body;
    try {
      const newDetailId = await transactionDB.createTransactionDetail(
        transactionId,
        productId,
        quantitySelected,
        pricePerUnit,
        taxRate
      );
      res.status(201).json({
        message: "Transaction detail created successfully.",
        id: newDetailId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction detail." });
    }
  }

  // Update a transaction detail
  async updateTransactionDetail(req, res) {
    const detailId = req.params.detailId;
    const {
      transactionId,
      productId,
      quantitySelected,
      pricePerUnit,
      taxRate,
    } = req.body;
    try {
      await transactionDB.updateTransactionDetail(
        detailId,
        transactionId,
        productId,
        quantitySelected,
        pricePerUnit,
        taxRate
      );
      res.json({ message: "Transaction detail updated successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction detail." });
    }
  }

  // Delete a transaction detail
  async deleteTransactionDetail(req, res) {
    const detailId = req.params.detailId;
    try {
      await transactionDB.deleteTransactionDetail(detailId);
      res.json({ message: "Transaction detail deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction detail." });
    }
  }
}

module.exports = TransactionController;
