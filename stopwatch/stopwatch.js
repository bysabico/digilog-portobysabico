// fetch navbar-fitur
fetch('../navbar-fitur/navbar-fitur-digilog.html')
.then(response => response.text())
.then(data => {
    document.getElementById('navbar-container').innerHTML = data;
    setupNavbarFiturLogic();
    stopwatchInit();
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
      notifStopwatch   = document.getElementById('notif-container')
;

// ELEMENT MODAL HUB KE BOOTSTRAP
let modal = new bootstrap.Modal(document.getElementById('lapModal'));

// PENCET LAP = ADA BUNYI
const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
);

// bunyi notifikasi
const notifSound = new Audio (
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
)

// = ELEMEN STATE =
// (data yang dibutuhin buat jalanin stopwatch, disimpen di sini)

let startTime = 0;
// karena settingan awal dari 0

let elapsedTime = 0;
// untuk penghitung waktu dan 0 = belum mulai

let startClockTime = null,
    endClockTime = null
// untuk mencantumkan jam saat klik start dan reset, tapi awalnya null karena belum ada klik start dan reset

let stopwatchInterval = null;
// 'motivasi si stopwatch' atau biar stopwatchnya jalan.
// null = kosong [gaada motivasi atau arah sama sekali. makanya dibuat null, bukan 0]
// kek sp yh 🫵🏻

let lastLapTime = 0,
    lastDurationLap = 0,
    lapCount = 0
;
// belum ada waktu lap terakhir, durasi terakhir lap, dan lap yang dihitung, jadi settingan awal 0

let laps = [];
// [] : array
// dipakai ada banyak data yang perlu disimpan~

let notifFlags = {
    passedLastLap: false,
    passedFastestLap: false,
    passedSlowestLap: false
};

// = START =
// fungsi startStopwatch dibuat dulu karena 'gerbang' dari jalannya stopwatch
function startStopwatch() {

    if (stopwatchInterval) return;
    // fungsi yang memberikan stopwatchInterval untuk jalan 🔥

    if (elapsedTime === 0) {
        startClockTime = new Date();
    }
    
    startTime = Date.now() - elapsedTime;
    // aturan startTime di 'elemen state' buat gerak maju (gerbang agar stopwatch jalan)
    // KNPH DIKURANGI (-) elapsedTime??
    // karena kalau ga, bakal ngitung ulang dari 0 lagi setelah pause dan refresh.
    // ibaratnya, abis perjalanan panjang tapi karena ga kuat dan pengen istirahat trs lanjut lg eh malah balik ke awal.. perjalananmu jadi sia-sia 💔 
    // makanya, fungsi elapsed time ini juga sangat teramat penting 😼👌
    // tapi elapsedTime disini belum diatur.

    // = Date.now() =
    // Date.now() harus disertakan sebagai variable awal aturan / rumus startTime dan elapsedTime agar stopwatch bisa jalan sesuai dengan fungsinya.
    // jika tidak, maka js akan mengikutsertakan waktu 1970 (unix epoch : titik waktu komputer) dalam tampilannya.
    
    stopwatchInterval = setInterval(() => {
    // arah atau aturan si stopwatchInterval di 'element state' yang nilainya null berubah jadi 'progress' (atur stopwatch jalan atau mulai).
    // Caranya?
    // waktu dihitung setelah user masuk gerbang (klik tombol start). Lalu, stopwatch akan mulai dan menghitung waktu.
    // Perhitungan waktunya pakai fungsi bawaan js, yakni setInterval, tugasnya emang untuk mengulang suatu perintah tanpa jeda (makanya di fungsi digitalClock() dan displayDate() pakai setInterval juga) 
    // Pada stopwatch ini, saat klik tombol start, maka stopwatch bisa jalan terus tiap beberapa milisekon tanpa jeda.
    // isi aturan stopwatchInterval:

        elapsedTime = Date.now() - startTime;
        // elapsedTime baru diatur di dalam stopwatchInterval
        // Kenapa?
        // karena berhubungan sama progress waktu yang harus ditampilkan di layar dan harus dibantu setInterval biar mau gerak. 
        // dikurangi startTime biar kalau user klik start, maka stopwatch mulai jalan.
        
        displayTimeStopwatch(elapsedTime);
        // perhitungan / progress stopwatch muncul di layar, makanya parameternya elapsedTime
        // tapi disini belum berfungsi yep, baru dibuat nama fungsinya.

        // saveState();
        // biar gak ilang pas di refresh

        checkLapNotif();
        updateLiveLapDiffDisplay();

    }, 50);
    // 50 = setiap 50ms, stopwatch update. 
    // KENAPA 50ms? 
    // Karena kalau terlalu cepat (misal 10ms), 
    // bisa bikin performa turun, terutama di browser yang lebih tua. 
    // Selain itu, 50ms masih cukup halus untuk tampilan stopwatch, jadi tidak akan terlihat patah-patah.

    setInterval(() => {
        if(stopwatchInterval) saveState();
    },1000)

    // style stopwatch kalau lg jalan 
    // css .running teraplikasi
    displayStopwatch.classList.add('running');

    // css .fokus terhapus
    displayStopwatch.classList.remove('fokus');

    // efek css .tampilanSamarStopwatch ditambahin ke customStopwatch 
    // pakai for of karena customStopwatch bentuknya class di html
    // bukan ID kalau id bisa lgsg akses kayak displayStopwatch, 
    // tapi karena ini class dan ada di beberapa code di html (banyak)
    // jadi harus di loop satu-satu
    for (let item of customStopwatch) {

        // item sesuai dengan parameter setelah 'let ... of nama class'
        item.classList.add('tampilanSamarStopwatch'); 

    }

    // style tombol start sembunyi (add = tambah)
    startBtn.classList.add('d-none');

    // style tombol pause muncul (remove = hapus)
    pauseBtn.classList.remove('d-none');

    // style tombol lap aktif atau bisa dipencet
    lapBtn.disabled = false;

    // simpan state di localStorage, 
    // biar kalau refresh ga hilang datanya
    saveState();
}

// = PERINTAH EKSEKUSI TAMPILAN =
function displayTimeStopwatch(elapsedTime) {
// aturan untuk eksekusi displayTimeStopwatch(elapsedTime) yang ada di stopwatchInterval
// isinya;

    displayStopwatch.innerHTML = formatTime(elapsedTime);
    // komando agar stopwatch jalan dan bisa dilihat di layar
    // tapi baru komando (belum jalan dan bisa dilihat).
    // komandonya berupa fungsi formatTime(elapsedTime).
}

// ===== FORMAT & DISPLAY =====
function formatTime(elapsedTime) {
// isi dari komando di fungsi displayTimeStopwatch(elapsedTime) agar stopwatch jalan atau tereksekusi di layar 

    // ===== PENJELASAN PERHITUNGAN WAKTU: =====

    // method Math.floor() 
    // itu buat pembulatan ke bawah
    // jadi angkanya kagak desimal jelek.

    // const msStopwatch = Math.floor((elapsedTime % 1000) / 10);
    // msStopwatch = milisekon (dibagi 10 biar jadi 2 digit, misal 500ms => 5)

    const secStopwatch = Math.floor(elapsedTime / 1000);
    // secStopwatch = detik (dibagi 1000, karena 1000ms = 1 detik)

    const minStopwatch = Math.floor(secStopwatch / 60);
    // minStopwatch = menit (dibagi 60, karena 60 detik = 1 menit)

    
    const hourStopwatch = Math.floor(minStopwatch / 60);
    // hourStopwatch = jam (dibagi 60, karena 60 menit = 1 jam)


    const dayStopwatch = Math.floor(hourStopwatch / 24);
    // dayStopwatch = hari (dibagi 24, karena 24 jam = 1 hari)

    // ===== PENJELASAN `${String().padStart(2, '0')}` =====
    // `` = backticks, 
    // itu buat template literal,
    // biar kita bisa masukin variabel langsung ke string

    // ${} = placeholder
    // buat akses si variabel tamplatenya
    // biar bisa muncul di layar 🖥️

    // String(): ubah angka jadi teks
    // MANK GXX BISA LANGSUNG UBAH DARI ELEMENT DIATAS?! :<
    // kagak. makanya kudu pake string.

    // GEGARA APH?
    // karena .padStart() itu method yg cuma nerima text. 
    // Terus fungsi buat nambahin karakter di depan string, 
    // biar panjangnya sesuai yang kita mau. 
    // Jadi, karena pengen tampilannya 00 alias selalu dua angka
    // makanya 2, '0' artinya kalau nilainya 
    // satu digit, misal 1s, tampilannya 01 s
    // Juga thats why '0' pake "" atau '' karena dia itu kutipan untuk text

    // ===== PENJELASAN FORMAT: =====

    // let formatStopwatch = `${String(minStopwatch % 60).padStart(2, '0')}:${String(secStopwatch % 60).padStart(2, '0')}.${String(msStopwatch).padStart(2, '0')}`;
    let formatStopwatch = `${String(minStopwatch % 60).padStart(2, '0')}:${String(secStopwatch % 60).padStart(2, '0')}`
    // variabel ini merupakan mandor atau arahan utama dari stopwatch agar tampilannya ga ngaco
    // format dasar (menit) mm:ss.ms (%60 = sisa bagi dengan variable di depannya (minStopwatch atau secStopwatch), biar pas udh 60 menit pas ganti balik 00)
    // tapi reset (00:00) dan menambah format jam (tp format jam belum dibuat dan kalau ga dibuat bakal balik ke menit 00)
    // makanya, dibuatlah, rumus berikut;

    // let miliStopwatch = `${String(msStopwatch).padStart(2, '0')}`;

    if (hourStopwatch > 0) {
    // kalau stopwatch udh 1 jam ( 0 disini tu format sebelumnya kan per menit, sebelum 60 menitkan masih 00:59 menit, kan?)
    // nah, biar format abis 59 menit ini ga balik ke 0 menit, makanya harus buat fungsi if(hourStopwatch > 0) ini
    // Ini yang ngebuat tampilan stopwatch berubah jadi jam:menit:detik.ms
    // hourStopwatch % 24 = sisa bagi 24 dan sama variabel hourStopwatch, biar kalau udh 23:59:59 ga berubah jadi 00:00:00
    // tapi reset (00:00:00) dan menambah format hari (tp format jam belum dibuat dan kalau ga dibuat bakal balik ke menit 00)

        formatStopwatch = `${String(hourStopwatch % 24).padStart(2, '0')}:${formatStopwatch}`;
        // formatStopwatch kenapa variabelnya diulang diatas?
        // Karena satu arahan dan tujuan.
        // if itu kondisi tambahan dari arahan utama (variabel formatStopwatch)
    }  
    
    // kenapa ga pakai else? ntar error jir.. soalnya macam jika A maka A wlw ada B tetep aja patokannya yg depan
    if (dayStopwatch > 0) {
    // penjelasan kayak if (hourStopwatch > 0)

        formatStopwatch = `${String(dayStopwatch).padStart(2, '0')}:${formatStopwatch}`;
        // kok gaada %?
        // karena hari ga perlu di reset.

        return formatStopwatch;
        // return `${formatStopwatch}<br><span class="mili-style fs-3">00.${miliStopwatch}</span>`;
    } else {
        return formatStopwatch;
    }
    
    
    // else {
    //     // ms tetap di baris yang sama
    //     return `${formatStopwatch}<span class="mili-intervalStopwatch">.${String(msStopwatch).padStart(2, '0')}</span>`;
    // }

    // displayStopwatch.innerHTML = `${formatStopwatch}`;
    // displayMiliSecStopwatch.innerHTML = `00.${miliStopwatch}`;

    // harus di return
    // kalau gak, ga bakal keluar si angkanya
    // coba aje kalau kagak percaya 🗿 
    // return formatStopwatch;
}

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

function formatTimeForLapDisplay(diffLapTime) {
    const sign = diffLapTime > 0 ? '+' : diffLapTime < 0 ? '-' : '';
    return sign + formatTime(Math.abs(diffLapTime));
}

function formatClockTime(date) {
    if(!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', {hour12: false});
}



// notif muncul di layar dan bunyi
function showNotif(message, type='info') {
    
    // if (laps.length > 2) return;

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
    }, 4000);

}

