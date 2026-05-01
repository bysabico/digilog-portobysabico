function digitalAnalogMode() {
  // for digital analog mode
  const digitalBtn = document.getElementById('digitalBtn');
  const analogBtn = document.getElementById('analogBtn');
  const btn12 = document.getElementById('btn12');
  const btn24 = document.getElementById('btn24');

  digitalBtn.addEventListener('click', () => {
    // digital mode
    digitalBtn.classList.add('d-none', 'active');
    analogBtn.classList.remove('d-none');

    // mode digital, btn12 dan btn24 terlihat
    btn12.classList.add('d-none');
    btn24.classList.add('d-none');

    // Enable 12/24 buttons
    btn12.disabled = true;
    btn24.disabled = true;

    // btn12 dan btn24 aktif
    btn12.addEventListener('click', () => {
        btn12.classList.add('active');
        btn24.classList.remove('active');
    });

    btn24.addEventListener('click', () => {
        btn24.classList.add('active');
        btn12.classList.remove('active');
    });
  });

  analogBtn.addEventListener('click', () => {
    // analog mode
    analogBtn.classList.add('d-none', 'active');
    digitalBtn.classList.remove('d-none');

    // saat mode analog, btn12 dan btn24 tidak terlihat
    btn12.classList.remove('d-none');
    btn24.classList.remove('d-none');
    
    // Disable 12/24 buttons
    btn12.disabled = false;
    btn24.disabled = false;
  });
}

function displayDigitalMode() {
  const digitalMode = document.querySelectorAll('#switcher .nav-item');

  digitalMode.forEach(btn => {
    btn.addEventListener('click', () => {
      digitalMode.forEach (b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  }); 
}

// light-dark mode
function lightDarkMode() {
  const modeScreen = document.getElementById('screen-mode');

  // 🔥 LOAD dari localStorage
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    modeScreen.checked = true;
  } else {
    document.documentElement.setAttribute("data-bs-theme", "light");
    modeScreen.checked = false;
  }

  // 🔥 SAVE saat berubah
  modeScreen.addEventListener('change', () => {
    const theme = modeScreen.checked ? "dark" : "light";

    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// clear username
function clearUsername() {
  const clearUsername = document.getElementById('logout');
  clearUsername.addEventListener('click', () => {
    localStorage.clear();
  });
}

function setupNavbarLogic() {
  digitalAnalogMode();
  displayDigitalMode();
  lightDarkMode();
  clearUsername();
};

setupNavbarLogic();