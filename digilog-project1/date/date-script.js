

const fp = flatpickr("#calendarInput", {
      defaultDate: "today",
      maxDate: "today", // ❗ disable masa depan
      clickOpens: false
    });

// klik teks "date"
document.getElementById("calendar").addEventListener("click", () => {
    fp.open();
});

    // tambahin tombol close (❌)
    fp.calendarContainer.insertAdjacentHTML(
      "beforeend",
      '<span class="flatpickr-close">✖</span>'
    );

    fp.calendarContainer
      .querySelector(".flatpickr-close")
      .addEventListener("click", () => fp.close());
