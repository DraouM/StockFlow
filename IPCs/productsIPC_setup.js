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

  ipcMain.handle("fetch-single-product", async (event, productId) => {
    return await productsController.handleFetchSingle(productId);
  });

  ipcMain.handle("update-product", async (event, data) => {
    return await productsController.handleUpdate(data);
  });

  ipcMain.handle("search-products", async (event, searchTerm) => {
    return await productsController.searchProducts(searchTerm);
  });
}

// Export the setup function
module.exports = { setupProductsIPC };

/** For Later (error cheking) */
// ipcMain.handle('search-products', async (event, searchTerm) => {
//   try {
//     return await productController.searchProducts(searchTerm);
//   } catch (error) {
//     console.error('IPC search products error:', error);
//     return {
//       success: false,
//       error: {
//         type: 'IPC_ERROR',
//         message: 'Failed to process product search'
//       }
//     };
//   }
