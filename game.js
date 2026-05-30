// --- C64 Palette ---
const C64 = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#882000',
  cyan: '#68B0C0',
  purple: '#603C90',
  green: '#509C40',
  blue: '#304090',
  yellow: '#D8C450',
  orange: '#C86400',
  brown: '#503400',
  lightRed: '#C07060',
  darkGrey: '#404040',
  grey: '#808080',
  lightGreen: '#B4E880',
  lightBlue: '#A0B0E0',
  lightGrey: '#B0B0B0'
};

// --- Web Audio API Synth (C64 SID Emulator v2) ---
class RetroSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playFlap() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(360, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Sound 7: Heavy Launch Flap
  playFlapLaunch() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, this.ctx.currentTime + 0.18);

    sub.type = 'triangle';
    sub.frequency.setValueAtTime(45, this.ctx.currentTime);
    sub.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.18);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    
    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    sub.start();
    osc.stop(this.ctx.currentTime + 0.18);
    sub.stop(this.ctx.currentTime + 0.18);
  }

  playJoust() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const metal = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.25);

    metal.type = 'sine';
    metal.frequency.setValueAtTime(1800, this.ctx.currentTime);
    metal.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.12);
    
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    metal.connect(gain);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    metal.start();
    noise.start();
    osc.stop(this.ctx.currentTime + 0.25);
    metal.stop(this.ctx.currentTime + 0.25);
    noise.stop(this.ctx.currentTime + 0.25);
  }

  playShieldBreak() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.45);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.45);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.45);
    osc2.stop(this.ctx.currentTime + 0.45);
  }

  playDeath() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.85);

    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.85);
    
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);
    
    osc.connect(gain);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    noise.start();
    osc.stop(this.ctx.currentTime + 0.85);
    noise.stop(this.ctx.currentTime + 0.85);
  }

  playHatch() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.setValueAtTime(950, this.ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }

  playGrab() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.65);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.65);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.65);
  }

  playCollect() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playWaveStart() {
    if (!this.ctx || this.isMuted) return;
    const notes = [329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.22);
    });
  }

  // --- 10 NEW EVENT SOUNDS ---

  // Sound 1: Lava Bubble Pop
  playBubblePop() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Sound 2: Pterodactyl Warning Screech
  playPteroScreech() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1100, this.ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  // Sound 3: Pterodactyl Slay Chime Fanfare
  playPteroSlay() {
    if (!this.ctx || this.isMuted) return;
    const notes = [600, 800, 1000, 1200, 1600];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.15);
    });
  }

  // Sound 4: Egg Roll Chirp
  playEggRoll() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  // Sound 5: Shield Deflect Ping
  playShieldDeflect() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Sound 6: Speed Boost Powerup Chord
  playSpeedBoost() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.06);
      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.18);
    });
  }

  // Sound 8: Wave Victory Jingle
  playVictory() {
    if (!this.ctx || this.isMuted) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.2);
    });
  }

  // Sound 9: Low Life Dual Pulse Warning
  playLowLife() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.setValueAtTime(130, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.24);
  }

  // Sound 10: Leaderboard Menu Fanfare arpeggios
  playLeaderboard() {
    if (!this.ctx || this.isMuted) return;
    const notes = [440.00, 554.37, 659.25, 880.00, 659.25, 554.37];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.14);
    });
  }
}

const synth = new RetroSynth();

// --- Game Configurations ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const border = document.getElementById('screenBorder');

let screenShakeIntensity = 0;

const platforms = [
  { x: 0, y: 388, w: 180, h: 12 },
  { x: 460, y: 388, w: 180, h: 12 },
  { x: 80, y: 300, w: 160, h: 12 },
  { x: 400, y: 300, w: 160, h: 12 },
  { x: 180, y: 200, w: 280, h: 12 },
  { x: 20, y: 120, w: 140, h: 12 },
  { x: 480, y: 120, w: 140, h: 12 },
  { x: 260, y: 100, w: 120, h: 12 }
];

// Relocated safe spawn points (prevent overlap on start)
const spawnPoints = [
  { x: 80, y: 80 },
  { x: 540, y: 80 },
  { x: 100, y: 260 },
  { x: 500, y: 260 }
];

// --- Keyboard input state ---
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    if (gameState === 'PLAYING') triggerFlap();
  }
  if (e.code === 'KeyM') {
    synth.isMuted = !synth.isMuted;
    document.getElementById('musicStatus').innerText = synth.isMuted ? 'OFF' : 'ON';
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// --- Mobile buttons state ---
const mobileControls = { left: false, right: false };
document.getElementById('btnLeft').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.left = true; });
document.getElementById('btnLeft').addEventListener('touchend', () => { mobileControls.left = false; });
document.getElementById('btnRight').addEventListener('touchstart', (e) => { e.preventDefault(); mobileControls.right = true; });
document.getElementById('btnRight').addEventListener('touchend', () => { mobileControls.right = false; });
document.getElementById('btnFlap').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameState === 'PLAYING') triggerFlap();
});

