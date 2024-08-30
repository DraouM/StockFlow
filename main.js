const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getAllProducts, getProductById } = require("./ipc/productHandlers");

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

ipcMain.handle("products-get-all", getAllProducts);
ipcMain.handle("products-get-by-id", (event, productId) =>
  getProductById(productId)
);

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
