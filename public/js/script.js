// menghubungkan ke server
function getData() {
  fetch("/api/hello")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("hasil").textContent = data.message;
    });
}