// --- Entities & State Variables ---
let gameState = 'MENU';
let score = 0;
let highScore = parseInt(localStorage.getItem('joust_high') || '0');
let lives = 3;
let wave = 1;
let waveTimer = 0;
let survivalTimer = 0;

let player = null;
let enemies = [];
let eggs = [];
let powerups = [];
let particles = [];
let pterodactyl = null;
let floatingTexts = [];
let lavaRipples = [];

// Populate lava heat ripples
for (let i = 0; i < 6; i++) {
  lavaRipples.push({
    x: Math.random() * 640,
    y: 380 - Math.random() * 60,
    w: Math.random() * 15 + 10,
    speed: Math.random() * 0.4 + 0.2
  });
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -1.0;
    this.alpha = 1.0;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.025;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = '8px "Press Start 2P"';
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

let lavaHand = {
  active: false,
  x: 320,
  y: 420,
  target: null,
  width: 24,
  height: 40
};

// --- Particles Engine ---
class Particle {
  constructor(x, y, color, type = 'spark') {
    this.x = x;
    this.y = y;
    this.type = type; // spark, feather, bubble
    this.vx = (Math.random() - 0.5) * (type === 'feather' ? 2 : 6);
    this.vy = (Math.random() - 0.5) * (type === 'feather' ? 1.2 : 6) - (type === 'bubble' ? 1.5 : 0);
    this.size = type === 'feather' ? Math.random() * 4 + 3 : Math.random() * 3 + 2;
    this.color = color;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.type === 'feather') {
      this.vy += 0.06;
      this.vx += Math.sin(this.angle) * 0.08;
      this.angle += 0.06;
    } else if (this.type === 'bubble') {
      this.vy -= 0.03;
      this.vx *= 0.94;
    } else {
      this.vy += 0.16;
    }
    this.life -= this.decay;
  }

  draw() {
    ctx.fillStyle = this.color;
    if (this.type === 'feather') {
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size / 2));
    } else {
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size));
    }
  }
}

// --- Split Wrap Rendering Utility ---
// Draws the entity wrapped around the edges seamlessly to avoid graphic pop-out issues.
function drawWrappedEntity(x, width, drawCallback) {
  // Primary Draw
  drawCallback(x);
  
  // Wrap-left duplicate
  if (x < 0) {
    drawCallback(x + canvas.width);
  }
  // Wrap-right duplicate
  if (x + width > canvas.width) {
    drawCallback(x - canvas.width);
  }
}

