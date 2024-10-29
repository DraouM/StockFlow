const PartiesModel = require("../database/models/partiesModel");

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
  async getPartiesByType(params) {
    try {
      const { type } = params;
      console.log("Processing type in controller:", type);

      // Get data from model
      const data = await this.partiesModel.getByType(type);
      console.log("Data from model:", data); // Debug log

      // Always return a structured response
      return {
        success: true,
        data: data || [], // Ensure data is at least an empty array
        pagination: {
          // your pagination details
        },
      };
    } catch (error) {
      console.error("Controller error:", error);
      // Return error response rather than throwing
      return {
        success: false,
        error: error.message,
        data: [],
        pagination: {},
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
