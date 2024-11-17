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
    const dropQuery = `DROP TABLE IF EXISTS products;`;

    const tableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,                                           -- Product name must be unique
        total_stock INTEGER DEFAULT 0,                                       -- Default stock is 0 until updated
        subunit_in_unit INTEGER NOT NULL DEFAULT 1 CHECK (subunit_in_unit >= 1), -- Must be 1 or more
        buying_price REAL NOT NULL CHECK (buying_price >= 0) DEFAULT 0,      -- Allow default price of 0
        selling_price REAL NOT NULL CHECK (selling_price >= 0) DEFAULT 0,    -- Allow default price of 0
        tax_rate REAL CHECK (tax_rate >= 0 AND tax_rate <= 100) DEFAULT 0, -- Tax rate between 0 and 100
        reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0), -- Minimum stock level before reordering is required
        status TEXT NOT NULL CHECK (status IN ('available', 'out_of_stock', 'inactive')) DEFAULT 'out_of_stock', -- Default product status
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const indexQuery = `
      -- Index for product name (used frequently in searches)
      CREATE INDEX idx_products_name ON products (name);

      -- Index for product status (for filtering based on status)
      CREATE INDEX idx_products_status ON products (status);

      -- Index for total stock (to quickly find products with low or out-of-stock)
      CREATE INDEX idx_products_total_stock ON products (total_stock);

      -- Index for creation date (useful for sorting products by date added)
      CREATE INDEX idx_products_created_at ON products (created_at);
    `;

    // const triggerQuery = `
    //   CREATE TRIGGER IF NOT EXISTS update_products_timestamp
    //   AFTER UPDATE ON products
    //   FOR EACH ROW
    //   BEGIN
    //     UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    //   END;
    // `;

    // const viewQuery = `
    //   CREATE VIEW IF NOT EXISTS products_with_total AS
    //   SELECT
    //     *,
    //     (stock_quantity / product_unit) AS stock_units,
    //     (stock_quantity * unit_price) AS product_value,
    //     (stock_quantity * unit_price * (1 + tax_rate)) AS total_with_tax
    //   FROM products;
    // `;

    try {
      await this.runQuery(
        dropQuery,
        "Old parties table dropped successfully.",
        "Error dropping old parties table"
      ); // Drop old table

      await this.runQuery(
        tableQuery,
        "Products table created successfully.",
        "Error creating products table"
      );

      await this.runQuery(
        indexQuery,
        "Indexes for products table created successfully.",
        "Error creating indexes for products table"
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
