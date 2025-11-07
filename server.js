// ==========================
// server.js — Travelista Tours Backend (booking fixes + email confirmation)
// ==========================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session); // ✅ Added

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// MySQL Connection
// ==========================
const db = mysql.createConnection({
  host: process.env.DB_HOST || "bve10i1d1emv4kdevx5i-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "u3ygzqnjqt9kttzx",
  password: process.env.DB_PASS || "bsAZ0E9nMFwYLmbZ9Owb",
  database: process.env.DB_NAME || "bve10i1d1emv4kdevx5i",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ MySQL connected successfully");
});

// ==========================
// Persistent Session Store (✅ Added)
// ==========================
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "bve10i1d1emv4kdevx5i-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "u3ygzqnjqt9kttzx",
  password: process.env.DB_PASS || "bsAZ0E9nMFwYLmbZ9Owb",
  database: process.env.DB_NAME || "bve10i1d1emv4kdevx5i",
});

app.use(
  session({
    secret: "travelista-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
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

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

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
      from: `"Travalisat Tours" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP code",
      html: `
        <div style="font-family: Poppins, Arial; padding:15px; background:#f9f9f9; border-radius:10px;">
          <h2 style="color:#007BFF;">🔐 OTP Verification</h2>
          <p>Hello traveler,</p>
          <p>Your one-time password (OTP) for login is:</p>
          <h1 style="letter-spacing:3px; color:#333;">${otp}</h1>
          <p>This code expires in <b>5 minutes</b>. Please do not share it with anyone.</p>
          <hr>
          <p style="font-size:13px; color:#888;">© GlacierX Travel</p>
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

// ==========================
// VERIFY OTP
// ==========================
app.post("/api/users/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "❌ No OTP found for this email" });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(401).json({ message: "❌ OTP expired, please request again" });
  }
  if (String(record.otp) !== String(otp))
    return res.status(401).json({ message: "❌ Invalid OTP" });

  delete otpStore[email];

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);

    let user;
    if (results.length === 0) {
      const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(insertSql, ["Guest User", email, "otp_login"], (err2, result) => {
        if (err2) return res.status(500).json(err2);
        user = { id: result.insertId, name: "Guest User", email };
        req.session.user = user;
        res.json({ message: "✅ OTP verified and new user created!", user });
      });
    } else {
      user = results[0];
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

app.get("/api/packages/:id", (req, res) => {
  const sql = "SELECT * FROM packages WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(404).json({ message: "Package not found" });
    res.json({ package: results[0] });
  });
});

// ==========================
// BOOKINGS + PAYMENTS (Protected)
// ==========================
app.post("/api/bookings/book", (req, res) => {
  const user_id = req.session?.user?.id;
  if (!user_id)
    return res.status(401).json({ error: "You must be logged in to book a package." });

  const { package_id } = req.body;
  if (!package_id) return res.status(400).json({ error: "Missing package_id" });

  const sql = "INSERT INTO bookings (user_id, package_id, payment_status) VALUES (?, ?, 'Pending')";
  db.query(sql, [user_id, package_id], (err, result) => {
    if (err) {
      console.error("❌ Booking insert error:", err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
    console.log(`✅ Booking created (Pending) for user ${user_id}`);
    res.json({ success: true, bookingId: result.insertId });
  });
});

app.post("/api/bookings/pay-and-book", (req, res) => {
  const user_id = req.session?.user?.id;
  if (!user_id)
    return res.status(401).json({ error: "You must be logged in to complete payment." });

  const package_id = parseInt(req.body.package_id, 10);
  if (!package_id)
    return res.status(400).json({ error: "Invalid or missing data" });

  const updateSql = `
    UPDATE bookings 
    SET payment_status = 'Paid', booking_date = NOW()
    WHERE user_id = ? AND package_id = ? AND payment_status = 'Pending'
  `;

  db.query(updateSql, [user_id, package_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating booking" });

    const sendConfirmationEmail = () => {
      const emailQuery = `
        SELECT u.email, u.name, p.title, p.location, p.price
        FROM users u
        JOIN packages p ON p.id = ?
        WHERE u.id = ?
      `;
      db.query(emailQuery, [package_id, user_id], (mailErr, mailResults) => {
        if (mailErr || !mailResults.length) {
          console.error("❌ Email data fetch error:", mailErr);
          return res.json({ success: true, message: "Booking done but email failed" });
        }

        const { email, name, title, location, price } = mailResults[0];
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
          from: `"Travelista Tours" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "✅ Booking Confirmation - Travelista Tours",
          html: `
            <div style="font-family:Poppins,Arial;padding:20px;background:#f9f9f9;border-radius:10px;">
              <h2 style="color:#007BFF;">🎉 Booking Confirmed!</h2>
              <p>Hi <b>${name}</b>,</p>
              <p>Your booking for <b>${title}</b> in ${location} has been confirmed!</p>
              <p><b>Amount Paid:</b> ₹${price}</p>
              <p>We can’t wait to host you. Have a wonderful trip!</p>
              <hr>
              <p style="font-size:13px;color:#888;">© Travelista Tours</p>
            </div>`,
        };

        transporter.sendMail(mailOptions, (err2) => {
          if (err2) console.error("❌ Email sending failed:", err2);
          else console.log(`📧 Confirmation sent to ${email}`);
        });
      });
    };

    if (result.affectedRows > 0) {
      console.log(`✅ Booking updated to Paid for user ${user_id}`);
      sendConfirmationEmail();
      return res.json({ success: true, message: "Booking updated to Paid" });
    }

    const insertSql = `
      INSERT INTO bookings (user_id, package_id, booking_date, payment_status)
      VALUES (?, ?, NOW(), 'Paid')
    `;
    db.query(insertSql, [user_id, package_id], (insertErr) => {
      if (insertErr) return res.status(500).json({ message: "Error creating Paid booking" });
      console.log(`✅ New booking created as Paid for user ${user_id}`);
      sendConfirmationEmail();
      res.json({ success: true, message: "New booking created with Paid status" });
    });
  });
});

// ==========================
// Bookings retrieval
// ==========================
app.get("/api/bookings/user", (req, res) => {
  if (!req.session.user?.id)
    return res.status(401).json({ error: "User not logged in" });

  const sql = `
    SELECT 
      b.id, 
      p.title, 
      b.booking_date, 
      b.payment_status, 
      p.location, 
      p.image1
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.get("/api/bookings/user/:userId", (req, res) => {
  const user_id = parseInt(req.params.userId, 10);
  if (!user_id) return res.status(400).json({ error: "Invalid userId" });

  const sql = `
    SELECT 
      b.id, 
      p.title, 
      b.booking_date, 
      b.payment_status, 
      p.location, 
      p.image1
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ==========================
// Get package image by booking ID
// ==========================
app.get("/api/bookings/image/:bookingId", (req, res) => {
  const bookingId = parseInt(req.params.bookingId, 10);
  if (!bookingId) return res.status(400).json({ error: "Invalid bookingId" });

  const sql = `
    SELECT 
      b.id AS booking_id,
      b.user_id,
      p.id AS package_id,
      p.title,
      p.image1,
      p.location
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = ?;
  `;

  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0)
      return res.status(404).json({ message: "Booking not found" });

    const data = results[0];
    data.image_url = data.image1
      ? `http://localhost:5000/images/${data.image1}`
      : null;

    res.json(data);
  });
});

// ==========================
// Check session status
// ==========================
app.get("/api/users/session", (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user,
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// ==========================
// Logout User
// ==========================
app.post("/api/users/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to logout." });
      }
      res.clearCookie("connect.sid", { path: "/" });
      return res.json({ success: true, message: "Logged out successfully." });
    });
  } else {
    return res.json({ success: true, message: "No active session." });
  }
});

// ==========================
// FRONTEND ROUTES
// ==========================
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (_, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/register", (_, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/packages", (_, res) => res.sendFile(path.join(__dirname, "public", "packages.html")));
app.get("/booking", (_, res) => res.sendFile(path.join(__dirname, "public", "booking.html")));
app.get("/payment", (_, res) => res.sendFile(path.join(__dirname, "public", "payment.html")));
app.get("/mybookings", (_, res) => res.sendFile(path.join(__dirname, "public", "mybookings.html")));
app.get("/db", (_, res) => res.sendFile(path.join(__dirname, "public", "db.html")));

// ==========================
// 404 Fallback
// ==========================
app.use((_, res) => res.status(404).json({ message: "Route not found" }));

// ==========================
// Start Server
// ==========================
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);






