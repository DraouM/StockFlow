const sqlite3 = require("sqlite3").verbose();
const dbConfig = require("./dbConfig");

const db = new sqlite3.Database(dbConfig.databasePath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the SQLite database.");
});

module.exports = db;
