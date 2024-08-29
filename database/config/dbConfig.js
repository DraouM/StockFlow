// connections.js
const path = require("path");

module.exports = {
  // Database file path
  dbPath: path.join(
    process.env.APPDATA || process.env.HOME,
    "your_app_name.db"
  ),

  // SQLite options
  options: {
    verbose: console.log, // You can set this to null in production
    timeout: 5000, // Timeout for database operations (ms)
  },

  // Add any other configuration options you might need
  // For example:
  // maxConnections: 10,
  // idleTimeoutMillis: 30000,
};
