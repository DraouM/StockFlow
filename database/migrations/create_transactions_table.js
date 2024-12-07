const { openConnection, closeConnection } = require("../config/connection");

class TransactionDB {
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

  async createTransactionsTable() {
    const transactionTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions(
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL, -- To associate the transaction with a client or supplier
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')), 
        total_amount REAL NOT NULL CHECK (total_amount >= 0) DEFAULT 0, -- Total amount of the transaction before discount
        discount REAL DEFAULT 0 CHECK (discount >= 0 AND discount <= total_amount), -- Discount cannot exceed total amount
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'canceled'))  DEFAULT "pending",  -- Status of the transaction
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE
    );
    `;

    const transactionDetailsTableQuery = `
      CREATE TABLE IF NOT EXISTS transaction_details (
        transaction_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity_selected INTEGER NOT NULL CHECK (quantity_selected > 0),
        price_per_unit REAL NOT NULL CHECK (price_per_unit > 0),--(user-defined)
        tax_rate REAL NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100) DEFAULT 0, -- Tax rate as percentage (0-100)
        total_price REAL GENERATED ALWAYS AS (quantity_selected * price_per_unit * (1 + tax_rate / 100)) STORED, -- Total price including tax
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      );
      `;

    const indexQuery = `
      -- Indexes for transactions table
      CREATE INDEX IF NOT EXISTS idx_transactions_party_id ON transactions(party_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

      -- Composite index for common query patterns
      CREATE INDEX IF NOT EXISTS idx_transactions_party_type ON transactions(party_id, transaction_type);
      CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(transaction_type, status);

      -- Indexes for transaction_details table
      CREATE INDEX IF NOT EXISTS idx_transaction_details_transaction_id ON transaction_details(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_details_product_id ON transaction_details(product_id);

      -- Composite index for common join and filtering scenarios
      CREATE INDEX IF NOT EXISTS idx_transaction_details_transaction_product ON transaction_details(transaction_id, product_id);

      -- Index for price and tax-related queries
      CREATE INDEX IF NOT EXISTS idx_transaction_details_price_tax ON transaction_details(price_per_unit, tax_rate);
    `;

    /** See documentation in triggers.md for a detailed
     *  explanation of the trigger logic */

    // #01
    const tr_update_transaction_on_insert = `
      Drop TRIGGER if EXISTS tr_update_transaction_on_insert;
      CREATE TRIGGER IF NOT EXISTS tr_update_transaction_on_insert
      AFTER INSERT ON transaction_details
      FOR EACH ROW BEGIN
          -- Update the total amount for the transaction
          UPDATE transactions 
          SET 
              total_amount = (
                  SELECT SUM(total_price)
                  FROM transaction_details 
                  WHERE transaction_id = NEW.transaction_id
              ),
              updated_at = CURRENT_TIMESTAMP
          WHERE transaction_id = NEW.transaction_id;
          
          -- Update product stock based on transaction type
          UPDATE products
          SET 
              total_stock = total_stock + 
              CASE 
                  WHEN (
                      SELECT transaction_type 
                      FROM transactions 
                      WHERE transaction_id = NEW.transaction_id
                  ) = 'sell' 
                  THEN -NEW.quantity_selected
                  ELSE NEW.quantity_selected
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.product_id;

          -- Automatically update product status based on stock level
          UPDATE products
          SET 
              status = CASE 
                  WHEN total_stock > 0 THEN 'available'
                  ELSE 'out_of_stock'
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.product_id;

          --LOG the changes-- ** LATER
      END;
    `;

    // #02
    const tr_update_transaction_on_update = `
      -- Trigger for UPDATE on transaction_details
      DROP TRIGGER IF EXISTS tr_update_transaction_on_update;
      CREATE TRIGGER IF NOT EXISTS tr_update_transaction_on_update
      AFTER UPDATE ON transaction_details
      FOR EACH ROW BEGIN
          -- Update total amount for the transaction
          UPDATE transactions 
          SET 
              total_amount = (
                  SELECT SUM(total_price)
                  FROM transaction_details 
                  WHERE transaction_id = NEW.transaction_id
              ),
              updated_at = CURRENT_TIMESTAMP
          WHERE transaction_id = NEW.transaction_id;
          
          -- Update product stock based on transaction type
          UPDATE products
          SET 
              total_stock = total_stock + 
              CASE 
                  WHEN (
                      SELECT transaction_type 
                      FROM transactions 
                      WHERE transaction_id = NEW.transaction_id
                  ) = 'sell' 
                  THEN 
                      (OLD.quantity_selected - NEW.quantity_selected)
                  ELSE 
                      (NEW.quantity_selected - OLD.quantity_selected)
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.product_id;

          -- Automatically update product status based on stock level
          UPDATE products
          SET 
              status = CASE 
                  WHEN total_stock > 0 THEN 'available'
                  ELSE 'out_of_stock'
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = NEW.product_id;
      END;

    `;

    // #03
    const tr_update_transaction_on_delete = `
    -- Trigger for DELETE on transaction_details
      DROP TRIGGER IF EXISTS tr_update_transaction_on_delete;
      CREATE TRIGGER IF NOT EXISTS tr_update_transaction_on_delete
      AFTER DELETE ON transaction_details
      FOR EACH ROW BEGIN
          -- Update total amount for the transaction
          UPDATE transactions 
          SET 
              total_amount = (
                  SELECT COALESCE(SUM(total_price), 0)
                  FROM transaction_details 
                  WHERE transaction_id = OLD.transaction_id
              ),
              updated_at = CURRENT_TIMESTAMP
          WHERE transaction_id = OLD.transaction_id;
          
          -- Update product stock based on transaction type
          UPDATE products
          SET 
              total_stock = total_stock + 
              CASE 
                  WHEN (
                      SELECT transaction_type 
                      FROM transactions 
                      WHERE transaction_id = OLD.transaction_id
                  ) = 'sell' 
                  THEN OLD.quantity_selected
                  ELSE -OLD.quantity_selected
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = OLD.product_id;

          -- Automatically update product status based on stock level
          UPDATE products
          SET 
              status = CASE 
                  WHEN total_stock > 0 THEN 'available'
                  ELSE 'out_of_stock'
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = OLD.product_id;
      END;
    `;

    try {
      await this.runQuery(
        transactionTableQuery,
        "Transactions table created successfully.",
        "Error creating Transactions table"
      );
      await this.runQuery(
        transactionDetailsTableQuery,
        "Transactions Details table created successfully.",
        "Error creating Transactions Details table"
      );

      await this.runQuery(
        indexQuery,
        "Indexes for Transactions and Transaction Details tables created successfully.",
        "Error creating indexes for Transactions and Transaction Details tables"
      );

      await this.runQuery(
        tr_update_transaction_on_insert,
        "Trigger for INSERT on transaction_details created successfully.",
        "Error creating trigger for inserting on transaction_details"
      );
      await this.runQuery(
        tr_update_transaction_on_update,
        "Trigger for UPDATE on transaction_details created successfully.",
        "Error creating trigger for UPDATING on transaction_details"
      );
      await this.runQuery(
        tr_update_transaction_on_delete,
        "Trigger for DELETE on transaction_details created successfully.",
        "Error creating trigger for deleting on transaction_details"
      );
    } catch (error) {
      console.error("Failed to set up the transactions database:", error);
    }
  }

  closeConnection() {
    closeConnection();
  }
}

// Instantiate the ProductDatabase class and create the table
const transactionDB = new TransactionDB();
transactionDB.createTransactionsTable().finally(() => {
  transactionDB.closeConnection();
});
