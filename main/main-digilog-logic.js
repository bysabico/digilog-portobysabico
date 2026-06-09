
// fetch navbar
fetch ('../navbar/navbar-digilog.html')
.then(response => response.text())      
.then(data => {
    document.getElementById('navbar-container').innerHTML = data;
    setupNavbarLogic();
    mainPageClock();
})
.catch(error => {
    console.error('gagal load navbar:', error)
})

// fetch footer
fetch ('../footer/footer-digilog.html')
.then(response => response.text())      
.then(data => {
    document.getElementById('footer-container').innerHTML = data;
})
.catch(error => {
    console.error('gagal load footer:', error)
})

// greeting dan username log in
function showGreeting() {

  // nama user tersimpan dalam local storage
  const usernameInputed = localStorage.getItem("username") || "Guest";

  // greeting
  const now = new Date();
  const hour = now.getHours();
  let greet = "";

  if (hour >= 5 && hour < 12) greet = "Good Morning";
  else if (hour >= 12 && hour < 17) greet = "Good Afternoon";    else if (hour >= 17 && hour < 21) greet = "Good Evening";
  else greet = "Good Night";

  greet = greet.toUpperCase();

  document.getElementById("greeting").textContent = `${greet}, ${usernameInputed} 👋`;
}

// nama user dari hasil login akan muncul di layar
window.addEventListener("DOMContentLoaded", showGreeting);

// tampilan jam mode digital atau analog
function digitalAnalogClock() {
  // digital-analog clock
  const digitalBtn = document.getElementById('digitalBtn');
  const analogBtn = document.getElementById('analogBtn');
  const digitalClock = document.getElementById('digitalClock');
  const analogClock = document.getElementById('analogClock');

  digitalClock.classList.remove('d-none');
  analogClock.classList.add('d-none');

  digitalBtn.addEventListener('click', () => {
    analogClock.classList.remove('d-none');
    digitalClock.classList.add('d-none');
  });

  analogBtn.addEventListener('click', () => {
    digitalClock.classList.remove('d-none');
    analogClock.classList.add('d-none');
  });
}

// tampilan tanggal
function displayDate() {
  const displayDate = document.getElementById('date');

  setInterval(() => {
    const now = new Date();

    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();

    displayDate.innerHTML = `${day}, ${date} ${month} ${year}`;
  }, 1000);
}

// flipickr date

const fp = flatpickr("#calendarInput", {
    defaultDate: "today",
    maxDate: "today", // ❗ disable masa depan
    clickOpens: false,
    onReady: function(_, __, instance) {
    const yearEl = instance.currentYearElement;

        yearEl.style.cursor = "pointer";

        yearEl.addEventListener("click", () => {
                showYearPicker(instance);
        });
    },

    onClose: function(_, __, instance) {
        const today = new Date();

        requestAnimationFrame(() => {
            instance.setDate(today, true);
            instance.jumpToDate(today);
        });
    }
});

// klik teks "date"
document.getElementById("date").addEventListener("click", () => {
    fp.open();
});

function showYearPicker(instance) {
      const container = instance.calendarContainer;
      const days = container.querySelector(".flatpickr-days");

      days.style.display = "none";

      if (container.querySelector(".year-grid")) return;

      const grid = document.createElement("div");
      grid.className = "year-grid";

      const now = new Date().getFullYear();

      for (let y = now - 12; y <= now + 12; y++) {
        const item = document.createElement("div");
        item.textContent = y;
        item.className = "year-item";

        item.onclick = () => {
          instance.changeYear(y);
          grid.remove();
          days.style.display = "";
        };

        grid.appendChild(item);
      }

      container.appendChild(grid);
    }

// tambahin tombol close (❌)
fp.calendarContainer.insertAdjacentHTML(
    "beforeend",
    '<span class="flatpickr-close">✖</span>'
);

const closeBtn = fp.calendarContainer.querySelector(".flatpickr-close");

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fp.close(); // ini nutup kalender total
  });

// sambungin digital ke btn12 dan btn24
function digitalMode() {
  const displayDigitalMode = document.getElementById('digitalClock');
  const btn12 = document.getElementById('btn12');
  const btn24 = document.getElementById('btn24');

  let use24HourFormat = false;

  btn12.addEventListener('click', () => {
      use24HourFormat = false;
  });

  btn24.addEventListener('click', () => {
      use24HourFormat = true;
  });

  setInterval(() => {
      let date = new Date(),
          h = date.getHours(),
          m = date.getMinutes(),
          s = date.getSeconds(),
          ampm = "AM";

      if (!use24HourFormat) {
          if (h >= 12) {
              ampm = "PM";
              h = h > 12 ? h - 12 : h;
          }
          h = h === 0 ? 12 : h;
      }

      // Tambah 0 di depan angka < 10
      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;

      // Tampilkan waktu
      displayDigitalMode.innerHTML = use24HourFormat 
          ? `${h}:${m}:${s}` 
          : `${h}:${m}:${s} ${ampm}`;
  }, 1000);
}

// analog clock
function analogClock() {
  const numberHours = document.querySelector('.number-hours');
  const barSeconds = document.querySelector('.bar-seconds');

  const numberElement = [],
      barElement = [];

  // create number hours
  for (let i = 1; i <= 12; i++) {
      numberElement.push(
          `<span style="--indeks:${i};"><p>${i}</p></span>`
      );
  }

  numberHours.insertAdjacentHTML("afterbegin", numberElement.join(''));

  // create bar seconds

  for (let i = 1; i <= 60; i++) {
      barElement.push(
          `<span style="--indeks:${i};"><p></p></span>`
      );
  }

  barSeconds.insertAdjacentHTML("afterbegin", barElement.join(''));

  const handHours = document.querySelector('.hand.hours'),
      handMinutes = document.querySelector('.hand.minutes'),
      handSeconds = document.querySelector('.hand.seconds');

  function getCurrentTime() {
      let date = new Date();
      let currentHours = date.getHours(),
          currentMinutes = date.getMinutes(),
          currentSeconds = date.getSeconds();
      /*
    60s = 360deg so 1 s = 360 / 60 = 6 deg
    60min = 360deg so 1 min = 360 / 60  = 6 deg
    12h = 360deg so 1 h = 360 / 12 = 30 deg

    1 h = 30 deg that means 60 min = 30deg so 1 min = 30 / 60 = 0.5 or 1/2deg

    so formula for h is (hours * 30 + minutes / 2)
      */

      handHours.style.transform = `rotate(${currentHours * 30 + currentMinutes / 2}deg)`;
      handMinutes.style.transform = `rotate(${currentMinutes * 6}deg)`;
      handSeconds.style.transform = `rotate(${currentSeconds * 6}deg)`;
  }

  // call getCurrentTime
  getCurrentTime();

  // call getCurrentTime to set Clock hands every seconds
  setInterval(getCurrentTime, 1000); //1000ms = 1s
}

// Kode JavaScript untuk mengatur logika navbar
function mainPageClock() {
  showGreeting();
  digitalAnalogClock();
  displayDate();
  digitalMode();
  analogClock();
};

mainPageClock();