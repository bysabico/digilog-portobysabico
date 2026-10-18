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
const inputsSection = document.getElementById('inputs-section'),
      modeBiasaRadio = document.getElementById('mode-timer-biasa'),
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
      resultsEmpty = document.getElementById('results-empty'),
      resultsTimerTable = document.getElementById('results-timer-table'),
      hasilTimer = document.getElementById('hasil-timer'),
      saveNote = document.getElementById('save-note'),

      triggerModal = document.getElementById('trigger-modal'),
      triggerModalBody = document.getElementById('trigger-modal-body'),
      autoCloseBar = document.getElementById('auto-close-bar'),
      countdownTriggerModal = document.getElementById('countdown-trigger-modal'),
      modalCloseBtn = document.getElementById('modal-close-btn'),
      triggerModalCloseX = document.getElementById('trigger-modal-close-x'),

      headerReport = document.getElementById('header-report'),
      timerTitle = document.getElementById('timer-title'),
      inputNamaSesi = document.getElementById('input-nama-sesi'),

      totalTimerBadge = document.getElementById('total-timer-badge'),
      breakdownModal = document.getElementById('breakdown-modal'),
      breakdownTotal = document.getElementById('breakdown-total'),
      breakdownSelesai = document.getElementById('breakdown-selesai'),
      breakdownReset = document.getElementById('breakdown-reset'),

      sectionDivider = document.getElementById('section-divider'),

      endTimeText = document.getElementById('end-time-text'),

      breakdownPause = document.getElementById('breakdown-pause'),
      extraInfoPanel = document.getElementById('extra-info-panel'),
      infoToggleBtn = document.getElementById('info-toggle-btn'),
      breakdownModeTimer = document.getElementById('breakdown-mode-timer'),
      breakdownModePomodoro = document.getElementById('breakdown-mode-pomodoro'),

      extendModalEl = document.getElementById('extend-modal'),
      extendModalTitle = document.getElementById('extend-modal-title'),
      extendCountdownText = document.getElementById('countdown-extend-modal'),
      extendAutoBar = document.getElementById('extend-auto-bar'),
      extendSkipBtn = document.getElementById('extend-skip-btn'),

      extendToggle = document.getElementById('extend-toggle'),
      extendQuestion = document.getElementById('extend-question'),
      extendOptionsBox = document.getElementById('extend-options'),

      extendToggleLabel = document.getElementById('extend-toggle-label'),

      phaseTicker = document.getElementById('phase-ticker'),
      tickerTrack = document.getElementById('ticker-track'),
      tickerText = document.getElementById('ticker-text'),

      dailyReportEl = document.getElementById('daily-report-modal'),
      dailyReportWhen = document.getElementById('daily-report-when'),
      dailyReportDate = document.getElementById('daily-report-date'),
      dailyReportBody = document.getElementById('daily-report-body'),

      lastReportWrap = document.getElementById('last-report-wrap'),
      lastReportBtn = document.getElementById('last-report-btn'),
      lastReportLabel = document.getElementById('last-report-label')
;

let autoCloseTimeout = null,
    autoCloseInterval = null,
    endTimestamp = null,
    pauseDisplayInterval = null,
    pauseStartTimestamp = null
;


let totalPausedMs = 0;

let endPreviewOn = false,
    endPreviewShown = false
;

let sessionWasPaused = false;
let sessionStartTimestamp = null;

const extendModal = new bootstrap.Modal(extendModalEl);
const extendWaitSeconds = 15;
const alarmSeconds = 5;

const tickerSec = 60;
let tickerShown = false;

let extendCountdownInterval = null,
    pendingFinishTs = null,
    alarmOscillators = [];

const autoCloseSecondTime = 10000;

toggleSettingPomodoroBtn.addEventListener('click', () => {
    const isHidden = pomodoroSettings.classList.contains('d-none');
    pomodoroSettings.classList.toggle('d-none');
    toggleSettingPomodoroIcon.className = isHidden ? 'fa-solid fa-caret-up' : 'fa-solid fa-caret-down';
});

