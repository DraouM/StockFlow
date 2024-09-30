const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { dbPath } = require("../config/dbConfig");

const { closeConnection, openConnection } = require("../config/connection");

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

  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        product_unit INTEGER NOT NULL DEFAULT 1,
        stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
        unit_price REAL NOT NULL CHECK (unit_price > 0),
        tax_rate REAL NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return this.runQuery(sql);
  }

  async addNewProduct(productData) {
    if (!productData) {
      throw new Error("Product data is undefined");
    }

    const { productName, subunitsInUnit, taxes } = productData;
    console.log("ccc ", productData);

    // if (!productName || !subunitsInUnit || taxRate === undefined) {
    //   throw new Error("Missing required product data");
    // }

    try {
      const sql = `
        INSERT INTO products (name, product_unit, stock_quantity, unit_price, tax_rate)
        VALUES (?, ?, ?, ?, ?)
      `;
      const result = await this.runQuery(sql, [
        productName,
        subunitsInUnit,
        0, // Initial stock quantity
        0.001, // Placeholder unit price
        taxes,
      ]);

      return result.lastID;
    } catch (error) {
      console.error("Error adding new product:", error);
      throw error;
    }
  }

  async getProduct(productId) {
    const sql = "SELECT * FROM products WHERE id = ?";
    return this.getQuery(sql, [productId]);
  }

  async updateProduct(productId, updates) {
    console.log("From The Product Model ", productId, updates);

    const allowedFields = [
      "name",
      "product_unit",
      "stock_quantity",
      "unit_price",
      "tax_rate",
    ];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return;

    values.push(new Date().toISOString());
    values.push(productId);

    const sql = `
      UPDATE products 
      SET ${updateFields.join(", ")}, updated_at = ?
      WHERE id = ?
    `;

    return this.runQuery(sql, values);
  }

  async deleteProduct(productId) {
    const sql = "DELETE FROM products WHERE id = ?";
    return this.runQuery(sql, [productId]);
  }

  async listProducts() {
    const sql = "SELECT * FROM products_with_total";
    return this.allQuery(sql);
  }

  // Method to fetch products by search term
  async searchProducts(searchTerm) {
    const sql = `SELECT * FROM products WHERE name LIKE ?`;
    console.log("AAA ", searchTerm);

    const params = [`%${searchTerm}%`];
    return this.allQuery(sql, params); // Use the helper method
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

  getProductValue(productId) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT stock_quantity * unit_price AS product_value FROM products WHERE id = ?";
      this.db.get(sql, [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.product_value : null);
      });
    });
  }

  getTotalWithTax(productId) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT stock_quantity * unit_price * (1 + tax_rate) AS total_with_tax FROM products WHERE id = ?";
      this.db.get(sql, [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total_with_tax : null);
      });
    });
  }

  getStockUnits(productId) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT CAST(stock_quantity AS FLOAT) / product_unit AS stock_units FROM products WHERE id = ?";
      this.db.get(sql, [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.stock_units : null);
      });
    });
  }
  // Static utility methods
  static calculateProductValue(stockQuantity, unitPrice) {
    return stockQuantity * unitPrice;
  }

  static calculateTotalWithTax(stockQuantity, unitPrice, taxRate) {
    return stockQuantity * unitPrice * (1 + taxRate);
  }

  static calculateStockUnits(stockQuantity, productUnit) {
    return stockQuantity / productUnit;
  }
}

// When your application is shutting down:
closeConnection();

module.exports = ProductModel;
