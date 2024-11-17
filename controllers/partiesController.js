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

  async createParty(partyData) {
    try {
      const result = await this.partiesModel.create(partyData);
      return {
        success: true,
        status: 201, // Created
        data: result,
        message: `Party ${partyData.name} created successfully`,
      };
    } catch (error) {
      console.error("Error creating party:", {
        data: partyData,
        error: error.message,
        stack: error.stack,
      });

      // Check if it's a unique constraint error (name already exists)
      console.log("YXY ", error);

      if (error.message.includes("UNIQUE constraint")) {
        throw {
          success: false,
          status: 409, // Conflict
          error: {
            type: "UniqueConstraintError",
            message: `Party with name "${partyData.name}" already exists.`,
            field: "name",
          },
        };
      }

      // Determine if this is a validation error
      const isValidationError =
        error.message.includes("Invalid") ||
        error.message.includes("required") ||
        error.message.includes("format");

      // Check for other SQLite constraint errors
      if (error.code === "SQLITE_CONSTRAINT") {
        throw {
          success: false,
          status: isValidationError ? 400 : 500,
          error: {
            type: isValidationError ? "ValidationError" : "SystemError",
            message: error.message || "Failed to create party",
            field: isValidationError
              ? extractFieldFromSQLiteError(error.message)
              : null,
          },
        };
      }

      // Default error handling for unknown errors
      throw {
        success: false,
        status: isValidationError ? 400 : 500, // Validation or system error
        error: {
          type: isValidationError ? "ValidationError" : "SystemError",
          message: error.message || "Failed to create party",
          field: isValidationError
            ? extractFieldFromSQLiteError(error.message)
            : null,
        },
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

  async updateParty(partyId, partyData) {
    try {
      const result = await this.partiesModel.update(partyId, partyData);
      return {
        success: true,
        status: 200, // OK
        data: result,
        message: `Party ${
          partyData.name || "#" + partyId
        } updated successfully`,
      };
    } catch (error) {
      console.error("Error updating party:", {
        id: partyId,
        data: partyData,
        error: error.message,
        stack: error.stack,
      });

      // Check if it's a unique constraint error (name already exists)
      if (error.message.includes("UNIQUE constraint")) {
        throw {
          success: false,
          status: 409, // Conflict
          error: {
            type: "UniqueConstraintError",
            message: `Party with name "${partyData.name}" already exists.`,
            field: "name",
          },
        };
      }

      // Handle party not found error
      if (error.message.includes("not found")) {
        throw {
          success: false,
          status: 404,
          error: {
            type: "NotFoundError",
            message: `Party with ID ${partyId} not found`,
            field: "id",
          },
        };
      }

      // Handle invalid party type error
      if (error.message.includes("Invalid party type")) {
        throw {
          success: false,
          status: 400,
          error: {
            type: "ValidationError",
            message: error.message,
            field: "type",
          },
        };
      }

      // Determine if this is a validation error
      const isValidationError =
        error.message.includes("Invalid") ||
        error.message.includes("required") ||
        error.message.includes("format") ||
        error.message.includes("No fields provided");

      // Check for other SQLite constraint errors
      if (error.code === "SQLITE_CONSTRAINT") {
        throw {
          success: false,
          status: isValidationError ? 400 : 500,
          error: {
            type: isValidationError ? "ValidationError" : "SystemError",
            message: error.message || "Failed to update party",
            field: isValidationError
              ? extractFieldFromSQLiteError(error.message)
              : null,
          },
        };
      }

      // Default error handling for unknown errors
      throw {
        success: false,
        status: isValidationError ? 400 : 500,
        error: {
          type: isValidationError ? "ValidationError" : "SystemError",
          message: error.message || "Failed to update party",
          field: isValidationError
            ? extractFieldFromSQLiteError(error.message)
            : null,
        },
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

// Helper function to extract field name from validation error messages
function extractFieldFromSQLiteError(errorMessage) {
  const lowercaseMsg = errorMessage.toLowerCase();
  if (lowercaseMsg.includes("nrc")) return "nrc";
  if (lowercaseMsg.includes("nif")) return "nif";
  if (lowercaseMsg.includes("nis")) return "nis";
  if (lowercaseMsg.includes("ia")) return "ia";
  if (lowercaseMsg.includes("phone")) return "phone";
  if (lowercaseMsg.includes("name")) return "name";
  if (lowercaseMsg.includes("type")) return "type";
  return null;
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
