const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class ProductModel {
  constructor(dbPath = "inventory.db") {
    this.dbPath = path.join(process.env.APPDATA || process.env.HOME, dbPath);
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
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
        product_name TEXT NOT NULL,
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

  async addProduct(
    productName,
    productUnit,
    stockQuantity,
    unitPrice,
    taxRate
  ) {
    const sql = `
      INSERT INTO products (product_name, product_unit, stock_quantity, unit_price, tax_rate)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await this.runQuery(sql, [
      productName,
      productUnit,
      stockQuantity,
      unitPrice,
      taxRate,
    ]);
    return result.lastID;
  }

  async getProduct(productId) {
    const sql = "SELECT * FROM products WHERE id = ?";
    return this.getQuery(sql, [productId]);
  }

  async updateProduct(productId, updates) {
    const allowedFields = [
      "product_name",
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
    const sql = "SELECT * FROM products";
    return this.allQuery(sql);
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

module.exports = ProductModel;