// --- Powerups ---
class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 18;
    this.height = 18;
    this.pulse = 0;
  }

  update() {
    this.pulse += 0.1;
  }

  draw() {
    const pulseOffset = Math.sin(this.pulse) * 3;
    drawWrappedEntity(this.x, this.width, (dx) => {
      if (this.type === 'shield') {
        ctx.strokeStyle = C64.cyan;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dx + 9, this.y + 9, 8 + pulseOffset, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = C64.lightBlue;
        ctx.fillRect(dx + 6, this.y + 6, 6, 6);
      } else if (this.type === 'gold_egg') {
        ctx.fillStyle = C64.yellow;
        ctx.beginPath();
        ctx.ellipse(dx + 9, this.y + 9, 6 + pulseOffset/2, 8 + pulseOffset/2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}

// --- Player Setup ---
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 320;
    this.y = 150;
    this.vx = 0;
    this.vy = 0;
    this.width = 24;
    this.height = 32;
    this.facing = 1;
    this.animFrame = 0;
    this.flapCycle = 0;
    this.walkCycle = 0;
    this.invulnerable = 120;
    this.isGrabbed = false;
    this.hasShield = false;
    this.speedBoostTimer = 0;
    
    // Squash & Stretch animations
    this.squashX = 1.0;
    this.squashY = 1.0;
    this.wasOnGround = false;
  }

  update() {
    if (this.isGrabbed && lavaHand.active && lavaHand.target === this) return; 

    let moveLeft = keys['ArrowLeft'] || keys['KeyA'] || mobileControls.left;
    let moveRight = keys['ArrowRight'] || keys['KeyD'] || mobileControls.right;

    let acc = 0.25;
    let maxSpeed = 4.5;
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer--;
      acc = 0.4;
      maxSpeed = 6.0;
    }

    if (moveLeft) {
      this.vx -= acc;
      this.facing = -1;
      this.walkCycle += 0.25;
    } else if (moveRight) {
      this.vx += acc;
      this.facing = 1;
      this.walkCycle += 0.25;
    } else {
      this.vx *= 0.94;
    }

    if (this.vx > maxSpeed) this.vx = maxSpeed;
    if (this.vx < -maxSpeed) this.vx = -maxSpeed;

    this.vy += 0.18;
    if (this.vy > 8) this.vy = 8;

    this.x += this.vx;
    this.y += this.vy;

    // Edge wrapping
    if (this.x < -this.width) this.x = canvas.width;
    if (this.x > canvas.width) this.x = -this.width;

    // Platform Collisions
    let onGround = false;
    platforms.forEach(plat => {
      if (this.x + this.width > plat.x && this.x < plat.x + plat.w) {
        if (this.y + this.height >= plat.y && this.y + this.height - this.vy <= plat.y + 6) {
          this.y = plat.y - this.height;
          this.vy = 0;
          onGround = true;
        } else if (this.y >= plat.y + plat.h - 6 && this.y + this.vy <= plat.y + plat.h) {
          this.y = plat.y + plat.h;
          this.vy = 0.5;
        }
      }
    });

    if (onGround) {
      if (!this.wasOnGround) {
        // Land impact: squash ostrich vertical scale
        this.squashX = 1.3;
        this.squashY = 0.7;
      }
      this.vy = 0;
      this.animFrame = Math.floor(this.walkCycle) % 3; 
    } else {
      this.animFrame = Math.floor(this.flapCycle) % 2 + 3; 
    }
    
    this.wasOnGround = onGround;

    // Smooth return to base shape scale
    this.squashX += (1.0 - this.squashX) * 0.16;
    this.squashY += (1.0 - this.squashY) * 0.16;

    if (this.invulnerable > 0) this.invulnerable--;
  }

  draw() {
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 6) % 2 === 0) return;

    drawWrappedEntity(this.x, this.width, (dx) => {
      ctx.save();
      // Translate to center-bottom (feet) to squash and skew from ground pivot
      ctx.translate(dx + this.width / 2, this.y + this.height);
      ctx.scale(this.facing * this.squashX, this.squashY);

      // Lean tilt forward/backward based on movement speed
      const lean = this.vx * 0.035;
      ctx.rotate(lean);
      
      // Move offset back up to draw normally
      ctx.translate(0, -this.height);

      // Ostrich Mount body
      ctx.fillStyle = C64.lightBlue;
      ctx.fillRect(-10, 12, 20, 10); // Body coords offset modified to fit bottom pivot

      // Procedural Leg Running Animation
      ctx.fillStyle = C64.purple;
      const legFrame = this.animFrame % 3;
      if (this.vy === 0) { // On Ground
        if (legFrame === 0) {
          ctx.fillRect(-6, 22, 3, 8);
          ctx.fillRect(3, 22, 3, 8);
        } else if (legFrame === 1) {
          ctx.fillRect(-8, 22, 3, 5);
          ctx.fillRect(-5, 25, 3, 5);
          ctx.fillRect(1, 22, 3, 5);
          ctx.fillRect(4, 25, 3, 5);
        } else {
          ctx.fillRect(-4, 22, 3, 8);
          ctx.fillRect(6, 22, 3, 8);
        }
      } else { // Flying
        ctx.fillRect(-7, 22, 3, 6);
        ctx.fillRect(2, 22, 3, 6);
      }

      // Head & Neck
      ctx.fillStyle = C64.lightBlue;
      ctx.fillRect(8, 4, 4, 10);
      ctx.fillRect(10, 2, 6, 4);

      // Lance (Glows if speed boosted)
      ctx.strokeStyle = this.speedBoostTimer > 0 ? C64.white : C64.yellow;
      ctx.lineWidth = this.speedBoostTimer > 0 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(24, 6);
      ctx.stroke();

      // Rider (Knight)
      ctx.fillStyle = C64.cyan;
      ctx.fillRect(-6, 2, 12, 10);
      ctx.fillStyle = C64.white;
      ctx.fillRect(-4, -2, 8, 5);
      ctx.fillStyle = C64.red;
      ctx.fillRect(this.facing === 1 ? 2 : -4, 0, 2, 2);

      // Wing flaps
      ctx.fillStyle = C64.purple;
      let wingFrame = Math.floor(this.flapCycle) % 3;
      if (wingFrame === 0) ctx.fillRect(-8, 14, 12, 4);
      else if (wingFrame === 1) ctx.fillRect(-8, 11, 12, 4);
      else ctx.fillRect(-8, 17, 12, 4);

      ctx.restore();

      // Shield Bubble
      if (this.hasShield) {
        ctx.save();
        ctx.strokeStyle = C64.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx + this.width / 2, this.y + this.height / 2, 22 + Math.sin(Date.now() / 80) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }
}

function triggerFlap() {
  if (!player || player.isGrabbed) return;
  if (player.vy === 0) {
    synth.playFlapLaunch();
  } else {
    synth.playFlap();
  }
  player.vy = -3.4;
  player.flapCycle += 1.0;
  
  for (let i = 0; i < 2; i++) {
    particles.push(new Particle(player.x + player.width / 2, player.y + player.height, C64.lightGrey, 'feather'));
  }
}

// --- Enemy Setup ---
class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() > 0.5 ? 1.5 : -1.5);
    this.vy = 0;
    this.type = type;
    this.width = 24;
    this.height = 32;
    this.facing = this.vx > 0 ? 1 : -1;
    this.flapTimer = Math.random() * 40;
    this.walkCycle = 0;
    this.isGrabbed = false;
    
    // Squash & Stretch
    this.squashX = 1.0;
    this.squashY = 1.0;
    this.wasOnGround = false;
  }

  update() {
    if (this.isGrabbed && lavaHand.active && lavaHand.target === this) return;

    this.flapTimer--;
    if (this.flapTimer <= 0) {
      let flapChance = 0.05;
      
      if (this.type === 'Hunter') {
        if (player && this.y + 12 > player.y) flapChance = 0.3;
      } else if (this.type === 'ShadowLord') {
        if (player && this.y + 50 > player.y) flapChance = 0.45;
        this.vx += (this.x < player.x ? 0.2 : -0.2);
      } else {
        if (this.vy > 1.0) flapChance = 0.18;
      }

      if (this.y > 330) flapChance = 0.75; // lava hand dodge

      if (Math.random() < flapChance) {
        this.vy = -2.9;
      }
      this.flapTimer = Math.random() * 25 + 8;
    }

    let maxSpeed = this.type === 'ShadowLord' ? 3.8 : 2.2;
    if (this.vx > maxSpeed) this.vx = maxSpeed;
    if (this.vx < -maxSpeed) this.vx = -maxSpeed;

    this.vy += 0.16;
    if (this.vy > 8) this.vy = 8;

    this.x += this.vx;
    this.y += this.vy;
    this.walkCycle += Math.abs(this.vx) * 0.15;

    if (this.x < -this.width) this.x = canvas.width;
    if (this.x > canvas.width) this.x = -this.width;

    this.facing = this.vx > 0 ? 1 : -1;

    let onGround = false;
    platforms.forEach(plat => {
      if (this.x + this.width > plat.x && this.x < plat.x + plat.w) {
        if (this.y + this.height >= plat.y && this.y + this.height - this.vy <= plat.y + 6) {
          this.y = plat.y - this.height;
          this.vy = 0;
          onGround = true;
        } else if (this.y >= plat.y + plat.h - 6 && this.y + this.vy <= plat.y + plat.h) {
          this.y = plat.y + plat.h;
          this.vy = 0.5;
        }
      }
    });

    if (onGround) {
      if (!this.wasOnGround) {
        this.squashX = 1.25;
        this.squashY = 0.75;
      }
    }
    this.wasOnGround = onGround;

    this.squashX += (1.0 - this.squashX) * 0.16;
    this.squashY += (1.0 - this.squashY) * 0.16;
  }

  draw() {
    drawWrappedEntity(this.x, this.width, (dx) => {
      ctx.save();
      ctx.translate(dx + this.width / 2, this.y + this.height);
      ctx.scale(this.facing * this.squashX, this.squashY);

      const lean = this.vx * 0.035;
      ctx.rotate(lean);

      ctx.translate(0, -this.height);

      let buzzardColor = C64.red;
      let knightColor = C64.orange;
      if (this.type === 'Hunter') {
        buzzardColor = C64.green;
        knightColor = C64.yellow;
      } else if (this.type === 'ShadowLord') {
        buzzardColor = C64.darkGrey;
        knightColor = C64.lightGrey;
      }

      // Rider Knight
      ctx.fillStyle = knightColor;
      ctx.fillRect(-6, 2, 12, 10);
      ctx.fillStyle = C64.black;
      ctx.fillRect(-4, -2, 8, 5);

      // Buzzard
      ctx.fillStyle = buzzardColor;
      ctx.fillRect(-10, 12, 20, 10);

      // Leg Walk animation
      ctx.fillStyle = C64.brown;
      const legFrame = Math.floor(this.walkCycle) % 3;
      if (this.vy === 0) {
        if (legFrame === 0) {
          ctx.fillRect(-6, 22, 3, 8);
          ctx.fillRect(3, 22, 3, 8);
        } else {
          ctx.fillRect(-8, 22, 3, 8);
          ctx.fillRect(4, 22, 3, 8);
        }
      } else {
        ctx.fillRect(-6, 22, 3, 6);
        ctx.fillRect(2, 22, 3, 6);
      }

      ctx.fillStyle = buzzardColor;
      ctx.fillRect(8, 4, 4, 10);
      ctx.fillRect(10, 2, 6, 4);

      ctx.strokeStyle = C64.yellow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(22, 7);
      ctx.stroke();

      ctx.restore();
    });
  }
}

