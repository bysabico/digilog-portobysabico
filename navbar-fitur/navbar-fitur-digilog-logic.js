

function descDigilog() {
  const modalDescDigilog = document.getElementById('deskripsi-digilog');

  if (!modalDescDigilog) return;

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

  navLinks.forEach(link => {
    const rawHref = link.getAttribute('href');

    // skip link yang emang belum punya tujuan real (coming-soon, dsb)
    if (!rawHref || rawHref === '#') {
      link.classList.remove('active');
      link.classList.remove('disable-nav');
      link.removeEventListener('click', preventNavClick);
      return;
    }

    const targetUrl = new URL(link.href, window.location.origin);
    
    if (window.location.pathname.endsWith(targetUrl.pathname)) {
      link.classList.add('active');
      link.classList.add('disable-nav');
      link.addEventListener('click', preventNavClick);
    } else {
      link.classList.remove('active');
      link.classList.remove('disable-nav');
      link.removeEventListener('click', preventNavClick);
    }
  });
}

function preventNavClick(e) {
  e.preventDefault();
}

// = LIGHT / DARK MODE =
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

// = SETUP NAVBAR =
function setupNavbarFiturLogic() {
  autoActiveNavbar();
  lightDarkMode();
  descDigilog();
}

setupNavbarFiturLogic();