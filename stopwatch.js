fetch('../navbar-fitur/navbar-fitur-digilog.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        setupNavbarLogic();
    })
    .catch(error => {
        console.error('gagal load navbar-fitur:', error);
    });

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
      startBtn         = document.getElementById('startBtn'),
      pauseBtn         = document.getElementById('pauseBtn'),
      resetBtn         = document.getElementById('resetBtn'),
      lapBtn           = document.getElementById('lapBtn'),
      lapsList         = document.getElementById('laps'),
      closeModalResult = document.getElementById('closeModalResult'),
      tanggalHeader    = document.getElementById('date'),
      digitalRealTime  = document.getElementById('digitalClock'),
      resultsSession   = document.getElementById('lapResults'),
      customStopwatch  = document.getElementsByClassName('custom-stopwatch')
;

// ELEMENT MODAL HUB KE BOOTSTRAP
let modal = new bootstrap.Modal(document.getElementById('lapModal'));

// ELEMENT BIAR ADA BUNYI
const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"
);

let date = null,
    digiClock = null
;

// ===== DATE DISPLAY =====
function displayDate() {
    setInterval(() => {

        // disini cuma diperintahin 'ambil' data tanggal saat ini berdasarkan variable 'now'.
        const now = new Date(),
              hariIni = now.toLocaleDateString('id-ID', { weekday: 'long' }),
              tanggalHariIni = now.getDate(),
              bulanIni = now.toLocaleDateString('id-ID', { month: 'long' }),
              tahunIni = now.getFullYear()
        ;

        tanggalHeader.innerHTML = `${hariIni}, ${tanggalHariIni} ${bulanIni} ${tahunIni}`;

    }, 1000);
}

// ===== DIGITAL CLOCK =====
function digitalClock() {
    setInterval(() => {

        // nama variabel jam, pakai let karena jam itu sifatnya ga konstan dan selalu berubah.
        // disini cuma diperintahin 'ambil' data jam saat ini berdasarkan variable 'now'..
        let now = new Date(),
            jamSkrg = now.getHours(),
            menitSkrg = now.getMinutes(),
            detikSkrg = now.getSeconds()
        ;

        // ini aturan si variable, jadi gausah pake 'const' atau 'let' lagi
        // aturan apa?
        // aturan untuk cek nilai jam, menit, detik. Kalau kurang dan 2 angka (10), mata di depannya ditambahi '0'
        jamSkrg = jamSkrg < 10 ? '0' + jamSkrg : jamSkrg;
        menitSkrg = menitSkrg < 10 ? '0' + menitSkrg : menitSkrg;
        detikSkrg = detikSkrg < 10 ? '0' + detikSkrg : detikSkrg;

        digitalRealTime.innerHTML = `${jamSkrg}:${menitSkrg}:${detikSkrg}`;

    }, 1000);
}

// = ELEMEN STATE =
// (data yang dibutuhin buat jalanin stopwatch, disimpen di sini)

let startTime = 0;
// karena settingan awal dari 0

let elapsedTime = 0;
// untuk penghitung waktu dan 0 = belum mulai

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

