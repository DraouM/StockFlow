const { openConnection, closeConnection } = require("../config/connection");

class ProductDatabase {
  constructor() {
    this.db = openConnection();
  }

  runQuery(query, successMessage, errorMessage) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          console.error(`${errorMessage}:`, err.message);
          reject(err);
        } else {
          console.log(successMessage);
          resolve();
        }
      });
    });
  }

  async createProductsTable() {
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        product_unit INTEGER NOT NULL DEFAULT 1,
        stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0),
        unit_price REAL NOT NULL CHECK (unit_price > 0),
        tax_rate REAL NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const triggerQuery = `
      CREATE TRIGGER IF NOT EXISTS update_products_timestamp
      AFTER UPDATE ON products
      FOR EACH ROW
      BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `;

    const viewQuery = `
      CREATE VIEW IF NOT EXISTS products_with_total AS
      SELECT 
        *,
        (stock_quantity / product_unit) AS stock_units,
        (stock_quantity * unit_price) AS product_value,
        (stock_quantity * unit_price * (1 + tax_rate)) AS total_with_tax
      FROM products;
    `;

    try {
      await this.runQuery(
        tableQuery,
        "Products table created successfully.",
        "Error creating products table"
      );
      await this.runQuery(
        triggerQuery,
        "Trigger for products table created successfully.",
        "Error creating trigger for products table"
      );
      await this.runQuery(
        viewQuery,
        "View for products total value created successfully.",
        "Error creating View for products total value"
      );
    } catch (error) {
      console.error("Failed to set up the products database:", error);
    }
  }

  closeConnection() {
    closeConnection();
  }
}

// Instantiate the ProductDatabase class and create the table
const productDB = new ProductDatabase();
productDB.createProductsTable().finally(() => {
  productDB.closeConnection();
});