function showTriggerModal(message) {
    triggerModalBody.textContent = message;
    triggerModal.classList.add('show', 'd-block');
    triggerModal.style.backgroundColor = 'rgba(0,0,0,0.6)';

    clearTimeout(autoCloseTimeout);
    clearInterval(autoCloseInterval);

    const totalSecond = autoCloseSecondTime / 1000;
    let secondLeft = totalSecond;

    autoCloseBar.style.transition = 'none';
    autoCloseBar.style.width = '100%';
    countdownTriggerModal.textContent = secondLeft;

    autoCloseInterval = setInterval(() => {
        secondLeft--;
        countdownTriggerModal.textContent = Math.max(secondLeft, 0);

        const percent = (Math.max(secondLeft, 0) / totalSecond) * 100;
        autoCloseBar.style.width = `${percent}%`;

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

// worker buat detak timer, supaya tetap jalan walau tab di background
const timerWorkerCode = `
    let id = null;
    onmessage = (e) => {
        if (e.data === 'start') {
            clearInterval(id);
            id = setInterval(() => postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
            clearInterval(id);
            id = null;
        }
    };
`;

const timerWorker = new Worker(
    URL.createObjectURL(new Blob([timerWorkerCode], { type: 'application/javascript' }))
);
timerWorker.onmessage = () => tick();

function startTicking() {
    timerWorker.postMessage('start');
    intervalTimer = true; 
}

function stopTicking() {
    timerWorker.postMessage('stop');
    intervalTimer = null;
}

// STATE FOR AUDIO
let audioCtx = null;
function getAudioCtx() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.AudioContext)();
    }
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playBeep(frequency, duration, volume = 0.15, type = 'sine', delay = 0) {
    try {
        const ctx = getAudioCtx(),
              oscillator = ctx.createOscillator(),
              gainNode = ctx.createGain(),
              startAt = ctx.currentTime + delay;

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(volume, startAt);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(startAt);

        gainNode.gain.exponentialRampToValueAtTime(0.00001, startAt + duration);
        oscillator.stop(startAt + duration);
    } catch (error) {
        // kalau error = diem
    }
}

function playTimerSound() {
    playAlarmLoop(alarmSeconds);
}

// bunyi detik terakhir sebelum timer habis
function playTickSound() {
    playBeep(1000, 0.1, 0.1, 'square');
}

// bunyi papan info sebelum istirahat habis (ticker)    
function playTickerChime() {
    playBeep(880, 0.25, 0.25, 'sine', 0);
    playBeep(1175, 0.35, 0.25, 'sine', 0.3);
}

// BTN
modeBiasaRadio.addEventListener('change', () => {
    mode = 'biasa';
    sectionModeBiasa.classList.remove('d-none');
    sectionModePomodoro.classList.add('d-none');
    timerTitle.textContent = 'TIMER';

    inputNamaSesi.textContent = 'NAMA TIMER';
    namaTimer.placeholder = 'Meeting, Belajar, dan lainnya...';

    extendToggleLabel.textContent = 'Tambah waktu';

    renderNameSuggestions();
    presetHint.classList.add('d-none');
    namaTimer.focus();

    updateEndPreview();
});

modePomodoroRadio.addEventListener('change', () => {
    mode = 'pomodoro';
    sectionModeBiasa.classList.add('d-none');
    sectionModePomodoro.classList.remove('d-none');
    timerTitle.textContent = 'POMODORO';

    inputNamaSesi.textContent = 'NAMA TASK';
    namaTimer.placeholder = 'Belajar, Coding, dan lainnya...';

    extendToggleLabel.textContent = 'Tambah siklus';

    renderNameSuggestions();
    presetHint.classList.add('d-none');
    namaTimer.focus();

    updateEndPreview();
});

unlimitedPengulangan.addEventListener('change', () => {
    jumlahPengulangan.disabled = unlimitedPengulangan.checked;
});

function todayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function storageKey(dayKey){
    return `timer-results:${dayKey}`
}

// pratinjau end time saat isi durasi
function previewClock(sec) {
    const end = new Date(Date.now() + sec * 1000);

    const startOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          dayDiff = Math.round((startOf(end) - startOf(new Date())) / 86400000),
          suffix = dayDiff === 0 ? '' : dayDiff === 1 ? ' (besok)' : ` (+${dayDiff} hari)`
    ;
    
    return formatClockTime(end) + suffix;
}

function updateEndPreview() {
    if (!endPreviewOn || inputsSection.classList.contains('d-none')) return;

    let text = '';

    if (mode === 'biasa') {
        const dur = toSec(durasiJamTimer.value, durasiMenitTimer.value, durasiDetikTimer.value);
        if (dur > 0) text = `Jika Start sekarang, selesai pada ${previewClock(dur)}`;
    } else {
        const focus = toSec(jamPomodoro.value, menitPomodoro.value, detikPomodoro.value),
              rest = toSec(jamIstirahat.value, menitIstirahat.value, detikIstirahat.value),
              repeat = parseInt(jumlahPengulangan.value, 10);

        if (focus > 0) {
            text = `Fokus pertama selesai pada ${previewClock(focus)}`;
            if (!unlimitedPengulangan.checked && repeat > 0 && rest > 0) {
                text += ` · semua siklus selesai pada ${previewClock(repeat * (focus + rest))}`;
            }
        }
    }

    if (text) {
        statusText.textContent = text;
        endPreviewShown = true;
    } else if (endPreviewShown) {
        statusText.textContent = '';
        endPreviewShown = false;
    }
}

[durasiJamTimer, durasiMenitTimer, durasiDetikTimer,
 jamPomodoro, menitPomodoro, detikPomodoro,
 jamIstirahat, menitIstirahat, detikIstirahat,
 jumlahPengulangan].forEach(el => {
    el.addEventListener('input', () => {
        endPreviewOn = true;
        updateEndPreview();
    });
});

unlimitedPengulangan.addEventListener('change', () => {
    endPreviewOn = true;
    updateEndPreview();
});

setInterval(updateEndPreview, 1000);

// results
async function loadResultsForToday() {
    const key = todayKey();
    currentDayKey = key;

    try {
        const stored = localStorage.getItem(storageKey(key));
        results = stored ? JSON.parse(stored) : [];
    } catch (error) {
        results = [];
    }

    renderResults();
}

async function saveResults() {
    try {
        localStorage.setItem(storageKey(currentDayKey), JSON.stringify(results));
        saveNote.classList.remove('text-danger');
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

function formatTotalTime(totalSec) {
    const h = Math.floor(totalSec / 3600),
          m = Math.floor((totalSec % 3600) / 60),
          s = totalSec % 60;

    const parts = [];
    if (h) parts.push(`${h} jam`);
    if (m) parts.push(`${m} menit`);
    if (s || parts.length === 0) parts.push(`${s} detik`);
    return parts.join(' ');
}

// hitung warna nama sesi semakin nyata saat waktunya udh mau selesai
function getNameOpacity(percent) {
    const minOpacity = 0.35;
    return minOpacity + (1 - percent / 100) * (1 - minOpacity);
}

function getNameScale(percent) {
    const minScale = 1;
    const maxScale = 1.15;
    return minScale + (1 - percent / 100) * (maxScale - minScale);
}

// hitung warna berdasarkan sisa persentase waktu (100% = hijau, 0% = merah)
function getTimerColor(percent) {
    let r, g, b = 0;

    if (percent > 50) {
        // hijau (34, 197, 94) -> kuning (250, 204, 21)
        const t = (100 - percent) / 50;
        r = Math.round(34 + t * (250 - 34));
        g = Math.round(197 + t * (204 - 197));
        b = Math.round(94 + t * (21 - 94));
    } else {
        // kuning (250, 204, 21) -> merah (239, 68, 68)
        const t = (50 - percent) / 50;
        r = Math.round(250 + t * (239 - 250));
        g = Math.round(204 + t * (68 - 204));
        b = Math.round(21 + t * (68 - 21));
    }

    return `rgb(${r}, ${g}, ${b})`;
}

function fitTimerDisplay() {
    displayTimer.style.removeProperty('font-size');
    const maxW = displayTimer.clientWidth;
    if (!maxW) return;
    const curW = displayTimer.scrollWidth;
    if (curW > maxW) {
        const base = parseFloat(getComputedStyle(displayTimer).fontSize);
        displayTimer.style.setProperty('font-size', `${base * maxW / curW}px`, 'important');
    }
}

window.addEventListener('resize', fitTimerDisplay);

function updateDisplayTimer() {
    displayTimer.textContent = formatTime(reminingSeconds);

    fitTimerDisplay();

    const percent = totalSeconds > 0 ? (reminingSeconds / totalSeconds) * 100 : 0;

    // pas istirahat, warnanya dibalik: awal merah -> akhir hijau
    const colorPercent = currentPhase === 'break' ? (100 - percent) : percent;
    const color = getTimerColor(colorPercent);

    progressBar.style.width = `${percent}%`;
    progressBar.style.backgroundColor = color;
    displayTimer.style.color = color;

    runningTimerName.style.opacity = getNameOpacity(percent);
    runningTimerName.style.transform = `scale(${getNameScale(percent)})`;

    displayTimer.classList.toggle('finished', reminingSeconds <= 0);
    progressBar.classList.toggle('phase-break', currentPhase === 'break');

    updateTicker();
}

function updateRunningLabel() {
    if (mode === 'pomodoro') {
        const phaseLabel = currentPhase === 'fokus' ? 'POMODORO' : 'ISTIRAHAT';
        runningTimerName.innerHTML = ` ${phaseLabel}  

        <br>

        ${currentName} (${currentRepeat} / ${formatRepeat(totalRepeat)})`;
    } else {
        runningTimerName.textContent = `${currentName}`;
    }
}

async function addResult(name, modeVal, phaseLabel, target, used, status, finishedAt = Date.now()) {
    if (currentDayKey !== todayKey()) {
        await loadResultsForToday();
    }

    const pausedMs = totalPausedMs + (pauseStartTimestamp ? Date.now() - pauseStartTimestamp : 0);
    const now = new Date();

    results.unshift({
        name,
        mode: modeVal,
        phaseLabel,
        target,
        used,
        status,
        time: formatClockTime(sessionStartTimestamp || now),
        endTime: formatClockTime(finishedAt),
        wasPaused: sessionWasPaused,
        pausedSeconds: Math.round(pausedMs / 1000),
    })

    renderResults();
    await saveResults();
}

function renderResults() {
    if (results.length === 0) {
        resultsEmpty.classList.remove('d-none');
        resultsTimerTable.classList.add('d-none');
        headerReport.classList.add('d-none');
        saveNote.classList.add('d-none');
        return;
    }

    resultsEmpty.classList.add('d-none');
    resultsTimerTable.classList.remove('d-none');
    headerReport.classList.remove('d-none');
    saveNote.classList.remove('d-none');

    sectionDivider.classList.remove('d-none');

    totalTimerBadge.textContent = `${results.length} sesi`;

    hasilTimer.innerHTML = results.map((result, index) => `
        <tr>
            <td>${results.length - index}</td>
            <td>${result.wasPaused ? '⏸ ' : ''}${result.name}</td>
            <td class="d-none d-md-table-cell"><span class='badge ${String(result.mode).toLowerCase() === 'pomodoro' ? 'badge-mode-belajar' : 'badge-mode-biasa'}'>${result.mode}</span></td>
            <td class="d-none d-md-table-cell">${result.phaseLabel}</td>
            <td class="d-none d-md-table-cell">${formatTime(result.target)}</td>
            <td>
                ${formatTime(result.used + (result.pausedSeconds || 0))}
            </td>
            <td><span class='badge ${result.status === 'Selesai' ? 'badge-status-selesai' : 'badge-status-reset'}'>${result.status}</span></td>
            <td class="d-none d-md-table-cell">${result.time}</td>
            <td class="d-none d-md-table-cell">${result.endTime || '-'}</td>
        </tr>
    `).join('');
}

hasilTimer.addEventListener('click', (e) => {
    const btn = e.target.closest('.replay-btn');
    if (!btn) return;
});
 
function resetTampilan() {
    inputsSection.classList.remove('d-none');
    runningTimer.classList.add('d-none');
    runningTimerName.classList.add('d-none');
    startTimerBtn.classList.remove('d-none');
    pauseTimerBtn.classList.add('d-none');
    resetTimerBtn.classList.add('d-none');

    if(mode === 'pomodoro') {
        pomodoroSettings.classList.remove('d-none');
        toggleSettingPomodoroIcon.className = 'fa-solid fa-caret-up';
    }
    namaTimer.disabled = false;
    durasiJamTimer.disabled = false;
    durasiMenitTimer.disabled = false;
    durasiDetikTimer.disabled = false;
    
    jamPomodoro.disabled = false;
    menitPomodoro.disabled = false;
    detikPomodoro.disabled = false;
    jamIstirahat.disabled = false;
    menitIstirahat.disabled = false;
    detikIstirahat.disabled = false;

    jumlahPengulangan.disabled = unlimitedPengulangan.checked;
    unlimitedPengulangan.disabled = false;
    modeBiasaRadio.disabled = false;
    modePomodoroRadio.disabled = false;
    currentPhase = null;
    endTimestamp = null;

    pauseTimerBtn.disabled = false;
    resetTimerBtn.disabled = false;

    endPreviewOn = false;
    endPreviewShown = false;

    clearActiveSession();
    stopTicking();
    hideTicker();
    namaTimer.focus();
    runningTimer.classList.remove('is-paused');
    setPauseButtonState(false);
}

function setPauseButtonState(isPaused) {
    pauseTimerBtn.classList.toggle('btn-warning', !isPaused);
    pauseTimerBtn.classList.toggle('btn-success', isPaused);
    pauseTimerBtn.innerHTML = isPaused
        ? `<i class="fa-solid fa-play d-inline d-md-none"></i>
           <span class="d-none d-md-inline">RESUME</span>`
        : `<i class="fa-solid fa-pause d-inline d-md-none"></i>
           <span class="d-none d-md-inline">PAUSE</span>`;
}

function startTimerInterval() {
    getAudioCtx();
    sessionWasPaused = false;
    sessionStartTimestamp = Date.now();
    totalPausedMs = 0;
    pauseStartTimestamp = null;
    updateDisplayTimer();
    updateRunningLabel();
    endPreviewOn = false;
    endPreviewShown = false;
    statusText.innerHTML = 'Starting <span class="dot">.</span><span class="dot"> .</span><span class="dot"> .</span>';

    startTicking();
    saveActiveSession();
}

async function tick() {
    if (!intervalTimer) return;

    reminingSeconds = Math.max(0, Math.round((endTimestamp - Date.now()) / 1000));

    if (reminingSeconds > 0) {
        updateDisplayTimer();
        if (reminingSeconds <= 10) {
            playTickSound();
        }
        return;
    }

    stopTicking();

    // ===== MODE TIMER =====
    if (mode === 'biasa') {
        if (extendToggle.checked) {
            showExtendPrompt();
            return;
        }
        playTimerSound();
        await addResult(currentName, 'Timer', '-', totalSeconds, totalSeconds, 'Selesai');
        statusText.textContent = `Timer "${currentName}" selesai!`;
        resetTampilan();
        return;
    }

    // ===== MODE POMODORO =====
    const phaseLabel = currentPhase === 'fokus' ? 'Pomodoro' : 'Istirahat';
    const isFinalPhase = currentPhase === 'break' && currentRepeat >= totalRepeat;
    const askExtend = isFinalPhase && extendToggle.checked;

    if (!askExtend) playTimerSound();
    await addResult(currentName, 'Pomodoro', phaseLabel, totalSeconds, totalSeconds, 'Selesai');

    if (currentPhase === 'fokus') {
        // selesai fokus -> istirahat
        currentPhase = 'break';
        totalSeconds = breakDuration;
        reminingSeconds = breakDuration;
        statusText.textContent = `Waktunya istirahat, (${currentRepeat}/${formatRepeat(totalRepeat)})`;
        endTimeText.textContent = `Selesai pada ${calculateEndTime(totalSeconds)}`;
        startTimerInterval();
    } else if (currentRepeat < totalRepeat) {
        // selesai istirahat, masih ada siklus berikutnya
        currentRepeat++;
        currentPhase = 'fokus';
        totalSeconds = focusDuration;
        reminingSeconds = focusDuration;
        statusText.textContent = `Waktunya belajar, (${currentRepeat}/${formatRepeat(totalRepeat)})`;
        endTimeText.textContent = `Selesai pada ${calculateEndTime(totalSeconds)}`;
        startTimerInterval();
    } else if (askExtend) {
        // siklus terakhir habis tp extended
        showExtendPrompt();
    } else {
        statusText.textContent = `${formatRepeat(totalRepeat)} siklus belajar selesai!`;
        resetTampilan();
    }
}

// papan informasi
function tickerMessage() {

    if(mode === 'biasa') {
        return 'Timer segera selesai. Siap-siap, konfirmasi tambah waktu!';
    }

    if(currentPhase === 'fokus') {
        return `Fokus segera selesai. Sebentar lagi istirahat!`;
    }

    if(currentRepeat >= totalRepeat) {
       return 'Istirahat terakhir hampir selesai. Semua siklus segera tuntas! >.<';
    }

    return `Istirahat segera selesai. Sebentar lagi masuk ke siklus ${currentRepeat + 1}!`;
}

function hideTicker() {
    phaseTicker.classList.add('d-none');
    tickerShown = false;
}

function updateTicker() {
    const tickerActive = mode === 'pomodoro' || (mode === 'biasa' && extendToggle.checked)
    const shouldShow = tickerActive && totalSeconds > tickerSec && reminingSeconds > 0 && reminingSeconds <= tickerSec;

    if(shouldShow && !tickerShown) {
        const msg = tickerMessage();
        tickerText.innerHTML = `⏳ <span class="ticker-count" id="ticker-count"></span> lagi, ${msg}`;
        tickerTrack.style.animationDuration = `${Math.max(10, msg.length * 0.2)}s`;
        phaseTicker.classList.remove('d-none');
        tickerShown = true;
        playTickerChime();
    } else if (!shouldShow && tickerShown) {
        hideTicker();
    }

    if (tickerShown) {
        const count = document.getElementById('ticker-count');
        if (count) {
            count.textContent = formatTime(reminingSeconds);
            count.classList.toggle('urgent', reminingSeconds <= 10);
        }
    }
}

// end time
function formatClockTime(timestamp) {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function calculateEndTime(durationInSeconds) {
    endTimestamp = Date.now() + durationInSeconds * 1000;
    return formatClockTime(endTimestamp);
}

function updateEndTimeLive() {
    const projectedEnd = Date.now() + reminingSeconds * 1000;
    endTimeText.textContent = `Perkiraan selesai ${formatClockTime(projectedEnd)}`;
}

// toggle extended
extendToggle.checked = localStorage.getItem('timer-extend-enabled') === 'true';
extendToggle.addEventListener('change', () => {
    localStorage.setItem('timer-extend-enabled', extendToggle.checked);
    extendToggle.blur(); 
})

const extendOptions = {
    biasa: {
        question: 'Mau tambah waktu?',
        items: [
            { label: '+30s', value: 30 },
            { label: '+1min', value: 60 },
            { label: '+5min', value: 300 },
            { label: '+15min', value: 900 },
            { label: '+30min', value: 1800 }
        ]
    },
    pomodoro: {
        question: 'Mau tambah siklus?',
        items: [
            { label: '+1 siklus', value: 1 },
            { label: '+2 siklus', value: 2 },
            { label: '+3 siklus', value: 3 },
            { label: '+4 siklus', value: 4 },
            { label: '+5 siklus', value: 5 }
        ]
    }
};

function renderExtendOptions() {
    const cfg = extendOptions[mode];
    extendQuestion.textContent = cfg.question;
    extendOptionsBox.innerHTML = cfg.items.map(item =>
        `<button type="button" class="btn btn-outline-info extend-btn" data-value="${item.value}">${item.label}</button>`
    ).join('');
}

extendOptionsBox.addEventListener('click', (e) => {
    const btn = e.target.closest('.extend-btn');
    if (!btn) return;
    const value = parseInt(btn.dataset.value, 10);
    if (mode === 'biasa') extendSession(value);
    else extendCycles(value);
});

function playAlarmLoop(durationSeconds = 15) {
    stopAlarm();
    try {
        const ctx = getAudioCtx();
        for (let i = 0; i * 0.5 < durationSeconds; i++) {
            const startAt = ctx.currentTime + i * 0.5,
                  osc = ctx.createOscillator(),
                  gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = i % 2 === 0 ? 1046 : 784;
            gain.gain.setValueAtTime(0.35, startAt);
            gain.gain.exponentialRampToValueAtTime(0.00001, startAt + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startAt);
            osc.stop(startAt + 0.45);
            alarmOscillators.push(osc);
        }
    } catch (error) {
        // kalau error = diem
    }
}

function stopAlarm() {
    alarmOscillators.forEach(osc => {
        try { osc.stop(); } catch (error) { 
            /* sudah berhenti */ 
        }
    });
    alarmOscillators = [];
}

function closeExtendPrompt() {
    clearInterval(extendCountdownInterval);
    extendCountdownInterval = null;
    stopAlarm();
    extendModal.hide();
}

// tambah waktu (mode Timer)
function extendSession(extraSeconds) {
    if (pendingFinishTs === null) return;
    pendingFinishTs = null;
    closeExtendPrompt();

    totalSeconds += extraSeconds;
    reminingSeconds = extraSeconds;

    endTimeText.textContent = `Selesai pada ${calculateEndTime(reminingSeconds)}`;
    statusText.innerHTML = 'Starting <span class="dot">.</span><span class="dot"> .</span><span class="dot"> .</span>';
    pauseTimerBtn.disabled = false;
    resetTimerBtn.disabled = false;

    updateDisplayTimer();
    startTicking();
    saveActiveSession();
}

extendSkipBtn.addEventListener('click', finishSession);

function showExtendPrompt() {
    if (mode === 'pomodoro') clearActiveSession();
    pendingFinishTs = endTimestamp || Date.now();

    updateDisplayTimer();
    endTimeText.textContent = '';
    statusText.textContent = mode === 'biasa'
        ? `Timer "${currentName}" selesai!`
        : `Semua ${formatRepeat(totalRepeat)} siklus selesai!`;
    pauseTimerBtn.disabled = true;
    resetTimerBtn.disabled = true;

    bootstrap.Modal.getInstance(breakdownModal)?.hide();

    extendModalTitle.textContent = mode === 'biasa'
        ? `${currentName} selesai!`
        : `${currentName}: ${formatRepeat(totalRepeat)} siklus selesai!`;
    renderExtendOptions(); 
    playAlarmLoop(extendWaitSeconds);

    const deadline = Date.now() + extendWaitSeconds * 1000;
    extendCountdownText.textContent = extendWaitSeconds;
    extendAutoBar.style.transition = 'none';
    extendAutoBar.style.width = '100%';

    extendCountdownInterval = setInterval(() => {
        const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        extendCountdownText.textContent = left;
        extendAutoBar.style.width = `${(left / extendWaitSeconds) * 100}%`;
        if (left <= 0) finishSession();
    }, 250);

    extendModal.show();
}

// tambah siklus (Pomodoro)
function extendCycles(extraCycles) {
    if (pendingFinishTs === null) return;
    pendingFinishTs = null;
    closeExtendPrompt();

    totalRepeat += extraCycles;
    currentRepeat++;
    currentPhase = 'fokus';
    totalSeconds = focusDuration;
    reminingSeconds = focusDuration;

    pauseTimerBtn.disabled = false;
    resetTimerBtn.disabled = false;

    endTimeText.textContent = `Selesai pada ${calculateEndTime(totalSeconds)}`;
    startTimerInterval();
}

// tidak ada tanggapan / 'klik' Selesai
async function finishSession() {
    if (pendingFinishTs === null) return;
    const finishedAt = pendingFinishTs;
    pendingFinishTs = null;
    closeExtendPrompt();

    if (mode === 'biasa') {
        await addResult(currentName, 'Timer', '-', totalSeconds, totalSeconds, 'Selesai', finishedAt);
        statusText.textContent = `Timer "${currentName}" selesai!`;
    } else {
        statusText.textContent = `Semua ${formatRepeat(totalRepeat)} siklus belajar selesai! >.<`;
    }
    resetTampilan();
}

// untuk save timer saat ter refresh
const ACTIVE_KEY = 'timer-active-session';

function saveActiveSession() {
    try {
        localStorage.setItem(ACTIVE_KEY, JSON.stringify({
            mode,
            name: currentName,
            totalSeconds,
            reminingSeconds,
            endTimestamp,
            paused: !intervalTimer,
            phase: currentPhase,
            repeat: currentRepeat,
            totalRepeat: totalRepeat === Infinity ? null : totalRepeat,
            focusDuration,
            breakDuration,
            sessionStartTimestamp,
            totalPausedMs,
            pauseStartTimestamp,
            sessionWasPaused
        }));
    } catch (error) {
        // gagal simpan: timer tetap jalan normal
    }
}

function clearActiveSession() {
    localStorage.removeItem(ACTIVE_KEY);
}

function enterRunningUI() {
    namaTimer.disabled = true;
    durasiJamTimer.disabled = true;
    durasiMenitTimer.disabled = true;
    durasiDetikTimer.disabled = true;

    jamPomodoro.disabled = true;
    menitPomodoro.disabled = true;
    detikPomodoro.disabled = true;
    jamIstirahat.disabled = true;
    menitIstirahat.disabled = true;
    detikIstirahat.disabled = true;

    jumlahPengulangan.disabled = true;
    unlimitedPengulangan.disabled = true;

    modeBiasaRadio.disabled = true;
    modePomodoroRadio.disabled = true;

    startTimerBtn.classList.add('d-none');
    startTimerBtn.classList.remove('w-100');
    startTimerBtn.classList.add('w-50');

    pauseTimerBtn.classList.remove('d-none');
    pauseTimerBtn.classList.remove('w-100');
    pauseTimerBtn.classList.add('w-50');

    resetTimerBtn.classList.remove('d-none');
    resetTimerBtn.classList.remove('w-100');
    resetTimerBtn.classList.add('w-50');

    inputsSection.classList.add('d-none');
    runningTimer.classList.remove('d-none');
    runningTimerName.classList.remove('d-none');

    if (mode === 'pomodoro') {
        pomodoroSettings.classList.add('d-none');
        toggleSettingPomodoroIcon.className = 'fa-solid fa-caret-up';
    }
}

async function restoreActiveSession() {
    let data = null;
    try {
        data = JSON.parse(localStorage.getItem(ACTIVE_KEY));
    } catch (error) {
        data = null;
    }
    if (!data) return;

    const modeRadio = data.mode === 'pomodoro' ? modePomodoroRadio : modeBiasaRadio;
    modeRadio.checked = true;
    modeRadio.dispatchEvent(new Event('change'));

    currentName = data.name;
    totalSeconds = data.totalSeconds;
    reminingSeconds = data.reminingSeconds;
    endTimestamp = data.endTimestamp;
    currentPhase = data.phase;
    currentRepeat = data.repeat;
    totalRepeat = data.totalRepeat === null ? Infinity : data.totalRepeat;
    focusDuration = data.focusDuration;
    breakDuration = data.breakDuration;
    sessionStartTimestamp = data.sessionStartTimestamp;
    totalPausedMs = data.totalPausedMs;
    pauseStartTimestamp = data.pauseStartTimestamp;
    sessionWasPaused = data.sessionWasPaused;

    if (!data.paused) {
        while (endTimestamp <= Date.now()) {
            const finishedAt = endTimestamp;

            if (mode === 'biasa') {
                await addResult(currentName, 'Timer', '-', totalSeconds, totalSeconds, 'Selesai', finishedAt);
                statusText.textContent = `Timer "${currentName}" selesai!`;
                resetTampilan();
                return;
            }

            const phaseLabel = currentPhase === 'fokus' ? 'Pomodoro' : 'Istirahat';
            await addResult(currentName, 'Pomodoro', phaseLabel, totalSeconds, totalSeconds, 'Selesai', finishedAt);

            if (currentPhase === 'fokus') {
                currentPhase = 'break';
                totalSeconds = breakDuration;
            } else if (currentRepeat < totalRepeat) {
                currentRepeat++;
                currentPhase = 'fokus';
                totalSeconds = focusDuration;
            } else {
                statusText.textContent = `Semua ${formatRepeat(totalRepeat)} siklus belajar selesai! >.<`;
                resetTampilan();
                return;
            }

            // fase berikutnya mulai tepat saat fase sebelumnya berakhir
            sessionStartTimestamp = finishedAt;
            totalPausedMs = 0;
            pauseStartTimestamp = null;
            sessionWasPaused = false;
            endTimestamp = finishedAt + totalSeconds * 1000;
        }
    }

    enterRunningUI();
    updateRunningLabel();

    if (data.paused) {
        statusText.textContent = 'Paused ⏸️';
        setPauseButtonState(true);
        updateDisplayTimer();
        updateEndTimeLive();

        pauseDisplayInterval = setInterval(updateEndTimeLive, 1000);

        runningTimer.classList.add('is-paused');
    } else {
        reminingSeconds = Math.max(0, Math.round((endTimestamp - Date.now()) / 1000));
        updateDisplayTimer();
        endTimeText.textContent = `Selesai pada ${formatClockTime(endTimestamp)}`;
        statusText.innerHTML = 'Starting <span class="dot">.</span><span class="dot"> .</span><span class="dot"> .</span>';
        startTicking();
    }

    saveActiveSession();
}

const nameSuggestions = document.getElementById('nama-suggestions'),
      presetHint = document.getElementById('preset-hint');

const PRESET_KEY = 'timer-name-presets';
const PRESET_MAX = 30;

// kunci per mode + nama (huruf besar/kecil dianggap sama)
const presetId = (m, name) => `${m}:${name.trim().toLowerCase()}`;

function loadPresets() {
    try {
        return JSON.parse(localStorage.getItem(PRESET_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function toSec(h, m, s) {
    return (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
}

function readDurationData() {
    if (mode === 'biasa') {
        return {
            h: durasiJamTimer.value,
            m: durasiMenitTimer.value,
            s: durasiDetikTimer.value
        };
    }
    return {
        fh: jamPomodoro.value, fm: menitPomodoro.value, fs: detikPomodoro.value,
        bh: jamIstirahat.value, bm: menitIstirahat.value, bs: detikIstirahat.value,
        repeat: jumlahPengulangan.value,
        unlimited: unlimitedPengulangan.checked
    };
}

// isi kolom durasi dari data tersimpan
function applyDurationData(d) {
    if (mode === 'biasa') {
        durasiJamTimer.value = d.h;
        durasiMenitTimer.value = d.m;
        durasiDetikTimer.value = d.s;
    } else {
        jamPomodoro.value = d.fh;
        menitPomodoro.value = d.fm;
        detikPomodoro.value = d.fs;
        jamIstirahat.value = d.bh;
        menitIstirahat.value = d.bm;
        detikIstirahat.value = d.bs;
        jumlahPengulangan.value = d.repeat;
        unlimitedPengulangan.checked = d.unlimited;
        jumlahPengulangan.disabled = d.unlimited;
    }
}

// teks waktu dalam list rekomendasi
function presetLabel(p) {
    const d = p.data;
    if (p.mode === 'biasa') return formatTotalTime(toSec(d.h, d.m, d.s));
    const rep = d.unlimited ? '∞' : (d.repeat || 1);
    return `${formatTotalTime(toSec(d.fh, d.fm, d.fs))} / ${formatTotalTime(toSec(d.bh, d.bm, d.bs))} × ${rep}`;
}

// simpan durasi untuk nama timer
function saveNamePreset(name) {
    const clean = name.trim();
    if (!clean) return;

    const presets = loadPresets();
    presets[presetId(mode, clean)] = {
        name: clean,
        mode,
        data: readDurationData(),
        lastUsed: Date.now()
    };

    // hapus saat sudah melebihi batas max (30)
    const keys = Object.keys(presets);
    if (keys.length > PRESET_MAX) {
        keys.sort((a, b) => presets[a].lastUsed - presets[b].lastUsed)
            .slice(0, keys.length - PRESET_MAX)
            .forEach(k => delete presets[k]);
    }

    try {
        localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
    } catch (error) {
        // gagal simpan: timer tetap jalan normal
    }
    renderNameSuggestions();
}

// list daftar saran nama timer yang sudah dijalankan (direkomendasikan dari data yang terbaru)
function renderNameSuggestions() {
    const typed = namaTimer.value.trim().toLowerCase();

    nameSuggestions.innerHTML = '';
    Object.values(loadPresets())
        .filter(p => p.mode === mode)
        .filter(p => !typed || p.name.toLowerCase().startsWith(typed))
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.label = presetLabel(p);
            nameSuggestions.appendChild(opt);
        });
}

// nama ada = langsung input waktunya juga
function tryApplyPreset() {
    const typed = namaTimer.value.trim();
    renderNameSuggestions();
    presetHint.classList.add('d-none');
    if (!typed || namaTimer.disabled) return;

    const p = loadPresets()[presetId(mode, typed)];
    if (!p) return;

    applyDurationData(p.data);
    endPreviewOn = true;
    updateEndPreview();
    presetHint.textContent = `Waktu terakhir "${p.name}" terisi otomatis`;
    presetHint.classList.remove('d-none');
}

namaTimer.addEventListener('change', tryApplyPreset);

namaTimer.addEventListener('input', (e) => {
    if (!e.inputType || e.inputType === 'insertReplacementText') {
        tryApplyPreset();
    } else {
        renderNameSuggestions();
        presetHint.classList.add('d-none');
    }
});

// btn komponen
startTimerBtn.addEventListener('click', async () => {

    stopAlarm();

    const defaultName = mode === 'pomodoro' ? 'Pomodoro' : 'Timer';
    const name = namaTimer.value.trim() || defaultName;

    if (currentDayKey !== todayKey()) {
        await loadResultsForToday();
    }

    currentName = name;

    if (mode==='biasa') {
        const h = parseInt(durasiJamTimer.value, 10) || 0,
              m = parseInt(durasiMenitTimer.value, 10) || 0,
              s = parseInt(durasiDetikTimer.value, 10) || 0,
              dur = (h*3600) + (m*60) + s;
        
        if (!dur || dur <= 0) {
            showTriggerModal('Isi durasi terlebih dahulu ya!');
            return;
        }

        totalSeconds = dur;
        reminingSeconds = dur;
        currentPhase = null;
    } else {
        const fh = parseInt(jamPomodoro.value, 10) || 0,
              fm = parseInt(menitPomodoro.value, 10) || 0,
              fs = parseInt(detikPomodoro.value, 10) || 0,
              bh = parseInt(jamIstirahat.value, 10) || 0,
              bm = parseInt(menitIstirahat.value, 10) || 0,
              bd = parseInt(detikIstirahat.value, 10) || 0;
        
        focusDuration = (fh*3600) + (fm*60) + fs;
        breakDuration = (bh*3600) + (bm*60) + bd;
        totalRepeat = unlimitedPengulangan.checked ? Infinity : parseInt(jumlahPengulangan.value, 10);

        if (!focusDuration || focusDuration <= 0) {
            showTriggerModal('Durasi fokus harus lebih dari 0 (isi jam/menit/detik) ya!');
            return;
        }

        if (!breakDuration || breakDuration <= 0) {
            showTriggerModal('Durasi istirahat harus lebih dari 0 (isi jam/menit/detik) ya!');
            return;
        }

        if (!unlimitedPengulangan.checked && (!totalRepeat || totalRepeat <= 0)) {
            showTriggerModal('Jumlah pengulangan harus lebih dari 0 atau centang Pengulangan Tanpa Batas');
            return;
        }

        currentRepeat = 1;
        currentPhase = 'fokus';
        totalSeconds = focusDuration;
        reminingSeconds = focusDuration;
    }

    if (namaTimer.value.trim()) saveNamePreset(namaTimer.value);
    endTimeText.textContent = `Selesai pada ${calculateEndTime(totalSeconds)}`;

    namaTimer.disabled = true;
    durasiJamTimer.disabled = true;
    durasiMenitTimer.disabled = true;
    durasiDetikTimer.disabled = true;

    jamPomodoro.disabled = true;
    menitPomodoro.disabled = true;
    detikPomodoro.disabled = true;
    jamIstirahat.disabled = true;
    menitIstirahat.disabled = true;
    detikIstirahat.disabled = true;

    jumlahPengulangan.disabled = true;
    unlimitedPengulangan.disabled = true;

    modeBiasaRadio.disabled = true;
    modePomodoroRadio.disabled = true;

    startTimerBtn.classList.add('d-none');
    startTimerBtn.classList.remove('w-100');
    startTimerBtn.classList.add('w-50');

    pauseTimerBtn.classList.remove('d-none');
    pauseTimerBtn.classList.remove('w-100');
    pauseTimerBtn.classList.add('w-50');

    resetTimerBtn.classList.remove('d-none');
    resetTimerBtn.classList.remove('w-100');
    resetTimerBtn.classList.add('w-50');

    inputsSection.classList.add('d-none');
    runningTimer.classList.remove('d-none');
    runningTimerName.classList.remove('d-none');

    if(mode === 'pomodoro') {
        pomodoroSettings.classList.add('d-none');
        toggleSettingPomodoroIcon.className = 'fa-solid fa-caret-up';
    }

    startTimerInterval();
})

resetTimerBtn.addEventListener('click', async () => {
    stopAlarm();
    stopTicking();
    clearInterval(pauseDisplayInterval);
    pauseDisplayInterval = null;

    const used = totalSeconds - reminingSeconds;

    if (mode === 'biasa') {
        await addResult(currentName, 'Timer', '-', totalSeconds, used, 'Reset');
    } else {
        const phaseLabel = currentPhase === 'fokus' ? 'Pomodoro' : 'Istirahat';
        await addResult(currentName, 'Pomodoro', phaseLabel, totalSeconds, used, 'Reset');
    }

    resetTampilan();
    statusText.textContent = '';
    endTimeText.textContent = '';
    displayTimer.textContent = '00:00';
    progressBar.style.width = '0%';
});

pauseTimerBtn.addEventListener('click', () => {
    if (intervalTimer) {
        stopTicking();
        sessionWasPaused = true;
        pauseStartTimestamp = Date.now();

        runningTimer.classList.add('is-paused');

        statusText.textContent = 'Paused ⏸️';
        setPauseButtonState(true);

        updateEndTimeLive();
        pauseDisplayInterval = setInterval(updateEndTimeLive, 1000);
        saveActiveSession();
    } else {
        if (pauseStartTimestamp) {
            totalPausedMs += Date.now() - pauseStartTimestamp;
            pauseStartTimestamp = null;
        }
        
        clearInterval(pauseDisplayInterval);

        pauseDisplayInterval = null;
        runningTimer.classList.remove('is-paused');

        endTimeText.textContent = `Selesai pada ${calculateEndTime(reminingSeconds)}`;

        startTicking();

        statusText.innerHTML = `
            <div class="text-center"> Starting <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
        `;
        setPauseButtonState(false);;
        saveActiveSession();
    }
});

loadResultsForToday();
restoreActiveSession();
renderNameSuggestions();
namaTimer.focus();

namaTimer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const firstDurasiInput = mode === 'pomodoro' ? jamPomodoro : durasiJamTimer;
        firstDurasiInput.focus();
        firstDurasiInput.select(); 
    }
});

function setupDurasiArrowNav(inputs, onEnter) {
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                e.preventDefault();
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }
            if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                inputs[index - 1].focus();
                inputs[index - 1].select();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (onEnter) {
                    onEnter(index);
                } else if (!startTimerBtn.classList.contains('d-none')) {
                    startTimerBtn.click();
                }
            }
        });
    });
}

