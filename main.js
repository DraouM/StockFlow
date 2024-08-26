const { app, BrowserWindow } = require("electron");
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
  win.loadFile("index.html");

  // Open DevTools (optional)
  win.webContents.openDevTools();
}

// When Electron has finished initialization, create the window
app.whenReady().then(createWindow);

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
