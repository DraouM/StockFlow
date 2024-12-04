const partiesController = require("../controllers/partiesController");

const { ipcMain } = require("electron");

// Set up IPC handlers in main process
function setupPartiesIPC() {
  ipcMain.handle("parties:getAll", (event, req) =>
    partiesController.getAllParties(req)
  );

  ipcMain.handle("parties:getById", (event, partyId) =>
    partiesController.getPartyById(partyId)
  );

  ipcMain.handle("parties:create", async (event, partyData) => {
    try {
      const result = await partiesController.createParty(partyData);
      return result; // This will have the success structure if everything went well
    } catch (error) {
      // If it's already a formatted error from our controller
      if (error.hasOwnProperty("success") && error.hasOwnProperty("status")) {
        return error; // Return the error as is since it's already properly formatted
      }

      // Fallback for unexpected errors
      console.error("Unexpected error in create-party handler:", {
        error: error.message,
        stack: error.stack,
        data: partyData,
      });

      // Return a generic error response
      return {
        success: false,
        status: 500,
        error: {
          type: "SystemError",
          message: "An unexpected error occurred while creating the party.",
          field: null,
        },
      };
    }
  });

  ipcMain.handle("parties:update", (event, { partyId, updateData }) =>
    partiesController.updateParty(partyId, updateData)
  );

  ipcMain.handle("parties:delete", (event, partyId) =>
    partiesController.deleteParty(partyId)
  );
  ipcMain.handle("parties:search", async (event, req) => {
    try {
      if (!req || !req.query) {
        console.log({ event, req });
      }
      const result = await partiesController.searchParties(req);
      return result; // Return the result from the controller
    } catch (error) {
      console.error("Error in parties:search IPC handler:", error);
      // Return structured error response
      return {
        success: false,
        error: error.message,
        data: [],
        pagination: {},
      };
    }
  });

  // main.js
  ipcMain.handle("parties:getByType", async (event, params) => {
    try {
      console.log("From parties ipc ", params);

      const result = await partiesController.getPartiesByType(params);
      console.log("IPC result before sending:", result); // Debug log

      // If result is undefined, return a structured response
      if (!result) {
        return {
          success: false,
          error: "No data returned from controller",
          data: [],
          pagination: {},
        };
      }

      // Ensure we're returning a properly structured response
      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination || {},
        error: null,
      };
    } catch (error) {
      console.error("IPC error:", error);
      // Return structured error response
      return {
        success: false,
        error: error.message,
        data: [],
        pagination: {},
      };
    }
  });

  ipcMain.handle("parties:getDebt", (event, partyId) =>
    partiesController.getPartyDebt(partyId)
  );

  ipcMain.handle("parties:cleanup", () => partiesController.cleanup());
}

// Export the setup function
module.exports = { setupPartiesIPC };
