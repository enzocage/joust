// ============================================================
//  C64 JOUST — DEMOSCENE EDITION
//  15 visual tricks of the late C64 demo scene:
//  1. Copper/Raster bars   2. Sine scroller      3. Color cycling
//  4. Plasma               5. Parallax starfield 6. Sprite ghosting (trails)
//  7. Bouncing rainbow logo (DYCP)               8. Glitch/noise transitions
//  9. Border flashes      10. CRT scanlines     11. SID arpeggio music
// 12. Wavy big-pixel typography                 13. Vector balls
// 14. Perspective checkerboard floor            15. Interference circles
// ============================================================

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

// Rainbow cycle palette (classic copper bar gradient order)
const RAINBOW = [
  '#882000', '#C86400', '#D8C450', '#B4E880', '#509C40',
  '#68B0C0', '#A0B0E0', '#304090', '#603C90', '#C07060'
];
function rainbow(i) {
  return RAINBOW[((Math.floor(i) % RAINBOW.length) + RAINBOW.length) % RAINBOW.length];
}

// --- Web Audio API Synth (C64 SID Emulator v3) ---
class RetroSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = false;      // sound effects
    this.musicMuted = false;   // background music only
    this.musicStep = 0;
    this.musicTimer = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.startMusic();
    }
  }

  tone(type, f0, f1, t, vol, delay = 0) {
    if (this.isMuted) return;
    this._tone(type, f0, f1, t, vol, delay);
  }

  // raw tone without the SFX mute check (used by the music channel)
  _tone(type, f0, f1, t, vol, delay = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const start = this.ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(f0, start);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), start + t);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.linearRampToValueAtTime(0.001, start + t);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + t);
  }

  noiseBurst(t, vol, filterFrom = 4000, filterTo = 400) {
    if (!this.ctx || this.isMuted) return;
    const bufferSize = this.ctx.sampleRate * t;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrom, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(filterTo, this.ctx.currentTime + t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + t);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // --- SID-style 3-channel music loop (bass + arpeggio + lead blips) ---
  startMusic() {
    if (this.musicTimer) return;
    // A-minor / F / C / G progression roots
    const bassline = [110.0, 110.0, 87.31, 87.31, 130.81, 130.81, 98.0, 98.0];
    const chords = [
      [220.0, 261.63, 329.63],   // Am
      [174.61, 220.0, 261.63],   // F
      [261.63, 329.63, 392.0],   // C
      [196.0, 246.94, 293.66]    // G
    ];
    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.musicMuted) return;
      const s = this.musicStep++;
      const bar = Math.floor(s / 8) % 8;
      const chord = chords[Math.floor(bar / 2) % 4];

      // Channel 1: bass (square)
      if (s % 4 === 0) {
        this._tone('square', bassline[bar], bassline[bar], 0.22, 0.045);
      }
      // Channel 2: fast SID arpeggio (the classic chord-trill)
      const arpNote = chord[s % 3] * 2;
      this._tone('triangle', arpNote, arpNote, 0.09, gameState === 'PLAYING' ? 0.035 : 0.05);
      // Channel 3: sparse lead blips
      if (s % 16 === 14) {
        this._tone('sawtooth', chord[2] * 2, chord[2] * 4, 0.18, 0.03);
      }
    }, 110);
  }

  playFlap() {
    this.tone('sawtooth', 140, 360, 0.12, 0.12);
  }

  playFlapLaunch() {
    this.tone('sawtooth', 90, 220, 0.18, 0.15);
    this.tone('triangle', 45, 110, 0.18, 0.12);
  }

  playJoust() {
    this.tone('square', 200, 50, 0.25, 0.18);
    this.tone('sine', 1800, 900, 0.12, 0.12);
    this.noiseBurst(0.18, 0.12);
  }

  playShieldBreak() {
    this.tone('sawtooth', 2000, 100, 0.45, 0.18);
    this.tone('sine', 2400, 200, 0.45, 0.12);
  }

  playDeath() {
    this.tone('square', 900, 20, 0.85, 0.2);
    this.noiseBurst(0.8, 0.18, 1200, 60);
  }

  playHatch() {
    this.tone('sine', 650, 650, 0.08, 0.14);
    this.tone('sine', 950, 950, 0.08, 0.14, 0.08);
    this.tone('sine', 1400, 1400, 0.12, 0.14, 0.16);
  }

  playGrab() {
    this.tone('triangle', 120, 40, 0.65, 0.06);
  }

  playCollect() {
    this.tone('triangle', 1000, 2000, 0.18, 0.15);
  }

  playWaveStart() {
    [329.63, 392.0, 523.25, 659.25].forEach((f, i) => this.tone('sawtooth', f, f, 0.22, 0.08, i * 0.08));
  }

  playBubblePop() {
    this.tone('sine', 180, 450, 0.04, 0.05);
  }

  playPteroScreech() {
    this.tone('sawtooth', 1600, 1100, 0.45, 0.12);
  }

  playPteroSlay() {
    [600, 800, 1000, 1200, 1600].forEach((f, i) => this.tone('sine', f, f, 0.15, 0.12, i * 0.05));
  }

  playEggRoll() {
    this.tone('triangle', 80, 80, 0.02, 0.02);
  }

  playShieldDeflect() {
    this.tone('sine', 1700, 650, 0.18, 0.2);
  }

  playSpeedBoost() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone('triangle', f, f, 0.18, 0.12, i * 0.06));
  }

  playVictory() {
    [261.63, 329.63, 392.0, 523.25, 392.0, 523.25, 659.25].forEach((f, i) => this.tone('sawtooth', f, f, 0.2, 0.08, i * 0.12));
  }

  playLowLife() {
    this.tone('square', 160, 160, 0.12, 0.15);
    this.tone('square', 130, 130, 0.12, 0.15, 0.12);
  }

  playLeaderboard() {
    [440.0, 554.37, 659.25, 880.0, 659.25, 554.37].forEach((f, i) => this.tone('triangle', f, f, 0.14, 0.05, i * 0.08));
  }

  // Glitch transition: detuned squares + filtered static
  playGlitch() {
    this.noiseBurst(0.4, 0.14, 6000, 200);
    for (let i = 0; i < 5; i++) {
      this.tone('square', 200 + Math.random() * 1800, 50 + Math.random() * 400, 0.06, 0.06, i * 0.05);
    }
  }

  playPanicFlap() {
    this.tone('sawtooth', 400, 700, 0.07, 0.04);
  }
}

