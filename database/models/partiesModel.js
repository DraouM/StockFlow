const {
  openConnection,
  closeConnection: dbCloseConnection,
} = require("../config/connection");

class PartiesModel {
  constructor() {
    this.db = openConnection();
  }

  // Generic query executor with better error handling
  async runQuery(query, params = [], successMessage, errorMessage) {
    try {
      return new Promise((resolve, reject) => {
        this.db.run(query, params, function (err) {
          if (err) {
            console.error(`${errorMessage}:`, err.message);
            reject(err);
          } else {
            console.log(successMessage);
            resolve({ id: this.lastID, changes: this.changes });
          }
        });
      });
    } catch (error) {
      console.error(`Database error in runQuery: ${error.message}`);
      throw error;
    }
  }

  // Generic fetch query with better error handling
  async fetchQuery(query, params = [], errorMessage) {
    try {
      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) {
            console.error(`${errorMessage}:`, err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error(`Database error in fetchQuery: ${error.message}`);
      throw error;
    }
  }

  // Generic fetch single record with better error handling
  async fetchSingle(query, params = [], errorMessage) {
    try {
      return new Promise((resolve, reject) => {
        this.db.get(query, params, (err, row) => {
          if (err) {
            console.error(`${errorMessage}:`, err.message);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } catch (error) {
      console.error(`Database error in fetchSingle: ${error.message}`);
      throw error;
    }
  }

  // Create a new party
  async create({ name, type, phone, address, nrc, nif, ia, nis }) {
    // Format validations
    if (nrc && !nrc.match(/^[0-9]{2}\/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$/)) {
      throw new Error("Invalid NRC format.");
    }
    if (nif && !nif.match(/^[0-9]{15}$/)) {
      throw new Error("Invalid NIF format.");
    }
    if (nis && !nis.match(/^[0-9]{12}$/)) {
      throw new Error("Invalid NIS format.");
    }
    if (ia && !ia.match(/^[0-9]{11}$/)) {
      throw new Error("Invalid IA format.");
    }

    // Rest of the function remains the same
    const query = `
      INSERT INTO parties (
        name, type, phone, address, nrc, nif, ia, nis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    if (!["customer", "supplier", "both"].includes(type)) {
      throw new Error(
        "Invalid party type. Must be customer, supplier, or both."
      );
    }

    const params = [name, type, phone, address, nrc, nif, ia, nis];

    return this.runQuery(
      query,
      params,
      `New party added: ${name}`,
      "Error adding new party"
    );
  }

  // Get all parties with optional pagination
  async getAll(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM parties 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.fetchQuery(query, [limit, offset], "Error fetching parties");
  }

  // Get party by ID with error handling
  async getById(partyId) {
    const query = `SELECT * FROM parties WHERE id = ?`;
    const party = await this.fetchSingle(
      query,
      [partyId],
      "Error fetching party by ID"
    );

    if (!party) {
      throw new Error(`Party with ID ${partyId} not found`);
    }

    return party;
  }

  // Update party by ID with validation
  async update(
    partyId,
    { name, type, phone, address, credit_balance, nrc, nif, ia, nis }
  ) {
    if (type && !["customer", "supplier", "both"].includes(type)) {
      throw new Error(
        "Invalid party type. Must be customer, supplier, or both."
      );
    }

    // Format validations
    if (nrc && !nrc.match(/^[0-9]{2}\/[0-9]{2}-[0-9]{7}[A-Z][0-9]{2}$/)) {
      throw new Error("Invalid NRC format.");
    }
    if (nif && !nif.match(/^[0-9]{15}$/)) {
      throw new Error("Invalid NIF format.");
    }
    if (nis && !nis.match(/^[0-9]{12}$/)) {
      throw new Error("Invalid NIS format.");
    }
    if (ia && !ia.match(/^[0-9]{11}$/)) {
      throw new Error("Invalid IA format.");
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name);
    }
    if (type) {
      updates.push("type = ?");
      params.push(type);
    }
    if (phone) {
      updates.push("phone = ?");
      params.push(phone);
    }
    if (address) {
      updates.push("address = ?");
      params.push(address);
    }
    if (credit_balance !== undefined) {
      updates.push("credit_balance = ?");
      params.push(credit_balance);
    }
    if (nrc) {
      updates.push("nrc = ?");
      params.push(nrc);
    }
    if (nif) {
      updates.push("nif = ?");
      params.push(nif);
    }
    if (ia) {
      updates.push("ia = ?");
      params.push(ia);
    }
    if (nis) {
      updates.push("nis = ?");
      params.push(nis);
    }

    if (updates.length === 0) {
      throw new Error("No fields provided for update");
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(partyId);

    const query = `
      UPDATE parties
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    const result = await this.runQuery(
      query,
      params,
      "Party updated successfully",
      "Error updating party"
    );

    if (result.changes === 0) {
      throw new Error(`Party with ID ${partyId} not found`);
    }

    return result;
  }

  // Delete party by ID with validation
  async delete(partyId) {
    const query = `DELETE FROM parties WHERE id = ?`;
    const result = await this.runQuery(
      query,
      [partyId],
      "Party deleted successfully",
      "Error deleting party"
    );

    if (result.changes === 0) {
      throw new Error(`Party with ID ${partyId} not found`);
    }

    return result;
  }

  // Get parties by type with validation
  async getByType(type, page = 1, limit = 50) {
    if (!["customer", "supplier", "both"].includes(type)) {
      throw new Error(
        "Invalid party type. Must be customer, supplier, or both."
      );
    }

    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM parties 
      WHERE type = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    return this.fetchQuery(
      query,
      [type, limit, offset],
      `Error fetching parties of type ${type}`
    );
  }

  // Search parties with improved search functionality
  async search(type, searchTerm, page = 1, limit = 50) {
    if (type && !["customer", "supplier", "both"].includes(type)) {
      throw new Error(
        "Invalid party type. Must be customer, supplier, or both."
      );
    }

    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM parties 
      WHERE (? IS NULL OR type = ?) 
        AND (
          name LIKE ? OR 
          phone LIKE ? OR 
          address LIKE ?
        )
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchTerm}%`;
    return this.fetchQuery(
      query,
      [type, type, searchPattern, searchPattern, searchPattern, limit, offset],
      "Error searching parties"
    );
  }

  // Get total debt with better error handling
  async getTotalDebt(partyId) {
    const query = `
      SELECT credit_balance 
      FROM parties 
      WHERE id = ?
    `;

    const result = await this.fetchSingle(
      query,
      [partyId],
      "Error fetching total debt"
    );

    if (!result) {
      throw new Error(`Party with ID ${partyId} not found`);
    }

    return result.credit_balance || 0;
  }

  // Close database connection
  closeConnection() {
    try {
      if (this.isConnected) {
        dbCloseConnection();
        this.isConnected = false;
        console.log("Database connection closed.");
      }
    } catch (error) {
      console.error("Error closing database connection:", error.message);
      throw error;
    }
  }
}

module.exports = PartiesModel;