// --- Egg Setup ---
class Egg {
  constructor(x, y, tier) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = -2.5;
    this.width = 16;
    this.height = 16;
    this.tier = tier;
    this.hatchTimer = 450;
  }

  update() {
    this.vy += 0.18;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;

    if (this.x < -this.width) this.x = canvas.width;
    if (this.x > canvas.width) this.x = -this.width;

    platforms.forEach(plat => {
      if (this.x + this.width > plat.x && this.x < plat.x + plat.w) {
        if (this.y + this.height >= plat.y && this.y + this.height - this.vy <= plat.y + 6) {
          this.y = plat.y - this.height;
          this.vy = -this.vy * 0.4;
          this.vx *= 0.85;
          if (Math.abs(this.vx) > 0.25 && Math.random() < 0.22) {
            synth.playEggRoll();
          }
        }
      }
    });

    this.hatchTimer--;
    if (this.hatchTimer <= 0) {
      enemies.push(new Enemy(this.x, this.y - 12, this.tier));
      synth.playHatch();
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(this.x + 8, this.y + 8, C64.orange));
      }
      return false;
    }
    return true;
  }

  draw() {
    drawWrappedEntity(this.x, this.width, (dx) => {
      ctx.fillStyle = C64.yellow;
      ctx.beginPath();
      ctx.ellipse(dx + 8, this.y + 8, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = C64.orange;
      ctx.fillRect(dx + 6, this.y + 6, 2, 2);
      ctx.fillRect(dx + 9, this.y + 10, 2, 2);
    });
  }
}