const synth = new RetroSynth();

// --- Game Configurations ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const border = document.getElementById('screenBorder');

let screenShakeIntensity = 0;
let frame = 0; // global demo clock

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
    toggleSound();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// --- Sound FX toggle (M key) ---
function toggleSound() {
  synth.isMuted = !synth.isMuted;
  document.getElementById('musicStatus').innerText = synth.isMuted ? 'OFF' : 'ON';
}

// --- Music toggle (button) — music only, sound effects stay on ---
function toggleMusic() {
  synth.musicMuted = !synth.musicMuted;
  document.getElementById('musicToggleState').innerText = synth.musicMuted ? 'OFF' : 'ON';
  document.getElementById('musicToggleBtn').classList.toggle('muted', synth.musicMuted);
}

document.getElementById('musicToggleBtn').addEventListener('click', (e) => {
  synth.init(); // allow enabling audio from the menu before the game starts
  toggleMusic();
  e.currentTarget.blur(); // keep Space flapping instead of re-clicking the button
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
let scorePop = 0; // HUD typography pop animation
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

// --- Glitch transition system (trash retro color flicker) ---
let transition = null; // { t, dur, cb, next, fired }
function startTransition(cb, next) {
  transition = { t: 0, dur: 46, cb, next, fired: false };
  gameState = 'TRANSITION';
  synth.playGlitch();
  triggerBorderFlash('flash-white');
}

// --- Parallax starfield (3 depth layers) ---
const stars = [];
for (let layer = 0; layer < 3; layer++) {
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * 640,
      y: Math.random() * 370,
      layer,
      speed: 0.15 + layer * 0.3,
      twinkle: Math.random() * 100
    });
  }
}

// --- Vector balls (menu demo objects) ---
const vectorBalls = [];
for (let i = 0; i < 6; i++) {
  vectorBalls.push({ phase: (i / 6) * Math.PI * 2 });
}

// Populate lava heat ripples
for (let i = 0; i < 6; i++) {
  lavaRipples.push({
    x: Math.random() * 640,
    y: 380 - Math.random() * 60,
    w: Math.random() * 15 + 10,
    speed: Math.random() * 0.4 + 0.2
  });
}

// --- Scroller texts (classic demo greetings) ---
const SCROLL_TEXT = '*** C64 JOUST DEMOSCENE EDITION *** GREETINGS FLY OUT TO ALL OSTRICH RIDERS ... FLAP TO SURVIVE THE LAVA PIT ... CODE+GFX+SID BY THE JOUST CREW ... PRESS LOAD TO RIDE ... RASTERBARS! PLASMA! VECTORBALLS! ... KEEP THE SCENE ALIVE ...     ';
let scrollX = 660;

