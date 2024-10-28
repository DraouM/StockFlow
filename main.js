// Import core Electron modules and necessary packages
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Import Product handlers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("./controllers/productController");

// Import Transaction handlers
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDateRange,
  getTotalAmountByType,
  settleTransaction,
  getUnsettledTransactions,
} = require("./controllers/transactionController");

// Create a new BrowserWindow when `app` is ready
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script
    },
  });

  // Load a specific page (you can change it to index.html or another page)
  win.loadFile(
    "/home/mohamed/Documents/Projects/StockFlow/pages/clients/client.html"
  );

  // Optionally, open DevTools for debugging
  win.webContents.openDevTools();
}

// --------- Electron App Lifecycle Events ---------

// When Electron is initialized, create a window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Re-create a window when the app icon is clicked (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --------- IPC Handlers: Grouped by Functionality ---------

// Products IPC Handlers
ipcMain.handle("products-get-all", getAllProducts);
ipcMain.handle("products-get-by-id", (event, productId) =>
  getProductById(productId)
);
ipcMain.handle("products-create", (event, productData) =>
  createProduct(productData)
);
ipcMain.handle("products-update", (event, id, productData) =>
  updateProduct(id, productData)
);
ipcMain.handle("products-delete", (event, id) => deleteProduct(id));
ipcMain.handle("products.search", (event, searchTerm) =>
  searchProducts(searchTerm)
);

// Transactions IPC Handlers
ipcMain.handle("transactions-get-all", getAllTransactions);
ipcMain.handle("transactions-get-by-id", (event, transactionId) => {
  console.log("Data received in main process:", transactionId);
  return getTransactionById(transactionId);
});
ipcMain.handle("transactions-create", (event, transactionData) => {
  return createTransaction(transactionData);
});
ipcMain.handle("transactions-update", (event, id, transactionData) => {
  console.log("Data received in main process (UPDATE):", id, transactionData);
  return updateTransaction(event, id, transactionData);
});
ipcMain.handle("transactions-delete", (event, id) => deleteTransaction(id));
ipcMain.handle(
  "transactions-get-by-date-range",
  (event, startDate, endDate, type) =>
    getTransactionsByDateRange(startDate, endDate, type)
);
ipcMain.handle(
  "transactions-get-total-amount-by-type",
  (event, type, startDate, endDate) =>
    getTotalAmountByType(type, startDate, endDate)
);
ipcMain.handle("transactions-settle", (event, id) => settleTransaction(id));
ipcMain.handle("transactions-get-unsettled", (event, partyId) =>
  getUnsettledTransactions(partyId)
);

const { setupPartiesIPC } = require("./IPCs/partiesIPC_setup"); //path-to-ipc-setup
// Call this after creating your electron window
setupPartiesIPC();

// Optional: Handle graceful shutdowns
// process.on('SIGINT', () => {
//   closeConnection(); // Call your DB connection close function if needed
//   process.exit(0);
// });