// --- Pterodactyl Boss ---
class Pterodactyl {
  constructor() {
    this.x = Math.random() > 0.5 ? -40 : canvas.width + 10;
    this.y = player ? player.y : 150;
    this.vx = this.x < 0 ? 3.8 : -3.8;
    this.vy = 0;
    this.width = 30;
    this.height = 18;
    this.facing = this.vx > 0 ? 1 : -1;
    this.anim = 0;
  }

  update() {
    this.anim += 0.2;
    this.x += this.vx;
    if (player) {
      this.y += (player.y - this.y) * 0.035;
    }

    if ((this.vx > 0 && this.x > canvas.width + 50) || (this.vx < 0 && this.x < -100)) {
      return false;
    }
    return true;
  }

  draw() {
    drawWrappedEntity(this.x, this.width, (dx) => {
      ctx.save();
      ctx.translate(dx + this.width / 2, this.y + this.height / 2);
      ctx.scale(this.facing, 1);

      ctx.fillStyle = C64.red;
      ctx.fillRect(-12, -4, 24, 8);
      ctx.fillStyle = C64.white;
      ctx.fillRect(8, -8, 6, 4);
      ctx.fillStyle = C64.yellow;
      ctx.fillRect(12, -6, 8, 2);

      ctx.fillStyle = C64.lightRed;
      const flap = Math.floor(this.anim) % 2;
      if (flap === 0) {
        ctx.fillRect(-6, -12, 6, 8);
        ctx.fillRect(-6, 4, 6, 8);
      } else {
        ctx.fillRect(-12, -2, 10, 2);
        ctx.fillRect(-12, 2, 10, 2);
      }
      ctx.restore();
    });
  }
}

// --- Screen Flashes & Shake Trigger ---
function triggerBorderFlash(className) {
  border.className = 'c64-border';
  void border.offsetWidth;
  border.classList.add(className);
  setTimeout(() => {
    border.classList.remove(className);
  }, 120);
}

function triggerScreenShake(amt) {
  screenShakeIntensity = amt;
}

// --- Wave Initializers ---
function spawnWave() {
  enemies = [];
  eggs = [];
  particles = [];
  powerups = [];
  pterodactyl = null;
  lavaHand.active = false;
  lavaHand.target = null;
  survivalTimer = 0;

  let enemyCount = Math.min(3 + wave, 8);
  let types = ['Bounder'];
  if (wave >= 2) types.push('Hunter');
  if (wave >= 3) types.push('ShadowLord');

  for (let i = 0; i < enemyCount; i++) {
    let pt = spawnPoints[i % spawnPoints.length];
    let selectedType = types[Math.floor(Math.random() * types.length)];
    enemies.push(new Enemy(pt.x, pt.y, selectedType));
  }

  if (Math.random() < 0.5) {
    const pt = platforms[Math.floor(Math.random() * (platforms.length - 2) + 2)];
    const type = Math.random() < 0.4 ? 'shield' : 'gold_egg';
    powerups.push(new Powerup(pt.x + pt.w/2 - 9, pt.y - 18, type));
  }

  if (player) {
    player.reset();
  }
  synth.playWaveStart();
}

