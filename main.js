const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Create a new BrowserWindow when `app` is ready
function createWindow() {
  const win = new BrowserWindow({
    width: 1200, // Set window width
    height: 800, // Set window height
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script
    },
  });

  // Load the `index.html` file into the window
  // win.loadFile("index.html");
  win.loadFile(
    "/home/mohamed/Documents/Projects/StockFlow/pages/stock/stock.html"
  );

  // Open DevTools (optional)
  win.webContents.openDevTools();
}

// When Electron has finished initialization, create the window
app.whenReady().then(createWindow);

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./handlers/productsHandler");

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
} = require("./handlers/transactionsHandler");

ipcMain.handle("transactions-get-all", getAllTransactions);
ipcMain.handle("transactions-get-by-id", (event, transactionId) =>
  getTransactionById(transactionId)
);
ipcMain.handle("transactions-create", (event, transactionData) =>
  createTransaction(transactionData)
);
ipcMain.handle("transactions-update", (event, id, transactionData) =>
  updateTransaction(id, transactionData)
);
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

const {
  getAllParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
} = require("./handlers/partiesHandler");

ipcMain.handle("parties-get-all", getAllParties);
ipcMain.handle("parties-get-by-id", (event, partyId) => getPartyById(partyId));
ipcMain.handle("parties-create", (event, partyData) => createParty(partyData));
ipcMain.handle("parties-update", (event, id, partyData) =>
  updateParty(id, partyData)
);
ipcMain.handle("parties-delete", (event, id) => deleteParty(id));

// Quit when all windows are closed (except on macOS)
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

// index.js or app.js
// const { closeConnection } = require('./database/connection');
// const Product = require('./models/Product');

// // ... your app logic here ...

// // When shutting down your app:
// process.on('SIGINT', () => {
//   closeConnection();
//   process.exit(0);
// });
