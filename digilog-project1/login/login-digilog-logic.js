document.addEventListener("DOMContentLoaded", () => {

  const username = document.getElementById("username");
  const anonCheckbox = document.getElementById("anon-checked");
  const sendBtn = document.getElementById("sendBtn");

  function userInput() {
    // Kalau user ngetik username → disable checkbox
      username.addEventListener("input", () => {
        if (username.value.trim() !== "") {
          anonCheckbox.disabled = true;
        } else {
          anonCheckbox.disabled = false;
        }
      });

      // Kalau user centang anonymous → disable kotak username
      anonCheckbox.addEventListener("change", () => {
        if (anonCheckbox.checked) {
          username.disabled = true;
          username.value = ""; // hapus teks kalau sebelumnya ada
        } else {
          username.disabled = false;
        }
      });
  }

  // capslock
  username.addEventListener("input", function() {
    username.value = username.value.toUpperCase();
  });

  function showAlert(message) {
    const overlay = document.getElementById("custom-alert");
    const alertMsg = document.getElementById("alert-message");

    alertMsg.textContent = message;
    overlay.classList.remove("d-none");

    // Klik di luar alert untuk tutup
    overlay.addEventListener("click", () => {
      overlay.classList.add("d-none");
    });

    // Auto-close setelah 2.5 detik
    setTimeout(() => {
      overlay.classList.add("d-none");
    }, 2500);
  }

  function sendUsername() {
    const nameValue = username.value.trim();
    const isAnon = anonCheckbox.checked;

    if (nameValue === "" && !isAnon) {
      showAlert("Isi nama atau pilih anonymous 🕵🏻");
      return;
    }

    const finalName = isAnon ? "YOU" : nameValue;

    localStorage.setItem("username", finalName);
    window.location.href = "../main/main-digilog.html";
  }

  // klik tombol
  sendBtn.addEventListener("click", sendUsername);

  // tekan enter
  username.addEventListener("keydown", (e) => {
    // sendUsername dipanggilnya disini, jadi gausah dipanggil lagi yep
    if (e.key === "Enter") sendUsername();
  });

  userInput();
});