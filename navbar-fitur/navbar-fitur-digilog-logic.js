// = DISPLAY DIGITAL MODE =
function displayDigitalMode() {

  const digitalMode = document.querySelectorAll('#switcher .nav-item');

  if (!digitalMode.length) return;

  digitalMode.forEach(btn => {

    btn.addEventListener('click', () => {

      digitalMode.forEach(b =>
        b.classList.remove('active')
      );

      btn.classList.add('active');
    });

  });

}

// = css active navbar =
function autoActiveNavbar() {
  const navLinks = document.querySelectorAll('#navbar-fitur-btn .navbar-fitur-kostum');
  
  if (!navLinks.length) return; 
  // Jaga-jaga kalau elemen navbar belum dimuat

  navLinks.forEach(link => {
    const targetUrl = new URL(link.href, window.location.origin);
    
    if (window.location.pathname.endsWith(targetUrl.pathname)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }

  });
}

// = LIGHT / DARK MODE =
function lightDarkMode() {

  const modeScreen = document.getElementById('screen-mode');

  // kalau element belum ada
  if (!modeScreen) return;


  // = LOAD THEME =
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {

    document.documentElement.setAttribute(
      "data-bs-theme",
      "dark"
    );

    modeScreen.checked = true;

  }

  else {

    document.documentElement.setAttribute(
      "data-bs-theme",
      "light"
    );

    modeScreen.checked = false;

  }


  // = CHANGE THEME =
  modeScreen.addEventListener('change', () => {

    const theme = modeScreen.checked
      ? "dark"
      : "light";

    document.documentElement.setAttribute(
      "data-bs-theme",
      theme
    );

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


// = SETUP NAVBAR =
function setupNavbarLogic() {
  autoActiveNavbar();
  displayDigitalMode();
  lightDarkMode();
  clearUsername();
}

// = INIT =
document.addEventListener('DOMContentLoaded', () => {
  setupNavbarLogic();
});