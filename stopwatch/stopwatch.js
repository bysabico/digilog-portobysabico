// fetch navbar-fitur
fetch('../navbar-fitur/navbar-fitur-digilog.html')
.then(response => response.text())
.then(data => {
    document.getElementById('navbar-container').innerHTML = data;
    setupNavbarFiturLogic();
})
.catch(error => {
    console.error('gagal load navbar-fitur:', error);
});

// fetch date-time
fetch('../reusable-comp/date-time-for-fitur/date-time.html')
.then(response => response.text())
.then(data => {
    document.getElementById('date-time-container').innerHTML = data;
    dateTimeInit();
})
.catch(error => {
    console.error('gagal load date-time:', error);
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

// ===== ELEMENT =====
// DARI FILE HTML
const displayStopwatch = document.getElementById('display-stopwatch'),
      liveLapDiff      = document.getElementById('live-lap-diff'),
      startBtn         = document.getElementById('startBtn'),
      pauseBtn         = document.getElementById('pauseBtn'),
      resetBtn         = document.getElementById('resetBtn'),
      lapBtn           = document.getElementById('lapBtn'),
      lapsList         = document.getElementById('laps'),
      closeModalResult = document.getElementById('closeModalResult'),
      resultsSession   = document.getElementById('lapResults'),
      customStopwatch  = document.getElementsByClassName('custom-stopwatch'),
      notifStopwatch   = document.getElementById('notif-container'),
      lapTableHeader   = document.getElementById('lap-table-header'),
      lapModal         = document.getElementById('lapModal'),
      deskripsiModalDigiStopwatch = document.getElementById('deskripsiModalDigiStopwatch')
;

// ELEMENT MODAL HUB KE BOOTSTRAP
let modal = new bootstrap.Modal(lapModal),
    descDigiStopwatchModal = new bootstrap.Modal(deskripsiModalDigiStopwatch)
;

// sound saat ada data lap
const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
);

// bunyi notifikasi slowest, fastest, dan melewati lap sebelum
const notifSound = new Audio (
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
)

// ELEMEN STATE

// data awal stopwatch sebelum tombol start di klik
let startTime = 0;

// total waktu pemakaian stopwatch
let elapsedTime = 0;

// tampilan stopwatch saat tombol start & reset belum di klik
// null = belum pernah di klik
let startClockTime = null,
    endClockTime = null
;

// ID dari setInterval() untuk menggerakkan stopwatch
// null = belum ada interval aktif
let stopwatchInterval = null,
    autoSaveStopwatch = null
;

// perhitungan data lap
let lastLapTime = 0,
    lastDurationLap = 0,
    lapCount = 0
;

// simpan seluruh data lap dalam bentuk array []
// [] = banyak data yang tersimpan.
let laps = [];

// flags untuk notifikasi lap selama stopwatch masih berjalan
let notifFlags = {
    passedLastLap: false,
    passedFastestLap: false,
    passedSlowestLap: false
};

// === startStopwatch() = gerbang awal seluruh proses jalannya stopwatch ===
function startStopwatch() {

    if (stopwatchInterval) return;

    // untuk kebutuhan resultsSession() biar bisa tau jam berapa user klik start stopwatch
    if (elapsedTime === 0) {
        startClockTime = new Date();
    }
    
    // startTime hitungan mundur dari waktu real dengan elapsedTime (waktu yang sudah berjalan), agar saat pause dan mau resume perhitungan tidak mulai dari 0 lagi.
    startTime = Date.now() - elapsedTime;
    
    stopwatchInterval = setInterval(() => {

        elapsedTime = Date.now() - startTime;
        
        displayTimeStopwatch(elapsedTime);
        checkLapNotif();
        updateLiveLapDiffDisplay();

    }, 50);

    // agar data stopwatch tersimpan di localStorage setiap 1 detik, biar kalau ke refresh ga hilang datanya
    autoSaveStopwatch = setInterval(() => {
        if(stopwatchInterval) saveState();
    },1000)

    displayStopwatch.classList.add('running');
    displayStopwatch.classList.remove('fokus');

    for (let item of customStopwatch) {
        item.classList.add('tampilanSamarStopwatch'); 
    }

    startBtn.classList.add('d-none');
    pauseBtn.classList.remove('d-none');
    lapBtn.disabled = false;

    // simpan state di localStorage, agar saat ter refresh ga hilang datanya
    saveState();
}

// displayTimeStopwatch(elapsedTime) = komando tampilan stopwatch dilayar.
function displayTimeStopwatch(elapsedTime) {
    displayStopwatch.innerHTML = formatTime(elapsedTime);
}

// ===== FORMAT & DISPLAY =====
function formatTime(elapsedTime) {

    // perhitungan waktu detik, menit, jam, dan hari dari total waktu yang sudah berjalan (elapsedTime)
    const secStopwatch = Math.floor(elapsedTime / 1000),
          minStopwatch = Math.floor(secStopwatch / 60),
          hourStopwatch = Math.floor(minStopwatch / 60),
          dayStopwatch = Math.floor(hourStopwatch / 24)
    ;

    // format dasar stopwatch
    let formatStopwatch = `${String(hourStopwatch % 24).padStart(2, '0')}:${String(minStopwatch % 60).padStart(2, '0')}:${String(secStopwatch % 60).padStart(2, '0')}`;
    
    // format stopwatch jika lebih dari 1 hari
    if (dayStopwatch > 0) {
        formatStopwatch = `${String(dayStopwatch).padStart(2, '0')}:${formatStopwatch}`;
    } 

    return formatStopwatch;
}

// untuk menampilkan selisih waktu lap secara real-time saat stopwatch berjalan
function updateLiveLapDiffDisplay() {
    if (laps.length === 0) {
        liveLapDiff.textContent = '';
        return
    }

    const currentLapDuration = elapsedTime - lastLapTime,
          prevLapTime = laps[0].lapTime,
          diffLaps = currentLapDuration - prevLapTime,
          fastestAllLap = Math.min(...laps.map(l => l.lapTime)),
          slowestAllLap = Math.max(...laps.map(l => l.lapTime));
    
    liveLapDiff.textContent = formatTimeForLapDisplay(diffLaps);
    liveLapDiff.classList.remove('text-success', 'text-danger', 'text-warning');
    liveLapDiff.classList.add(
        currentLapDuration < fastestAllLap ? 'text-success' 
        : currentLapDuration > slowestAllLap ? 'text-danger' 
        : 'text-warning');
}

// untuk indikator selisih waktu lap
function formatTimeForLapDisplay(diffLapTime) {
    const sign = diffLapTime > 0 ? '+' : diffLapTime < 0 ? '-' : '';
    return sign + formatTime(Math.abs(diffLapTime));
}

// untuk menampilkan jam saat user klik start dan reset stopwatch
function formatClockTime(date, includeDate = false) {
    if(!date) return '--:--:--';
    
    const timeStart = date.toLocaleTimeString('en-US', {hour12: false});

    if (includeDate) {
        const dateStart = date.toLocaleDateString('en-US', { 
            day: '2-digit',
            year: 'numeric', 
            month: 'short'
        });

        return `${dateStart} ${timeStart}`;

    }

    return timeStart;


}

// notif muncul di layar dan bunyi
function showNotif(message, type='info') {

    const now = new Date(),
          realTime = now.toLocaleTimeString('en-US', {hour12: false}),
          notifElement = document.createElement('div');
    
    notifElement.className = `notif-item notif-${type}`;
    notifElement.innerHTML = `
        <span class="notif-time">${realTime}</span>
        <span class="notif-message">${message}</span>
    `;

    notifStopwatch.appendChild(notifElement);

    notifSound.currentTime = 0;
    notifSound.play();

    setTimeout(() => {
        notifElement.remove();
    }, 5000);

}

// cek notifikasi
function checkLapNotif() {
    if (laps.length === 0) return;

    const currentLapDuration = elapsedTime - lastLapTime,
          lastLap = laps[0].lapTime,
          fastestAllLap = Math.min(...laps.map(l => l.lapTime)),
          slowestAllLap = Math.max(...laps.map(l => l.lapTime));

    if (currentLapDuration > lastLap && !notifFlags.passedLastLap) {
        showNotif('Melewati lap sebelumnya!', 'warning');
        notifFlags.passedLastLap = true;
    }

    if (laps.length >= 2) {
        if (currentLapDuration > slowestAllLap && !notifFlags.passedSlowestLap) {
            showNotif('Melewati slowest!', 'danger');
            notifFlags.passedSlowestLap = true;
        }

        if (currentLapDuration > fastestAllLap && !notifFlags.passedFastestLap) {
            showNotif('Melewati fastest!', 'info');
            notifFlags.passedFastestLap = true;
        }
    }
}

// = PAUSE =
function pauseStopwatch() {

    clearInterval(stopwatchInterval);

    stopwatchInterval = null;

    displayStopwatch.classList.remove('running');
    displayStopwatch.classList.add('fokus');
    for (let item of customStopwatch) { 
        item.classList.remove('tampilanSamarStopwatch'); 
    }

    pauseBtn.classList.add('d-none');
    startBtn.classList.remove('d-none');

    lapBtn.disabled = true;

    saveState();
}

// = RESET =
function resetStopwatch() {

    showResult();

}

// = SHOW RESULT =
function showResult() {
    pauseStopwatch();

    endClockTime = new Date();

    const isDiffDay = startClockTime && endClockTime && startClockTime.toDateString() !== endClockTime.toDateString(),
          dateInfo = isDiffDay ? 
            `<div class='text-secondary small'>    
            
                📅 DATE DURATION: ${startClockTime.toLocaleDateString('en-US', {day:'2-digit', month:'short', year:'numeric'})} 
               - ${endClockTime.toLocaleDateString('en-US', {day:'2-digit', month:'short', year:'numeric'})}
            </div>` : ''
    ;

    if (laps.length === 0) {

        resultsSession.innerHTML = ` 
            <div class="text-center">
                <div class="mb-3 text-muted">Belum ada lap ⏱️</div>
                <div class="fs-4 font-monospace fw-bold">Total Time: ${formatTime(elapsedTime)}</div>
                <div class="mt-3 text-secondary small">     
                    ${dateInfo}
                    Duration: ${formatClockTime(startClockTime)} - ${formatClockTime(endClockTime)}
                </div>
            </div>
        `;
        
        modal.show();

        return; 
    }

    const fastest = laps.reduce((prev, curr) =>

        curr.lapTime < prev.lapTime ? curr : prev

    );

    const slowest = laps.reduce((prev, curr) =>

        curr.lapTime > prev.lapTime ? curr : prev
    );

    resultsSession.innerHTML = `
        <div class="text-center">
            <div class="mb-3 text-success fs-5">
                <span class="fw-bold"> 🟢 Fastest Lap <br> </span>
                #${fastest.id} — ${formatTime(fastest.lapTime)}
            </div>
            
            <br>
            
            <div class="mb-3 text-danger">
                <span class="fw-bold"> 🔴 Slowest Lap <br> </span>
                #${slowest.id} — ${formatTime(slowest.lapTime)}
            </div> 
            
            <br>

            <div class="mb-2 text-secondary">
                Total Lap: ${laps.length}
            </div>

            <div class="mb-2 text-secondary">
                Total Time: ${formatTime(elapsedTime)}
            </div>

            <div class="text-secondary"> 
                ${dateInfo}
                Duration: ${formatClockTime(startClockTime)} - ${formatClockTime(endClockTime)}
            </div>
        </div>
    `;

    modal.show();
}

// = CLOSE MODAL =
function closeLapModal() {
    modal.hide();
    clearSession();
}

function closeDescModal() {
    descDigiStopwatchModal.hide();
}

// = CLEAR SESSION =
function clearSession() {

    clearInterval(stopwatchInterval);
    
    startTime = 0;
    elapsedTime = 0;
    stopwatchInterval = null;

    lastLapTime = 0;
    lastDurationLap = 0;
    lapCount = 0;
    laps = [];

    startClockTime = null;
    endClockTime = null;

    notifFlags = {
        passedLastLap: false,
        passedFastestLap: false,
        passedSlowestLap: false
    }

    localStorage.removeItem('data-stopwatch');

    displayTimeStopwatch(0);

    liveLapDiff.textContent = '';

    displayStopwatch.classList.remove('running', 'fokus');
    for (let item of customStopwatch) { 
        item.classList.remove('tampilanSamarStopwatch'); 
    }

    lapsList.innerHTML = '';
    lapTableHeader.classList.add('d-none');

    startBtn.classList.remove('d-none');
    pauseBtn.classList.add('d-none');
    lapBtn.disabled = true;
}

// = LAP =
function lap() {

    if (!stopwatchInterval) return;

    const currentTime = elapsedTime,

        //   ini variabel menghitung nilai lap.
          lapTime = elapsedTime - lastLapTime
    ;

    lastLapTime = currentTime;

    const fastestAllLap = Math.min(...laps.map(l => l.lapTime));
    const slowestAllLap = Math.max(...laps.map(l => l.lapTime));

    lapCount++;

    laps.unshift({ 
        id: lapCount, 
        lapTime, 
        totalTime: currentTime 
    });

    renderLaps();

    if (lapCount > 1 && lapTime < fastestAllLap) {
        beep.play();
        displayStopwatch.classList.add('glow');
        setTimeout(() => 
            displayStopwatch.classList.remove('glow'), 500
        );
    }

    if (lapCount > 1 && lapTime > slowestAllLap) {
        beep.play();
        displayStopwatch.classList.add('glow-slowest');
        setTimeout(() => displayStopwatch.classList.remove('glow-slowest'), 500);
    }

    notifFlags = {
        passedLastLap: false,
        passedFastestLap: false,
        passedSlowestLap: false
    }

    saveState();

    // cek
    // console.log('lapTime:', lapTime);
    // console.log('lastDurationLap:', lastDurationLap);
    // console.log('lapDiff:', lapDiff);
}

// = RENDER LAPS =
function renderLaps() {
    lapsList.innerHTML = '';

    if (laps.length === 0) {
        lapTableHeader.classList.add('d-none');
        return;
    }; 

    lapTableHeader.classList.remove('d-none');

    // sama kayak di showResult()
    const fastest = laps.reduce((prev, curr) => curr.lapTime < prev.lapTime ? curr : prev);
    const slowest = laps.reduce((prev, curr) => curr.lapTime > prev.lapTime ? curr : prev);

    for (let categoryLap of laps) {

        let lapPackage = '',
            rowClass = '';

        if (categoryLap.lapTime === fastest.lapTime) {

            lapPackage = '<span class="badge">🟢</span>';

            rowClass = 'fastest-lap-row';
            
        } else if (categoryLap.lapTime === slowest.lapTime) {

            lapPackage = '<span class="badge">🔴</span>';

            rowClass = 'slowest-lap-row';

        }

        const trLapsData = document.createElement('tr');
        
        trLapsData.className = rowClass;     
        trLapsData.innerHTML = `
            <td class="text-center">
                <small>
                    ${lapPackage || ' '}
                </small>
            </td>

            <td class="text-center">
                <strong>#${categoryLap.id}</strong>
            </td>

            <td class="text-center">    
                <small>
                    ${formatTime(categoryLap.lapTime)}
                </small>
            </td>

            <td class="text-center">
                <small>
                    ${formatTime(categoryLap.totalTime)}
                </small>
            </td>
        `

        lapsList.appendChild(trLapsData);
    }
}

// = SAVE STATE =
function saveState() {

    localStorage.setItem('data-stopwatch', JSON.stringify ({

        elapsedTime,
        lastLapTime,
        lastDurationLap,
        lapCount,
        laps,
        startClockTime,
        endClockTime,
        running: !!stopwatchInterval,
        notifFlags
    }));
}

// = LOAD STATE =
function loadState() {

    const load = JSON.parse(localStorage.getItem('data-stopwatch'));

    if (!load) {
        renderLaps();
        return;
    };

    elapsedTime = load.elapsedTime;
    lastLapTime = load.lastLapTime;
    lapCount = load.lapCount;
    laps = load.laps || [];

    notifFlags = load.notifFlags || {
        passedLastLap: false,
        passedFastestLap: false,
        passedSlowestLap: false
    };

    startClockTime = load.startClockTime ? new Date(load.startClockTime) : null;
    endClockTime = load.endClockTime ? new Date(load.endClockTime) : null;

    displayTimeStopwatch(elapsedTime);
    renderLaps();

    if (load.running) {

        startStopwatch();

    } else {

        startBtn.classList.remove('d-none');
        pauseBtn.classList.add('d-none');
        lapBtn.disabled = true;

        displayStopwatch.classList.add('fokus');
        displayStopwatch.classList.remove('running');
    }
}

// = EVENT LISTENER =
startBtn.addEventListener('click', startStopwatch);
pauseBtn.addEventListener('click', pauseStopwatch);
resetBtn.addEventListener('click', resetStopwatch);
lapBtn.addEventListener('click', lap);
closeModalResult.addEventListener('click', closeLapModal);


// event listener memakai tombol di keyboard
let resultSessionOpen = false,
    descDigilogOpen = false;

lapModal.addEventListener('shown.bs.modal', () => {
    resultSessionOpen = true;
});
lapModal.addEventListener('hidden.bs.modal', () => {
    resultSessionOpen = false;
});

deskripsiModalDigiStopwatch.addEventListener('shown.bs.modal', () => {
    descDigilogOpen = true;
});
deskripsiModalDigiStopwatch.addEventListener('hidden.bs.modal', () => {
    descDigilogOpen = false;
});

document.addEventListener('keydown', (e) => {

    if (resultSessionOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeLapModal();
        return;
    }

    if (descDigilogOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeDescModal();
        return;
    }

    // space = start & pause
    if (e.code === 'Space') {
        e.preventDefault();
        if (stopwatchInterval) {
            pauseBtn.click();
        } else {
            startBtn.click();
        }
    } 

    // enter = lap
    if (e.code === 'Enter') {
        e.preventDefault();
        lapBtn.click();
    }

    // backspace = reset, modal otomatis show lewat showResult() -> modal.show()
    if (e.code === 'Backspace') {
        e.preventDefault();
        resetBtn.click();
    }
});


// = INIT =
function stopwatchInit() {
    autoActiveNavbar();
    loadState();
}

stopwatchInit();