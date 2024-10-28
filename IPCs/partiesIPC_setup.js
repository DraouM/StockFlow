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

  ipcMain.handle("parties:getByType", (event, req) =>
    partiesController.getPartiesByType(req)
  );

  ipcMain.handle("parties:getDebt", (event, partyId) =>
    partiesController.getPartyDebt(partyId)
  );

  ipcMain.handle("parties:cleanup", () => partiesController.cleanup());
}

// Export the setup function
module.exports = { setupPartiesIPC };
