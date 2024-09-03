const { openConnection, closeConnection } = require("../config/connection");

class PartiesDB {
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

  async createPartiesTable() {
    const tableQuery = `
      CREATE TABLE IF NOT EXISTS Parties (
        party_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        address TEXT,
        party_type TEXT CHECK(party_type IN ('client', 'supplier')) NOT NULL,
        total_debt DECIMAL(10, 2) DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const triggerQuery = `
      CREATE TRIGGER IF NOT EXISTS update_party_timestamp
      AFTER UPDATE ON Parties
      FOR EACH ROW
      BEGIN
        UPDATE Parties SET updated_at = CURRENT_TIMESTAMP WHERE party_id = OLD.party_id;
      END;
    `;

    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_party_name ON Parties(name);
      CREATE INDEX IF NOT EXISTS idx_party_type ON Parties(party_type);
    `;

    try {
      await this.runQuery(
        tableQuery,
        "Parties table created successfully.",
        "Error creating Parties table"
      );
      await this.runQuery(
        triggerQuery,
        "Trigger for Parties table created successfully.",
        "Error creating trigger for Parties table"
      );
      await this.runQuery(
        indexQuery,
        "Indexes for Parties table created successfully.",
        "Error creating indexes for Parties table"
      );
    } catch (error) {
      console.error("Failed to set up the parties database:", error);
    }
  }

  closeConnection() {
    closeConnection();
  }
}

// Instantiate the PartyDB class and create the table
const partiesDB = new PartiesDB();
partiesDB.createPartiesTable().finally(() => {
  partiesDB.closeConnection();
});