class FloatingText {
  constructor(x, y, text, color, opts = {}) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -1.0;
    this.alpha = 1.0;
    this.scale = 1.8;          // typography pop-in
    this.rainbow = !!opts.rainbow;
    this.wave = !!opts.wave;
    this.t = 0;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.02;
    this.scale += (1.0 - this.scale) * 0.2;
    this.t++;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.font = '8px "Press Start 2P"';
    if (this.wave || this.rainbow) {
      // per-letter wavy rainbow typography
      let cx = this.x;
      for (let i = 0; i < this.text.length; i++) {
        const dy = this.wave ? Math.sin(this.t * 0.25 + i * 0.6) * 3 : 0;
        ctx.fillStyle = this.rainbow ? rainbow(this.t * 0.3 + i) : this.color;
        ctx.save();
        ctx.translate(cx, this.y + dy);
        ctx.scale(this.scale, this.scale);
        ctx.fillText(this.text[i], 0, 0);
        ctx.restore();
        cx += 9 * this.scale;
      }
    } else {
      ctx.fillStyle = this.color;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
}

function addScore(n, x, y, color, opts) {
  score += n;
  scorePop = 12;
  floatingTexts.push(new FloatingText(x, y, '+' + n, color, opts));
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
    this.type = type; // spark, feather, bubble, trail, ember, firework, ring
    this.vx = (Math.random() - 0.5) * (type === 'feather' ? 2 : 6);
    this.vy = (Math.random() - 0.5) * (type === 'feather' ? 1.2 : 6) - (type === 'bubble' ? 1.5 : 0);
    this.size = type === 'feather' ? Math.random() * 4 + 3 : Math.random() * 3 + 2;
    this.color = color;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
    this.angle = Math.random() * Math.PI * 2;

    if (type === 'trail') {
      this.vx = 0; this.vy = 0;
      this.decay = 0.07;
      this.size = Math.random() * 3 + 2;
    } else if (type === 'ember') {
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(Math.random() * 0.8 + 0.4);
      this.decay = Math.random() * 0.01 + 0.006;
      this.size = Math.random() * 2 + 1;
    } else if (type === 'firework') {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 4 + 1.5;
      this.vx = Math.cos(a) * sp;
      this.vy = Math.sin(a) * sp;
      this.decay = Math.random() * 0.015 + 0.01;
    } else if (type === 'ring') {
      this.vx = 0; this.vy = 0;
      this.size = 2;
      this.decay = 0.04;
    }
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
    } else if (this.type === 'ember') {
      this.vx += Math.sin(this.angle + this.y * 0.05) * 0.03;
    } else if (this.type === 'firework') {
      this.vy += 0.08;
      this.vx *= 0.98;
    } else if (this.type === 'ring') {
      this.size += 2.2;
    } else if (this.type !== 'trail') {
      this.vy += 0.16;
    }
    this.life -= this.decay;
  }

  draw() {
    if (this.type === 'ring') {
      ctx.save();
      ctx.globalAlpha = Math.max(this.life, 0);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.save();
    if (this.type === 'trail' || this.type === 'ember') ctx.globalAlpha = Math.max(this.life, 0) * 0.7;
    ctx.fillStyle = this.type === 'firework' ? rainbow(frame * 0.5 + this.angle * 3) : this.color;
    if (this.type === 'feather') {
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size / 2));
    } else {
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size));
    }
    ctx.restore();
  }
}

function explosionBurst(x, y, color, count = 16) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color, 'firework'));
  particles.push(new Particle(x, y, C64.white, 'ring'));
  particles.push(new Particle(x, y, color, 'ring'));
}

