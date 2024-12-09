const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { dbPath } = require("../config/dbConfig");

const { closeConnection, openConnection } = require("../config/connection");

class TransactionsModel {
  //   constructor() {
  //     this.db = openConnection();
  //   }

  //   // Helper methods
  //   async runQuery(sql, params = []) {
  //     return new Promise((resolve, reject) => {
  //       this.db.run(sql, params, function (err) {
  //         if (err) reject(err);
  //         else resolve(this);
  //       });
  //     });
  //   }

  //   async getQuery(sql, params = []) {
  //     return new Promise((resolve, reject) => {
  //       this.db.get(sql, params, (err, row) => {
  //         if (err) reject(err);
  //         else resolve(row);
  //       });
  //     });
  //   }

  //   async allQuery(sql, params = []) {
  //     return new Promise((resolve, reject) => {
  //       this.db.all(sql, params, (err, rows) => {
  //         if (err) reject(err);
  //         else resolve(rows);
  //       });
  //     });
  //   }

  //   async create(transaction) {
  //     const {
  //       party_id,
  //       total_amount,
  //       discount = 0,
  //       transaction_date,
  //       transaction_type,
  //       settled = 1,
  //       notes = "",
  //     } = transaction;

  //     console.log("Received transaction data:", transaction);

  //     // Improved validation
  //     const missingFields = [];
  //     if (party_id === undefined) missingFields.push("party_id");
  //     if (total_amount === undefined) missingFields.push("total_amount");
  //     if (!transaction_type) missingFields.push("transaction_type");
  //     if (!transaction_date) missingFields.push("transaction_date");

  //     if (missingFields.length > 0) {
  //       throw new Error(
  //         `Missing required fields in transaction data: ${missingFields.join(
  //           ", "
  //         )}`
  //       );
  //     }

  //     // Type checking
  //     if (typeof party_id !== "number")
  //       throw new Error("party_id must be a number");
  //     if (typeof total_amount !== "number")
  //       throw new Error("total_amount must be a number");
  //     if (typeof transaction_type !== "string")
  //       throw new Error("transaction_type must be a string");
  //     if (
  //       !(transaction_date instanceof Date) &&
  //       isNaN(Date.parse(transaction_date))
  //     ) {
  //       throw new Error(
  //         "transaction_date must be a valid date string or Date object"
  //       );
  //     }

  //     const sql = `
  //       INSERT INTO transactions (party_id, total_amount, discount, transaction_date, transaction_type, settled, notes)
  //       VALUES (?, ?, ?, ?, ?, ?, ?)
  //     `;

  //     try {
  //       const result = await this.runQuery(sql, [
  //         party_id,
  //         total_amount,
  //         discount,
  //         transaction_date,
  //         transaction_type,
  //         settled,
  //         notes,
  //       ]);
  //       console.log("Transaction created successfully. ID:", result.lastID);
  //       return result.lastID;
  //     } catch (error) {
  //       console.error("Error executing SQL query:", error);
  //       throw new Error(`Failed to create transaction: ${error.message}`);
  //     }
  //   }

  //   // Get a transaction by ID
  //   async getById(transaction_id) {
  //     const sql = `
  //       SELECT * FROM Transactions WHERE transaction_id = ?;
  //     `;
  //     const params = [transaction_id];

  //     try {
  //       const transaction = await this.getQuery(sql, params);
  //       console.log("hello from transactions model", transaction);

  //       return transaction;
  //     } catch (error) {
  //       console.error("Failed to get transaction:", error);
  //       throw error;
  //     }
  //   }

  //   // Get a transaction by Party
  //   async getAllByPartyId(party_id) {
  //     const sql = `
  //       SELECT * FROM Transactions WHERE party_id = ? ORDER BY transaction_date DESC;
  //     `;
  //     const params = [party_id];

  //     try {
  //       const transactions = await this.allQuery(sql, params);
  //       return transactions;
  //     } catch (error) {
  //       console.error("Failed to get transactions:", error);
  //       throw error;
  //     }
  //   }

  //   async listTransactions() {
  //     const sql = "SELECT * FROM Transactions ORDER BY transaction_date DESC";
  //     try {
  //       const transactions = await this.allQuery(sql);
  //       return transactions;
  //     } catch (error) {
  //       console.error("Failed to get transactions:", error);
  //       throw error;
  //     }
  //   }

  //   // Update a transaction
  //   async update(transactionId, updateData) {
  //     console.log("Updating transaction in model:", transactionId, updateData);

  //     const {
  //       total_amount,
  //       discount,
  //       transaction_date,
  //       transaction_type,
  //       notes,
  //       settled,
  //     } = updateData;