// pengaturan enter timer vs pomodoro
const focusSelect = el => { el.focus(); el.select(); };
const startIfIdle = () => {
    if (!startTimerBtn.classList.contains('d-none')) startTimerBtn.click();
};

// timer mode, enter = start
setupDurasiArrowNav([durasiJamTimer, durasiMenitTimer, durasiDetikTimer]);

// pomodoro mode, enter = ke bawah
const fokusInputs = [jamPomodoro, menitPomodoro, detikPomodoro];
const istirahatInputs = [jamIstirahat, menitIstirahat, detikIstirahat];

setupDurasiArrowNav(fokusInputs, i => focusSelect(istirahatInputs[i]));

setupDurasiArrowNav(istirahatInputs, () => {
    if (jumlahPengulangan.disabled) startIfIdle();
    else focusSelect(jumlahPengulangan);
});

jumlahPengulangan.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        startIfIdle();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return;

    if (extendModalEl.classList.contains('show')) return;

    if (descModalEl.classList.contains('show')) {
        if(e.key === 'Backspace') {
            e.preventDefault();
            bootstrap.Modal.getInstance(descModalEl)?.hide();
        }
        return;
    }

    if (dailyReportEl?.classList.contains('show')) {
        if (e.key === 'Backspace') {
            e.preventDefault();
            bootstrap.Modal.getInstance(dailyReportEl)?.hide();
        }
        return;
    }

    const ringkasanOpen = breakdownModal.classList.contains('show');
    const altOnly = e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey;

    if (ringkasanOpen) {
        if (e.key === 'Backspace' || (altOnly && e.code === 'KeyR')) {
            e.preventDefault();
            bootstrap.Modal.getOrCreateInstance(breakdownModal).hide();
        } else if (altOnly && e.code === 'KeyI') {
            e.preventDefault();
            infoToggleBtn.click();
        }
        return;
    }

    if (altOnly && e.code === 'KeyR') {
        e.preventDefault();
        if (results.length > 0) bootstrap.Modal.getOrCreateInstance(breakdownModal).show();
        return;
    }

    if(altOnly && e.code === 'KeyL') {
        e.preventDefault();
        openLastReport();
        return;
    }

    const formVisible = !inputsSection.classList.contains('d-none');

    if (formVisible && altOnly) {

        if (e.code === 'KeyT') {
            e.preventDefault();
            modeBiasaRadio.checked = true;
            modeBiasaRadio.dispatchEvent(new Event('change'));
            namaTimer.focus();
        }

        if (e.code === 'KeyP') {
            e.preventDefault();
            modePomodoroRadio.checked = true;
            modePomodoroRadio.dispatchEvent(new Event('change'));
            namaTimer.focus();
        }

        if (e.code === 'KeyO') {
            e.preventDefault();
            extendToggle.checked = !extendToggle.checked;
            extendToggle.dispatchEvent(new Event('change'));
        }
    }

    const active = document.activeElement;
    const isTypingNama = active === namaTimer;

    if (e.code === 'Space' && !isTypingNama) {
        e.preventDefault();
        if (!startTimerBtn.classList.contains('d-none')) {
            startTimerBtn.click();
        } else if (!pauseTimerBtn.classList.contains('d-none')) {
            pauseTimerBtn.click();
        }
    }

    if (e.key === 'Enter' && !pauseTimerBtn.classList.contains('d-none') && !isTypingNama) {
        e.preventDefault();
        pauseTimerBtn.click();
    }

    if (e.key === 'Backspace' && !resetTimerBtn.classList.contains('d-none') && active.tagName !== 'INPUT') {
        e.preventDefault();
        resetTimerBtn.click();
    }
});