// --- Split Wrap Rendering Utility ---
function drawWrappedEntity(x, width, drawCallback) {
  drawCallback(x);
  if (x < 0) drawCallback(x + canvas.width);
  if (x + width > canvas.width) drawCallback(x - canvas.width);
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
    // sparkle aura
    if (Math.random() < 0.15) {
      const p = new Particle(this.x + Math.random() * 18, this.y + Math.random() * 18,
        this.type === 'shield' ? C64.cyan : C64.yellow, 'trail');
      particles.push(p);
    }
  }

  draw() {
    const pulseOffset = Math.sin(this.pulse) * 3;
    drawWrappedEntity(this.x, this.width, (dx) => {
      if (this.type === 'shield') {
        ctx.strokeStyle = rainbow(frame * 0.2);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dx + 9, this.y + 9, 8 + pulseOffset, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = C64.lightBlue;
        ctx.fillRect(dx + 6, this.y + 6, 6, 6);
      } else if (this.type === 'gold_egg') {
        ctx.fillStyle = frame % 20 < 10 ? C64.yellow : C64.white; // color flash cycle
        ctx.beginPath();
        ctx.ellipse(dx + 9, this.y + 9, 6 + pulseOffset / 2, 8 + pulseOffset / 2, 0, 0, Math.PI * 2);
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
      // speed boost rainbow exhaust
      particles.push(new Particle(this.x + this.width / 2 - this.facing * 12, this.y + 18, rainbow(frame), 'trail'));
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

    if (this.x < -this.width) this.x = canvas.width;
    if (this.x > canvas.width) this.x = -this.width;

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
        this.squashX = 1.3;
        this.squashY = 0.7;
        // landing dust
        for (let i = 0; i < 4; i++) {
          particles.push(new Particle(this.x + Math.random() * this.width, this.y + this.height, C64.grey, 'trail'));
        }
      }
      this.vy = 0;
      this.animFrame = Math.floor(this.walkCycle) % 3;
    } else {
      this.animFrame = Math.floor(this.flapCycle) % 2 + 3;
      // sprite ghosting trail while airborne (multiplexer afterimage)
      if (frame % 3 === 0 && Math.abs(this.vx) + Math.abs(this.vy) > 1.5) {
        particles.push(new Particle(this.x + this.width / 2, this.y + this.height / 2, C64.lightBlue, 'trail'));
      }
    }

    this.wasOnGround = onGround;

    this.squashX += (1.0 - this.squashX) * 0.16;
    this.squashY += (1.0 - this.squashY) * 0.16;

    if (this.invulnerable > 0) this.invulnerable--;
  }

  draw() {
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 6) % 2 === 0) return;

    drawWrappedEntity(this.x, this.width, (dx) => {
      ctx.save();
      ctx.translate(dx + this.width / 2, this.y + this.height);
      ctx.scale(this.facing * this.squashX, this.squashY);

      const lean = this.vx * 0.035;
      ctx.rotate(lean);
      ctx.translate(0, -this.height);

      ctx.fillStyle = C64.lightBlue;
      ctx.fillRect(-10, 12, 20, 10);

      ctx.fillStyle = C64.purple;
      const legFrame = this.animFrame % 3;
      if (this.vy === 0) {
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
      } else {
        ctx.fillRect(-7, 22, 3, 6);
        ctx.fillRect(2, 22, 3, 6);
      }

      ctx.fillStyle = C64.lightBlue;
      ctx.fillRect(8, 4, 4, 10);
      ctx.fillRect(10, 2, 6, 4);

      ctx.strokeStyle = this.speedBoostTimer > 0 ? rainbow(frame) : C64.yellow;
      ctx.lineWidth = this.speedBoostTimer > 0 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(24, 6);
      ctx.stroke();

      ctx.fillStyle = C64.cyan;
      ctx.fillRect(-6, 2, 12, 10);
      ctx.fillStyle = C64.white;
      ctx.fillRect(-4, -2, 8, 5);
      ctx.fillStyle = C64.red;
      ctx.fillRect(this.facing === 1 ? 2 : -4, 0, 2, 2);

      ctx.fillStyle = C64.purple;
      let wingFrame = Math.floor(this.flapCycle) % 3;
      if (wingFrame === 0) ctx.fillRect(-8, 14, 12, 4);
      else if (wingFrame === 1) ctx.fillRect(-8, 11, 12, 4);
      else ctx.fillRect(-8, 17, 12, 4);

      ctx.restore();

      if (this.hasShield) {
        ctx.save();
        ctx.strokeStyle = rainbow(frame * 0.5); // color-cycled shield
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
  // downdraft puff
  particles.push(new Particle(player.x + player.width / 2, player.y + player.height + 4, C64.white, 'trail'));
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
    this.panicCooldown = 0;
    this.squashX = 1.0;
    this.squashY = 1.0;
    this.wasOnGround = false;
  }

  // Lava-avoidance brain: enemies actively dodge the lava + troll hand
  // instead of drifting to their doom at the bottom edge.
  avoidLava() {
    const DANGER_Y = 290;       // start worrying
    const PANIC_Y = 330;        // full panic — climb NOW
    const bottom = this.y + this.height;
    if (this.panicCooldown > 0) this.panicCooldown--;

    if (bottom > PANIC_Y) {
      // Emergency: hard repeated flaps until clear of the pit
      if (this.vy > -2.2 && this.panicCooldown <= 0) {
        this.vy = -3.4;
        this.panicCooldown = 6;
        synth.playPanicFlap();
        particles.push(new Particle(this.x + this.width / 2, this.y + this.height, C64.lightGrey, 'feather'));
      }
      // Steer toward the nearest platform that's safely above the lava
      let best = null, bestDist = 1e9;
      platforms.forEach(plat => {
        if (plat.y >= 360) return; // ignore the lava-level ledges as refuge
        const cx = plat.x + plat.w / 2;
        const d = Math.abs(cx - (this.x + this.width / 2));
        if (d < bestDist) { bestDist = d; best = plat; }
      });
      if (best) {
        const cx = best.x + best.w / 2;
        this.vx += (this.x + this.width / 2 < cx ? 0.18 : -0.18);
      }
      // Extra dodge: flee the lava hand if it's rising nearby
      if (lavaHand.active && Math.abs(lavaHand.x - this.x) < 80) {
        this.vx += (this.x < lavaHand.x ? -0.3 : 0.3);
      }
      return true;
    }
    if (bottom > DANGER_Y && this.vy > 0.5 && this.panicCooldown <= 0) {
      // Pre-emptive altitude correction
      this.vy = -2.9;
      this.panicCooldown = 10;
      return true;
    }
    return false;
  }

  update() {
    if (this.isGrabbed && lavaHand.active && lavaHand.target === this) return;

    const panicking = this.avoidLava();

    this.flapTimer--;
    if (this.flapTimer <= 0 && !panicking) {
      let flapChance = 0.05;

      if (this.type === 'Hunter') {
        if (player && this.y + 12 > player.y) flapChance = 0.3;
      } else if (this.type === 'ShadowLord') {
        if (player && this.y + 50 > player.y) flapChance = 0.45;
        this.vx += (this.x < player.x ? 0.2 : -0.2);
      } else {
        if (this.vy > 1.0) flapChance = 0.18;
      }

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

    // ShadowLord leaves a dark afterimage trail
    if (this.type === 'ShadowLord' && frame % 4 === 0) {
      particles.push(new Particle(this.x + this.width / 2, this.y + this.height / 2, C64.darkGrey, 'trail'));
    }

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

      ctx.fillStyle = knightColor;
      ctx.fillRect(-6, 2, 12, 10);
      ctx.fillStyle = C64.black;
      ctx.fillRect(-4, -2, 8, 5);

      ctx.fillStyle = buzzardColor;
      ctx.fillRect(-10, 12, 20, 10);

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
    // hatch warning shimmer
    if (this.hatchTimer < 100 && frame % 6 === 0) {
      particles.push(new Particle(this.x + 8, this.y + 8, C64.orange, 'trail'));
    }
    if (this.hatchTimer <= 0) {
      enemies.push(new Enemy(this.x, this.y - 12, this.tier));
      synth.playHatch();
      explosionBurst(this.x + 8, this.y + 8, C64.orange, 10);
      return false;
    }
    return true;
  }

  draw() {
    drawWrappedEntity(this.x, this.width, (dx) => {
      // egg flashes faster as hatch approaches (color cycle warning)
      const urgent = this.hatchTimer < 100 && Math.floor(frame / 4) % 2 === 0;
      ctx.fillStyle = urgent ? C64.white : C64.yellow;
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
    // menacing red trail
    if (frame % 2 === 0) {
      particles.push(new Particle(this.x + this.width / 2 - this.facing * 14, this.y + this.height / 2, C64.red, 'trail'));
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
    powerups.push(new Powerup(pt.x + pt.w / 2 - 9, pt.y - 18, type));
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

      const hitCenter = Math.abs((player.y + player.height / 2) - (pterodactyl.y + pterodactyl.height / 2));
      const hitFront = player.facing === 1 ? (player.x + player.width >= pterodactyl.x) : (player.x <= pterodactyl.x + pterodactyl.width);

      if (hitCenter < 8 && hitFront) {
        synth.playJoust();
        synth.playPteroSlay();
        triggerScreenShake(12);
        triggerBorderFlash('flash-green');
        addScore(1000, pterodactyl.x, pterodactyl.y, C64.yellow, { rainbow: true, wave: true });
        explosionBurst(pterodactyl.x + 15, pterodactyl.y + 9, C64.orange, 28);
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
        addScore(150, enemy.x, enemy.y, C64.green);
        explosionBurst(enemy.x + 12, enemy.y + 16, C64.lightBlue, 12);
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(enemy.x + 12, enemy.y + 16, C64.lightGrey, 'feather'));
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
          floatingTexts.push(new FloatingText(player.x, player.y, "SHIELD BREAK", C64.lightRed, { wave: true }));
          explosionBurst(player.x + 12, player.y + 16, C64.cyan, 15);
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
          particles.push(new Particle((player.x + enemy.x) / 2, (player.y + enemy.y) / 2, C64.white));
        }
        particles.push(new Particle((player.x + enemy.x) / 2, (player.y + enemy.y) / 2, C64.white, 'ring'));
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
      addScore(250, egg.x, egg.y, C64.yellow);
      explosionBurst(egg.x + 8, egg.y + 8, C64.yellow, 8);
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
        floatingTexts.push(new FloatingText(pw.x, pw.y, "SHIELD", C64.cyan, { rainbow: true }));
      } else if (pw.type === 'gold_egg') {
        player.speedBoostTimer = 300;
        synth.playSpeedBoost();
        addScore(500, pw.x, pw.y, C64.yellow, { rainbow: true, wave: true });
      }

      explosionBurst(pw.x + 9, pw.y + 9, C64.cyan, 16);
    }
  }
}

function handlePlayerDeath() {
  synth.playDeath();
  triggerScreenShake(15);
  triggerBorderFlash('flash-red');

  explosionBurst(player.x + 12, player.y + 16, C64.lightRed, 24);
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
  // constant rising embers from the lava
  if (Math.random() < 0.3) {
    particles.push(new Particle(Math.random() * canvas.width, 384, Math.random() < 0.5 ? C64.orange : C64.yellow, 'ember'));
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
      explosionBurst(eggs[i].x + 8, eggs[i].y + 8, C64.orange, 6);
      eggs.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].y > 390) {
      explosionBurst(enemies[i].x + 12, 385, C64.orange, 10);
      if (lavaHand.target === enemies[i]) {
        enemies[i].isGrabbed = false;
        lavaHand.active = false;
        lavaHand.target = null;
      }
      enemies.splice(i, 1);
    }
  }

  if (player && player.y > 395) {
    if (player.isGrabbed) player.isGrabbed = false;
    handlePlayerDeath();
  }

  if (lavaHand.active && lavaHand.target) {
    lavaHand.x += (lavaHand.target.x - lavaHand.x) * 0.12;

    if (lavaHand.y > 355) {
      lavaHand.y -= 2.5;
    }
    // dripping lava from the rising hand
    if (frame % 4 === 0) {
      particles.push(new Particle(lavaHand.x + Math.random() * 24, lavaHand.y + 30, C64.orange, 'spark'));
    }

    if (Math.abs(lavaHand.x - lavaHand.target.x) < 22 && Math.abs(lavaHand.y - lavaHand.target.y) < 32) {
      lavaHand.target.isGrabbed = true;
      lavaHand.target.y += 1.5;
      lavaHand.target.x += (lavaHand.x - lavaHand.target.x) * 0.2;

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
    if (lavaHand.target) {
      lavaHand.target.isGrabbed = false;
      lavaHand.target = null;
    }
    if (lavaHand.y < 420) {
      lavaHand.y += 3.5;
    }
  }
}

// ============================================================
//  DEMOSCENE VISUAL LAYERS
// ============================================================

// (5) Parallax starfield
function drawStarfield(dim) {
  stars.forEach(s => {
    s.x -= s.speed;
    if (s.x < 0) { s.x = 640; s.y = Math.random() * 370; }
    s.twinkle += 0.15;
    const bright = 0.25 + s.layer * 0.25 + Math.sin(s.twinkle) * 0.15;
    ctx.globalAlpha = Math.max(bright * (dim ? 0.5 : 1), 0.05);
    ctx.fillStyle = s.layer === 2 ? C64.white : (s.layer === 1 ? C64.lightBlue : C64.grey);
    const sz = s.layer === 2 ? 2 : 1;
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), sz, sz);
  });
  ctx.globalAlpha = 1;
}

