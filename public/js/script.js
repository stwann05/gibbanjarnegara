// Cek apakah script dimuat
console.log("✅ script.js dimuat");

// Auto-isi nominal dari tombol pilihan
document.querySelectorAll(".btn-outline-secondary").forEach((button) => {
  button.addEventListener("click", () => {
    const angka = button.textContent.match(/\d[\d.]+/)[0].replace(/\./g, "");
    document.getElementById("amount").value = angka;
  });
});

// Event listener form donasi
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value || "Anonim";
    const email = document.getElementById("email").value;
    const amount = parseInt(document.getElementById("amount").value);
    const message = document.getElementById("message").value;

    if (!email || !amount) {
      alert("Email dan nominal donasi harus diisi.");
      return;
    }

    try {
      // 1. Kirim transaksi ke server
      const res = await fetch("/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount }),
      });

      const data = await res.json();

      if (data.token) {
        snap.pay(data.token); // Midtrans Snap muncul
      } else {
        alert("Gagal memproses transaksi.");
      }
    } catch (err) {
      console.error("❌ Gagal transaksi:", err);
      alert("Terjadi kesalahan saat transaksi.");
    }

    // 2. Kirim email ke admin (opsional)
    try {
      await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
    } catch (err) {
      console.warn("⚠️ Gagal mengirim email:", err);
    }
  });
});
