const sqlite3 = require("sqlite3").verbose();
const { dbPath, options } = require("./dbConfig");

let db = null;

function openConnection() {
  if (!db) {
    db = new sqlite3.Database(dbPath, options, (err) => {
      if (err) {
        console.error("Error connecting to the SQLite database:", err.message);
      } else {
        console.log(`Connected to the SQLite database at ${dbPath}.`);

        // Enable foreign keys
        db.run("PRAGMA foreign_keys = ON", (err) => {
          if (err) {
            console.error("Error enabling foreign keys:", err.message);
          } else {
            console.log("Foreign key enforcement enabled.");
          }
        });

        // Handle connection errors
        db.on("error", (err) => {
          console.error("Database error:", err.message);
        });
      }
    });
  }
  return db;
}

function closeConnection() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing the database connection:", err.message);
      } else {
        console.log("Database connection closed.");
      }
      db = null;
    });
  }
}

module.exports = {
  openConnection,
  closeConnection,
};