// (1) Copper / raster bars
function drawRasterBars(count, alpha, amp) {
  const t = frame * 0.02;
  for (let b = 0; b < count; b++) {
    const cy = 200 + Math.sin(t + b * 0.55) * amp;
    for (let j = -4; j <= 4; j++) {
      const fade = 1 - Math.abs(j) / 5;
      ctx.globalAlpha = alpha * fade;
      ctx.fillStyle = rainbow(b * 2 + frame * 0.08);
      ctx.fillRect(0, Math.floor(cy + j * 2), 640, 2);
    }
  }
  ctx.globalAlpha = 1;
}

// (4) Plasma (coarse C64-style colour cell plasma)
function drawPlasma(alpha) {
  const t = frame * 0.03;
  const cell = 20;
  ctx.globalAlpha = alpha;
  for (let y = 0; y < 400; y += cell) {
    for (let x = 0; x < 640; x += cell) {
      const v = Math.sin(x * 0.012 + t) + Math.sin(y * 0.017 - t * 1.3) +
                Math.sin((x + y) * 0.009 + t * 0.7);
      ctx.fillStyle = rainbow(v * 2.2 + frame * 0.05);
      ctx.fillRect(x, y, cell, cell);
    }
  }
  ctx.globalAlpha = 1;
}

// (14) Perspective checkerboard floor
function drawCheckerFloor() {
  const horizon = 295;
  const t = frame * 0.04;
  for (let row = 0; row < 12; row++) {
    const z = (row + 1) / 12;
    const y = horizon + Math.pow(z, 1.6) * 105;
    const h = Math.max(Math.pow(z, 1.6) * 18, 2);
    const tileW = 18 + z * 80;
    const offset = ((t * 40 * z) % (tileW * 2));
    for (let x = -tileW * 2 + offset; x < 660; x += tileW * 2) {
      ctx.fillStyle = (row % 2 === 0) ? C64.purple : C64.blue;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(tileW), Math.ceil(h));
      ctx.fillStyle = (row % 2 === 0) ? C64.blue : C64.purple;
      ctx.fillRect(Math.floor(x + tileW), Math.floor(y), Math.floor(tileW), Math.ceil(h));
    }
  }
}

