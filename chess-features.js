/* =========================================================
   MBICUKI CATUR — CHESS FEATURES
   Stable browser-safe version
   - Move sound on every chess move
   - Special knight sound when a knight moves
   - Capture/check/win sounds
   - Relaxation music
   - 3 consecutive draws = -50 total Point
   - 6 selectable premium chess board themes
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
  return { piece, isKnight: /[♘♞]/.test(piece), isCapture: destinations.some(x => x.replaced) };
}

function playDetectedMove(before, after) {
  const move = detectBoardMove(before, after);
  if (!move) return;
  if (move.isKnight) knightSound();
  else if (move.isCapture) captureSound();
  else moveSound();
}

function observeBoard() {
  const board = $("board");
  if (!board || !window.MutationObserver) return;
  if (boardObserver) boardObserver.disconnect();
  lastBoardState = JSON.stringify(boardSnapshot(board));
  boardObserver = new MutationObserver(() => {
    const before = (() => { try { return JSON.parse(lastBoardState || "{}"); } catch { return {}; } })();
    const after = boardSnapshot(board);
    const nextState = JSON.stringify(after);
    if (nextState === lastBoardState) return;
    lastBoardState = nextState;
    playDetectedMove(before, after);
  });
  boardObserver.observe(board, { childList: true, subtree: true });
}

async function resetDrawStreak(uid) {
  if (!uid) return;
  try {
    await runTransaction(ref(db, `chessPlayers/${uidKey(uid)}`), value => {
      if (!value) return value;
      value.drawStreak = 0;
      value.drawsProcessed = Number(value.draws || 0);
      value.updatedAt = Date.now();
      return value;
    });
  } catch (e) { console.warn("Gagal reset draw streak:", e); }
}

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
  } catch (e) { console.warn("Gagal menerapkan penalti 3 remis:", e); }
  finally { drawPenaltyProcessing = false; }
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
      if (Number(v.drawsProcessed || 0) < Number(v.draws || 0)) {
        runTransaction(ref(db, `chessPlayers/${uidKey(uid)}`), current => {
          const x = current || {};
          if (Number(x.drawsProcessed || 0) >= Number(x.draws || 0)) return x;
          x.drawsProcessed = Number(x.draws || 0);
          x.drawStreak = Math.max(0, Number(x.drawStreak || 0));
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
    playerUnsub(); playerUnsub = null; watchedUid = null;
  }
}

function updateRuleDisplay() {
  const notice = document.querySelector(".notice p");
  if (notice && !notice.textContent.includes("3 Remis")) notice.textContent += " • 3 Remis berturut-turut −50";
  const grid = document.querySelector(".score-grid");
  if (grid && !grid.querySelector("[data-draw-penalty]")) {
    const item = document.createElement("div");
    item.className = "score-item";
    item.dataset.drawPenalty = "1";
    item.innerHTML = '<b class="score-minus">−50</b>3 Remis Berturut-turut';
    grid.appendChild(item);
  }
}

/* =========================================================
   PILIHAN DESAIN PAPAN
   Tersimpan di browser masing-masing pemain.
   Tidak mengubah warna bidak atau sistem permainan.
   ========================================================= */
const BOARD_THEMES = {
  rose: {
    name: "🌸 Rose Luxury", light: "#f8dbe8", dark: "#8e315e", edge: "#35172b", accent: "#ff4fa3", glow: "rgba(255,79,163,.55)"
  },
  ocean: {
    name: "🌊 Ocean Blue", light: "#d8f0f4", dark: "#176b80", edge: "#092b38", accent: "#48d9f5", glow: "rgba(72,217,245,.5)"
  },
  emerald: {
    name: "💎 Emerald", light: "#d9ecd8", dark: "#216044", edge: "#0d2d21", accent: "#65e6a4", glow: "rgba(101,230,164,.5)"
  },
  royal: {
    name: "👑 Royal Purple", light: "#e8dcf4", dark: "#5a3a78", edge: "#241632", accent: "#c58cff", glow: "rgba(197,140,255,.52)"
  },
  obsidian: {
    name: "🖤 Obsidian Gold", light: "#d8d0c2", dark: "#343238", edge: "#111014", accent: "#e7c56a", glow: "rgba(231,197,106,.48)"
  },
  sunset: {
    name: "🔥 Sunset", light: "#ffe0bd", dark: "#a6422d", edge: "#351611", accent: "#ff9a4d", glow: "rgba(255,154,77,.5)"
  }
};

