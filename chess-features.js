/* =========================================================
   MBICUKI CATUR — CHESS FEATURES
   Stable browser-safe version
   - No unnecessary Firebase initialization
   - Safe Web Audio handling
   - No duplicate event bindings
   - No duplicate win modal observers
   ========================================================= */
"use strict";

const $ = id => document.getElementById(id);

let audioCtx = null;
let musicTimer = null;
let musicOn = false;
let bound = false;
let boardObserver = null;
let resultObserver = null;
let lastBoardState = "";
let lastResultText = "";

function getAudioContext() {
  if (audioCtx) return audioCtx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  } catch (e) {
    console.warn("Web Audio tidak tersedia:", e);
    return null;
  }
}

async function audioStart() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  try {
    if (ctx.state === "suspended") await ctx.resume();
  } catch (e) {
    console.warn("Audio resume gagal:", e);
  }
  return ctx;
}

function tone(freq, duration, type = "sine", volume = 0.055, delay = 0) {
  const ctx = getAudioContext();
  if (!ctx || !Number.isFinite(freq) || !Number.isFinite(duration)) return;
  try {
    const now = ctx.currentTime;
    const start = now + Math.max(0, Number(delay) || 0);
    const end = start + Math.max(0.02, Number(duration) || 0.02);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, Number(freq) || 440), start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, Number(volume) || 0.02), start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.04);
  } catch (e) {
    console.warn("Audio tone gagal:", e);
  }
}

function moveSound() {
  tone(520, 0.09, "triangle", 0.065);
  tone(760, 0.12, "sine", 0.035, 0.035);
}

function captureSound() {
  tone(180, 0.11, "square", 0.045);
  tone(110, 0.16, "triangle", 0.035, 0.05);
}

function checkSound() {
  tone(880, 0.12, "sine", 0.05);
  tone(660, 0.15, "sine", 0.04, 0.12);
}

function winSound() {
  tone(523, 0.18, "sine", 0.06);
  tone(659, 0.18, "sine", 0.06, 0.18);
  tone(784, 0.30, "sine", 0.07, 0.36);
}

function musicStep() {
  if (!musicOn) return;
  const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
  const index = Math.floor(Date.now() / 1000) % notes.length;
  tone(notes[index], 1.45, "sine", 0.012);
}

async function toggleMusic() {
  const ctx = await audioStart();
  if (!ctx) {
    const btn = $("musicBtn");
    if (btn) btn.textContent = "🎵 Audio tidak tersedia";
    return;
  }

  musicOn = !musicOn;
  const btn = $("musicBtn");

  if (musicOn) {
    btn?.classList.add("active");
    if (btn) btn.textContent = "🔊 Musik Relaksasi: ON";
    clearInterval(musicTimer);
    musicTimer = setInterval(musicStep, 1500);
    musicStep();
  } else {
    clearInterval(musicTimer);
    musicTimer = null;
    btn?.classList.remove("active");
    if (btn) btn.textContent = "🎵 Musik Relaksasi";
  }
}

function observeBoard() {
  const board = $("board");
  if (!board || !window.MutationObserver) return;
  if (boardObserver) boardObserver.disconnect();

  lastBoardState = board.textContent || "";
  boardObserver = new MutationObserver(() => {
    const state = board.textContent || "";
    if (!lastBoardState) {
      lastBoardState = state;
      return;
    }
    if (state !== lastBoardState) {
      lastBoardState = state;
      moveSound();
    }
  });

  boardObserver.observe(board, { childList: true, subtree: true });
}

function observeResult() {
  const msg = $("gameMsg");
  if (!msg || !window.MutationObserver) return;
  if (resultObserver) resultObserver.disconnect();

  lastResultText = msg.textContent || "";
  resultObserver = new MutationObserver(() => {
    const text = String(msg.textContent || "").trim();
    if (!text || text === lastResultText) return;
    lastResultText = text;

    const terminal = /menang|skakmat|remis|stalemate|waktu habis|menyerah|keluar game/i.test(text);
    if (!terminal) return;

    $("winPanel")?.classList.remove("hidden");
    if (/menang|skakmat/i.test(text)) winSound();
  });

  resultObserver.observe(msg, { childList: true, characterData: true, subtree: true });
}

function bind() {
  if (bound) return;
  bound = true;

  $("musicBtn")?.addEventListener("click", toggleMusic);
  $("winClose")?.addEventListener("click", () => $("winPanel")?.classList.add("hidden"));

  observeBoard();
  observeResult();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bind, { once: true });
} else {
  bind();
}

window.chessAudio = {
  move: moveSound,
  capture: captureSound,
  check: checkSound,
  win: winSound
};