// cek notifikasi
function checkLapNotif() {
    if (laps.length === 0) return;

    const currentLapDuration = elapsedTime - lastLapTime,
          lastLap = laps[0].lapTime,
          fastestAllLap = (laps.length > 0 ? Math.min(...laps.map(l => l.lapTime)) : Infinity),
          slowestAllLap = (laps.length > 0 ? Math.max(...laps.map(l => l.lapTime)) : -Infinity);

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
        };
    }
}

// = PAUSE =
function pauseStopwatch() {

    clearInterval(stopwatchInterval);
    // clearInterval = method js buat stop stopwatch yang lagi jalanin setInterval
    // stopwatchInterval as parameter biar tau saklar (variabel) yang mau ditargetin

    stopwatchInterval = null;
    // makanya.. 
    // abis itu stopwatchInterval di-null-kan (dihilangin) karena pas start stopwatchInterval ada nilainya (waktu yag berjalan)
    // karena klik pause (dipaksa stop 😔)

    // sama kayak penjelasan func startStopwatch()
    displayStopwatch.classList.remove('running');
    displayStopwatch.classList.add('fokus');
    for (let item of customStopwatch) { 
        item.classList.remove('tampilanSamarStopwatch'); 
    }

    // button yang muncul dan yg tidak
    pauseBtn.classList.add('d-none');
    startBtn.classList.remove('d-none');

    // tombol lap nonaktif atau gak bisa dipencet
    // dimunculin biar user tw bisa lap #muk-pamer
    lapBtn.disabled = true;

    saveState();
}