// --- Jousting Collisions Engine ---
function checkJoustCollisions() {
  if (!player || player.isGrabbed) return;

  // 1. Pterodactyl Collision
  if (pterodactyl && player.invulnerable === 0) {
    if (player.x + player.width > pterodactyl.x && player.x < pterodactyl.x + pterodactyl.width &&
        player.y + player.height > pterodactyl.y && player.y < pterodactyl.y + pterodactyl.height) {
      
      const hitCenter = Math.abs((player.y + player.height/2) - (pterodactyl.y + pterodactyl.height/2));
      const hitFront = player.facing === 1 ? (player.x + player.width >= pterodactyl.x) : (player.x <= pterodactyl.x + pterodactyl.width);

      if (hitCenter < 8 && hitFront) {
        synth.playJoust();
        synth.playPteroSlay();
        triggerScreenShake(12);
        triggerBorderFlash('flash-green');
        score += 1000;
        floatingTexts.push(new FloatingText(pterodactyl.x, pterodactyl.y, "+1000", C64.yellow));
        
        for (let i = 0; i < 20; i++) {
          particles.push(new Particle(pterodactyl.x + 15, pterodactyl.y + 9, C64.orange));
        }
        pterodactyl = null;
      } else {
        handlePlayerDeath();
      }
    }
  }

  // 2. Enemy Collisions
  enemies.forEach((enemy, idx) => {
    if (enemy.isGrabbed) return;

    if (player.x + player.width > enemy.x && player.x < enemy.x + enemy.width &&
        player.y + player.height > enemy.y && player.y < enemy.y + enemy.height) {
      
      const pCenterY = player.y + player.height / 2;
      const eCenterY = enemy.y + enemy.height / 2;

      if (player.invulnerable > 0) return;

      if (pCenterY < eCenterY - 4) {
        synth.playJoust();
        triggerScreenShake(6);
        triggerBorderFlash('flash-green');
        eggs.push(new Egg(enemy.x, enemy.y, enemy.type));
        enemies.splice(idx, 1);
        score += 150;
        floatingTexts.push(new FloatingText(enemy.x, enemy.y, "+150", C64.green));

        for (let i = 0; i < 8; i++) {
          particles.push(new Particle(enemy.x + 12, enemy.y + 16, C64.lightBlue));
        }
      } 
      else if (pCenterY > eCenterY + 4) {
        if (player.hasShield) {
          player.hasShield = false;
          synth.playShieldBreak();
          synth.playShieldDeflect();
          triggerScreenShake(8);
          player.vx = -player.vx * 1.5;
          player.vy = -2.5;
          floatingTexts.push(new FloatingText(player.x, player.y, "SHIELD BREAK", C64.lightRed));
          for (let i = 0; i < 15; i++) {
            particles.push(new Particle(player.x + 12, player.y + 16, C64.cyan, 'spark'));
          }
        } else {
          handlePlayerDeath();
        }
      } 
      else {
        synth.playJoust();
        const pDir = player.x < enemy.x ? -1 : 1;
        player.vx = pDir * 4.5;
        enemy.vx = -pDir * 4.5;
        player.vy = -1.8;
        enemy.vy = -1.8;
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle((player.x + enemy.x)/2, (player.y + enemy.y)/2, C64.white));
        }
      }
    }
  });

  // 3. Egg Collection
  for (let i = eggs.length - 1; i >= 0; i--) {
    let egg = eggs[i];
    if (player.x + player.width > egg.x && player.x < egg.x + egg.width &&
        player.y + player.height > egg.y && player.y < egg.y + egg.height) {
      
      synth.playCollect();
      eggs.splice(i, 1);
      score += 250;
      floatingTexts.push(new FloatingText(egg.x, egg.y, "+250", C64.yellow));
      
      for (let j = 0; j < 6; j++) {
        particles.push(new Particle(egg.x + 8, egg.y + 8, C64.yellow));
      }
    }
  }

  // 4. Power-up Collection
  for (let i = powerups.length - 1; i >= 0; i--) {
    let pw = powerups[i];
    if (player.x + player.width > pw.x && player.x < pw.x + pw.width &&
        player.y + player.height > pw.y && player.y < pw.y + pw.height) {
      
      synth.playCollect();
      powerups.splice(i, 1);
      
      if (pw.type === 'shield') {
        player.hasShield = true;
        floatingTexts.push(new FloatingText(pw.x, pw.y, "SHIELD", C64.cyan));
      } else if (pw.type === 'gold_egg') {
        score += 500;
        player.speedBoostTimer = 300;
        synth.playSpeedBoost();
        floatingTexts.push(new FloatingText(pw.x, pw.y, "+500 SPEED", C64.yellow));
      }

      for (let j = 0; j < 12; j++) {
        particles.push(new Particle(pw.x + 9, pw.y + 9, C64.cyan));
      }
    }
  }
}

function handlePlayerDeath() {
  synth.playDeath();
  triggerScreenShake(15);
  triggerBorderFlash('flash-red');
  
  for (let i = 0; i < 18; i++) {
    particles.push(new Particle(player.x + 12, player.y + 16, C64.lightRed, 'feather'));
  }

  lives--;
  if (lives === 1) {
    synth.playLowLife();
  }
  
  if (lives <= 0) {
    gameState = 'GAME_OVER';
    document.getElementById('finalScore').innerText = `SCORE: ${score}`;
    
    const leaderboard = JSON.parse(localStorage.getItem('joust_leader') || '[]');
    const qualifies = leaderboard.length < 5 || score > leaderboard[leaderboard.length - 1].score;

    if (qualifies) {
      document.getElementById('nameEntryContainer').classList.remove('hidden');
      synth.playLeaderboard();
    } else {
      document.getElementById('nameEntryContainer').classList.add('hidden');
    }

    document.getElementById('gameOverOverlay').classList.remove('hidden');
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('joust_high', highScore);
    }
  } else {
    player.reset();
  }
}

