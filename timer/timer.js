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

// element
const modeBiasaRadio = document.getElementById('mode-timer-biasa'),
      modePomodoroRadio = document.getElementById('mode-timer-pomodoro'),
      namaTimer = document.getElementById('input-nama-timer'),
      sectionModeBiasa = document.getElementById('section-mode-biasa'),
      sectionModePomodoro = document.getElementById('section-mode-pomodoro'),
      durasiJamTimer = document.getElementById('durasi-jam-timer-biasa'),
      durasiMenitTimer = document.getElementById('durasi-menit-timer-biasa'),
      durasiDetikTimer = document.getElementById('durasi-detik-timer-biasa'),

      toggleSettingPomodoroBtn = document.getElementById('toggle-setting-pomodoro-btn'),
      toggleSettingPomodoroIcon = document.getElementById('toggle-setting-pomodoro-icon'),
      pomodoroSettings = document.getElementById('pomodoro-settings'),

      jamPomodoro = document.getElementById('jam-pomodoro'),
      menitPomodoro = document.getElementById('menit-pomodoro'),
      detikPomodoro = document.getElementById('detik-pomodoro'),
      jamIstirahat = document.getElementById('jam-istirahat'),
      menitIstirahat = document.getElementById('menit-istirahat'),
      detikIstirahat = document.getElementById('detik-istirahat'),
      jumlahPengulangan = document.getElementById('jumlah-pengulangan'),
      unlimitedPengulangan = document.getElementById('unlimited-pengulangan'),

      runningTimer = document.getElementById('running-timer'),
      runningTimerName = document.getElementById('running-timer-name'),
      displayTimer = document.getElementById('display-timer'),
      progressBar = document.getElementById('progress-bar'),
      startTimerBtn = document.getElementById('startBtn'),
      pauseTimerBtn = document.getElementById('pauseBtn'),
      resetTimerBtn = document.getElementById('resetBtn'),

      statusText = document.getElementById('status-text'),
      loadingState = document.getElementById('loading-state'),
      resultsEmpty = document.getElementById('results-empty'),
      resultsTimerTable = document.getElementById('results-timer-table'),
      hasilTimer = document.getElementById('hasil-timer'),
      todayDateBadge = document.getElementById('today-date-badge'),
      saveNote = document.getElementById('save-note'),

      triggerModal = document.getElementById('trigger-modal'),
      triggerModalBody = document.getElementById('trigger-modal-body'),
      autoCloseBar = document.getElementById('auto-close-bar'),
      countdownTriggerModal = document.getElementById('countdown-trigger-modal'),
      modalCloseBtn = document.getElementById('modal-close-btn'),
      triggerModalCloseX = document.getElementById('trigger-modal-close-x')
;

let autoCloseTimeout = null,
    autoCloseInterval = null;
const autoCloseSecondTime = 10000;

toggleSettingPomodoroBtn.addEventListener('click', () => {
    const isHidden = pomodoroSettings.classList.contains('d-none');
    pomodoroSettings.classList.toggle('d-none');
    toggleSettingPomodoroIcon.textContent = isHidden ? '^' : 'v';
});

function showTriggerModal(message) {
    triggerModalBody.textContent = message;
    triggerModal.classList.add('show', 'd-block');
    triggerModal.style.backgroundColor = 'rgba(0,0,0,0.6)';

    clearTimeout(autoCloseTimeout);
    clearInterval(autoCloseInterval);

    autoCloseBar.style.transition = 'none';
    autoCloseBar.style.width = '100%';
    void autoCloseBar.offsetWidth;
    requestAnimationFrame(() => {
        autoCloseBar.style.transition = `width ${autoCloseSecondTime}ms linear`;
        autoCloseBar.style.width = '0%';
    });

    let secondLeft = autoCloseSecondTime;
    countdownTriggerModal.textContent = secondLeft;

    autoCloseInterval = setInterval(() => {
        secondLeft--;
        countdownTriggerModal.textContent = Math.max(secondLeft, 0);

        if(secondLeft <= 0) {
            clearInterval(autoCloseInterval);
        }
    }, 1000);

    autoCloseTimeout = setTimeout(() => {
        hideTriggerModal();
    }, autoCloseSecondTime);
}

function hideTriggerModal() {
    clearInterval(autoCloseInterval);
    clearTimeout(autoCloseTimeout);
    triggerModal.classList.remove('show', 'd-block');
    triggerModal.style.backgroundColor = '';
}

