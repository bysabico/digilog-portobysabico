// fetch ke file navbar
fetch('../navbar/navbar-digilog.html')
.then(res => res.text())
.then(dataRes => {
    document.getElementById('navbar-container').innerHTML = dataRes;
    setupNavbarLogic();
    mainPageClock();

    // logout di file navbar, kalau klik logout, maka modal logout muncul
    const logoutBtn = document.getElementById('logout'),
          modalLogout = document.getElementById('logoutSayByebye'),
          modalLogoutContent = document.getElementById('content-logoutbyebye'),
          modal = new bootstrap.Modal(modalLogout);

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.show();

        setTimeout(() => {
            modalLogoutContent.classList.add('slide-up');
            setTimeout(() => {
                modal.hide();
                localStorage.clear();
                
                // redirect ke halaman login, di html navbar pakai a href.
                const targetLogout = logoutBtn.getAttribute('href');
                window.location.href = targetLogout;
            }, 600)
        }, 2000)
    })

    if (!logoutBtn) return;
})
.catch(error => {
    console.error('gagal load navbar:', error)
})

// fetch ke file footer
fetch('../footer/footer-digilog.html')
.then(res => res.text())
.then(dataRes => {
    document.getElementById('footer-container').innerHTML = dataRes;
})
.catch(error => {
    console.error('gagal load footer:', error)
})

// jika tidak klik remember-me box = balik ke halaman login.
const remembered = localStorage.getItem('username-or-anonim'),
      loginOnce = sessionStorage.getItem('login-once');

if (!remembered && !loginOnce) {
    window.location.href = '../login/login-digilog.html';
}

if (loginOnce) {
    sessionStorage.clear();
}

// menampilkan greeting / sapaan
const usernameInputed = localStorage.getItem('username-or-anonim') ||
                        sessionStorage.getItem('username-or-anonim') ||
                        'HOOMAN',
    greeting = document.getElementById('greeting'),
    now = new Date(),
    hour = now.getHours();

function showGreeting() {

    // kurang dari 12 = pagi
    if (hour < 12) {
        greeting.innerHTML = `Selamat Pagi, ${usernameInputed}`;
    } 
    // 12 - 14 = siang
    else if (hour >= 12 && hour <= 14) {
        greeting.innerHTML = `Selamat Siang, ${usernameInputed}`;
    } 
    // 14 - 18 kurang = sore
    else if (hour >= 14 && hour < 18) {
        greeting.innerHTML = `Selamat Sore, ${usernameInputed}`;
    } 
    // lebih dari 18 = malam
    else {
        greeting.innerHTML = `Selamat Malam, ${usernameInputed}`;
    }

    // huruf kapital semua
    greeting.innerHTML = greeting.innerHTML.toUpperCase();

    // munculin greeting
    window.addEventListener('load', showGreeting);
}

// menampilkan jam yg terhubung dengan navbar
const digitalClock = document.getElementById('digital-clock'),
      analogClock = document.getElementById('analog-clock');

function digitalAnalogClock() {

    // var di navbar-digilog.html harus di dalam func kalau tidak hasilnya null + error
    const digitalBtn = document.getElementById('digitalBtn'),
          analogBtn = document.getElementById('analogBtn');

    // kalau button belum ada
    if (!digitalBtn || !analogBtn || !digitalClock || !analogClock) return;

    // var untuk menyimpan mode jam biar kalau ke refresh ga berubah / tampilan tetap
    // default = digital
    const savedMode = localStorage.getItem('clock-mode') || 'show-digital';

    // default saveMode = tampilan digital
    if(savedMode === 'show-digital') {
        digitalClock.classList.remove('d-none');
        analogClock.classList.add('d-none');
    }
    // tapi kalau di navbar klik analog, saveMode = tampilan analog
    else {
        analogClock.classList.remove('d-none');
        digitalClock.classList.add('d-none');
    }

    // digital mode = digital-clock
    digitalBtn.addEventListener('click', () => {
        analogClock.classList.remove('d-none');
        digitalClock.classList.add('d-none');
        localStorage.setItem('clock-mode', 'show-analog');
    });

    // analog mode = analog-clock
    analogBtn.addEventListener('click', () => {
        digitalClock.classList.remove('d-none');
        analogClock.classList.add('d-none');
        localStorage.setItem('clock-mode', 'show-digital');
    });
}

// menampilkan tanggal
const displayDate = document.getElementById('date');

function displayDateNow() {
    setInterval(() => {
        // now harus ditulis disini agar tanggal berubah setiap harinya.
        const now = new Date(),
              day = now.toLocaleDateString('id-ID', { weekday: 'long' }),
              date = now.getDate(),
              month = now.toLocaleDateString('id-ID', { month: 'short' }),
              year = now.getFullYear();
        
        displayDate.innerHTML = `${day}, ${date} ${month} ${year}`;
    }, 1000);
}