// = START =
// fungsi startStopwatch dibuat dulu karena 'gerbang' dari jalannya stopwatch
function startStopwatch() {

    if (stopwatchInterval) return;
    // fungsi yang memberikan stopwatchInterval untuk jalan 🔥
    
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

        saveState();
        // biar gak ilang pas di refresh

    }, 50);
    // 50 = setiap 50ms, stopwatch update. 
    // KENAPA 50ms? 
    // Karena kalau terlalu cepat (misal 10ms), 
    // bisa bikin performa turun, terutama di browser yang lebih tua. 
    // Selain itu, 50ms masih cukup halus untuk tampilan stopwatch, jadi tidak akan terlihat patah-patah.

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

    const msStopwatch = Math.floor((elapsedTime % 1000) / 10);
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

    let miliStopwatch = `${String(msStopwatch).padStart(2, '0')}`;

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

        return `${formatStopwatch}<br><span class="mili-style fs-3">00.${miliStopwatch}</span>`;
    } else {
        // ms tetap di baris yang sama
        return `${formatStopwatch}.${String(msStopwatch).padStart(2, '0')}`;
    }

    // displayStopwatch.innerHTML = `${formatStopwatch}`;
    // displayMiliSecStopwatch.innerHTML = `00.${miliStopwatch}`;

    // harus di return
    // kalau gak, ga bakal keluar si angkanya
    // coba aje kalau kagak percaya 🗿 
    // return formatStopwatch;
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

    if (laps.length === 0) {
    // klo gxx ada lap (lap.length === 0) ini yep hasilnya;
        
    // isi body modal nampilin total waktu dan ket 'belum ada lap'
        resultsSession.innerHTML = ` 
            <div class="text-center">
                <div class="mb-3 text-muted">Belum ada lap ⏱️</div>
                <div class="fs-4 font-monospace fw-bold">Total Time: ${formatTime(elapsedTime)}</div>
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
            <div class="mb-3 text-success">
                🟢 Fastest Lap <br>
                #${fastest.id} — ${formatTime(fastest.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </div>

            <div class="mb-3 text-danger">
                🔴 Slowest Lap <br>
                #${slowest.id} — ${formatTime(slowest.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </div>
            
            <div class="mb-2">
                Total Lap: ${laps.length}
            </div>
            
            <div>
                Total Time: ${formatTime(elapsedTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
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

    // kalau udh close, seluruh data di sesi itu = hilang permanen 🥷
    localStorage.removeItem('data-stopwatch');

    // tampilan awal balik yep, makanya ni fungsi dipanggil lagi
    displayTimeStopwatch(0);

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
    const fastestAllLap = Math.min(...laps.slice(1).map(l => l.lapTime));

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

    saveState();

    // cek
    console.log('lapTime:', lapTime);
    console.log('lastDurationLap:', lastDurationLap);
    // console.log('lapDiff:', lapDiff);
}

// = RENDER LAPS =
function renderLaps() {
    lapsList.innerHTML = '';

    // ada di bagian showResult() baca aja
    const fastest = laps.reduce((prev, curr) => curr.lapTime < prev.lapTime ? curr : prev);
    const slowest = laps.reduce((prev, curr) => curr.lapTime > prev.lapTime ? curr : prev);

    // kenapa pake forEach? forEach lebih simpel dari for of
    // ver for of;
    for (let categoryLap of laps) {

        // variabel penampung seluruh data lap (bagian bawah setelah di klik lap) saat dan setelah selesai sesi
        let lapPackage = '';

        if (categoryLap.lapTime === fastest.lapTime) {

            // pakai variabel lapPackage soalnya dia kan yg pegang semua data lap.
            // nah, kalau ada lap paling cepat (fastest) ditandain disini aturannya
            lapPackage = '<span class="badge bg-success">FASTEST</span>';
            
        } else if (categoryLap.lapTime === slowest.lapTime) {

            // pakai variabel lapPackage soalnya dia kan yg pegang semua data lap.
            // nah, kalau ada lap paling lambat (slowest) ditandain disini aturannya
            lapPackage = '<span class="badge bg-danger">SLOWEST</span>';

        }

        // buat div untuk nampung seluruh data lap
        const divLapsData = document.createElement('div');

        // buat classnya biar bisa dimasukin ke div yang spesifik
        divLapsData.classList.add('lap-data');

        // masukin isi dari div lap data yang udh dibuat tadi
        divLapsData.innerHTML = `
            <div>
                <strong>Lap #${categoryLap.id}</strong> ${lapPackage}
            </div>

            <small>
                Lap : ${formatTime(categoryLap.lapTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
                
                <br>

                Total Time : ${formatTime(categoryLap.totalTime).replace(/<br><span[^>]*>|<\/span>/g, '.')}
            </small>
        `;

        // ini yang bikin data lap muncul di layar
        lapsList.appendChild(divLapsData);
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
closeModalResult.addEventListener('click', closeLapModal)

// = INIT =
// kenapa yang dipangil cuma 4 ini?
// soalnya fungsi lain itu bergantung sama 'pergerakkan user'(klik = .addEventListener)
// sedangkan 4 ini buat nyuruh tampilan layar yg konstan (waktu dan tanggal real time) dan memulihkan data lama saat ter-refresh
autoActiveNavbar(); //dari func navbar-fitur-digilog yep
displayDate();
digitalClock();
loadState();