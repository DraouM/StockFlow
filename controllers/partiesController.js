const PartiesModel = require("../database/models/partiesModel");

// Instantiate the partiesModel class
const partiesModel = new PartiesModel();

// Get all parties
exports.getAllParties = async () => {
  try {
    const parties = await partiesModel.getAll();
    return parties;
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }
};

// Get party by ID
exports.getPartyById = async (event, partyId) => {
  try {
    const party = await partiesModel.getById(partyId);
    return party;
  } catch (error) {
    console.error(`Error fetching party with ID ${partyId}:`, error);
    throw error;
  }
};

// Create a new party
exports.createParty = async (event, partyData) => {
  try {
    const newPartyId = await partiesModel.create(partyData);
    return newPartyId;
  } catch (error) {
    console.error("Error creating party:", error);
    throw error;
  }
};

// Update an existing party
exports.updateParty = async (event, id, partyData) => {
  try {
    const updatedParty = await partiesModel.update(id, partyData);
    return updatedParty;
  } catch (error) {
    console.error(`Error updating party with ID ${id}:`, error);
    throw error;
  }
};

// Delete a party
exports.deleteParty = async (event, id) => {
  try {
    const deletedParty = await partiesModel.delete(id);
    return deletedParty;
  } catch (error) {
    console.error(`Error deleting party with ID ${id}:`, error);
    throw error;
  }
};

//
exports.searchParty = async (avent, partyType, searchTerm) => {
  try {
    const party = await partiesModel.search(partyType, searchTerm);
    return party;
  } catch (error) {
    console.error(
      `Error searching party with type ${partyType} and search term ${searchTerm}:
        `,
      error
    );
    throw error;
  }
};

// Get total debt for a party
exports.getPartyTotalDebt = async (event, partyId) => {
  try {
    const totalDebt = await partiesModel.getTotalDebt(partyId);
    return totalDebt;
  } catch (error) {
    console.error(
      `Error fetching total debt for party with ID ${partyId}:`,
      error
    );
    throw error;
  }
};

// ----****
// controllers/partiesController.js
const PartiesModel = require("../models/PartiesModel");

class PartiesController {
  constructor() {
    this.partiesModel = new PartiesModel();
  }

  // Get all parties with pagination
  async getAllParties(req) {
    try {
      const page = parseInt(req?.query?.page) || 1;
      const limit = parseInt(req?.query?.limit) || 50;

      const parties = await this.partiesModel.getAll(page, limit);

      return {
        success: true,
        data: parties,
        pagination: {
          page,
          limit,
          total: parties.length, // In a real app, you might want to add a count query
        },
      };
    } catch (error) {
      console.error("Error fetching parties:", error);
      throw {
        success: false,
        error: error.message || "Failed to fetch parties",
      };
    }
  }

  // Get a single party by ID
  async getPartyById(partyId) {
    try {
      const party = await this.partiesModel.getById(partyId);
      return {
        success: true,
        data: party,
      };
    } catch (error) {
      console.error(`Error fetching party with ID ${partyId}:`, error);
      throw {
        success: false,
        error: error.message || "Failed to fetch party",
      };
    }
  }

  // Create a new party
  async createParty(partyData) {
    try {
      const result = await this.partiesModel.create(partyData);
      return {
        success: true,
        data: result,
        message: `Party ${partyData.name} created successfully`,
      };
    } catch (error) {
      console.error("Error creating party:", error);
      throw {
        success: false,
        error: error.message || "Failed to create party",
      };
    }
  }

  // Update a party
  async updateParty(partyId, updateData) {
    try {
      const result = await this.partiesModel.update(partyId, updateData);
      return {
        success: true,
        data: result,
        message: `Party updated successfully`,
      };
    } catch (error) {
      console.error(`Error updating party with ID ${partyId}:`, error);
      throw {
        success: false,
        error: error.message || "Failed to update party",
      };
    }
  }

  // Delete a party
  async deleteParty(partyId) {
    try {
      const result = await this.partiesModel.delete(partyId);
      return {
        success: true,
        data: result,
        message: "Party deleted successfully",
      };
    } catch (error) {
      console.error(`Error deleting party with ID ${partyId}:`, error);
      throw {
        success: false,
        error: error.message || "Failed to delete party",
      };
    }
  }

  // Search parties
  async searchParties(req) {
    try {
      const { type, searchTerm } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const parties = await this.partiesModel.search(
        type,
        searchTerm,
        page,
        limit
      );

      return {
        success: true,
        data: parties,
        pagination: {
          page,
          limit,
          total: parties.length,
        },
      };
    } catch (error) {
      console.error("Error searching parties:", error);
      throw {
        success: false,
        error: error.message || "Failed to search parties",
      };
    }
  }

  // Get parties by type
  async getPartiesByType(req) {
    try {
      const { type } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const parties = await this.partiesModel.getByType(type, page, limit);

      return {
        success: true,
        data: parties,
        pagination: {
          page,
          limit,
          total: parties.length,
        },
      };
    } catch (error) {
      console.error(`Error fetching parties of type ${type}:`, error);
      throw {
        success: false,
        error: error.message || "Failed to fetch parties by type",
      };
    }
  }

  // Get total debt for a party
  async getPartyDebt(partyId) {
    try {
      const debt = await this.partiesModel.getTotalDebt(partyId);
      return {
        success: true,
        data: {
          partyId,
          debt,
        },
      };
    } catch (error) {
      console.error(`Error fetching debt for party ID ${partyId}:`, error);
      throw {
        success: false,
        error: error.message || "Failed to fetch party debt",
      };
    }
  }

  // Cleanup method to close database connection
  cleanup() {
    try {
      this.partiesModel.closeConnection();
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw error;
    }
  }
}

// Create a singleton instance
const partiesController = new PartiesController();

// Export controller methods
module.exports = {
  getAllParties: (req) => partiesController.getAllParties(req),
  getPartyById: (partyId) => partiesController.getPartyById(partyId),
  createParty: (partyData) => partiesController.createParty(partyData),
  updateParty: (partyId, updateData) =>
    partiesController.updateParty(partyId, updateData),
  deleteParty: (partyId) => partiesController.deleteParty(partyId),
  searchParties: (req) => partiesController.searchParties(req),
  getPartiesByType: (req) => partiesController.getPartiesByType(req),
  getPartyDebt: (partyId) => partiesController.getPartyDebt(partyId),
  cleanup: () => partiesController.cleanup(),
};
