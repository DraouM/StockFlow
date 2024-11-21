const productsController = require("../controllers/productsController");

const { ipcMain } = require("electron");

// Set up IPC handlers in main process
function setupProductsIPC() {
  ipcMain.handle("create-product", async (event, data) => {
    return await productsController.createProductController(data);
  });

  ipcMain.handle("list-products", async (event, filters) => {
    return await productsController.listProductsController(filters);
  });

  ipcMain.handle("update-product", async (event, data) => {
    return await productsController.handleUpdate(data);
  });
}

// Export the setup function
module.exports = { setupProductsIPC };
