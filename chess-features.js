/* =========================================================
   MBICUKI CATUR — CHESS FEATURES
   Stable browser-safe version
   - No unnecessary Firebase initialization
   - Safe Web Audio handling
   - Move sound on every chess move
   - Special knight sound when a knight moves
   - Capture/check/win sounds
   - Relaxation music
   - 3 consecutive draws = -50 total Point
   ========================================================= */
"use strict";

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const uidKey = s => String(s || "").replace(/[^a-zA-Z0-9_-]/g, "_");

const $ = id => document.getElementById(id);

let audioCtx = null;
let musicTimer = null;
let musicOn = false;
let bound = false;
let boardObserver = null;
let resultObserver = null;
let lastBoardState = "";
let lastResultText = "";
let watchedUid = null;
let playerUnsub = null;
let firstPlayerSnapshot = true;
let drawPenaltyProcessing = false;

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

function knightSound() {
  // Suara khas kuda: tiga nada pendek dengan aksen naik.
  tone(300, 0.075, "square", 0.045);
  tone(610, 0.10, "triangle", 0.06, 0.055);
  tone(860, 0.12, "sine", 0.04, 0.13);
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

function boardSnapshot(board) {
  const map = {};
  board?.querySelectorAll?.(".sq").forEach(cell => {
    const sq = cell.dataset.square;
    if (sq) map[sq] = cell.textContent || "";
  });
  return map;
}

function detectBoardMove(before, after) {
  const sources = [];
  const destinations = [];

  for (const sq of Object.keys(after)) {
    const oldPiece = String(before[sq] || "").trim();
    const newPiece = String(after[sq] || "").trim();
    if (oldPiece && !newPiece) sources.push({ sq, piece: oldPiece });
    if (!oldPiece && newPiece) destinations.push({ sq, piece: newPiece });
    if (oldPiece && newPiece && oldPiece !== newPiece) destinations.push({ sq, piece: newPiece, replaced: oldPiece });
  }

  const source = sources.find(x => !/[♔♚]/.test(x.piece)) || sources[0];
  const destination = destinations[0];
  if (!source && !destination) return null;

  const piece = source?.piece || destination?.piece || "";
  const isKnight = /[♘♞]/.test(piece);
  const isCapture = destinations.some(x => x.replaced);
  return { piece, isKnight, isCapture };
}

function playDetectedMove(before, after) {
  const move = detectBoardMove(before, after);
  if (!move) {
    moveSound();
    return;
  }
  if (move.isKnight) knightSound();
  else if (move.isCapture) captureSound();
  else moveSound();
}

function observeBoard() {
  const board = $("board");
  if (!board || !window.MutationObserver) return;
  if (boardObserver) boardObserver.disconnect();

  const initial = boardSnapshot(board);
  lastBoardState = JSON.stringify(initial);

  boardObserver = new MutationObserver(() => {
    const before = (() => {
      try { return JSON.parse(lastBoardState || "{}"); } catch { return {}; }
    })();
    const after = boardSnapshot(board);
    const nextState = JSON.stringify(after);
    if (nextState === lastBoardState) return;
    lastBoardState = nextState;
    playDetectedMove(before, after);
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

/* =========================================================
   3 REMIS BERTURUT-TURUT = -50 POINT TOTAL
   ========================================================= */
function showDrawPenalty() {
  const msg = $("gameMsg");
  if (msg) msg.textContent = "⚠️ 3 kali Remis berturut-turut — Point dikurangi 50!";
  const text = $("winText");
  if (text) text.textContent = "Remis +25 Point • Penalti streak −50 Point";
  $("winPanel")?.classList.remove("hidden");
}

async function processDrawStreak(uid) {
  if (!uid || drawPenaltyProcessing) return;
  drawPenaltyProcessing = true;
  try {
    const playerRef = ref(db, `chessPlayers/${uidKey(uid)}`);
    const tx = await runTransaction(playerRef, value => {
      const v = value || {};
      const draws = Math.max(0, Number(v.draws || 0));
      const processed = Math.max(0, Number(v.drawsProcessed || 0));
      let streak = Math.max(0, Number(v.drawStreak || 0));

      if (processed >= draws) return v;

      const newDraws = draws - processed;
      streak += newDraws;
      const penalties = Math.floor(streak / 3);

      v.drawsProcessed = draws;
      v.drawStreak = streak % 3;
      if (penalties > 0) {
        v.points = Number(v.points || 0) - penalties * 50;
        v.drawPenaltyCount = Number(v.drawPenaltyCount || 0) + penalties;
        v.lastDrawPenalty = penalties * 50;
        v.lastDrawPenaltyAt = Date.now();
      }
      v.updatedAt = Date.now();
      return v;
    });

    if (tx.committed) {
      const v = tx.snapshot?.val() || {};
      const penaltyAt = Number(v.lastDrawPenaltyAt || 0);
      if (penaltyAt && penaltyAt >= Date.now() - 5000) showDrawPenalty();
    }
  } catch (e) {
    console.warn("Gagal menerapkan penalti 3 remis:", e);
  } finally {
    drawPenaltyProcessing = false;
  }
}

function watchDrawStreak(uid) {
  if (!uid || uid === watchedUid) return;
  if (playerUnsub) playerUnsub();
  watchedUid = uid;
  firstPlayerSnapshot = true;

  playerUnsub = onValue(ref(db, `chessPlayers/${uidKey(uid)}`), snap => {
    if (!snap.exists()) return;
    const v = snap.val() || {};

    if (firstPlayerSnapshot) {
      firstPlayerSnapshot = false;
      // Jangan menghukum draw lama saat fitur pertama kali dipasang.
      if (Number(v.drawsProcessed || 0) < Number(v.draws || 0)) {
        runTransaction(ref(db, `chessPlayers/${uidKey(uid)}`), current => {
          const x = current || {};
          if (Number(x.drawsProcessed || 0) >= Number(x.draws || 0)) return x;
          x.drawsProcessed = Number(x.draws || 0);
          return x;
        }).catch(() => {});
      }
      return;
    }

    if (Number(v.draws || 0) > Number(v.drawsProcessed || 0)) processDrawStreak(uid);
  }, error => console.warn("Draw streak listener:", error));
}

function pollDrawAccount() {
  const user = window.chessAccount?.getUser?.();
  if (user?.uid) watchDrawStreak(user.uid);
  else if (playerUnsub) {
    playerUnsub();
    playerUnsub = null;
    watchedUid = null;
  }
}

function bind() {
  if (bound) return;
  bound = true;

  $("musicBtn")?.addEventListener("click", toggleMusic);
  $("winClose")?.addEventListener("click", () => $("winPanel")?.classList.add("hidden"));

  observeBoard();
  observeResult();
  pollDrawAccount();
  setInterval(pollDrawAccount, 500);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bind, { once: true });
} else {
  bind();
}

window.chessAudio = {
  move: moveSound,
  knight: knightSound,
  capture: captureSound,
  check: checkSound,
  win: winSound
};