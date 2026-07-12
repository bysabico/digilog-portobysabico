function descDigilogModal() {
  const modalDescDigilog = document.getElementById('deskripsi-digilog');

  if (!modalDescDigilog) return; // stop kalau elemen ga ada di halaman ini

  modalDescDigilog.addEventListener('show.bs.modal', 
    () => {
    fetch('../reusable-comp/desk-digilog/desc-digilog.html')
      .then(response => response.text())
      .then(data => {
        const isiDescDigilog = document.getElementById('isiDescDigilog');
        isiDescDigilog.innerHTML = data;
        })
      .catch(error => {
        console.error('gagal load desk-digilog:', error);
      })
    }
  )
}

// btn digital-analog mode
function digitalAnalogMode() {
  const digitalBtn = document.getElementById('digitalBtn'),
        analogBtn = document.getElementById('analogBtn'),
        btn12 = document.getElementById('btn12'),
        btn24 = document.getElementById('btn24');

  if (!digitalBtn || !analogBtn) return;

  const savedMode = localStorage.getItem('clock-mode') || 'show-digital';

  if(savedMode === 'show-analog') {
        
    digitalBtn.classList.add('active');
    analogBtn.classList.remove('active');

    digitalBtn.classList.add('d-none');
    analogBtn.classList.remove('d-none');

    btn12.classList.add('d-none');
    btn24.classList.add('d-none');
  } else {
        
    analogBtn.classList.add('active');
    digitalBtn.classList.remove('active');

    analogBtn.classList.add('d-none');
    digitalBtn.classList.remove('d-none');

    btn12.classList.remove('d-none');
    btn24.classList.remove('d-none');
  }

  digitalBtn.addEventListener('click', () => {
    digitalBtn.classList.add('d-none');
    analogBtn.classList.remove('d-none');
    btn12.classList.add('d-none');
    btn24.classList.add('d-none');
    localStorage.setItem('clock-mode', 'show-analog');
  });

  analogBtn.addEventListener('click', () => {
    analogBtn.classList.add('d-none');
    digitalBtn.classList.remove('d-none');
    btn12.classList.remove('d-none');
    btn24.classList.remove('d-none');
    localStorage.setItem('clock-mode', 'show-digital');
  });
}

// light-dark mode
function lightDarkMode() {
  const modeScreen = document.getElementById('screen-mode');
  
  if (!modeScreen) return;

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    modeScreen.checked = true;
  } else {
    document.documentElement.setAttribute("data-bs-theme", "light");
    modeScreen.checked = false;
  }

  modeScreen.addEventListener('change', () => {
    const theme = modeScreen.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// = CLEAR USERNAME =
function clearUsername() {

  const logoutBtn = document.getElementById('logout');

  // kalau button belum ada
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {

    localStorage.clear();

  });
}

function setupNavbarLogic() {
  descDigilogModal()
  digitalAnalogMode();
  lightDarkMode();
  clearUsername();
};

setupNavbarLogic()