// info tambahan btn
infoToggleBtn.addEventListener('click', () => {
    extraInfoPanel.classList.toggle('d-none');
    infoToggleBtn.classList.toggle('active');
});


breakdownModal.addEventListener('hidden.bs.modal', () => {
    extraInfoPanel.classList.add('d-none');
    infoToggleBtn.classList.remove('active');

    breakdownTooltipEls().forEach(el => {
        const tooltip = bootstrap.Tooltip.getInstance(el);
        if (tooltip) tooltip.hide();
    });
});

// extend modal agar langsung focus ke pilihan di dalamnya
extendModalEl.addEventListener('shown.bs.modal', () => {
    const first = extendOptionsBox.querySelector('.extend-btn');
    if (first) first.focus();
});

// extend modal agar bisa memakai keyboard untuk memilih/navigasi
extendModalEl.addEventListener('keydown', (e) => {
    const btns = [...extendOptionsBox.querySelectorAll('.extend-btn')];
    if (!btns.length) return;
    const i = btns.indexOf(document.activeElement);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        btns[i === -1 ? 0 : (i + 1) % btns.length].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        btns[i === -1 ? 0 : (i - 1 + btns.length) % btns.length].focus();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        finishSession();
    }
});

const isTimerMode = r => String(r.mode).toLowerCase() === 'timer', 
      isPomodoroMode = r => String(r.mode).toLowerCase() === 'pomodoro',
      sessionSeconds = r => (r.used || 0) + (r.pausedSeconds || 0),
      sumSeconds = list => list.reduce((total, r) => total + sessionSeconds(r), 0)