// --- Lava & Hand Mechanics ---
function updateLavaTroll() {
  const lavaLevel = 380;
  
  if (Math.random() < 0.15) {
    particles.push(new Particle(Math.random() * canvas.width, 385, C64.orange, 'bubble'));
    synth.playBubblePop();
  }

  if (player && !player.isGrabbed && player.invulnerable === 0 && player.y + player.height > lavaLevel) {
    lavaHand.active = true;
    lavaHand.target = player;
    synth.playGrab();
  }

  enemies.forEach(enemy => {
    if (!enemy.isGrabbed && enemy.y + enemy.height > lavaLevel) {
      lavaHand.active = true;
      lavaHand.target = enemy;
      synth.playGrab();
    }
  });

  for (let i = eggs.length - 1; i >= 0; i--) {
    if (eggs[i].y + eggs[i].height > lavaLevel) {
      for (let j = 0; j < 5; j++) {
        particles.push(new Particle(eggs[i].x + 8, eggs[i].y + 8, C64.orange));
      }
      eggs.splice(i, 1);
    }
  }

  // Safety fallback: Melt enemies that sink too deep into lava to prevent softlocks
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].y > 390) {
      for (let j = 0; j < 8; j++) {
        particles.push(new Particle(enemies[i].x + 12, 385, C64.orange, 'spark'));
      }
      if (lavaHand.target === enemies[i]) {
        enemies[i].isGrabbed = false;
        lavaHand.active = false;
        lavaHand.target = null;
      }
      enemies.splice(i, 1);
    }
  }

  // Safety fallback: Melt player if they fall too deep
  if (player && player.y > 395) {
    if (player.isGrabbed) player.isGrabbed = false;
    handlePlayerDeath();
  }

  // Update Lava Hand Position & Pull Physics
  if (lavaHand.active && lavaHand.target) {
    // Pull hand horizontally to target
    lavaHand.x += (lavaHand.target.x - lavaHand.x) * 0.12;
    
    // Rise hand
    if (lavaHand.y > 355) {
      lavaHand.y -= 2.5;
    }

    // Touch trigger connection grab check
    if (Math.abs(lavaHand.x - lavaHand.target.x) < 22 && Math.abs(lavaHand.y - lavaHand.target.y) < 32) {
      lavaHand.target.isGrabbed = true;
      
      // DRAG TARGET DOWN DIRECTLY (Bypasses player update early return freeze)
      lavaHand.target.y += 1.5;
      lavaHand.target.x += (lavaHand.x - lavaHand.target.x) * 0.2; // pull center
      
      if (lavaHand.target.y > 385) {
        lavaHand.target.isGrabbed = false;
        if (lavaHand.target === player) {
          handlePlayerDeath();
        } else {
          enemies = enemies.filter(e => e !== lavaHand.target);
        }
        lavaHand.active = false;
        lavaHand.target = null;
      }
    }
  } else {
    // Return to pool depth
    if (lavaHand.target) {
      lavaHand.target.isGrabbed = false;
      lavaHand.target = null;
    }
    if (lavaHand.y < 420) {
      lavaHand.y += 3.5;
    }
  }
}

