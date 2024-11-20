const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { dbPath } = require("../config/dbConfig");

const { closeConnection, openConnection } = require("../config/connection");

// models/Product.js
class ProductError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

class ProductModel {
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

  // Helper methods
  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async fetchSingle(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async fetchQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async createProduct({ name, subunit_in_unit = 1, tax_rate = 0 }) {
    try {
      const query = `INSERT INTO products (name, subunit_in_unit, tax_rate) VALUES (?, ?, ?)`;
      return await this.runQuery(query, [name, subunit_in_unit, tax_rate]);
    } catch (error) {
      if (error.message.includes("UNIQUE constraint")) {
        throw new ProductError("DUPLICATE_NAME", "Product name already exists");
      }
      if (error.message.includes("CHECK constraint")) {
        throw new ProductError("INVALID_DATA", "Invalid input values");
      }
      throw new ProductError("DATABASE_ERROR", "Failed to create product");
    }
  }

  async listProducts(options = {}) {
    const {
      limit = 50,
      offset = 0,
      sortBy = "name",
      sortOrder = "ASC",
    } = options;

    const query = `SELECT * FROM products ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;

    try {
      return await this.fetchQuery(query, [limit, offset]);
    } catch (error) {
      console.error("Database Error:", error); // Add this for debugging
      throw new ProductError(`Failed to retrieve products: ${error.message}`);
    }
  }

  // async getProductById(productId) {
  //   const sql = "SELECT * FROM products WHERE id = ?";
  //   return this.getQuery(sql, [productId]);
  // }

  // async updateProduct(productId, updates) {
  //   const allowedFields = [
  //     "name",
  //     "product_unit",
  //     "stock_quantity",
  //     "unit_price",
  //     "tax_rate",
  //   ];
  //   const updateFields = [];
  //   const values = [];

  //   for (const [key, value] of Object.entries(updates)) {
  //     if (allowedFields.includes(key)) {
  //       updateFields.push(`${key} = ?`);
  //       values.push(value);
  //     }
  //   }

  //   if (updateFields.length === 0) return;

  //   values.push(new Date().toISOString());
  //   values.push(productId);

  //   const sql = `
  //     UPDATE products
  //     SET ${updateFields.join(", ")}, updated_at = ?
  //     WHERE id = ?
  //   `;

  //   return this.runQuery(sql, values);
  // }

  // async deleteProduct(productId) {
  //   const sql = "DELETE FROM products WHERE id = ?";
  //   return this.runQuery(sql, [productId]);
  // }

  // // Method to fetch products by search term
  // async searchProducts(searchTerm) {
  //   const sql = `SELECT * FROM products WHERE name LIKE ?`;
  //   console.log("AAA ", searchTerm);

  //   const params = [`%${searchTerm}%`];
  //   return this.allQuery(sql, params); // Use the helper method
  // }

  // getProductValue(productId) {
  //   return new Promise((resolve, reject) => {
  //     const sql =
  //       "SELECT stock_quantity * unit_price AS product_value FROM products WHERE id = ?";
  //     this.db.get(sql, [productId], (err, row) => {
  //       if (err) reject(err);
  //       else resolve(row ? row.product_value : null);
  //     });
  //   });
  // }

  // getTotalWithTax(productId) {
  //   return new Promise((resolve, reject) => {
  //     const sql =
  //       "SELECT stock_quantity * unit_price * (1 + tax_rate) AS total_with_tax FROM products WHERE id = ?";
  //     this.db.get(sql, [productId], (err, row) => {
  //       if (err) reject(err);
  //       else resolve(row ? row.total_with_tax : null);
  //     });
  //   });
  // }

  // getStockUnits(productId) {
  //   return new Promise((resolve, reject) => {
  //     const sql =
  //       "SELECT CAST(stock_quantity AS FLOAT) / product_unit AS stock_units FROM products WHERE id = ?";
  //     this.db.get(sql, [productId], (err, row) => {
  //       if (err) reject(err);
  //       else resolve(row ? row.stock_units : null);
  //     });
  //   });
  // }
  // // Static utility methods
  // static calculateProductValue(stockQuantity, unitPrice) {
  //   return stockQuantity * unitPrice;
  // }

  // static calculateTotalWithTax(stockQuantity, unitPrice, taxRate) {
  //   return stockQuantity * unitPrice * (1 + taxRate);
  // }

  // static calculateStockUnits(stockQuantity, productUnit) {
  //   return stockQuantity / productUnit;
  // }

  // Close database connection
  closeConnection() {
    try {
      if (this.isConnected) {
        closeConnection();
        this.isConnected = false;
        console.log("Database connection closed.");
      }
    } catch (error) {
      console.error("Error closing database connection:", error.message);
      throw error;
    }
  }
}

// When your application is shutting down:
// closeConnection();

module.exports = ProductModel;
