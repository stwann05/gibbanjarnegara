// menghubungkan ke server
function getData() {
  fetch("/api/hello")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("hasil").textContent = data.message;
    });
}
const menuToggle = document.getElementById("menuToggle");
const navbar = document.querySelector(".navbar");
const navbarNav = document.getElementById("navbarNav");

// Toggle class saat menu collapse dibuka/ditutup
navbarNav.addEventListener("shown.bs.collapse", function () {
  navbar.classList.add("expanded");
});

navbarNav.addEventListener("hidden.bs.collapse", function () {
  navbar.classList.remove("expanded");
});

// Auto-isi nominal dari tombol pilihan
document.querySelectorAll(".btn-outline-secondary").forEach((button) => {
  button.addEventListener("click", () => {
    const angka = button.textContent.match(/\d[\d.]+/)[0].replace(/\./g, "");
    document.getElementById("amount").value = angka;
  });
});

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("nama").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("pesan").value;

  fetch("http://localhost:3000/send-mail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Pesan berhasil dikirim!");
        document.getElementById("contactForm").reset();
      } else {
        alert("Gagal mengirim pesan: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Gagal kirim:", error);
      alert("Terjadi kesalahan saat mengirim.");
    });
});

// server.js
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value || "Anonim";
    const email = document.getElementById("email").value;
    const amount = parseInt(document.getElementById("amount").value);
    const message = document.getElementById("message").value;

    if (!email || !amount) {
      alert("Email dan nominal donasi harus diisi.");
      return;
    }

    // Kirim ke Midtrans
    fetch("http://localhost:3000/create-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, amount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          snap.pay(data.token); // Snap muncul
        } else {
          alert("Gagal memproses transaksi.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Terjadi kesalahan.");
      });

    // Kirim email (opsional)
    fetch("http://localhost:3000/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    }).catch((err) => console.error("Gagal kirim email:", err));
  });

  // Isi otomatis nominal dari tombol-tombol
  document.querySelectorAll(".btn-outline-secondary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nominal = btn.textContent.match(/\d[\d.]+/)[0].replace(/\./g, "");
      document.getElementById("amount").value = nominal;
    });
  });
});