;

const breakdownTooltipEls = () => [
    breakdownTotal, breakdownSelesai, breakdownReset,
    breakdownPause, breakdownModeTimer, breakdownModePomodoro
];

breakdownModal.addEventListener('show.bs.modal', () => {
    const selesaiResults = results.filter(r => r.status === 'Selesai');
    const resetResults = results.filter(r => r.status === 'Reset');
    const pausedResults = results.filter(r => r.wasPaused);
    const timerResults = results.filter(isTimerMode);
    const pomodoroResults = results.filter(isPomodoroMode);

    breakdownTotal.textContent = results.length;
    breakdownSelesai.textContent = selesaiResults.length;
    breakdownReset.textContent = resetResults.length;
    breakdownPause.textContent = pausedResults.length;
    breakdownModeTimer.textContent = timerResults.length;
    breakdownModePomodoro.textContent = pomodoroResults.length;

    const byMode = list => `Timer: ${list.filter(isTimerMode).length} | Pomodoro: ${list.filter(isPomodoroMode).length}`;

    // total waktu
    breakdownTotal.setAttribute('data-bs-title', `Total waktu: ${formatTotalTime(sumSeconds(results))}`);
    breakdownModeTimer.setAttribute('data-bs-title', `Total waktu: ${formatTotalTime(sumSeconds(timerResults))}`);
    breakdownModePomodoro.setAttribute('data-bs-title', `Total waktu: ${formatTotalTime(sumSeconds(pomodoroResults))}`);

    breakdownSelesai.setAttribute('data-bs-title', byMode(selesaiResults));
    breakdownReset.setAttribute('data-bs-title', byMode(resetResults));
    breakdownPause.setAttribute('data-bs-title',
        `${byMode(pausedResults)}`
    );

    // perhitungan di dalam modal
    breakdownTooltipEls().forEach(el => {
        const existing = bootstrap.Tooltip.getInstance(el);
        if (existing) existing.dispose();
        new bootstrap.Tooltip(el, { html: true });
    });
});

