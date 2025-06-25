const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Public folder untuk akses file statis (JS, CSS, gambar)
app.use(express.static(path.join(__dirname, "public")));

// Saat user mengakses '/', kirimkan file main.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
