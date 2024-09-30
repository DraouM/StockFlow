const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { dbPath } = require("../config/dbConfig");

const { closeConnection, openConnection } = require("../config/connection");

class TransactionsModel {
  constructor() {
    this.db = openConnection();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async close() {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async create(transaction) {
    const {
      party_id,
      total_amount,
      discount = 0,
      transaction_date,
      transaction_type,
      settled = 1,
      notes = "",
    } = transaction;

    console.log("Received transaction data:", transaction);

    // Improved validation
    const missingFields = [];
    if (party_id === undefined) missingFields.push("party_id");
    if (total_amount === undefined) missingFields.push("total_amount");
    if (!transaction_type) missingFields.push("transaction_type");
    if (!transaction_date) missingFields.push("transaction_date");

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields in transaction data: ${missingFields.join(
          ", "
        )}`
      );
    }

    // Type checking
    if (typeof party_id !== "number")
      throw new Error("party_id must be a number");
    if (typeof total_amount !== "number")
      throw new Error("total_amount must be a number");
    if (typeof transaction_type !== "string")
      throw new Error("transaction_type must be a string");
    if (
      !(transaction_date instanceof Date) &&
      isNaN(Date.parse(transaction_date))
    ) {
      throw new Error(
        "transaction_date must be a valid date string or Date object"
      );
    }

    const sql = `
      INSERT INTO transactions (party_id, total_amount, discount, transaction_date, transaction_type, settled, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = await this.runQuery(sql, [
        party_id,
        total_amount,
        discount,
        transaction_date,
        transaction_type,
        settled,
        notes,
      ]);
      console.log("Transaction created successfully. ID:", result.lastID);
      return result.lastID;
    } catch (error) {
      console.error("Error executing SQL query:", error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Get a transaction by ID
  async getById(transaction_id) {
    const sql = `
      SELECT * FROM Transactions WHERE transaction_id = ?;
    `;
    const params = [transaction_id];

    try {
      const transaction = await this.getQuery(sql, params);
      console.log("hello from transactions model", transaction);

      return transaction;
    } catch (error) {
      console.error("Failed to get transaction:", error);
      throw error;
    }
  }

  // Get a transaction by Party
  async getAllByPartyId(party_id) {
    const sql = `
      SELECT * FROM Transactions WHERE party_id = ? ORDER BY transaction_date DESC;
    `;
    const params = [party_id];

    try {
      const transactions = await this.allQuery(sql, params);
      return transactions;
    } catch (error) {
      console.error("Failed to get transactions:", error);
      throw error;
    }
  }

  async listTransactions() {
    const sql = "SELECT * FROM Transactions ORDER BY transaction_date DESC";
    try {
      const transactions = await this.allQuery(sql);
      return transactions;
    } catch (error) {
      console.error("Failed to get transactions:", error);
      throw error;
    }
  }

  // Update a transaction
  async update(transactionId, updateData) {
    console.log("Updating transaction in model:", transactionId, updateData);

    const {
      total_amount,
      discount,
      transaction_date,
      transaction_type,
      notes,
      settled,
    } = updateData;

    const sql = `
      UPDATE transactions
      SET total_amount = ?, discount = ?, transaction_date = ?, transaction_type = ?, notes = ?, settled = ?
      WHERE transaction_id = ?
    `;

    const result = await this.runQuery(sql, [
      total_amount,
      discount,
      transaction_date,
      transaction_type,
      notes,
      settled,
      transactionId,
    ]);

    return result;
  }

  // Delete a transaction
  async delete(transactionId) {
    const sql = "DELETE FROM Transactions WHERE transaction_id = ?";
    try {
      const result = await this.runQuery(sql, [transactionId]);
      return result.changes > 0;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate, endDate, transactionType = null) {
    let sql =
      "SELECT * FROM Transactions WHERE transaction_date BETWEEN ? AND ?";
    const params = [startDate, endDate];

    if (transactionType) {
      sql += " AND transaction_type = ?";
      params.push(transactionType);
    }

    sql += " ORDER BY transaction_date DESC";
    try {
      return await this.allQuery(sql, params);
    } catch (error) {
      console.error("Failed to get transactions by date range:", error);
      throw error;
    }
  }

  // Get total amount by transaction type
  async getTotalAmountByType(
    transactionType,
    startDate = null,
    endDate = null
  ) {
    let sql =
      "SELECT SUM(total_amount - discount) as total FROM Transactions WHERE transaction_type = ?";
    const params = [transactionType];

    if (startDate && endDate) {
      sql += " AND transaction_date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    try {
      const result = await this.getQuery(sql, params);
      return result.total || 0;
    } catch (error) {
      console.error("Failed to get total amount by type:", error);
      throw error;
    }
  }

  // Settle a transaction
  async settleTransaction(transactionId) {
    const sql = "UPDATE Transactions SET settled = 1 WHERE transaction_id = ?";
    try {
      const result = await this.runQuery(sql, [transactionId]);
      return result.changes > 0;
    } catch (error) {
      console.error("Failed to settle transaction:", error);
      throw error;
    }
  }

  // Get unsettled transactions
  async getUnsettledTransactions(partyId = null) {
    let sql = "SELECT * FROM Transactions WHERE settled = 0";
    const params = [];

    if (partyId) {
      sql += " AND party_id = ?";
      params.push(partyId);
    }

    sql += " ORDER BY transaction_date ASC";
    try {
      return await this.allQuery(sql, params);
    } catch (error) {
      console.error("Failed to get unsettled transactions:", error);
      throw error;
    }
  }

  // Helper methods
  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// // When your application is shutting down:
// closeConnection();

module.exports = TransactionsModel;
