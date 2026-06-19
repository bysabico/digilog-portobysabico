
const usernameInput = document.getElementById('username');
const anonCheckbox = document.getElementById('anon-checkbox');
const rememberMeCheckbox = document.getElementById('remember-me');
const sendBtn = document.getElementById('send-btn');
const customAlert = document.getElementById('custom-alert');
const alertMessage = document.getElementById('alert-message');

// user input nama / anon
function userInput() {
  usernameInput.addEventListener('input', () => {

    // kalau username ada = checkbox anon disabled
    if(usernameInput.value.trim() !==''){
      anonCheckbox.disabled = true;
      usernameInput.value = usernameInput.value.toUpperCase();
    } 
      
    // tapi kalau gaada bisa diisi~
    else {
      anonCheckbox.disabled = false;
    }
  });

  anonCheckbox.addEventListener('change', () => {
    // kalau checkbox anon di check = username disabled
    if(anonCheckbox.checked){
      usernameInput.disabled = true;

      // kalau user sempat isi kolom username, auto HAPUS!!
      usernameInput.value ="";
    } 
      
    // tapi kalau gaada bisa diisi~
    else {
      usernameInput.disabled = false;
    }
  });
}

// alert untuk milih user atau anon
function showAlertMessage(message) {
    
  // tampilin alert
  alertMessage.textContent = message;
  customAlert.style.remove('d-none');

  // klik random biar alert ketutup
  customAlert.addEventListener('click', () => {
    customAlert.style.add('d-none');
  });

  // alert tertutup otomatis
  setTimeout(() => {
    customAlert.style.add('d-none');
  }, 2000);  
}

// send inputan user
function sendUserInput() {  
  
  // kalau username dan checkbox anonim belum diisi, keluar peringatan ini
  if(!usernameInput.value.trim() && !anonCheckbox.checked){
    showAlertMessage('Ayo isi nama atau centang "Login as Anonim"');
    return;
  };

  // username atau checkbox anonim diisi = langsung lanjut ke main page
  const finalNameUser = anonCheckbox.checked ? "KAMU" : usernameInput.value;

  // hmmmm masih error ding :(
  if (rememberMeCheckbox.checked) {

    localStorage.setItem('username-or-anonim',finalNameUser);

  } else {

    sessionStorage.setItem('login-once', 'true');
    sessionStorage.setItem('username-or-anonim',finalNameUser);
    
  }

  // animasi transisi login to main-page
  const gerbangKiri = document.getElementById('gerbang-kiri');
  const gerbangKanan = document.getElementById('gerbang-kanan');
  const loginPageCard = document.getElementById('login-page');

  // login card ditambahin animasi 'slide-up'
  loginPageCard.classList.add('slide-up');

  // tampilan layar agak mengedip-ngedip dan background jam zoom (css)
  document.body.classList.add('fade-overlay');
  document.body.classList.add('bg-zoom');
      
  // animasi gerbang kiri dan kanan terlihat
  gerbangKiri.classList.add('visible');
  gerbangKanan.classList.add('visible');

  // animasi gerbang kiri dan kanan terbuka
  setTimeout(() => {
    gerbangKiri.classList.add('open');
    gerbangKanan.classList.add('open');
  }, 500);

  // muncul halaman main-page
  setTimeout(() => {
    window.location.href = "../main/main-digilog.html";
  }, 1500)
}

// enter = ke kirim
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')
  sendUserInput();
})

anonCheckbox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter')
  sendUserInput();
})

// klik btn send = ke kirim
sendBtn.addEventListener('click', sendUserInput);

userInput();