function ensureThemeStyle() {
  if ($("chessThemeStyle")) return;
  const style = document.createElement("style");
  style.id = "chessThemeStyle";
  style.textContent = `
    #chessThemeBox{margin:0 0 14px;padding:14px;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 30px rgba(0,0,0,.16)}
    #chessThemeBox h3{margin:0 0 5px;font-size:15px}#chessThemeBox p{margin:0 0 11px;color:#aeb4c7;font-size:12px}
    #chessThemeOptions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
    .chess-theme-btn{position:relative;min-width:0;padding:8px 5px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.14);color:#fff;cursor:pointer;transition:.2s ease;font-size:11px;font-weight:800}
    .chess-theme-btn:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.3)}
    .chess-theme-btn.active{border-color:var(--theme-accent);box-shadow:0 0 16px var(--theme-glow);background:rgba(255,255,255,.08)}
    .theme-preview{height:28px;margin-bottom:5px;border-radius:7px;background:linear-gradient(90deg,var(--theme-light) 0 50%,var(--theme-dark) 50% 100%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}
    .theme-preview:after{content:"♟ ♞ ♛";display:block;text-align:center;line-height:28px;color:#fff;font-size:15px;text-shadow:0 2px 2px #000}
    .board.theme-rose .sq.light{background:linear-gradient(145deg,#f8dbe8,#eec1d5)!important}.board.theme-rose .sq.dark{background:linear-gradient(145deg,#a83d6e,#6d2147)!important}
    .board.theme-ocean .sq.light{background:linear-gradient(145deg,#d8f0f4,#b7dfe6)!important}.board.theme-ocean .sq.dark{background:linear-gradient(145deg,#217d92,#10576a)!important}
    .board.theme-emerald .sq.light{background:linear-gradient(145deg,#d9ecd8,#bad8b9)!important}.board.theme-emerald .sq.dark{background:linear-gradient(145deg,#287052,#164c37)!important}
    .board.theme-royal .sq.light{background:linear-gradient(145deg,#e8dcf4,#d1bee4)!important}.board.theme-royal .sq.dark{background:linear-gradient(145deg,#684586,#42295d)!important}
    .board.theme-obsidian .sq.light{background:linear-gradient(145deg,#e2dbcf,#c1b8aa)!important}.board.theme-obsidian .sq.dark{background:linear-gradient(145deg,#47454b,#29282d)!important}
    .board.theme-sunset .sq.light{background:linear-gradient(145deg,#ffe0bd,#f8c18f)!important}.board.theme-sunset .sq.dark{background:linear-gradient(145deg,#b74e34,#7b2d21)!important}
    .board.theme-rose{border-color:#35172b!important;box-shadow:0 20px 50px rgba(0,0,0,.48),0 0 28px rgba(255,79,163,.14)}
    .board.theme-ocean{border-color:#092b38!important;box-shadow:0 20px 50px rgba(0,0,0,.48),0 0 28px rgba(72,217,245,.13)}
    .board.theme-emerald{border-color:#0d2d21!important;box-shadow:0 20px 50px rgba(0,0,0,.48),0 0 28px rgba(101,230,164,.12)}
    .board.theme-royal{border-color:#241632!important;box-shadow:0 20px 50px rgba(0,0,0,.48),0 0 28px rgba(197,140,255,.13)}
    .board.theme-obsidian{border-color:#111014!important;box-shadow:0 20px 50px rgba(0,0,0,.55),0 0 28px rgba(231,197,106,.11)}
    .board.theme-sunset{border-color:#351611!important;box-shadow:0 20px 50px rgba(0,0,0,.48),0 0 28px rgba(255,154,77,.12)}
    @media(max-width:650px){#chessThemeOptions{grid-template-columns:repeat(2,1fr)}.chess-theme-btn{font-size:10px}.theme-preview{height:24px}.theme-preview:after{line-height:24px;font-size:13px}}
  `;
  document.head.appendChild(style);
}

function applyBoardTheme(themeId) {
  const board = $("board");
  if (!board) return;
  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.rose;
  Object.keys(BOARD_THEMES).forEach(id => board.classList.remove(`theme-${id}`));
  board.classList.add(`theme-${themeId}`);
  document.documentElement.style.setProperty("--theme-accent", theme.accent);
  document.documentElement.style.setProperty("--theme-glow", theme.glow);
  localStorage.setItem("mbicukiChessBoardTheme", themeId);
  document.querySelectorAll(".chess-theme-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.theme === themeId));
}

function createThemePicker() {
  if ($("chessThemeBox")) return;
  const boardPanel = document.querySelector(".board-panel");
  const board = $("board");
  if (!boardPanel || !board) return;
  ensureThemeStyle();

  const box = document.createElement("div");
  box.id = "chessThemeBox";
  box.innerHTML = '<h3>🎨 Pilih Desain Papan</h3><p>Pilih warna papan favoritmu. Pilihan tersimpan otomatis di perangkat ini.</p><div id="chessThemeOptions"></div>';
  boardPanel.insertBefore(box, board);

  const options = $("chessThemeOptions");
  Object.entries(BOARD_THEMES).forEach(([id, theme]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chess-theme-btn";
    btn.dataset.theme = id;
    btn.style.setProperty("--theme-accent", theme.accent);
    btn.style.setProperty("--theme-glow", theme.glow);
    btn.innerHTML = `<div class="theme-preview" style="--theme-light:${theme.light};--theme-dark:${theme.dark}"></div>${theme.name}`;
    btn.addEventListener("click", () => applyBoardTheme(id));
    options.appendChild(btn);
  });

  const saved = localStorage.getItem("mbicukiChessBoardTheme") || "rose";
  applyBoardTheme(BOARD_THEMES[saved] ? saved : "rose");
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
    if (!/remis|stalemate/i.test(text)) {
      const uid = window.chessAccount?.getUser?.()?.uid;
      if (uid) setTimeout(() => resetDrawStreak(uid), 350);
    }
  });
  resultObserver.observe(msg, { childList: true, characterData: true, subtree: true });
}

function bind() {
  if (bound) return;
  bound = true;
  $("musicBtn")?.addEventListener("click", toggleMusic);
  $("winClose")?.addEventListener("click", () => $("winPanel")?.classList.add("hidden"));
  document.addEventListener("pointerdown", () => { audioStart(); }, { once: true, passive: true });
  createThemePicker();
  observeBoard();
  observeResult();
  updateRuleDisplay();
  pollDrawAccount();
  setInterval(() => { createThemePicker(); pollDrawAccount(); }, 700);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
else bind();

window.chessAudio = { move: moveSound, knight: knightSound, capture: captureSound, check: checkSound, win: winSound };