// ===== MODAL DESKRIPSI =====
const descModalEl = document.getElementById('desc-modal');

descModalEl.addEventListener('show.bs.modal', () => {
    const tabBtn = document.getElementById(mode === 'pomodoro' ? 'desc-tab-pomodoro' : 'desc-tab-timer');
    bootstrap.Tab.getOrCreateInstance(tabBtn).show();
});

// munculin hasil results timer kemarin
const dailyReportModal = new bootstrap.Modal(dailyReportEl);
const REPORT_SEEN_KEY = 'timer-report-seen';
const RESULTS_PREFIX = 'timer-results:';

function dayKeyToDate(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function findLastUsageDay() {
    const today = dayKeyToDate(todayKey());
    let best = null;

    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(RESULTS_PREFIX)) continue;

        const dayKey = k.slice(RESULTS_PREFIX.length);
        const date = dayKeyToDate(dayKey);
        if (isNaN(date) || date >= today) continue;

        let list;
        try { list = JSON.parse(localStorage.getItem(k)); } catch (error) { continue; }
        if (!Array.isArray(list) || list.length === 0) continue;

        if (!best || date > best.date) best = { dayKey, date, list };
    }
    return best;
}

function buildDailyReport(list) {
    const selesai = list.filter(r => r.status === 'Selesai').length;
    const reset = list.filter(r => r.status === 'Reset').length;
    const paused = list.filter(r => r.wasPaused).length;
    const timerList = list.filter(isTimerMode);
    const pomoList = list.filter(isPomodoroMode);

    const byName = {};
    list.forEach(r => {
        const key = String(r.name).trim().toLowerCase();
        if (!byName[key]) byName[key] = { name: r.name, secs: 0 };
        byName[key].secs += sessionSeconds(r);
    });
    const top = Object.values(byName).sort((a, b) => b.secs - a.secs)[0];

    return [
        ['Total sesi', list.length],
        ['Selesai', selesai],
        ['Reset', reset],
        ['Tingkat selesai', `${Math.round(selesai / list.length * 100)}%`],
        ['Total waktu', formatTotalTime(sumSeconds(list))],
        ['Mode Timer', `${timerList.length} sesi · ${formatTotalTime(sumSeconds(timerList))}`],
        ['Mode Pomodoro', `${pomoList.length} sesi · ${formatTotalTime(sumSeconds(pomoList))}`],
        ['Pernah dijeda', paused],
        ['Paling banyak', top ? `${top.name} (${formatTotalTime(top.secs)})` : '-']
    ];
}