// = RESET =
function resetStopwatch() {

    showResult();
    // klik resetStopwatch => laporan hasilnya pakai pop up (modal bootstrap)
    // biar bisa #pamer WKWKW 😋
}

// = SHOW RESULT =
function showResult() {
    pauseStopwatch();
    // panggil fungsi pauseStopwatch() agar saat reset trs hasil sesi keluar, akurat dan tidak ada penambahan waktu lagi (tepat saat klik reset)

    endClockTime = new Date();

    if (laps.length === 0) {
    // klo gxx ada lap (lap.length === 0) ini yep hasilnya;
        
    // isi body modal nampilin total waktu dan ket 'belum ada lap'
        resultsSession.innerHTML = ` 
            <div class="text-center">
                <div class="mb-3 text-muted">Belum ada lap ⏱️</div>
                <div class="fs-4 font-monospace fw-bold">Total Time: ${formatTime(elapsedTime)}</div>
                <div class="mt-3 text-secondary small"> 
                    Duration: ${formatClockTime(startClockTime)} - ${formatClockTime(endClockTime)}
                </div>
            </div>
        `;
        
        modal.show();
        // muncul modal

        return; 
        // return biar STOP (kode dibawah ini tidak tereksekusi).
    }

    // kalau lap ada~
    // fungsi untuk membandingkan lap secara keseluruhan (berdasarkan data yang sudah ada)
    const fastest = laps.reduce((prev, curr) =>
    // paling cepat dari data keseluruhan.
    // .reduce() = method js cari satu yang TERCEPAT

        curr.lapTime < prev.lapTime ? curr : prev
        // lap terbaru < lap sebelumnya, bandingin.
    );

    const slowest = laps.reduce((prev, curr) =>
    // paling cepat dari data keseluruhan.
    // .reduce() = method js cari satu yang TERLAMBAT

        curr.lapTime > prev.lapTime ? curr : prev
    );

    // delegasi html (getElementById) 
    // minta untuk masukin data html lewat js pakai perwakilan js (method js = .innerHTML)
    // makanya pakai backticks dan isinya elemen html 😎👍 
    resultsSession.innerHTML = `
        <div class="text-center">
            <div class="mb-3 text-success fs-5">
                <span class="fw-bold"> 🟢 Fastest Lap <br> </span>
                #${fastest.id} — ${formatTime(fastest.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </div>
            
            <br>
            
            <div class="mb-3 text-danger">
                <span class="fw-bold"> 🔴 Slowest Lap <br> </span>
                #${slowest.id} — ${formatTime(slowest.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </div> 
            
            <br>
            
            <div class="mb-2 text-secondary">
                Total Lap: ${laps.length}
            </div>

            <div class="mb-2 text-secondary">
                Total Time: ${formatTime(elapsedTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </div>

            <div class="text-secondary"> 
                Duration: ${formatClockTime(startClockTime)} - ${formatClockTime(endClockTime)}
            </div>
        </div>
    `;

    // modal~ its show time~ 🕺
    modal.show();
}