// --- Draw Functions ---
function drawWorld() {
  ctx.save();
  
  if (screenShakeIntensity > 0) {
    const dx = (Math.random() - 0.5) * screenShakeIntensity;
    const dy = (Math.random() - 0.5) * screenShakeIntensity;
    ctx.translate(dx, dy);
    screenShakeIntensity *= 0.88;
    if (screenShakeIntensity < 0.5) screenShakeIntensity = 0;
  }

  // Background Space
  ctx.fillStyle = C64.black;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lava magma
  ctx.fillStyle = C64.red;
  ctx.fillRect(0, 384, canvas.width, 16);
  ctx.fillStyle = C64.orange;
  const waveOffset = Math.sin(Date.now() / 150) * 5;
  for (let i = 0; i < canvas.width; i += 16) {
    ctx.fillRect(i, 382 + waveOffset, 16, 4);
  }

  // Draw lava heat ripples animation
  ctx.fillStyle = 'rgba(200, 70, 0, 0.2)';
  lavaRipples.forEach(rip => {
    ctx.fillRect(rip.x, rip.y, rip.w, 2);
    rip.y -= rip.speed;
    if (rip.y < 310) {
      rip.y = 380;
      rip.x = Math.random() * 640;
    }
  });

  // Platforms
  platforms.forEach(plat => {
    ctx.fillStyle = C64.brown;
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = C64.orange;
    ctx.fillRect(plat.x, plat.y, plat.w, 3);
  });

  // Score HUD
  ctx.font = '12px "Press Start 2P"';
  ctx.fillStyle = C64.yellow;
  ctx.fillText(`SCORE: ${String(score).padStart(6, '0')}`, 15, 25);
  ctx.fillText(`HIGH: ${String(highScore).padStart(6, '0')}`, 260, 25);
  ctx.fillStyle = C64.cyan;
  ctx.fillText(`WAVE: ${wave}`, 530, 25);

  // Lives ostriches
  ctx.fillStyle = C64.white;
  for (let i = 0; i < lives; i++) {
    ctx.fillRect(15 + i * 20, 36, 12, 10);
  }

  // Animated Lava Troll Hand (Multi-jointed fingers flex)
  if (lavaHand.y < 420) {
    ctx.fillStyle = C64.orange;
    ctx.fillRect(lavaHand.x, lavaHand.y, 24, 40); // Arm body
    
    // Procedural flexing joint fingers
    ctx.fillStyle = C64.red;
    const flex = Math.sin(Date.now() / 100) * 3;
    ctx.fillRect(lavaHand.x - 2, lavaHand.y - 4 + flex, 4, 12);      // Left finger
    ctx.fillRect(lavaHand.x + 10, lavaHand.y - 6 + flex/2, 4, 12);  // Middle finger
    ctx.fillRect(lavaHand.x + 22, lavaHand.y - 4 + flex, 4, 12);     // Right finger
  }
}

// --- Main Engine Loop ---
function update() {
  if (gameState === 'PLAYING') {
    survivalTimer++;

    if (survivalTimer === 2100 && !pterodactyl) {
      pterodactyl = new Pterodactyl();
      triggerBorderFlash('flash-yellow');
      synth.playPteroScreech();
    }

    if (player) player.update();
    enemies.forEach(enemy => enemy.update());
    
    eggs = eggs.filter(egg => egg.update());
    powerups.forEach(pw => pw.update());

    if (pterodactyl) {
      const alive = pterodactyl.update();
      if (!alive) pterodactyl = null;
    }

    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);

    floatingTexts.forEach(t => t.update());
    floatingTexts = floatingTexts.filter(t => t.alpha > 0);

    checkJoustCollisions();
    updateLavaTroll();

    // Clears wave IMMEDIATELY when all enemies are dead
    if (enemies.length === 0) {
      gameState = 'WAVE_CLEAR';
      waveTimer = 100;
      synth.playVictory();
    }
  } 
  else if (gameState === 'WAVE_CLEAR') {
    waveTimer--;
    if (waveTimer <= 0) {
      wave++;
      spawnWave();
      gameState = 'PLAYING';
    }
  }

  // Draw entities
  drawWorld();
  
  if (player && gameState === 'PLAYING') player.draw();
  enemies.forEach(enemy => enemy.draw());
  eggs.forEach(egg => egg.draw());
  powerups.forEach(pw => pw.draw());
  if (pterodactyl) pterodactyl.draw();
  particles.forEach(p => p.draw());
  floatingTexts.forEach(t => t.draw());

  ctx.restore(); // restore screenshake

  requestAnimationFrame(update);
}

// --- Leaderboard Actions ---
function updateLeaderboardUI() {
  const listEl = document.getElementById('leaderboardList');
  listEl.innerHTML = '';
  
  const leaderboard = JSON.parse(localStorage.getItem('joust_leader') || '[]');
  
  if (leaderboard.length === 0) {
    const defaults = [
      { name: 'SKE', score: 15000 },
      { name: 'JOU', score: 10000 },
      { name: 'C64', score: 5000 }
    ];
    localStorage.setItem('joust_leader', JSON.stringify(defaults));
    return updateLeaderboardUI();
  }

  leaderboard.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${entry.name}</span> <span>${entry.score}</span>`;
    listEl.appendChild(li);
  });
}

function submitScore() {
  const initials = document.getElementById('initialsInput').value.substring(0, 3).toUpperCase() || 'AAA';
  let leaderboard = JSON.parse(localStorage.getItem('joust_leader') || '[]');
  
  leaderboard.push({ name: initials, score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  localStorage.setItem('joust_leader', JSON.stringify(leaderboard));
  
  document.getElementById('nameEntryContainer').classList.add('hidden');
  updateLeaderboardUI();
}

document.getElementById('submitScoreBtn').addEventListener('click', () => {
  submitScore();
  startGame();
});

// --- Initialize / Controls ---
function startGame() {
  synth.init();
  document.getElementById('startOverlay').classList.add('hidden');
  document.getElementById('gameOverOverlay').classList.add('hidden');
  
  score = 0;
  lives = 3;
  wave = 1;
  player = new Player();
  spawnWave();
  gameState = 'PLAYING';
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Inital UI Setup
updateLeaderboardUI();
requestAnimationFrame(update);
