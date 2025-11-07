// ==========================
// server.js — Travelista Tours Backend (Render + Clever Cloud + OTP + Booking)
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// CORS CONFIGURATION (Render + Local Support)
// ==========================
const allowedOrigins = [
  "http://localhost:5500", // local frontend testing
  "https://travalista-tours-10.onrender.com" // your deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ==========================
// Middleware
// ==========================
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// MySQL Connection (Clever Cloud)
// ==========================
const db = mysql.createConnection({
  host: process.env.DB_HOST || "bz8i1xizpodkv0h7nzhm-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uky18yu4nero38fe",
  password: process.env.DB_PASS || "YbvFxdOLLMo10HwZy7qC",
  database: process.env.DB_NAME || "bz8i1xizpodkv0h7nzhm",
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: true },
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err.message);
  else console.log("✅ MySQL connected successfully to Clever Cloud");
});

// ==========================
// Persistent Session Store
// ==========================
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: true },
});

app.use(
  session({
    secret: "travelista-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ==========================
// USERS API
// ==========================
app.post("/api/users/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ User registered successfully", userId: result.insertId });
  });
});

app.post("/api/users/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = { id: results[0].id, name: results[0].name, email };
    res.json({ message: "✅ Login successful", user: results[0] });
  });
});

// ==========================
// OTP LOGIN
// ==========================
const otpStore = {}; // { email: { otp, expiresAt } }

app.post("/api/users/send-otp", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore[email] = { otp, expiresAt };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Travelista Tours" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP code",
      html: `
        <div style="font-family: Poppins, Arial; padding:15px; background:#f9f9f9; border-radius:10px;">
          <h2 style="color:#007BFF;">🔐 OTP Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="letter-spacing:3px; color:#333;">${otp}</h1>
          <p>This code expires in <b>5 minutes</b>.</p>
        </div>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("❌ Email Error:", err);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      console.log(`📩 OTP ${otp} sent to ${email}`);
      res.json({ message: "✅ OTP sent to your email!" });
    });
  });
});

app.post("/api/users/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "❌ No OTP found" });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(401).json({ message: "❌ OTP expired" });
  }
  if (String(record.otp) !== String(otp))
    return res.status(401).json({ message: "❌ Invalid OTP" });

  delete otpStore[email];
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(insertSql, ["Guest User", email, "otp_login"], (err2, result) => {
        if (err2) return res.status(500).json(err2);
        req.session.user = { id: result.insertId, name: "Guest User", email };
        res.json({ message: "✅ OTP verified and user created!", user: req.session.user });
      });
    } else {
      const user = results[0];
      req.session.user = { id: user.id, name: user.name, email: user.email };
      res.json({ message: "✅ OTP verified successfully!", user: req.session.user });
    }
  });
});

// ==========================
// PACKAGES API
// ==========================
app.get("/api/packages", (req, res) => {
  db.query("SELECT * FROM packages", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ==========================
// BOOKINGS + PAYMENTS
// ==========================
app.post("/api/bookings/book", (req, res) => {
  const user_id = req.session?.user?.id;
  if (!user_id)
    return res.status(401).json({ error: "You must be logged in to book." });

  const { package_id } = req.body;
  if (!package_id) return res.status(400).json({ error: "Missing package_id" });

  const sql =
    "INSERT INTO bookings (user_id, package_id, payment_status) VALUES (?, ?, 'Pending')";
  db.query(sql, [user_id, package_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create booking" });
    res.json({ success: true, bookingId: result.insertId });
  });
});

// ==========================
// Logout User
// ==========================
app.post("/api/users/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid", { path: "/" });
      res.json({ message: "✅ Logged out successfully" });
    });
  } else {
    res.json({ message: "No active session" });
  }
});

// ==========================
// FRONTEND ROUTES
// ==========================
app.get("/", (_, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// ==========================
// 404 Fallback
// ==========================
app.use((_, res) => res.status(404).json({ message: "Route not found" }));

// ==========================
// Start Server
// ==========================
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV})`)
);