// = CLOSE MODAL =
function closeLapModal() {

    modal.hide();
    // modal balik ga keliatan (ansos)

    clearSession();
    // kalau klik close di modal = apuss 
    // alias mulai dari 0 lagi ya, kak
}

// = CLEAR SESSION =
function clearSession() {

    clearInterval(stopwatchInterval);
    // ini fungsi biar stopwatch yang sedang jalan terhapus saat klik reset
    // kayak tahun baru, kalau close = mulai ulang dari awal~
    // makanya pergerakkan stopwatchInterval (waktu stopwatchnya) dihapus

    // element state di setting kayak awal lagii karena saat clear session harus balik seperti awal
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

    // kalau udh close, seluruh data di sesi itu = hilang permanen 🥷
    localStorage.removeItem('data-stopwatch');

    // tampilan awal balik yep, makanya ni fungsi dipanggil lagi
    displayTimeStopwatch(0);

    liveLapDiff.textContent = '';

    // bahkan css semua hapus untuk memulai lembaran baruu
    displayStopwatch.classList.remove('running', 'fokus');
    for (let item of customStopwatch) { 
        item.classList.remove('tampilanSamarStopwatch'); 
    }

    // list si laps juga kita kosongkan biar ga ovt (numpuk)
    lapsList.innerHTML = '';

    // tombol start muncul
    startBtn.classList.remove('d-none');

    // tombol pause sembunyi
    pauseBtn.classList.add('d-none');

    // lap tombol nonaktif atau gak bisa dipencet
    lapBtn.disabled = true;
}

