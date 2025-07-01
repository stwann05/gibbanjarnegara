require("dotenv").config(); // HARUS di paling atas

const express = require("express");
const path = require("path");
const cors = require("cors");
const midtransClient = require("midtrans-client");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// === Route Halaman Utama ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Konfigurasi Midtrans Snap ===
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// === Endpoint Buat Transaksi Snap ===
app.post("/create-transaction", async (req, res) => {
  const { amount, name, email } = req.body;

  console.log("📥 Data transaksi diterima:", { name, email, amount });
  console.log("🔑 Server Key tersedia:", !!process.env.MIDTRANS_SERVER_KEY);

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Nominal tidak valid." });
  }

  const parameter = {
    transaction_details: {
      order_id: "DONASI-" + Date.now(),
      gross_amount: amount,
    },
    customer_details: {
      first_name: name || "Anonim",
      email: email,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    console.log("✅ Transaksi berhasil:", transaction);
    res.json({ token: transaction.token });
  } catch (err) {
    console.error("❌ Gagal membuat transaksi:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === Endpoint Webhook dari Midtrans ===
app.post("/notification", async (req, res) => {
  const notificationJson = req.body;

  try {
    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const statusResponse = await core.transaction.notification(
      notificationJson
    );

    console.log("📢 Notifikasi Diterima:");
    console.log("Order ID:", statusResponse.order_id);
    console.log("Status:", statusResponse.transaction_status);
    console.log("Payment Type:", statusResponse.payment_type);

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error notifikasi:", err.message);
    res.status(500).send("Error");
  }
});

// === Konfigurasi Nodemailer ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // gunakan App Password
  },
});

// === Endpoint Kirim Email ===
app.post("/send-mail", async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_RECEIVER,
    subject: `Donasi dari ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email terkirim dari:", email);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal kirim email:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// === Endpoint Kesehatan (Opsional untuk cek online) ===
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// === Jalankan Server ===
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server aktif dan mendengarkan di PORT ${PORT}`);
});

// === Penanganan Error Global ===
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});