// menampilkan flatpickr
const fp = flatpickr("#seeCalendar", {
    // default date = hari ini
    defaultDate: "today",
    // max date = hari ini (jadi ga bisa pilih tanggal masa depan)
    maxDate: "today",
    // disable pilih tanggal
    clickOpens: false,
    // disable pilih tahun
    onReady: function(_, __, instance) {
        const yearEl = instance.currentYearElement;
        if (!yearEl) return;
        yearEl.style.cursor = "pointer";
        yearEl.addEventListener("click", () => {
            showYearPicker(instance);
        });
    },
    // set tanggal hari ini ketika close
    onClose: function(_, __, instance) {
        const today = new Date(),
              grid = instance.calendarContainer.querySelector(".year-grid"),
              days = instance.calendarContainer.querySelector(".flatpickr-days"),
              weekdays = instance.calendarContainer.querySelector('.flatpickr-weekdays');

        // hapus grid tahun
        if (grid) grid.remove();

        // tampilkan flatpickr-days dan flatpickr-weekdays lagi saat flatpickr tahun diklik
        if(days) days.style.display = '';
        if(weekdays) weekdays.style.display = '';


        requestAnimationFrame(() => {
            instance.setDate(today, true);
            instance.jumpToDate(today);
        });
    }
});

// kalau klik tampilan tanggal = flatpickr kebuka.
displayDate.addEventListener("click", () => {
    fp.open();
});

// tampilan tahun di flatpickr
function showYearPicker(instance) {

    const container = instance.calendarContainer,
          days = container.querySelector('.flatpickr-days'),
          weekdays = container.querySelector('.flatpickr-weekdays');
    
    // sembunyikan flatpickr days
    days.style.display = 'none';
    if(weekdays) weekdays.style.display = 'none';

    if (container.querySelector(".year-grid")) return;

    // bikin grid tahun flatpickr
    const grid = document.createElement("div");
    grid.className = "year-grid";

    const now = new Date().getFullYear();

    // buat tahun flatpickr
    for (let yearFp = now - 12; yearFp <= now; yearFp++) {
        const item = document.createElement("div");
        item.textContent = yearFp;
        item.className = "year-item";
        item.onclick = () => {
            instance.changeYear(yearFp);
            grid.remove();

            // display days diubah jadi tahun
            days.style.display = "";
        };
        grid.appendChild(item);
    }
    container.appendChild(grid);
}

// tombol close flatpickr
if (fp.calendarContainer) {

    // buat html closenya
    fp.calendarContainer.insertAdjacentHTML("beforeend", '<span class="flatpickr-close">✖</span>');

    // klik tombol close = close
    const closeBtn = fp.calendarContainer.querySelector(".flatpickr-close");
    closeBtn.addEventListener("click", () => {
        fp.close();
    });
}

// jam digital
function digitalMode() {
    const btn12 = document.getElementById('btn12'),
          btn24 = document.getElementById('btn24');

    if(!btn12 || !btn24) return;

    // default saveFormat = 12
    const savedFormat = localStorage.getItem('time-format') || '12';
    let use24HourFormat = savedFormat === '24';

    if (use24HourFormat) {
        btn24.classList.add('active');
    } else {
        btn12.classList.add('active');
    }

    btn12.addEventListener('click', () => {
        btn12.classList.add('active');
        btn24.classList.remove('active');

        use24HourFormat = false;
        localStorage.setItem('time-format', '12');
    });

    btn24.addEventListener('click', () => {
        btn24.classList.add('active');
        btn12.classList.remove('active');

        use24HourFormat = true;
        localStorage.setItem('time-format', '24');
    });

    // tampilan jam digital
    setInterval(() => {
        let now = new Date(),
            h = now.getHours(),
            m = now.getMinutes(),
            s = now.getSeconds(),
            ampm = "AM";

        if (!use24HourFormat) {
            if (h >= 12) {
                ampm = "PM";
                h = h > 12 ? h - 12 : h;
            }
            h = h === 0 ? 12 : h;
        }

        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;

        digitalClock.innerHTML = use24HourFormat
            ? `${h}:${m}:${s}`
            : `${h}:${m}:${s} ${ampm}`;
    }, 1000);
}

// jam analog
function analogMode() {
    const numberHours = document.querySelector('.number-hours'),
          barSeconds = document.querySelector('.bar-seconds'),
          numberElement = [],
          barElement = [];

    for (let i = 1; i <= 12; i++) {
        numberElement.push(`<span style="--indeks:${i};"><p>${i}</p></span>`);
    }
    numberHours.insertAdjacentHTML("afterbegin", numberElement.join(''));

    for (let i = 1; i <= 60; i++) {
        barElement.push(`<span style="--indeks:${i};"><p></p></span>`);
    }

    barSeconds.insertAdjacentHTML("afterbegin", barElement.join(''));

    const handHours = document.querySelector('.hand.hours'),
          handMinutes = document.querySelector('.hand.minutes'),
          handSeconds = document.querySelector('.hand.seconds');

    setInterval(() => {
        let now = new Date(),
            currentHours = now.getHours(),
            currentMinutes = now.getMinutes(),
            currentSeconds = now.getSeconds();

        // putaran jam
        handHours.style.transform = `rotate(${currentHours * 30 + currentMinutes / 2}deg)`;

        // putaran menit
        handMinutes.style.transform = `rotate(${currentMinutes * 6}deg)`;

        // putaran detik
        handSeconds.style.transform = `rotate(${currentSeconds * 6}deg)`;
    }, 1000)
}

function mainPageClock() {
    showGreeting();
    digitalAnalogClock();
    displayDateNow();
    digitalMode();
    analogMode();
};