modalCloseBtn.addEventListener('click', () => {
    hideTriggerModal();
}); 

triggerModalCloseX.addEventListener('click', () => {
    hideTriggerModal();
});

triggerModal.addEventListener('click', (e) => {
   if(e.target === triggerModal) hideTriggerModal();
});


// STATE
let mode = 'biasa',
    totalSeconds = 0,
    reminingSeconds = 0,
    intervalTimer = null,
    currentName = '',
    currentPhase = null,
    currentRepeat = 1,
    totalRepeat = 1,
    focusDuration = 0,
    breakDuration = 0,
    currentDayKey = null,
    results = []
;

// BTN
modeBiasaRadio.addEventListener('change', () => {
    mode = 'biasa';
    sectionModeBiasa.classList.remove('d-none');
    sectionModePomodoro.classList.add('d-none');
});

modePomodoroRadio.addEventListener('change', () => {
    mode = 'pomodoro';
    sectionModeBiasa.classList.add('d-none');
    sectionModePomodoro.classList.remove('d-none');
});

unlimitedPengulangan.addEventListener('change', () => {
    jumlahPengulangan.disabled = unlimitedPengulangan.checked;
});

function todayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function todayLabel() {
    return new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

function storageKey(dayKey){
    return `timer-results:${dayKey}`
}


async function loadResultsForToday() {
    const key = todayKey();
    currentDayKey = key;
    todayDateBadge.textContent = todayLabel();
    loadingState.classList.remove('d-none');
    resultsEmpty.classList.add('d-none');
    resultsTimerTable.classList.add('d-none');

    try {
        const stored = await window.storage.get(storageKey(key), false);
        results = stored && stored.value ? JSON.parse(stored.value) : [];
    } catch (error) {
        results = [];
    }

    loadingState.classList.add('d-none');
    renderResults();
}

async function saveResults() {
    try {
        const result = await window.storage.set(storageKey(currentDayKey), JSON.stringify(results), false);
        saveNote.classList.toggle('text-danger', !result);
        saveNote.textContent = result ? 'Berhasil disimpan' : 'Gagal disimpan, coba lagi.';
    } catch (error) {
        saveNote.classList.add('text-danger');
        saveNote.textContent = 'Gagal menyimpan data: ' + error.message;
    }
}

function formatRepeat(totalRepeat) {
    return totalRepeat === Infinity ? '∞' : totalRepeat;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function updateDisplayTimer() {
    displayTimer.textContent = formatTime(reminingSeconds);

    const percent = totalSeconds > 0 ? (reminingSeconds / totalSeconds) * 100 : 0;
    progressBar.style.width = `${percent}%`;

    displayTimer.classList.toggle('finished', reminingSeconds <= 0);
    progressBar.classList.toggle('phase-break', currentPhase === 'break');
}

function updateRunningLabel() {
    if (mode === 'pomodoro') {
        const phaseLabel = currentPhase === 'focus' ? 'pomodoro' : 'Istirahat';
        runningTimerName.textContent = `${currentName} - ${phaseLabel} (Pengulangan ${currentRepeat} / ${formatRepeat(totalRepeat)})`;
    } else {
        runningTimerName.textContent = `${currentName}`;
    }
}

async function addResult(name, modeVal, phaseLabel, target, used, status) {
    if (currentDayKey !== todayKey()) {
        await loadResultsForToday();
    }

    const now = new Date();
    results.unshift({
        name,
        mode: modeVal,
        phaseLabel,
        target,
        used,
        status,
        time: now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })

    renderResults();
    await saveResults();
}

function renderResults() {
    if (results.length === 0) {
        resultsEmpty.classList.remove('d-none');
        resultsTimerTable.classList.add('d-none');
        return;
    }

    resultsEmpty.classList.add('d-none');
    resultsTimerTable.classList.remove('d-none');
    hasilTimer.innerHTML = results.map(result => `
        <tr>
            <td>${result.name}</td>
            <td><span class='badge ${result.mode === 'pomodoro' ? 'badge-mode-belajar' : 'badge-mode-biasa'}'>${result.mode}</span></td>
            <td>${result.phaseLabel}</td>
            <td>${result.target}</td>
            <td>${result.used}</td>
            <td><span class='badge ${result.status === 'selesai' ? 'badge-mode-selesai' : 'badge-mode-reset'}'>${result.status}</span></td>
            <td>${result.time}</td>
        </tr>
    `).join('');
}

loadResultsForToday();