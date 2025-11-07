// ==============================
// db.js — MySQL Connection (Clever Cloud + Local Support)
// ==============================
require("dotenv").config();
const mysql = require("mysql2");

const isCloud = process.env.DB_HOST?.includes("clever-cloud");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Vasanth@05!!",
  database: process.env.DB_NAME || "tb",
  port: process.env.DB_PORT || 3306,
  ssl: isCloud ? { rejectUnauthorized: true } : false, // enable SSL for Clever Cloud
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log(
      `✅ MySQL connected successfully to ${isCloud ? "Clever Cloud" : "Localhost"}`
    );
  }
});

module.exports = db;
