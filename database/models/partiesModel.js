const { openConnection, closeConnection } = require("../config/connection");

class PartiesModel {
  constructor() {
    this.db = openConnection();
  }

  runQuery(query, params = [], successMessage, errorMessage) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
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

  fetchQuery(query, params = [], errorMessage) {
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
  }

  fetchSingle(query, params = [], errorMessage) {
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
  }

  // Create a new party
  async create({ name, phone, email, address, party_type }) {
    const query = `
      INSERT INTO Parties (name, phone, email, address, party_type)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [name, phone, email, address, party_type];
    return await this.runQuery(
      query,
      params,
      "Party added successfully.",
      "Error adding party"
    );
  }

  // Get all parties
  async getAll() {
    const query = `SELECT * FROM Parties`;
    return await this.fetchQuery(query, [], "Error fetching all parties");
  }

  // Get party by ID
  async getById(party_id) {
    const query = `SELECT * FROM Parties WHERE party_id = ?`;
    return await this.fetchSingle(
      query,
      [party_id],
      "Error fetching party by ID"
    );
  }

  // Update party by ID
  async update(
    party_id,
    { name, phone, email, address, party_type, total_debt }
  ) {
    const query = `
      UPDATE Parties
      SET name = ?, phone = ?, email = ?, address = ?, party_type = ?, total_debt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE party_id = ?
    `;

    const params = [
      name,
      phone,
      email,
      address,
      party_type,
      total_debt,
      party_id,
    ];
    return await this.runQuery(
      query,
      params,
      "Party updated successfully.",
      "Error updating party"
    );
  }

  // Delete party by ID
  async delete(party_id) {
    const query = `DELETE FROM Parties WHERE party_id = ?`;
    return await this.runQuery(
      query,
      [party_id],
      "Party deleted successfully.",
      "Error deleting party"
    );
  }

  // Get parties by type (client or supplier)
  async getByType(party_type) {
    const query = `SELECT * FROM Parties WHERE party_type = ?`;
    return await this.fetchQuery(
      query,
      [party_type],
      `Error fetching ${party_type}s`
    );
  }

  async search(party_type, searchTerm) {
    console.log("from parties model", party_type, searchTerm);

    const query = `SELECT * FROM Parties WHERE party_type = ? AND name LIKE ?`;
    return await this.fetchQuery(
      query,
      [party_type, `%${searchTerm}%`],
      `Error fetching ${party_type}s + ${searchTerm}`
    );
  }

  // Get total debt of a party by ID
  async getTotalDebt(party_id) {
    const query = `SELECT total_debt FROM Parties WHERE party_id = ?`;
    const result = await this.fetchSingle(
      query,
      [party_id],
      "Error fetching total debt"
    );
    return result?.total_debt || 0;
  }

  // Update debt of a party by ID
  async updateDebt(party_id, newDebt) {
    const query = `
      UPDATE Parties
      SET total_debt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE party_id = ?
    `;
    return await this.runQuery(
      query,
      [newDebt, party_id],
      "Debt updated successfully.",
      "Error updating debt"
    );
  }

  closeConnection() {
    closeConnection();
  }
}

// Export the class for use in other modules
module.exports = PartiesModel;