// = LAP =
function lap() {
// fungsi lap biar kalau klik lap, muncul datanya!

    if (!stopwatchInterval) return;
    // kalau stopwatchInterval diklik, maka nilainya jadi true (ada)
    // awalnya null = false, setelah di klik jadi true atau waktu stopwatch berjalan~

    const currentTime = elapsedTime,
    // elapsedTime di mirror dengan nilainya konstan agar selisih lap akurat.
    // kenapa ga lgsg elapsedTime aja? karena awalnya pakai let dan nilai let fleksibel (bikin hasil nilai lap ada selisih 0,001)

          lapTime = elapsedTime - lastLapTime
        //   ini variabel menghitung nilai lap.
    ;

    lastLapTime = currentTime;
    // waktu akhir lap = waktu elapsedTime (yg nilainya ga berubah, const)

    // lapDiff = selisih antara lapTime sekarang dengan lapTime sebelumnya
    // buat tau apakah lapTime sekarang lebih cepat atau lebih lambat dibanding lapTime sebelumnya
    // const lapDiff = lapTime - lastDurationLap;
    // lastDurationLap = lapTime;

    // variabel untuk mengetahui lap tercepat dari nilai keseluruhan data lap.
    const fastestAllLap = laps.length > 0 ? Math.min(...laps.map(l => l.lapTime)) : Infinity;
    const slowestAllLap = laps.length > 0 ? Math.max(...laps.map(l => l.lapTime)) : -Infinity;

    lapCount++;

    // .unshift = nambahin data baru paling atas di list
    laps.unshift({ 

        // tampilan pas klik lap, panggil aje variabel
        id: lapCount, 
        lapTime, 
        totalTime: currentTime 

    });

    renderLaps();

    // kalau nilai lapTime terbaru lebih kecil dari lapTime sebelumnya (lapDiff < 0), 
    // berarti lapTime sekarang lebih cepat, jadi dikasih efek glow dan suara beep~ untuk ngasih tau user~
    // if (lapCount > 1 && lapDiff < 0) {
    //     beep.play();
    //     displayStopwatch.classList.add('glow');
    //     setTimeout(() => displayStopwatch.classList.remove('glow'), 500);
    // }

    if (lapCount > 1 && lapTime < fastestAllLap) {
        beep.play();
        displayStopwatch.classList.add('glow');
        setTimeout(() => displayStopwatch.classList.remove('glow'), 500);
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

    if (laps.length === 0) return; 

    // ada di bagian showResult() baca aja
    const fastest = laps.reduce((prev, curr) => curr.lapTime < prev.lapTime ? curr : prev);
    const slowest = laps.reduce((prev, curr) => curr.lapTime > prev.lapTime ? curr : prev);

    // kenapa pake forEach? forEach lebih simpel dari for of
    // ver for of;
    for (let categoryLap of laps) {

        // variabel penampung seluruh data lap (bagian bawah setelah di klik lap) saat dan setelah selesai sesi
        let lapPackage = '';
        let rowClass = '';

        if (categoryLap.lapTime === fastest.lapTime) {

            // pakai variabel lapPackage soalnya dia kan yg pegang semua data lap.
            // nah, kalau ada lap paling cepat (fastest) ditandain disini aturannya
            lapPackage = '<span class="badge">🟢</span>';

            rowClass = 'fastest-lap-row';
            
        } else if (categoryLap.lapTime === slowest.lapTime) {

            // pakai variabel lapPackage soalnya dia kan yg pegang semua data lap.
            // nah, kalau ada lap paling lambat (slowest) ditandain disini aturannya
            lapPackage = '<span class="badge">🔴</span>';

            rowClass = 'slowest-lap-row';

        }

        // buat div untuk nampung seluruh data lap
        // const divLapsData = document.createElement('div');

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
                    ${formatTime(categoryLap.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
                </small>
            </td>

            <td class="text-center">
                <small>
                    ${formatTime(categoryLap.totalTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
                </small>
            </td>
        `

        lapsList.appendChild(trLapsData);

        // buat classnya biar bisa dimasukin ke div yang spesifik
        // divLapsData.classList.add('lap-data');

        // let lapDifference = '--';

        // // masukin isi dari div lap data yang udh dibuat tadi
        // divLapsData.innerHTML = `
        //     <div>
        //         <strong>Lap #${categoryLap.id}</strong> ${lapPackage}
        //     </div>

        //     <small>
        //         Lap : ${formatTime(categoryLap.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
        //     </small>

        //     <small>
        //         Total Waktu : ${formatTime(categoryLap.totalTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
        //     </small>
        // `;

        // // ini yang bikin data lap muncul di layar
        // lapsList.appendChild(divLapsData);
    }

    // ver forEach;
    // laps.forEach(lap => {
    //     let lapPackage = '';

    //     // buat tampilin kata 'fastest' & 'slowest' di layar
    //     if (lap.lapTime === fastest) lapPackage = '<span class="badge bg-success">FASTEST</span>';
    //     else if (lap.lapTime === slowest) lapPackage = '<span class="badge bg-danger">SLOWEST</span>';

    //     // bikin div untuk list lap nya
    //     const div = document.createElement('div');

    //     // ini yang buat setiap klik lap bisa bertambah
    //     div.classList.add('lap-item');

    //     // ini yang buat format tampilan lap di layar
    //     // div ini yang buat ada 'title' fastest dan slowest.
    //     // small ini data waktu per klik lap dan total stopwatch pas di klik lap
    //     div.innerHTML = `
    //         <div>
    //             <strong>Lap #${lap.id}</strong> ${lapPackage}
    //         </div>
    //         <small>
    //             Lap : ${formatTime(lap.lapTime)} <br>
    //             Total : ${formatTime(lap.totalTime)}
    //         </small>
    //     `;

    //     // ini yang bikin tampilan per lap muncul di layar
    //     lapsList.appendChild(div);
    // });
}

// = SAVE STATE =
function saveState() {

    localStorage.setItem('data-stopwatch', JSON.stringify ({

        // call all state~
        elapsedTime,
        lastLapTime,
        lastDurationLap,
        lapCount,
        laps,

        // null = kosong atau tidak ada nilai awal stopwatchInterval (awal bgt di state),
        // macam bocah pendiem yang ga bisa diajak ngomong.
        // makanya kalau mau ngomong sama dia, butuh temen/orang yang paham sama dia,
        // dalam hal ini !! (double bang), dia yang nerjemahin maunya si stopwatchInterval
        // !! dia jadi penerjemah dan maksa si stopwatchInterval kalau nilai null (diem aja diajak ngomong) artinya dia gamau atau nilainya false
        // tapi kalau nilainya ada (si stopwatchInterval ngejawab alias ada pergerakan), tandanya dia mau atau true.
        
        startClockTime,
        endClockTime,
        running: !!stopwatchInterval

        // KENAPA KUDU !! soalnya biar akurat 
        // ibaratnya !! = sahabat deket nemplok tau baik-buruk kita dan null anak super ansos 🗿
        // kalau ! = temen biasa yang muka dua :< alias suka muter balikin fakta.
        // makanya, kasus running diatas butuh !!~
    }));
}

// = LOAD STATE =
function loadState() {

    // kotak memori dan biar ga dilupain pas ke refresh~
    // kalau user PERNAH klik start = ada isinya dan ga dilupain
    // tapi kalau GK PERNAH ya berarti kosong atau null dan 0 (sesuai aturan awal yg state)
    const load = JSON.parse(localStorage.getItem('data-stopwatch'));

    // data ini butuh ! satu aja cukup karena ada penahannya si return
    // kalau data ini nilainya null atau kosong, return jadi pengingat buat STOP ga lanjutin perintah dibawahnya
    // tapi kalau ada nilainya, si return ga nahan dan bakal lanjutin perintah selanjutnya
    // ! macam guru piket gerbang sekolah
    // kalau ga pakai dasi atau melanggar peraturan sekolah (null/0 = gaada nilai). Bakal di stop ga boleh masuk ke sekolah.
    // tapi kalau pakai dasi (ada nilai) maka boleh masuk sekolah~
    if (!load) return;

    // pengaturan data tersimpan dan tetap muncul di layar dan bisa dilanjutkan
    elapsedTime = load.elapsedTime;
    lastLapTime = load.lastLapTime;
    // lastDurationLap = load.lastDurationLap;
    lapCount = load.lapCount;
    laps = load.laps || [];

    startClockTime = load.startClockTime ? new Date(load.startClockTime) : null;
    endClockTime = load.endClockTime ? new Date(load.endClockTime) : null;

    // balikin angka dan list lap ke layar
    displayTimeStopwatch(elapsedTime);
    renderLaps();

    // cek stopwatch terakhir pas web ke referesh / mati 
    // dia jalan atw gak?
    if (load.running) {

        // biar gaada BUG pas ke refresh
        // klik refresh dan lagi jalan, itu bisa crash tabrakan
        // kenapa?
        // refresh itu "kondisi menyendiri" atau mengosongkan seluruh operasi terhadap tampilan maupun perintah js (rehat sejenak)
        // nah, kalau refresh kelar, harapannya ya jalan biasa si stopwatch dan gaada konflik internal.
        // makanya ada clearInterval, dimana momen rehat sejenak (refresh) ini ga ikut dihitung jadi dianggap self reward
        // so ketika refresh udh selesai, stopwatch bisa lanjutin kerja lagi tanpa beban dengan suasa yang baru
        if (stopwatchInterval) 
        clearInterval (stopwatchInterval);

        startStopwatch();

    } else {

        // dengan kondisi diatas, maka di cek kembali tampilannya~ biar ga crash atau sesuai yang dimau
        startBtn.classList.remove('d-none');
        pauseBtn.classList.add('d-none');
        lapBtn.disabled = true;

        displayStopwatch.classList.add('fokus');
        displayStopwatch.classList.remove('running');
    }
}

// = EVENT LISTENER : biar fungsinya berjalan yep =
startBtn.addEventListener('click', startStopwatch);
pauseBtn.addEventListener('click', pauseStopwatch);
resetBtn.addEventListener('click', resetStopwatch);
lapBtn.addEventListener('click', lap);
closeModalResult.addEventListener('click', closeLapModal);

// event listener device
let backspaceCount = 0;

document.addEventListener('keydown', (e) => {

    // space = start & pause
    if (e.code === 'Space') {
        e.preventDefault();

        // kalau lagi jalan = pause
        if (stopwatchInterval) {
            pauseBtn.click();
        } 
        
        // kalau pause = start
            else {
            startBtn.click();
        }
    } 

    // enter = lap
    if (e.code === 'Enter') {
        e.preventDefault();
        lapBtn.click();
    }

    // backspace = reset
    if (e.code === 'Backspace') {
        e.preventDefault();
        backspaceCount++;
        if(backspaceCount === 1) {

            resetBtn.click();
        } else if (backspaceCount >= 2) {
            clearSession();
            closeModalResult.click();

            // harus dipanggil lagi, kalau engga, kliknya bakal terus dihitung.
            backspaceCount = 0;
        }
    } 
});  


// = INIT =
// kenapa yang dipangil cuma 4 ini?
// soalnya fungsi lain itu bergantung sama 'pergerakkan user'(klik = .addEventListener)
// sedangkan 4 ini buat nyuruh tampilan layar yg konstan (waktu dan tanggal real time) dan memulihkan data lama saat ter-refresh
function stopwatchInit() {
    autoActiveNavbar(); //dari func navbar-fitur-digilog yep
    loadState();
}