  //     const sql = `
  //       UPDATE transactions
  //       SET total_amount = ?, discount = ?, transaction_date = ?, transaction_type = ?, notes = ?, settled = ?
  //       WHERE transaction_id = ?
  //     `;

  //     const result = await this.runQuery(sql, [
  //       total_amount,
  //       discount,
  //       transaction_date,
  //       transaction_type,
  //       notes,
  //       settled,
  //       transactionId,
  //     ]);

  //     return result;
  //   }

  //   // Delete a transaction
  //   async delete(transactionId) {
  //     const sql = "DELETE FROM Transactions WHERE transaction_id = ?";
  //     try {
  //       const result = await this.runQuery(sql, [transactionId]);
  //       return result.changes > 0;
  //     } catch (error) {
  //       console.error("Failed to delete transaction:", error);
  //       throw error;
  //     }
  //   }

  //   // Get transactions by date range
  //   async getTransactionsByDateRange(startDate, endDate, transactionType = null) {
  //     let sql =
  //       "SELECT * FROM Transactions WHERE transaction_date BETWEEN ? AND ?";
  //     const params = [startDate, endDate];

  //     if (transactionType) {
  //       sql += " AND transaction_type = ?";
  //       params.push(transactionType);
  //     }

  //     sql += " ORDER BY transaction_date DESC";
  //     try {
  //       return await this.allQuery(sql, params);
  //     } catch (error) {
  //       console.error("Failed to get transactions by date range:", error);
  //       throw error;
  //     }
  //   }

  //   // Get total amount by transaction type
  //   async getTotalAmountByType(
  //     transactionType,
  //     startDate = null,
  //     endDate = null
  //   ) {
  //     let sql =
  //       "SELECT SUM(total_amount - discount) as total FROM Transactions WHERE transaction_type = ?";
  //     const params = [transactionType];

  //     if (startDate && endDate) {
  //       sql += " AND transaction_date BETWEEN ? AND ?";
  //       params.push(startDate, endDate);
  //     }

  //     try {
  //       const result = await this.getQuery(sql, params);
  //       return result.total || 0;
  //     } catch (error) {
  //       console.error("Failed to get total amount by type:", error);
  //       throw error;
  //     }
  //   }

  //   // Settle a transaction
  //   async settleTransaction(transactionId) {
  //     const sql = "UPDATE Transactions SET settled = 1 WHERE transaction_id = ?";
  //     try {
  //       const result = await this.runQuery(sql, [transactionId]);
  //       return result.changes > 0;
  //     } catch (error) {
  //       console.error("Failed to settle transaction:", error);
  //       throw error;
  //     }
  //   }

  //   // Get unsettled transactions
  //   async getUnsettledTransactions(partyId = null) {
  //     let sql = "SELECT * FROM Transactions WHERE settled = 0";
  //     const params = [];

  //     if (partyId) {
  //       sql += " AND party_id = ?";
  //       params.push(partyId);
  //     }

  //     sql += " ORDER BY transaction_date ASC";
  //     try {
  //       return await this.allQuery(sql, params);
  //     } catch (error) {
  //       console.error("Failed to get unsettled transactions:", error);
  //       throw error;
  //     }
  //   }
  // }
  constructor() {
    this.db = openConnection();
    console.log("Database connection initialized:", this.db);
  }

  // Generic query executor with better error handling
  async runQuery(query, params = [], successMessage, errorMessage) {
    try {
      return new Promise((resolve, reject) => {
        this.db.run(query, params, function (err) {
          if (err) {
            console.error(`${errorMessage}:`, err.message);
            reject(err);
          } else {
            console.log(successMessage);
            resolve({ id: this.lastID, changes: this.changes });
          }
        });
      });
    } catch (error) {
      console.error(`Database error in runQuery: ${error.message}`);
      throw error;
    }
  }

