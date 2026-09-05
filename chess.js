import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, push, serverTimestamp, runTransaction, get } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const FILES = ["a","b","c","d","e","f","g","h"];
const PIECES = { p:"♟", n:"♞", b:"♝", r:"♜", q:"♛", k:"♚", P:"♙", N:"♘", B:"♗", R:"♖", Q:"♕", K:"♔" };
const START_FEN = new Chess().fen();
const START_TIME = 600;

let roomId = null;
let myColor = null;
let myName = "";
let myUid = null;
let selected = null;
let localChess = new Chess();
let gameData = null;
let roomUnsub = null;
let chatUnsub = null;
let clockTimer = null;
let solo = false;
let soloEnded = false;
let aiBusy = false;
let soloInputLock = false;
let computerTimer = null;
let computerColor = "b";
let humanColor = "w";
let computerLevel = "normal";
let soloWhiteTime = START_TIME;
let soloBlackTime = START_TIME;
let soloTurnStarted = 0;
let pageLeaving = false;
let timeoutClaiming = false;

const colorName = c => c === "w" ? "Putih" : "Hitam";
const levelName = x => ({easy:"Easy", normal:"Normal", professional:"Professional", world:"World Class"}[x] || x);
const formatTime = n => { n = Math.max(0, Math.ceil(Number(n) || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`; };
const cleanName = value => String(value || "").trim().replace(/[<>]/g, "").slice(0, 20);
const makeRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const validConfig = () => !!(firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("TEMPEL"));

function setLobbyMsg(text) { const e = $("lobbyMsg"); if (e) e.textContent = text || ""; }
function setGameMsg(text) { const e = $("gameMsg"); if (e) e.textContent = text || ""; }
function roomRef(id = roomId) { return ref(db, `rooms/${id}`); }
function enterGame() { $("lobby")?.classList.add("hidden"); $("game")?.classList.remove("hidden"); selected = null; }
function stopEverything() {
  if (roomUnsub) roomUnsub();
  if (chatUnsub) chatUnsub();
  roomUnsub = null;
  chatUnsub = null;
  clearInterval(clockTimer);
  clockTimer = null;
  clearTimeout(computerTimer);
  computerTimer = null;
  selected = null;
  aiBusy = false;
  soloInputLock = false;
  timeoutClaiming = false;
}
function announceGame(mode, id) { window.chessAccount?.setGame?.(id, mode); }

onValue(ref(db, ".info/connected"), snap => {
  const e = $("connection");
  if (!e) return;
  const online = snap.val() === true;
  e.textContent = online ? "● Online" : "● Menghubungkan...";
  e.className = online ? "status online" : "status offline";
});

document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const isComputer = radio.value === "computer";
    $("computerSettings")?.classList.toggle("hidden", !isComputer);
    $("onlineSettings")?.classList.toggle("hidden", isComputer);
    setLobbyMsg("");
  });
});

function getAccount() { return window.chessAccount?.getUser?.() || null; }

async function createRoom() {
  if (pageLeaving) return;
  try {
    const account = getAccount();
    if (!account) {
      setLobbyMsg("🔐 Silakan Login / Daftar terlebih dahulu untuk bermain Online.");
      $("accountModal")?.classList.remove("hidden");
      return;
    }
    stopEverything();
    solo = false;
    pageLeaving = false;
    myUid = account.uid;
    myName = cleanName($("playerName")?.value || account.displayName || "Pemain") || "Pemain";

    let code = "";
    for (let i = 0; i < 8; i++) {
      const candidate = makeRoomCode();
      const exists = await get(roomRef(candidate));
      if (!exists.exists()) { code = candidate; break; }
    }
    if (!code) throw new Error("Tidak dapat membuat kode room unik. Coba lagi.");

    roomId = code;
    myColor = "w";
    await set(roomRef(), {
      createdAt: serverTimestamp(), status: "waiting", fen: START_FEN, turn: "w",
      whiteUid: myUid, blackUid: "", whiteName: myName, blackName: "",
      whiteTime: START_TIME, blackTime: START_TIME, lastTick: Date.now(),
      winner: "", lastMove: "", lastMoveAt: 0, drawOffer: "", moves: {}
    });
    $("roomInput").value = roomId;
    enterGame();
    $("roomTitle").textContent = `ROOM ${roomId}`;
    $("roleText").textContent = "Anda: Putih";
    $("roomInfo").textContent = roomId;
    $("roomStatus").textContent = "waiting";
    announceGame("online", roomId);
    listenRoom();
    listenChat();
  } catch (e) {
    console.error(e);
    roomId = null;
    setLobbyMsg(`Gagal membuat room: ${e?.message || "kesalahan tidak diketahui"}`);
  }
}

async function joinRoom() {
  if (pageLeaving) return;
  try {
    const account = getAccount();
    if (!account) {
      setLobbyMsg("🔐 Silakan Login / Daftar terlebih dahulu untuk bermain Online.");
      $("accountModal")?.classList.remove("hidden");
      return;
    }

    const code = String($("roomInput")?.value || "")
      .trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    if (code.length < 4) {
      setLobbyMsg("Masukkan kode room yang benar.");
      return;
    }

    stopEverything();
    solo = false;
    pageLeaving = false;
    myUid = account.uid;
    myName = cleanName($("playerName")?.value || account.displayName || "Pemain") || "Pemain";
    roomId = code;
    myColor = null;
    setLobbyMsg(`🔎 Mencari ROOM ${code}...`);

    const firstSnap = await get(roomRef(code));
    if (!firstSnap.exists()) {
      roomId = null;
      setLobbyMsg(`❌ ROOM ${code} tidak ditemukan. Pastikan pemain pertama masih berada di room dan kode sama persis.`);
      return;
    }

    const firstData = firstSnap.val() || {};
    if (String(firstData.whiteUid || "") === String(myUid)) {
      roomId = null;
      setLobbyMsg("❌ Anda sudah menjadi pemilik room ini. Buka room di perangkat/browser lain untuk pemain kedua.");
      return;
    }
    if (firstData.status !== "waiting") {
      roomId = null;
      setLobbyMsg("❌ ROOM sudah penuh atau permainan sudah dimulai.");
      return;
    }
    if (firstData.blackUid || firstData.blackName) {
      roomId = null;
      setLobbyMsg("❌ ROOM sudah memiliki pemain kedua.");
      return;
    }

    setLobbyMsg("🔄 Menghubungkan Anda sebagai pemain Hitam...");

    const txResult = await runTransaction(roomRef(code), current => {
      if (!current) return;
      if (current.status !== "waiting") return;
      if (current.blackUid || current.blackName) return;
      return {
        ...current,
        blackUid: myUid,
        blackName: myName,
        status: "playing",
        lastTick: Date.now()
      };
    });

    if (!txResult || !txResult.committed || !txResult.snapshot?.exists()) {
      roomId = null;
      setLobbyMsg(`❌ ROOM ${code} tidak tersedia atau sudah diambil pemain lain.`);
      return;
    }

    const joinedData = txResult.snapshot.val() || {};
    if (String(joinedData.blackUid || "") !== String(myUid)) {
      roomId = null;
      setLobbyMsg("❌ ROOM baru saja diambil pemain lain. Gunakan room lain.");
      return;
    }

    myColor = "b";
    enterGame();
    $("roomTitle").textContent = `ROOM ${roomId}`;
    $("roleText").textContent = "Anda: Hitam";
    $("roomInfo").textContent = roomId;
    $("roomStatus").textContent = "playing";
    setLobbyMsg("");
    announceGame("online", roomId);
    listenRoom();
    listenChat();
  } catch (e) {
    console.error("joinRoom:", e);
    roomId = null;
    const message = String(e?.message || "");
    if (/permission|denied/i.test(message)) {
      setLobbyMsg("❌ Firebase menolak akses ke room. Periksa Firebase Realtime Database Rules.");
    } else if (/network|offline|disconnected/i.test(message)) {
      setLobbyMsg("❌ Koneksi Firebase terputus. Pastikan status di atas sudah ● Online, lalu coba lagi.");
    } else {
      setLobbyMsg(`❌ Gagal bergabung: ${message || "kesalahan tidak diketahui"}`);
    }
  }
}

function listenRoom() {
  if (roomUnsub) roomUnsub();
  roomUnsub = onValue(roomRef(), snap => {
    if (!snap.exists()) { gameData = null; setGameMsg("Room sudah tidak tersedia."); return; }
    gameData = snap.val();
    if (!myColor) {
      if (String(gameData.whiteUid || "") === String(myUid)) myColor = "w";
      else if (String(gameData.blackUid || "") === String(myUid)) myColor = "b";
    }
    renderOnline();
  }, error => { console.error("Room listener:", error); setGameMsg("Koneksi room bermasalah. Memuat ulang data..."); });
}

function remaining(d) {
  let w = Number(d?.whiteTime ?? START_TIME);
  let b = Number(d?.blackTime ?? START_TIME);
  if (d?.status === "playing") {
    const elapsed = Math.max(0, (Date.now() - Number(d.lastTick || Date.now())) / 1000);
    if (d.turn === "w") w = Math.max(0, w - elapsed);
    else if (d.turn === "b") b = Math.max(0, b - elapsed);
  }
  return { w, b };
}

function statusText(d) {
  if (!d) return "";
  if (d.status === "waiting") return "Menunggu pemain kedua...";
  if (d.status === "playing") return d.turn === myColor ? "🎯 Giliran Anda — hanya Anda yang boleh jalan" : "⏳ Giliran lawan";
  if (d.status === "checkmate") return `♚ Skakmat! ${colorName(d.winner)} menang.`;
  if (d.status === "stalemate") return "🤝 Remis — Stalemate.";
  if (d.status === "draw") return "🤝 Remis.";
  if (d.status === "resigned") return `🏆 ${colorName(d.winner)} menang.`;
  if (d.status === "timeout") return `⏰ Waktu habis. ${colorName(d.winner)} menang.`;
  return "Permainan selesai.";
}

function renderOnline() {
  if (!gameData || solo) return;
  $("roomTitle").textContent = `ROOM ${roomId}`;
  $("roleText").textContent = `Anda: ${colorName(myColor)}`;
  $("aiBadge")?.classList.add("hidden");
  $("chatCard")?.classList.remove("hidden");
  $("copyBtn")?.classList.remove("hidden");
  $("whiteName").textContent = gameData.whiteName || "Menunggu...";
  $("blackName").textContent = gameData.blackName || "Menunggu...";
  $("roomInfo").textContent = roomId || "-";
  $("roomStatus").textContent = gameData.status || "waiting";
  const t = remaining(gameData);
  $("whiteClock").textContent = formatTime(t.w);
  $("blackClock").textContent = formatTime(t.b);
  let message = statusText(gameData);
  if (gameData.status === "playing" && gameData.drawOffer && gameData.drawOffer !== myColor) message = "🤝 Lawan menawarkan remis — tekan tombol Remis untuk menerima.";
  setGameMsg(message);
  renderBoard(gameData.fen || START_FEN, myColor);
  startOnlineClock();
}

function startOnlineClock() {
  clearInterval(clockTimer);
  if (!gameData || solo || gameData.status !== "playing") return;
  clockTimer = setInterval(() => {
    if (!gameData || solo || gameData.status !== "playing") return;
    const t = remaining(gameData);
    $("whiteClock").textContent = formatTime(t.w);
    $("blackClock").textContent = formatTime(t.b);
    if (t.w <= 0 || t.b <= 0) claimTimeout();
  }, 250);
}

async function claimTimeout() {
  if (timeoutClaiming || !roomId || !gameData || gameData.status !== "playing") return;
  timeoutClaiming = true;
  try {
    await runTransaction(roomRef(), d => {
      if (!d || d.status !== "playing") return;
      const t = remaining(d);
      if (t.w > 0 && t.b > 0) return;
      return { ...d, status: "timeout", winner: t.w <= 0 ? "b" : "w", whiteTime: t.w, blackTime: t.b, lastTick: Date.now(), drawOffer: "" };
    });
  } catch (e) { console.error("timeout:", e); }
  finally { timeoutClaiming = false; }
}

function renderBoard(fen, orientation = "w") {
  try { localChess = new Chess(fen || START_FEN); } catch { localChess = new Chess(); }
  const board = $("board");
  if (!board) return;
  board.innerHTML = "";
  const rows = orientation === "w" ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
  const fs = orientation === "w" ? FILES : [...FILES].reverse();
  for (const r of rows) for (const f of fs) {
    const fi = FILES.indexOf(f), sq = `${f}${r}`, p = localChess.get(sq);
    const cell = document.createElement("div");
    cell.className = `sq ${((fi + r) % 2 === 0) ? "light" : "dark"}`;
    cell.dataset.square = sq;
    if (selected === sq) cell.classList.add("selected");
    if (selected) {
      try {
        const mv = localChess.moves({ square: selected, verbose: true }).find(x => x.to === sq);
        if (mv) cell.classList.add(p ? "capture" : "legal");
      } catch {}
    }
    if (p) {
      const span = document.createElement("span");
      span.className = `piece ${p.color === "w" ? "piece-white" : "piece-black"}`;
      span.textContent = PIECES[p.color === "w" ? p.type.toUpperCase() : p.type];
      cell.appendChild(span);
    }
    cell.addEventListener("click", () => clickSquare(sq));
    board.appendChild(cell);
  }
}

async function clickSquare(sq) {
  if (solo) return clickSolo(sq);
  if (!gameData || gameData.status !== "playing" || gameData.turn !== myColor) return;
  const p = localChess.get(sq);
  if (!selected) {
    if (p && p.color === myColor) { selected = sq; renderBoard(gameData.fen, myColor); }
    return;
  }
  if (sq === selected) { selected = null; renderBoard(gameData.fen, myColor); return; }
  const from = selected;
  selected = null;
  try {
    const txResult = await runTransaction(roomRef(), d => {
      if (!d || d.status !== "playing" || d.turn !== myColor) return;
      const t = remaining(d);
      if (t.w <= 0 || t.b <= 0) return { ...d, status: "timeout", winner: t.w <= 0 ? "b" : "w", whiteTime: t.w, blackTime: t.b, lastTick: Date.now() };
      const c = new Chess(d.fen || START_FEN), piece = c.get(from);
      if (!piece || piece.color !== myColor) return;
      let move;
      try { move = c.move({ from, to: sq, promotion: "q" }); } catch { return; }
      let status = "playing", winner = "";
      if (c.isCheckmate()) { status = "checkmate"; winner = myColor; }
      else if (c.isStalemate()) status = "stalemate";
      else if (c.isDraw()) status = "draw";
      const moves = { ...(d.moves || {}) };
      moves[`m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`] = { from: move.from, to: move.to, fen: c.fen(), by: myColor, at: Date.now(), san: move.san };
      return { ...d, fen: c.fen(), turn: c.turn(), status, moves, lastMove: move.san, lastMoveAt: Date.now(), lastTick: Date.now(), drawOffer: "", whiteTime: t.w, blackTime: t.b, winner };
    });
    if (!txResult || !txResult.committed || !txResult.snapshot?.exists()) renderOnline();
  } catch (e) { console.error("move:", e); renderOnline(); }
}

function startSolo() {
  stopEverything();
  solo = true; soloEnded = false; pageLeaving = false;
  humanColor = $("computerSide")?.value === "b" ? "b" : "w";
  computerColor = humanColor === "w" ? "b" : "w";
  computerLevel = $("computerLevel")?.value || "normal";
  myColor = humanColor;
  const account = getAccount();
  myUid = account?.uid || null;
  myName = cleanName($("playerName")?.value || account?.displayName || "Pemain") || "Pemain";
  localChess = new Chess(); roomId = null;
  soloWhiteTime = START_TIME; soloBlackTime = START_TIME; soloTurnStarted = Date.now();
  gameData = { fen: localChess.fen(), turn: "w", status: "playing", whiteName: humanColor === "w" ? myName : "Computer", blackName: humanColor === "b" ? myName : "Computer", winner: "" };
  enterGame();
  $("roomTitle").textContent = "VS COMPUTER";
  $("roleText").textContent = `Anda: ${colorName(humanColor)}`;
  $("aiBadge")?.classList.remove("hidden"); $("chatCard")?.classList.add("hidden"); $("copyBtn")?.classList.add("hidden");
  $("roomInfo").textContent = "COMPUTER"; $("roomStatus").textContent = levelName(computerLevel);
  $("aiInfo").textContent = `Level ${levelName(computerLevel)} • 10 menit per pemain • ${humanColor === "w" ? "Anda jalan pertama" : "Computer jalan pertama"}`;
  announceGame("computer", `solo_${Date.now()}_${myUid || "guest"}`);
  renderSolo(); startSoloClock(); if (computerColor === "w") scheduleAI();
}

function soloRemaining() {
  let w = soloWhiteTime, b = soloBlackTime;
  if (!soloEnded) {
    const elapsed = Math.max(0, (Date.now() - soloTurnStarted) / 1000);
    if (gameData?.turn === "w") w = Math.max(0, w - elapsed);
    else if (gameData?.turn === "b") b = Math.max(0, b - elapsed);
  }
  return { w, b };
}
function startSoloClock() {
  clearInterval(clockTimer);
  clockTimer = setInterval(() => {
    if (!solo || soloEnded) return;
    const t = soloRemaining();
    $("whiteClock").textContent = formatTime(t.w); $("blackClock").textContent = formatTime(t.b);
    if (t.w <= 0 || t.b <= 0) finishSolo(`⏰ Waktu habis. ${colorName(t.w <= 0 ? "b" : "w")} menang.`, t.w <= 0 ? "b" : "w", "timeout");
  }, 200);
}
function renderSolo() {
  if (!gameData) return;
  const t = soloRemaining();
  $("whiteName").textContent = gameData.whiteName; $("blackName").textContent = gameData.blackName;
  $("whiteClock").textContent = formatTime(t.w); $("blackClock").textContent = formatTime(t.b);
  $("gameMsg").textContent = gameData.status === "playing" ? (gameData.turn === humanColor ? "🎯 Giliran Anda — pilih bidak dan kotak tujuan" : "⏳ Computer berpikir...") : statusText(gameData);
  renderBoard(gameData.fen, humanColor);
}
function clickSolo(sq) {
  if (soloEnded || soloInputLock || !gameData || gameData.status !== "playing" || gameData.turn !== humanColor) return;
  const p = localChess.get(sq);
  if (!selected) { if (p && p.color === humanColor) { selected = sq; renderSolo(); } return; }
  if (sq === selected) { selected = null; renderSolo(); return; }
  const from = selected; selected = null;
  const t = soloRemaining();
  if ((humanColor === "w" ? t.w : t.b) <= 0) return finishSolo(`⏰ Waktu habis. ${colorName(computerColor)} menang.`, computerColor, "timeout");
  const c = new Chess(gameData.fen);
  let move;
  try { move = c.move({ from, to: sq, promotion: "q" }); } catch { renderSolo(); return; }
  if (humanColor === "w") soloWhiteTime = t.w; else soloBlackTime = t.b;
  gameData.fen = c.fen(); gameData.turn = c.turn(); gameData.status = gameStatus(c); gameData.winner = gameData.status === "checkmate" ? humanColor : "";
  soloTurnStarted = Date.now(); renderSolo();
  if (gameData.status !== "playing") return finishFromChess(c, humanColor);
  soloInputLock = true; scheduleAI();
}
function gameStatus(c) { if (c.isCheckmate()) return "checkmate"; if (c.isStalemate() || c.isDraw()) return "draw"; return "playing"; }
function finishFromChess(c, winner) { if (c.isCheckmate()) finishSolo(`🏆 ${colorName(winner)} menang — Skakmat!`, winner, "checkmate"); else finishSolo("🤝 Permainan Remis.", "", "draw"); }
function finishSolo(message, winner = "", reason = "") {
  if (soloEnded) return;
  soloEnded = true; clearInterval(clockTimer); clearTimeout(computerTimer); computerTimer = null; aiBusy = false; soloInputLock = true;
  gameData.status = reason || (winner ? "checkmate" : "draw"); gameData.winner = winner;
  setGameMsg(message); renderBoard(gameData.fen, humanColor);
  const resultType = reason === "draw" ? "draw" : reason === "resign" ? "resign" : winner === humanColor ? "win" : "loss";
  window.chessAccount?.result?.(resultType);
}
function scheduleAI() {
  if (soloEnded || aiBusy || !solo) return;
  clearTimeout(computerTimer);
  const delay = { easy:120, normal:500, professional:1200, world:2200 }[computerLevel] || 500;
  computerTimer = setTimeout(computerMove, delay);
}
function computerMove() {
  computerTimer = null;
  if (soloEnded || !solo || !gameData || gameData.turn !== computerColor) return;
  aiBusy = true;
  const t = soloRemaining();
  if ((computerColor === "w" ? t.w : t.b) <= 0) { aiBusy = false; return finishSolo(`⏰ Waktu habis. ${colorName(humanColor)} menang.`, humanColor, "timeout"); }
  const c = new Chess(gameData.fen);
  const depth = { easy:1, normal:2, professional:3, world:3 }[computerLevel] || 2;
  const best = chooseMove(c, computerColor, depth);
  if (!best) { aiBusy = false; return finishFromChess(c, humanColor); }
  try { c.move(best); } catch (e) { aiBusy = false; console.error("AI move:", e); return renderSolo(); }
  if (computerColor === "w") soloWhiteTime = t.w; else soloBlackTime = t.b;
  gameData.fen = c.fen(); gameData.turn = c.turn(); gameData.status = gameStatus(c); gameData.winner = gameData.status === "checkmate" ? computerColor : "";
  soloTurnStarted = Date.now(); aiBusy = false; soloInputLock = false; renderSolo();
  if (gameData.status !== "playing") finishFromChess(c, computerColor);
}
function chooseMove(c, color, depth) {
  const moves = c.moves({ verbose: true }); if (!moves.length) return null;
  let best = moves[0], bestScore = color === "w" ? -Infinity : Infinity;
  for (const m of moves) { c.move(m); const score = minimax(c, depth - 1, -Infinity, Infinity, color !== "w"); c.undo(); if (color === "w" ? score > bestScore : score < bestScore) { bestScore = score; best = m; } }
  return best;
}
function minimax(c, depth, alpha, beta, maximizing) {
  if (depth <= 0 || c.isGameOver()) return evaluate(c);
  const moves = c.moves({ verbose: true }); if (!moves.length) return evaluate(c);
  if (maximizing) { let value = -Infinity; for (const m of moves) { c.move(m); value = Math.max(value, minimax(c, depth - 1, alpha, beta, false)); c.undo(); alpha = Math.max(alpha, value); if (beta <= alpha) break; } return value; }
  let value = Infinity; for (const m of moves) { c.move(m); value = Math.min(value, minimax(c, depth - 1, alpha, beta, true)); c.undo(); beta = Math.min(beta, value); if (beta <= alpha) break; } return value;
}
function evaluate(c) {
  if (c.isCheckmate()) return c.turn() === "w" ? -100000 : 100000;
  if (c.isDraw() || c.isStalemate()) return 0;
  const values = { p:100, n:320, b:330, r:500, q:900, k:20000 }; let score = 0;
  for (const row of c.board()) for (const p of row) if (p) score += (p.color === "w" ? 1 : -1) * values[p.type];
  return score;
}

function listenChat() {
  if (chatUnsub) chatUnsub();
  const list = $("chatList"); if (!list || !roomId) return;
  chatUnsub = onValue(ref(db, `rooms/${roomId}/chat`), snap => {
    list.innerHTML = ""; const messages = []; snap.forEach(child => messages.push(child.val()));
    messages.slice(-80).forEach(m => { const d = document.createElement("div"); d.className = "chat-msg"; d.textContent = `${m?.name || "Pemain"}: ${m?.text || ""}`; list.appendChild(d); });
    list.scrollTop = list.scrollHeight;
  });
}
async function sendChat() {
  const input = $("chatInput"), text = String(input?.value || "").trim().slice(0, 160);
  if (!roomId || !text || !gameData || gameData.status !== "playing") return;
  try { await push(ref(db, `rooms/${roomId}/chat`), { uid: myUid || "", name: myName || "Pemain", text, at: serverTimestamp() }); if (input) input.value = ""; }
  catch (e) { console.error("chat:", e); }
}
async function resign() {
  if (solo) { if (!soloEnded) finishSolo("🏳 Anda menyerah.", computerColor, "resign"); return; }
  if (!gameData || gameData.status !== "playing") return;
  try { await runTransaction(roomRef(), d => { if (!d || d.status !== "playing") return; return { ...d, status: "resigned", winner: myColor === "w" ? "b" : "w", lastTick: Date.now(), drawOffer: "" }; }); }
  catch (e) { console.error("resign:", e); }
}
async function draw() {
  if (solo) { if (confirm("Akhiri permainan dan nyatakan remis?")) finishSolo("🤝 Permainan Remis.", "", "draw"); return; }
  if (!gameData || gameData.status !== "playing") return;
  try {
    const offer = gameData.drawOffer || "";
    if (offer && offer !== myColor) { if (confirm("Lawan menawarkan remis. Terima?")) await update(roomRef(), { status:"draw", drawOffer:"", lastTick:Date.now() }); else await update(roomRef(), { drawOffer:"" }); return; }
    if (offer === myColor) { setGameMsg("🤝 Tawaran remis sudah dikirim. Tunggu jawaban lawan."); return; }
    await update(roomRef(), { drawOffer: myColor }); setGameMsg("🤝 Tawaran remis dikirim. Tunggu jawaban lawan.");
  } catch (e) { console.error("draw:", e); }
}
async function copyInvite() {
  if (!roomId) return;
  const url = `${location.origin}${location.pathname}?room=${encodeURIComponent(roomId)}`;
  try { await navigator.clipboard.writeText(url); setGameMsg(`🔗 Undangan disalin: ${roomId}`); }
  catch { try { const ta=document.createElement("textarea"); ta.value=url; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); setGameMsg(`🔗 Undangan disalin: ${roomId}`); } catch { setGameMsg(`Kode room: ${roomId}`); } }
}

function bind() {
  $("createBtn")?.addEventListener("click", createRoom);
  $("joinBtn")?.addEventListener("click", joinRoom);
  $("computerBtn")?.addEventListener("click", startSolo);
  $("copyBtn")?.addEventListener("click", copyInvite);
  $("resignBtn")?.addEventListener("click", resign);
  $("drawBtn")?.addEventListener("click", draw);
  $("newBtn")?.addEventListener("click", async () => {
    if (pageLeaving) return;
    const account = getAccount();
    const active = solo ? !soloEnded : !!(gameData && gameData.status === "playing");
    if (account && active) { try { await window.chessAccount?.award?.("exit"); } catch (e) { console.warn("exit score:", e); } }
    stopEverything(); pageLeaving = true; location.href = location.pathname;
  });
  $("chatForm")?.addEventListener("submit", e => { e.preventDefault(); sendChat(); });
  $("roomInput")?.addEventListener("input", e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); });
  const saved = localStorage.getItem("chessPlayerName"); if (saved && !$("playerName")?.value) $("playerName").value = saved;
  const invitedRoom = new URLSearchParams(location.search).get("room"); if (invitedRoom && $("roomInput")) $("roomInput").value = invitedRoom.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

if (validConfig()) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true }); else bind();
} else { console.error("Firebase config belum benar."); setLobbyMsg("Firebase belum dikonfigurasi dengan benar."); }

window.chessGame = { getState: () => ({ roomId, myColor, myUid, solo, gameData }), leave: () => { stopEverything(); location.href = location.pathname; } };
