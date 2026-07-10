


// ===== DATE DISPLAY =====
function displayDate() {

    const tanggalHeader    = document.getElementById('date');
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
    const digitalRealTime  = document.getElementById('digitalClock');
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

function dateTimeInit() {
    displayDate();
    digitalClock();
}