// (13) Vector balls on a Lissajous path
function drawVectorBalls() {
  const t = frame * 0.025;
  vectorBalls.forEach((b, i) => {
    const x = 320 + Math.sin(t + b.phase) * 240;
    const y = 165 + Math.sin(t * 1.7 + b.phase * 2) * 80;
    const scale = 0.7 + Math.sin(t * 1.3 + b.phase) * 0.3;
    // shaded sphere from concentric circles
    const cols = [C64.darkGrey, C64.grey, C64.lightGrey, C64.white];
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = cols[r];
      ctx.beginPath();
      ctx.arc(x - r * 2 * scale, y - r * 2 * scale, (12 - r * 2.6) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// (15) Interference circles (moire rings)
function drawInterference(alpha) {
  const t = frame * 0.02;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  const cx1 = 320 + Math.sin(t) * 150, cy1 = 200 + Math.cos(t * 0.8) * 90;
  const cx2 = 320 - Math.sin(t * 1.1) * 150, cy2 = 200 - Math.cos(t * 0.9) * 90;
  ctx.strokeStyle = C64.cyan;
  for (let r = 8; r < 280; r += 16) {
    ctx.beginPath(); ctx.arc(cx1, cy1, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.strokeStyle = C64.purple;
  for (let r = 8; r < 280; r += 16) {
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// (7) Bouncing rainbow logo (DYCP-style: each letter on its own sine)
function drawBigLogo(text, baseY, t) {
  ctx.save();
  ctx.font = '42px "Press Start 2P"';
  ctx.textAlign = 'center';
  const total = text.length;
  const spacing = 52;
  const startX = 320 - ((total - 1) * spacing) / 2;
  for (let i = 0; i < total; i++) {
    const y = baseY + Math.sin(t * 2.4 + i * 0.65) * 16;
    const x = startX + i * spacing;
    // hard pixel shadow
    ctx.fillStyle = C64.darkGrey;
    ctx.fillText(text[i], x + 4, y + 4);
    // colour-cycled letter
    ctx.fillStyle = rainbow(frame * 0.15 + i * 1.5);
    ctx.fillText(text[i], x, y);
    // glint scanline through letter
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    const glintY = y - 30 + ((frame * 2 + i * 17) % 50);
    ctx.fillRect(x - 22, glintY, 44, 2);
  }
  ctx.restore();
}

// (2) Sine scroller
function drawScroller(y) {
  ctx.save();
  ctx.font = '14px "Press Start 2P"';
  scrollX -= 1.6;
  if (scrollX < -SCROLL_TEXT.length * 16) scrollX = 660;
  for (let i = 0; i < SCROLL_TEXT.length; i++) {
    const cx = scrollX + i * 16;
    if (cx < -20 || cx > 660) continue;
    const cy = y + Math.sin(frame * 0.07 + cx * 0.025) * 10;
    ctx.fillStyle = C64.darkGrey;
    ctx.fillText(SCROLL_TEXT[i], cx + 2, cy + 2);
    ctx.fillStyle = rainbow(frame * 0.2 + i);
    ctx.fillText(SCROLL_TEXT[i], cx, cy);
  }
  ctx.restore();
}

// (8) Glitch / trash-noise transition frame
function drawGlitch(intensity) {
  // horizontal slice displacement (copies of the live framebuffer)
  for (let i = 0; i < 8 * intensity; i++) {
    const sy = Math.random() * 400;
    const sh = Math.random() * 18 + 2;
    const shift = (Math.random() - 0.5) * 90 * intensity;
    try {
      ctx.drawImage(canvas, 0, sy, 640, sh, shift, sy, 640, sh);
    } catch (e) { /* canvas not ready */ }
  }
  // trash colour bands
  for (let i = 0; i < 10 * intensity; i++) {
    ctx.globalAlpha = Math.random() * 0.5;
    ctx.fillStyle = rainbow(Math.random() * 10);
    ctx.fillRect(0, Math.random() * 400, 640, Math.random() * 8 + 1);
  }
  // static noise pixels
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 350 * intensity; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? '#FFFFFF' : rainbow(Math.random() * 10);
    ctx.fillRect(Math.random() * 640, Math.random() * 400, 2, 2);
  }
  // rolling sync bar
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, (frame * 13) % 400, 640, 26);
  ctx.globalAlpha = 1;
}

// (12) Big wavy rainbow text (wave clear etc.)
function drawWavyBigText(text, cx, cy, size) {
  ctx.save();
  ctx.font = `${size}px "Press Start 2P"`;
  ctx.textAlign = 'center';
  const spacing = size * 1.15;
  const startX = cx - ((text.length - 1) * spacing) / 2;
  for (let i = 0; i < text.length; i++) {
    const y = cy + Math.sin(frame * 0.15 + i * 0.7) * 8;
    ctx.fillStyle = C64.black;
    ctx.fillText(text[i], startX + i * spacing + 3, y + 3);
    ctx.fillStyle = rainbow(frame * 0.25 + i * 1.2);
    ctx.fillText(text[i], startX + i * spacing, y);
  }
  ctx.restore();
}

// --- Demo attract screen (menu / game over background) ---
function drawDemoScreen() {
  ctx.fillStyle = C64.black;
  ctx.fillRect(0, 0, 640, 400);

  drawPlasma(0.16);
  drawStarfield(false);
  drawRasterBars(5, 0.22, 150);
  drawInterference(0.08);
  drawCheckerFloor();
  drawVectorBalls();
  drawBigLogo('JOUST', 120, frame * 0.025);
  drawScroller(355);

  // corner sparkles
  if (frame % 5 === 0) {
    particles.push(new Particle(Math.random() * 640, Math.random() * 280, rainbow(frame), 'trail'));
  }
  particles.forEach(p => { p.update(); p.draw(); });
  particles = particles.filter(p => p.life > 0);
}

// --- Draw Functions ---
function drawWorld() {
  if (screenShakeIntensity > 0) {
    const dx = (Math.random() - 0.5) * screenShakeIntensity;
    const dy = (Math.random() - 0.5) * screenShakeIntensity;
    ctx.translate(dx, dy);
    screenShakeIntensity *= 0.88;
    if (screenShakeIntensity < 0.5) screenShakeIntensity = 0;
  }

  // Background Space
  ctx.fillStyle = C64.black;
  ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

  // demo layers behind the playfield
  drawStarfield(true);
  drawRasterBars(3, 0.08, 120);

  // Lava magma — colour-cycled surface
  ctx.fillStyle = C64.red;
  ctx.fillRect(0, 384, canvas.width, 16);
  const waveOffset = Math.sin(Date.now() / 150) * 5;
  for (let i = 0; i < canvas.width; i += 16) {
    // per-tile colour cycling shimmer
    ctx.fillStyle = (Math.floor(i / 16 + frame * 0.2) % 3 === 0) ? C64.yellow : C64.orange;
    ctx.fillRect(i, 382 + waveOffset, 16, 4);
  }
  // lava glow gradient
  const glow = ctx.createLinearGradient(0, 350, 0, 400);
  glow.addColorStop(0, 'rgba(200,100,0,0)');
  glow.addColorStop(1, `rgba(200,100,0,${0.25 + Math.sin(frame * 0.1) * 0.1})`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 350, canvas.width, 50);

  // Lava heat ripples
  ctx.fillStyle = 'rgba(200, 70, 0, 0.2)';
  lavaRipples.forEach(rip => {
    ctx.fillRect(rip.x, rip.y, rip.w, 2);
    rip.y -= rip.speed;
    if (rip.y < 310) {
      rip.y = 380;
      rip.x = Math.random() * 640;
    }
  });

  // Platforms with colour-cycled edge highlight
  platforms.forEach(plat => {
    ctx.fillStyle = C64.brown;
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.fillStyle = C64.orange;
    ctx.fillRect(plat.x, plat.y, plat.w, 3);
    // running highlight pixel (light chaser along the platform edge)
    const lx = plat.x + ((frame * 2) % plat.w);
    ctx.fillStyle = C64.yellow;
    ctx.fillRect(lx, plat.y, 8, 3);
  });

  // Score HUD with pop animation
  ctx.save();
  ctx.font = '12px "Press Start 2P"';
  const pop = 1 + (scorePop > 0 ? scorePop * 0.02 : 0);
  if (scorePop > 0) scorePop--;
  ctx.translate(15, 25);
  ctx.scale(pop, pop);
  ctx.fillStyle = scorePop > 0 ? rainbow(frame) : C64.yellow;
  ctx.fillText(`SCORE: ${String(score).padStart(6, '0')}`, 0, 0);
  ctx.restore();

  ctx.font = '12px "Press Start 2P"';
  ctx.fillStyle = C64.yellow;
  ctx.fillText(`HIGH: ${String(highScore).padStart(6, '0')}`, 260, 25);
  ctx.fillStyle = C64.cyan;
  ctx.fillText(`WAVE: ${wave}`, 530, 25);

  // Lives ostriches (blink red when only one left)
  ctx.fillStyle = (lives === 1 && Math.floor(frame / 15) % 2 === 0) ? C64.red : C64.white;
  for (let i = 0; i < lives; i++) {
    ctx.fillRect(15 + i * 20, 36, 12, 10);
  }

  // Animated Lava Troll Hand
  if (lavaHand.y < 420) {
    ctx.fillStyle = C64.orange;
    ctx.fillRect(lavaHand.x, lavaHand.y, 24, 40);
    ctx.fillStyle = C64.red;
    const flex = Math.sin(Date.now() / 100) * 3;
    ctx.fillRect(lavaHand.x - 2, lavaHand.y - 4 + flex, 4, 12);
    ctx.fillRect(lavaHand.x + 10, lavaHand.y - 6 + flex / 2, 4, 12);
    ctx.fillRect(lavaHand.x + 22, lavaHand.y - 4 + flex, 4, 12);
  }
}

// --- Main Engine Loop ---
function update() {
  frame++;

  if (gameState === 'MENU' || gameState === 'GAME_OVER') {
    drawDemoScreen();
    requestAnimationFrame(update);
    return;
  }

  ctx.save();

  if (gameState === 'TRANSITION') {
    transition.t++;
    // first half: glitch over old frame; midway: run callback; second half: glitch fades
    if (!transition.fired && transition.t >= transition.dur / 2) {
      transition.cb();
      transition.fired = true;
    }
    drawWorld();
    if (player && transition.fired) player.draw();
    enemies.forEach(e => e.draw());
    const half = transition.dur / 2;
    const intensity = 1 - Math.abs(transition.t - half) / half; // ramp up then down
    drawGlitch(Math.max(intensity, 0.15));
    if (transition.t >= transition.dur) {
      gameState = transition.next;
      transition = null;
      triggerBorderFlash('flash-yellow');
    }
    ctx.restore();
    requestAnimationFrame(update);
    return;
  }

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

    if (enemies.length === 0 && gameState === 'PLAYING') {
      gameState = 'WAVE_CLEAR';
      waveTimer = 130;
      synth.playVictory();
      // celebration fireworks
      for (let i = 0; i < 4; i++) {
        explosionBurst(100 + Math.random() * 440, 80 + Math.random() * 150, rainbow(i * 3), 20);
      }
    }
  }
  else if (gameState === 'WAVE_CLEAR') {
    waveTimer--;
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.life > 0);
    floatingTexts.forEach(t => t.update());
    floatingTexts = floatingTexts.filter(t => t.alpha > 0);
    // ongoing fireworks
    if (waveTimer % 25 === 0) {
      explosionBurst(100 + Math.random() * 440, 60 + Math.random() * 160, rainbow(waveTimer), 18);
      synth.playCollect();
    }
    if (waveTimer <= 0) {
      startTransition(() => {
        wave++;
        spawnWave();
      }, 'PLAYING');
    }
  }

  drawWorld();

  if (player && (gameState === 'PLAYING' || gameState === 'WAVE_CLEAR')) player.draw();
  enemies.forEach(enemy => enemy.draw());
  eggs.forEach(egg => egg.draw());
  powerups.forEach(pw => pw.draw());
  if (pterodactyl) pterodactyl.draw();
  particles.forEach(p => p.draw());
  floatingTexts.forEach(t => t.draw());

  if (gameState === 'WAVE_CLEAR') {
    drawWavyBigText(`WAVE ${wave} CLEAR!`, 320, 190, 24);
    drawScroller(250);
  }

  ctx.restore();

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
  // glitch-noise transition into the game
  startTransition(() => {
    spawnWave();
  }, 'PLAYING');
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Inital UI Setup
updateLeaderboardUI();
requestAnimationFrame(update);
