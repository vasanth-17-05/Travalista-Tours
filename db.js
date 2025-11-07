// ==============================
// db.js — MySQL Connection (Clever Cloud + Local Support)
// ==============================
require("dotenv").config();
const mysql = require("mysql2");

const isCloud = process.env.DB_HOST?.includes("clever-cloud");

const dbConfig = {
  host: process.env.DB_HOST || "bz8i1xizpodkv0h7nzhm-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uky18yu4nero38fe",
  password: process.env.DB_PASS || "YbvFxdOLLMo10HwZy7qC",
  database: process.env.DB_NAME || "bz8i1xizpodkv0h7nzhm",
  port: process.env.DB_PORT || 3306, // ✅ FIXED: MySQL port, not Express port
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