  // Generic fetch query with better error handling
  async fetchQuery(query, params = [], errorMessage) {
    try {
      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) {
            console.error(`${errorMessage}:`, err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error(`Database error in fetchQuery: ${error.message}`);
      throw error;
    }
  }

  // Get all transactions with optional pagination
  async getAllTransactions(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM transactions 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.fetchQuery(
      query,
      [limit, offset],
      "Error fetching transactions"
    );
  }

  // Get a transaction by ID
  async getTransactionById(transactionId) {
    const query = `SELECT * FROM transactions WHERE transaction_id = ?`;
    const transaction = await this.fetchSingle(
      query,
      [transactionId],
      "Error fetching transaction by ID"
    );

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    return transaction;
  }

  async createTransaction(transactionData) {
    console.log("From transactionsModel.js ", transactionData);

    const { party_id, transaction_type, discount } = transactionData;
    const sql = `
      INSERT INTO transactions (party_id, transaction_type, discount)
      VALUES (?, ?, ?)
    `;
    // Execute the SQL query and return the transaction ID
    try {
      const result = await this.runQuery(sql, [
        party_id,
        transaction_type,
        discount,
      ]);
      console.log({ result });
      return result.id; // Return the ID of the newly created transaction
    } catch (error) {
      console.error("Error executing SQL query:", error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Update transaction by ID with validation
  async updateTransaction(transactionId, updates) {
    const updateFields = [];
    const params = [];

    if (updates.party_id) {
      updateFields.push("party_id = ?");
      params.push(updates.party_id);
    }
    if (updates.transaction_type) {
      updateFields.push("transaction_type = ?");
      params.push(updates.transaction_type);
    }
    if (updates.total_amount !== undefined) {
      updateFields.push("total_amount = ?");
      params.push(updates.total_amount);
    }
    if (updates.discount !== undefined) {
      updateFields.push("discount = ?");
      params.push(updates.discount);
    }
    if (updates.status) {
      updateFields.push("status = ?");
      params.push(updates.status);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields provided for update");
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(transactionId);

    const query = `
    UPDATE transactions
    SET ${updateFields.join(", ")}
    WHERE transaction_id = ?
  `;

    const result = await this.runQuery(
      query,
      params,
      "Transaction updated successfully",
      "Error updating transaction"
    );

    if (result.changes === 0) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    return result;
  }

  // Delete transaction by ID with validation
  async deleteTransaction(transactionId) {
    const query = `DELETE FROM transactions WHERE transaction_id = ?`;
    const result = await this.runQuery(
      query,
      [transactionId],
      "Transaction deleted successfully",
      "Error deleting transaction"
    );

    if (result.changes === 0) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    return result;
  }

  /** Transaction Details */
  // Get all transaction details for a specific transaction
  async createTransactionDetail(transactionDetail) {
    const query = `
      INSERT INTO transaction_details (
        transaction_id, product_id, quantity_selected, price_per_unit
      ) VALUES (?, ?, ?, ?)
    `;
    const params = [
      transactionDetail.transactionId,
      transactionDetail.product_id,
      transactionDetail.quantity_selected,
      transactionDetail.unit_price,
    ];

    return this.runQuery(
      query,
      params,
      `New transaction detail created for transaction ID: ${transactionDetail.transaction_id}`,
      "Error creating new transaction detail"
    );
  }

  // Get all transaction details with optional pagination
  async getAllTransactionDetails(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM transaction_details 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.fetchQuery(
      query,
      [limit, offset],
      "Error fetching transaction details"
    );
  }

  // Get transaction details by transaction ID with error handling
  async getByTransactionId(transactionId) {
    const query = `SELECT * FROM transaction_details WHERE transaction_id = ?`;
    const transactionDetails = await this.fetchQuery(
      query,
      [transactionId],
      "Error fetching transaction details by transaction ID"
    );

    if (!transactionDetails || transactionDetails.length === 0) {
      throw new Error(
        `Transaction details for transaction ID ${transactionId} not found`
      );
    }

    return transactionDetails;
  }

  // Update transaction detail by ID with validation
  async updateTransactionDetail(transactionDetailId, updates) {
    const updateFields = [];
    const params = [];

    if (updates.product_id) {
      updateFields.push("product_id = ?");
      params.push(updates.product_id);
    }
    if (updates.quantity !== undefined) {
      updateFields.push("quantity = ?");
      params.push(updates.quantity);
    }
    if (updates.unit_price !== undefined) {
      updateFields.push("unit_price = ?");
      params.push(updates.unit_price);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields provided for update");
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(transactionDetailId);

    const query = `
      UPDATE transaction_details
      SET ${updateFields.join(", ")}
      WHERE transaction_detail_id = ?
    `;

    const result = await this.runQuery(
      query,
      params,
      "Transaction detail updated successfully",
      "Error updating transaction detail"
    );

    if (result.changes === 0) {
      throw new Error(
        `Transaction detail with ID ${transactionDetailId} not found`
      );
    }

    return result;
  }

  // Delete transaction detail by ID with validation
  async deleteTransactionDetail(transactionDetailId) {
    const query = `DELETE FROM transaction_details WHERE transaction_detail_id = ?`;
    const result = await this.runQuery(
      query,
      [transactionDetailId],
      "Transaction detail deleted successfully",
      "Error deleting transaction detail"
    );

    if (result.changes === 0) {
      throw new Error(
        `Transaction detail with ID ${transactionDetailId} not found`
      );
    }

    return result;
  }

  // Close the database connection
  close() {
    console.log("DB closing !");

    closeConnection(this.db);
  }
}

// module.exports = TransactionDB;

// // When your application is shutting down:
// closeConnection();

module.exports = TransactionsModel;
