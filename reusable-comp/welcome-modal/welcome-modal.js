window.addEventListener('DOMContentLoaded', () => {
    fetch('../reusable-comp/welcome-modal/welcome-modal.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('welcome-modal-container').innerHTML = data;

        const welcomeModal = new bootstrap.Modal(document.getElementById('welcome-modal'));
        welcomeModal.show();

        setTimeout(() => {
            welcomeModal.hide();
        }, 5000)
    })
    .catch(error => {
        console.error('gagal load welcome-modal:', error);
    })
})