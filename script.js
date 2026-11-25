const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const bubble = document.getElementById('inviteBubble');
const catImg = document.getElementById('catImg');

const DANGER_DISTANCE = 120;
const MAX_CLICKS = 3;

const noImages = [
  'images/sad-cat.png',
  'images/sad-cat1.png',
  'images/2.png'
];

const dodgeImage = 'images/cat-smug.png';
const happyImage = 'images/happy-cat.gif';

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
const happySound = document.getElementById('happySound');
const crySound = document.getElementById('crySound');
const evilSound = document.getElementById('evilSound');

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function stopSound(sound) {
  sound.pause();
  sound.currentTime = 0;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const confettiColors = ['#ffd166', '#ff7b00', '#ff8fa3', '#7bffb0', '#6ec6ff', '#ffffff'];
let pieces = [];
let confettiRunning = false;

function fireConfetti(amount = 160) {
  for (let i = 0; i < amount; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      size: 6 + Math.random() * 8,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      spin: -0.2 + Math.random() * 0.4
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(drawConfetti);
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pieces.forEach((p) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rotation += p.spin;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  });

  // remove pieces that fell off the screen
  pieces = pieces.filter((p) => p.y < canvas.height + 20);

  if (pieces.length > 0) {
    requestAnimationFrame(drawConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
const FORM_URL = 'https://formspree.io/f/xgakrbjk';

function sendResponse(answer, when = '') {
  fetch(FORM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      answer: answer,
      when: when,
      timesPressedNo: noClicks,
      sentAt: new Date().toLocaleString('en-PH')
    })
  }).catch(() => {});   // ignore errors so the page never breaks
}

function playHappySound() {
  happySound.currentTime = 0;
  happySound.play().catch(() => {});  // ignore if the browser blocks it
}

function setCat(src) {
  catImg.src = src;
  catImg.classList.remove('bounce');
  void catImg.offsetWidth;
  catImg.classList.add('bounce');
}

let noClicks = 0;
let dodgeMode = false;
const noMessages = [
  "Sige na please laro na tayo",
  "Bubuhatin kita kalaruin mo lang ako huhu😿",
  "Last na please, laro na tayo 🥺"
];
const noLabels = [
  "Ayoko nga sabi!",   // label after the 1st click
  "Bahala ka sa buhay mo!"     // label after the 2nd click
];

const dodgeMessage = "Ayaw parin talaga? Okay tignan natin kung maka no kapa ";

// Move the No button to a random spot, away from the pointer
function moveNoButton(pointerX = -9999, pointerY = -9999) {
  const padding = 12;
  const maxX = window.innerWidth - noBtn.offsetWidth - padding;
  const maxY = window.innerHeight - noBtn.offsetHeight - padding;

  let x, y;
  for (let i = 0; i < 15; i++) {
    x = padding + Math.random() * (maxX - padding);
    y = padding + Math.random() * (maxY - padding);

    const dx = x + noBtn.offsetWidth / 2 - pointerX;
    const dy = y + noBtn.offsetHeight / 2 - pointerY;
    if (Math.hypot(dx, dy) > DANGER_DISTANCE * 1.5) break;
  }

  noBtn.style.position = 'fixed';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// Make No smaller and Yes bigger
function updateSizes() {
  const noScale = Math.max(0.4, 1 - noClicks * 0.2);

  // Yes grows a lot more: ~1.8x after click 2, ~3x after click 3
  const yesSteps = [1, 1.3, 1.8, 3];
  let yesScale = yesSteps[Math.min(noClicks, yesSteps.length - 1)];

  // Don't let Yes grow wider than the screen (important on phones)
  const maxScale = (window.innerWidth * 0.9) / yesBtn.offsetWidth;
  yesScale = Math.min(yesScale, maxScale);

  noBtn.style.transform = `scale(${noScale})`;
  yesBtn.style.transform = `scale(${yesScale})`;
}

// Clicking No (works only for the first 3 clicks)
noBtn.addEventListener('click', (e) => {
  if (dodgeMode) {
    e.preventDefault();
    return;
  }

  noClicks++;
  if (noLabels[noClicks - 1]) noBtn.textContent = noLabels[noClicks - 1];   // <-- new
  bubble.textContent = noMessages[noClicks - 1];
  setCat(noImages[noClicks - 1]);

  if (noClicks === 1) playSound(crySound);

  moveNoButton(e.clientX, e.clientY);

  if (noClicks >= 2) updateSizes();

  if (noClicks >= MAX_CLICKS) {2
    dodgeMode = true;
    bubble.textContent = dodgeMessage;
    setCat(dodgeImage);
    stopSound(crySound);
    playSound(evilSound);
  }
});

// Dodge mode (mouse): run when the cursor gets near
document.addEventListener('mousemove', (e) => {
  if (!dodgeMode) return;

  const rect = noBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  if (Math.hypot(e.clientX - centerX, e.clientY - centerY) < DANGER_DISTANCE) {
    moveNoButton(e.clientX, e.clientY);
  }
});

// Dodge mode (finger): run the moment it touches the button
noBtn.addEventListener('touchstart', (e) => {
  if (!dodgeMode) return;
  e.preventDefault();
  const touch = e.touches[0];
  moveNoButton(touch.clientX, touch.clientY);
}, { passive: false });
const choices = document.querySelector('.choices');
const schedule = document.getElementById('schedule');
const nowBtn = document.getElementById('nowBtn');
const confirmBtn = document.getElementById('confirmBtn');
const dateTimeInput = document.getElementById('dateTime');
const errorMsg = document.getElementById('errorMsg');

// Format a date as YYYY-MM-DDTHH:mm in local time (what datetime-local expects)
function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
         `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Can't pick a time in the past
dateTimeInput.min = toLocalInputValue(new Date());

// Show the schedule card when Yes is clicked
yesBtn.addEventListener('click', () => {
  stopSound(crySound);
  stopSound(evilSound);
  choices.classList.add('hidden');
  schedule.classList.remove('hidden');
  bubble.textContent = "Di ka naman pala makunat ayain e game!";
  setCat(happyImage);
  fireConfetti();
  playHappySound();
});

// "Now" option
nowBtn.addEventListener('click', () => {
  schedule.classList.add('hidden');
  bubble.textContent = "Open Mobile Legends right now! Let's gooo 🔥🎮";
  sendResponse('Now');
});

// Pick a date and time
confirmBtn.addEventListener('click', () => {
  const value = dateTimeInput.value;
  const chosen = new Date(value);

  if (!value || chosen <= new Date()) {
    errorMsg.classList.remove('hidden');
    return;
  }

  errorMsg.classList.add('hidden');
  schedule.classList.add('hidden');

  const nice = chosen.toLocaleString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
    
    
  });
  sendResponse('Scheduled', nice);
  bubble.textContent = `siguraduhin mo na mag o-open ka sa oras na yan hhmmpp! ${nice}.`;
});
