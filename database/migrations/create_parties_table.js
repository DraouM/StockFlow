const { openConnection, closeConnection } = require("../config/connection");

class PartiesDB {
  constructor() {
    this.db = openConnection();
  }

  runQuery(query, successMessage, errorMessage) {
    return new Promise((resolve, reject) => {
      this.db.exec(query, (err) => {
        // Changed from run to exec for multiple statements
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
    // Separate DROP and CREATE statements
    const dropQuery = `DROP TABLE IF EXISTS parties;`;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
        credit_balance REAL DEFAULT 0,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        nrc TEXT UNIQUE CHECK (
            nrc IS NULL OR 
            nrc LIKE '__/__/_______A__'  -- Format example: XX/XX-XXXXXXXAXX
        ),  -- Stores the unique business registration number.

        nif TEXT UNIQUE CHECK (
            nif IS NULL OR 
            length(nif) = 15 AND nif GLOB '[0-9]*'  -- 15 digits
        ),  -- Stores the tax identification number.

        ia TEXT UNIQUE CHECK (
            ia IS NULL OR 
            length(ia) = 11 AND ia GLOB '[0-9]*'  -- 11 digits
        ),  -- Stores the administrative identifier.

        nis TEXT UNIQUE CHECK (
            nis IS NULL OR 
            length(nis) = 12 AND nis GLOB '[0-9]*'  -- 12 digits
        )  -- Stores the social identification number.

      );
    `;

    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_party_name ON parties(name);
      CREATE INDEX IF NOT EXISTS idx_party_type ON parties(type);  -- Fixed column name
      CREATE INDEX IF NOT EXISTS idx_party_balance ON parties(credit_balance);
      CREATE INDEX IF NOT EXISTS idx_party_timestamp ON parties(updated_at);
    `;

    try {
      // Execute queries in sequence
      await this.runQuery(
        dropQuery,
        "Old parties table dropped successfully.",
        "Error dropping old parties table"
      );

      await this.runQuery(
        createTableQuery,
        "Parties table created successfully.",
        "Error creating Parties table"
      );

      await this.runQuery(
        indexQuery,
        "Indexes for Parties table created successfully.",
        "Error creating indexes for Parties table"
      );
    } catch (error) {
      console.error("Failed to set up the parties database:", error);
      throw error; // Re-throw to handle in calling code
    }
  }

  closeConnection() {
    closeConnection();
  }
}

// Instantiate and run with proper error handling
const partiesDB = new PartiesDB();
partiesDB
  .createPartiesTable()
  .then(() => {
    console.log("Database setup completed successfully");
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
  })
  .finally(() => {
    partiesDB.closeConnection();
  });
