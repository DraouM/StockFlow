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
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS Transactions (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        party_id INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
        discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
        transaction_date TEXT NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buying', 'selling')),
        settled BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (party_id) REFERENCES Parties(party_id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    const triggerQuery = `
      CREATE TRIGGER IF NOT EXISTS update_transaction_timestamp
      AFTER UPDATE ON Transactions
      FOR EACH ROW
      BEGIN
        UPDATE Transactions SET updated_at = CURRENT_TIMESTAMP WHERE transaction_id = OLD.transaction_id;
      END;
    `;

    const debtTriggerQuery = `
      CREATE TRIGGER IF NOT EXISTS update_party_debt_after_transaction
      AFTER INSERT ON Transactions
      BEGIN
        UPDATE Parties
        SET total_debt = total_debt + (CASE 
          WHEN NEW.transaction_type = 'selling' THEN (NEW.total_amount - NEW.discount)
          ELSE -(NEW.total_amount - NEW.discount)
        END)
        WHERE party_id = NEW.party_id;
      END;
    `;

    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_transaction_party ON Transactions(party_id);
      CREATE INDEX IF NOT EXISTS idx_transaction_date ON Transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_transaction_type ON Transactions(transaction_type);
      CREATE INDEX IF NOT EXISTS idx_transaction_type_date ON Transactions(transaction_type, transaction_date);
    `;

    try {
      await this.runQuery(
        tableQuery,
        "Transactions table created successfully.",
        "Error creating Transactions table"
      );
      await this.runQuery(
        triggerQuery,
        "Trigger for Transactions table created successfully.",
        "Error creating trigger for Transactions table"
      );
      await this.runQuery(
        debtTriggerQuery,
        "Trigger for updating party debt created successfully.",
        "Error creating trigger for updating party debt"
      );
      await this.runQuery(
        indexQuery,
        "Indexes for Transactions table created successfully.",
        "Error creating indexes for Transactions table"
      );
    } catch (error) {
      console.error("Failed to set up the transactions database:", error);
    }
  }

  closeConnection() {
    closeConnection();
  }
}

// Instantiate the PartyDB class and create the table
const transactionDB = new TransactionDB();
transactionDB.createTransactionsTable().finally(() => {
  transactionDB.closeConnection();
});
