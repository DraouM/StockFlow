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

  async fetchSingleProduct(id) {
    // Validate input
    if (!id) {
      throw new ProductError("INVALID_INPUT", "Product ID is required");
    }

    const query = `
        SELECT * FROM products 
        WHERE id = ?
    `;

    try {
      const product = await this.fetchSingle(query, [id]);

      if (!product) {
        throw new ProductError("NOT_FOUND", `Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      // If it's already a ProductError, rethrow it
      if (error instanceof ProductError) {
        throw error;
      }

      // For any other database errors
      console.error("Fetch product error:", error);
      throw new ProductError("DATABASE_ERROR", "Failed to fetch product");
    }
  }

  async updateProduct(updateData) {
    const id = updateData.id;
    // Validate input
    console.log("XXX ", id);

    if (!id) {
      throw new ProductError(
        "INVALID_INPUT",
        "Product ID is required for updating"
      );
    }

    // Allowed fields for update
    const allowedFields = [
      "name",
      "total_stock",
      "subunit_in_unit",
      "buying_price",
      "selling_price",
      "average_price",
      "tax_rate",
      "reorder_level",
      "status",
    ];

    // Filter out any fields not allowed to be updated
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    // If no valid fields to update
    if (Object.keys(filteredData).length === 0) {
      throw new ProductError(
        "INVALID_INPUT",
        "No valid fields provided for update"
      );
    }

    // Validate data types and constraints
    this.validateUpdateData(filteredData);

    // Construct dynamic update query
    const updateFields = Object.keys(filteredData)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = [...Object.values(filteredData), id];

    const query = `
      UPDATE products 
      SET ${updateFields}
      WHERE id = ?
  `;

    try {
      const result = await this.runQuery(query, values);

      if (result.changes === 0) {
        throw new ProductError("NOT_FOUND", `No product found with ID ${id}`);
      }

      return {
        success: true,
        message: "Product updated successfully",
        updatedFields: Object.keys(filteredData),
      };
    } catch (error) {
      // Handle SQLite unique constraint violation
      if (error.message.includes("UNIQUE constraint")) {
        throw new ProductError("DUPLICATE_NAME", "Product name already exists");
      }

      // If it's already a ProductError, rethrow it
      if (error instanceof ProductError) {
        throw error;
      }

      // For any other database errors
      console.error("Update product error:", error);
      throw new ProductError("DATABASE_ERROR", "Failed to update product");
    }
  }
  // Helper method to validate update data
  validateUpdateData(data) {
    if (data.subunit_in_unit && data.subunit_in_unit < 1) {
      throw new ProductError(
        "INVALID_INPUT",
        "Subunit in unit must be 1 or more"
      );
    }

    if (data.buying_price && data.buying_price < 0) {
      throw new ProductError(
        "INVALID_INPUT",
        "Buying price cannot be negative"
      );
    }

    if (data.selling_price && data.selling_price < 0) {
      throw new ProductError(
        "INVALID_INPUT",
        "Selling price cannot be negative"
      );
    }

    if (data.average_price && data.average_price < 0) {
      throw new ProductError(
        "INVALID_INPUT",
        "Average price cannot be negative"
      );
    }

    if (data.tax_rate && (data.tax_rate < 0 || data.tax_rate > 100)) {
      throw new ProductError(
        "INVALID_INPUT",
        "Tax rate must be between 0 and 100"
      );
    }

    if (data.reorder_level && data.reorder_level < 0) {
      throw new ProductError(
        "INVALID_INPUT",
        "Reorder level cannot be negative"
      );
    }

    if (
      data.status &&
      !["available", "out_of_stock", "inactive"].includes(data.status)
    ) {
      throw new ProductError("INVALID_INPUT", "Invalid product status");
    }
  }

  // async deleteProduct(productId) {
  //   const sql = "DELETE FROM products WHERE id = ?";
  //   return this.runQuery(sql, [productId]);
  // }

  // Method to fetch products by search term
  async searchProducts(searchTerm) {
    // Validate search term
    if (!searchTerm || typeof searchTerm !== "string") {
      throw new ProductError(
        "INVALID_INPUT",
        "Search term must be a non-empty string"
      );
    }

    const sql = `SELECT * FROM products WHERE name LIKE ?`;
    const params = [`%${searchTerm}%`];

    try {
      return await this.fetchQuery(sql, params);
    } catch (error) {
      throw new ProductError(
        "DATABASE_ERROR",
        `Failed to search products: ${error.message}`
      );
    }
  }

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
