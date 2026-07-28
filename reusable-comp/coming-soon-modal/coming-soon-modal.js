function loadComingSoonModal(namaFitur) {
    fetch('../reusable-comp/coming-soon-modal/coming-soon-modal.html')
    .then(res => {
        if (!res.ok) {
            throw new Error(`Fetch gagal: ${res.status} ${res.statusText}`);
        }
        return res.text();
    })
    .then(dataRes => {
        document.getElementById('coming-soon-container').innerHTML = dataRes;
        
        const namaFiturEl = document.getElementById('nama-fitur');

        namaFiturEl.textContent = namaFitur;

        const comingSoonModal = new bootstrap.Modal(document.getElementById('coming-soon-modal'));
        comingSoonModal.show();

        let countdown = 10;
        const totalCountdown = 10,
            countdownNumber = document.getElementById('countdown-number'),
            countdownBar = document.getElementById('countdown-bar');

        countdownNumber.textContent = countdown;
        countdownBar.style.width = '100%';

        const interval = setInterval(() => {
            countdown--;
            countdownNumber.textContent = countdown;
            countdownBar.style.width = (countdown/totalCountdown) * 100 + '%';

            if (countdown <= 0) {
                clearInterval(interval);
                comingSoonModal.hide();

                window.location.href = '../main/main-digilog.html';
            }
        }, 1000);
    })
}

document.querySelectorAll('.coming-soon-btn').forEach((a) => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
    
        const namaFitur = a.dataset.feature;
        loadComingSoonModal(namaFitur);
    })
})