function showDailyReport(day) {
    const diff = Math.round((dayKeyToDate(todayKey()) - day.date) / 86400000);
    dailyReportWhen.textContent = diff === 1 ? 'Kemarin' : `${diff} Hari Lalu`;
    dailyReportDate.textContent = day.date.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    dailyReportBody.innerHTML = '';
    buildDailyReport(day.list).forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-center gap-3 py-2 report-row';

        const l = document.createElement('span');
        l.textContent = label;

        const v = document.createElement('span');
        v.className = 'fw-bold text-end';
        v.textContent = value;

        row.append(l, v);
        dailyReportBody.appendChild(row);
    });

    dailyReportModal.show();
}

function maybeShowDailyReport() {
    updateLastReportBtn();
    if (inputsSection.classList.contains('d-none')) return;
    if (document.querySelector('.modal.show')) return;

    if (currentDayKey !== todayKey()) loadResultsForToday();

    const last = findLastUsageDay();
    if (!last || localStorage.getItem(REPORT_SEEN_KEY) === last.dayKey) return;

    localStorage.setItem(REPORT_SEEN_KEY, last.dayKey);
    showDailyReport(last);
}

function updateLastReportBtn() {
    const last = findLastUsageDay();

    lastReportWrap.classList.toggle('d-none', !last);

    if(last) {
        const diff = Math.round((dayKeyToDate(todayKey())- last.date) / 86400000);
        lastReportLabel.textContent = diff === 1 ? 'Kemarin' : `${diff} Hari Lalu`;
    }
}

function openLastReport() {
    if (document.querySelector('.modal.show')) return;

    const last = findLastUsageDay();

    if (last) showDailyReport(last);
}

lastReportBtn.addEventListener('click', openLastReport)

maybeShowDailyReport();

setInterval(maybeShowDailyReport, 60 * 1000);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) maybeShowDailyReport();
});

// test hasil results timer kemarin
// localStorage.setItem('timer-results:2026-10-15', JSON.stringify([
//   {name:'Belajar', mode:'Timer', phaseLabel:'-', target:1500, used:1500, status:'Selesai', time:'08:00:00', endTime:'08:25:00', wasPaused:false, pausedSeconds:0},
//   {name:'Coding', mode:'Pomodoro', phaseLabel:'Pomodoro', target:1500, used:600, status:'Reset', time:'09:00:00', endTime:'09:10:00', wasPaused:true, pausedSeconds:30}
// ]));
// localStorage.removeItem('timer-report-seen');
// maybeShowDailyReport();