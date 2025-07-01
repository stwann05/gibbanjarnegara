require("dotenv").config(); // WAJIB di paling atas

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
    res.json({ token: transaction.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Endpoint Webhook/Notifikasi dari Midtrans ===
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

    // Kamu bisa tambah: simpan ke DB, kirim email, dll

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
    pass: process.env.EMAIL_PASS,
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Jalankan Server ===
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
