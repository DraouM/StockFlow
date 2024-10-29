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

  ipcMain.handle("parties:create", (event, partyData) =>
    partiesController.createParty(partyData)
  );

  ipcMain.handle("parties:update", (event, { partyId, updateData }) =>
    partiesController.updateParty(partyId, updateData)
  );

  ipcMain.handle("parties:delete", (event, partyId) =>
    partiesController.deleteParty(partyId)
  );

  ipcMain.handle("parties:search", (event, req) =>
    partiesController.searchParties(req)
  );

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
