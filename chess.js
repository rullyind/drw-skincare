import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, push, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const boardEl = $("board");
const lobby = $("lobby");
const game = $("game");
const nameInput = $("playerName");
const roomInput = $("roomInput");
const files = ["a","b","c","d","e","f","g","h"];
const PIECES = {p:"♟",n:"♞",b:"♝",r:"♜",q:"♛",k:"♚",P:"♙",N:"♘",B:"♗",R:"♖",Q:"♕",K:"♔"};

let roomId = null;
let myColor = null;
let myName = "";
let selected = null;
let gameData = null;
let localChess = new Chess();
let roomUnsubscribe = null;
let chatUnsubscribe = null;
let clockTimer = null;

let solo = false;
let computerColor = "b";
let humanColor = "w";
let computerLevel = "normal";
let aiBusy = false;
let soloInputLock = false;
let computerTimer = null;
let soloWhiteTime = 600;
let soloBlackTime = 600;
let soloTurnStarted = 0;
let soloEnded = false;

function validConfig(){
  return firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("TEMPEL");
}
function roomRef(){ return ref(db, `rooms/${roomId}`); }
function makeRoomCode(){ return Math.random().toString(36).substring(2,8).toUpperCase(); }
function formatTime(seconds){
  const s = Math.max(0, Math.ceil(Number(seconds) || 0));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
}
function colorName(c){ return c === "w" ? "Putih" : "Hitam"; }
function levelName(x){ return {easy:"Easy",normal:"Normal",professional:"Professional",world:"World Class"}[x] || x; }
function enterGame(){ lobby.classList.add("hidden"); game.classList.remove("hidden"); selected = null; $("lobbyMsg").textContent = ""; }

onValue(ref(db,".info/connected"), snap => {
  const el = $("connection");
  if(!el) return;
  if(snap.val() === true){ el.textContent = "● Online"; el.className = "status online"; }
  else { el.textContent = "● Menghubungkan..."; el.className = "status offline"; }
});

document.querySelectorAll('input[name="gameMode"]').forEach(r => r.addEventListener("change", () => {
  const computer = r.value === "computer";
  $("computerSettings").classList.toggle("hidden", !computer);
  $("onlineSettings").classList.toggle("hidden", computer);
  $("lobbyMsg").textContent = "";
}));

async function createRoom(){
  try{
    stopEverything();
    solo = false;
    myName = (nameInput.value.trim() || `Pemain ${Math.floor(Math.random()*9999)}`).slice(0,20);
    roomId = makeRoomCode();
    myColor = "w";
    const c = new Chess();
    await set(roomRef(), {
      createdAt: serverTimestamp(), status:"waiting", fen:c.fen(), turn:"w",
      whiteName:myName, blackName:"", whiteTime:600, blackTime:600,
      lastTick:Date.now(), createdBy:myName, winner:"", lastMove:"", drawOffer:"", moves:{}
    });
    roomInput.value = roomId;
    enterGame();
    listenRoom();
    listenChat();
    $("roomInfo").textContent = roomId;
    $("roomStatus").textContent = "Menunggu pemain...";
  }catch(e){ console.error(e); $("lobbyMsg").textContent = "Gagal membuat room: " + e.message; }
}

async function joinRoom(){
  try{
    stopEverything();
    solo = false;
    const code = roomInput.value.trim().toUpperCase();
    if(!code){ $("lobbyMsg").textContent = "Masukkan kode room."; return; }
    myName = (nameInput.value.trim() || `Pemain ${Math.floor(Math.random()*9999)}`).slice(0,20);
    roomId = code;
    const snap = await new Promise(resolve => onValue(roomRef(), resolve, {onlyOnce:true}));
    if(!snap.exists()){ $("lobbyMsg").textContent = "Room tidak ditemukan."; return; }
    const d = snap.val();
    if(d.blackName){ $("lobbyMsg").textContent = "Room sudah penuh."; return; }
    myColor = "b";
    await update(roomRef(), {blackName:myName, status:"playing", lastTick:Date.now()});
    enterGame();
    listenRoom();
    listenChat();
  }catch(e){ console.error(e); $("lobbyMsg").textContent = "Gagal bergabung: " + e.message; }
}

function listenRoom(){
  if(!roomId) return;
  if(roomUnsubscribe) roomUnsubscribe();
  roomUnsubscribe = onValue(roomRef(), snap => {
    if(!snap.exists()){
      gameData = null;
      $("gameMsg").textContent = "Room sudah tidak tersedia.";
      return;
    }
    gameData = snap.val();
    renderOnline();
  });
}

function onlineRemaining(d){
  let wt = Number(d.whiteTime ?? 600);
  let bt = Number(d.blackTime ?? 600);
  if(d.status === "playing"){
    const elapsed = Math.max(0, (Date.now() - Number(d.lastTick || Date.now())) / 1000);
    if(d.turn === "w") wt = Math.max(0, wt - elapsed);
    if(d.turn === "b") bt = Math.max(0, bt - elapsed);
  }
  return {w:wt,b:bt};
}

function renderOnline(){
  if(!gameData || solo) return;
  $("roomTitle").textContent = `ROOM ${roomId}`;
  $("roleText").textContent = `Anda: ${colorName(myColor)}`;
  $("aiBadge").classList.add("hidden");
  $("chatCard").classList.remove("hidden");
  $("copyBtn").classList.remove("hidden");
  $("whiteName").textContent = gameData.whiteName || "Menunggu...";
  $("blackName").textContent = gameData.blackName || "Menunggu...";
  $("roomInfo").textContent = roomId;
  $("roomStatus").textContent = gameData.status || "Menunggu pemain...";

  const t = onlineRemaining(gameData);
  $("whiteClock").textContent = formatTime(t.w);
  $("blackClock").textContent = formatTime(t.b);

  const messages = {
    waiting:"Menunggu pemain kedua...",
    playing:gameData.turn === myColor ? "🎯 Giliran Anda — hanya Anda yang boleh jalan" : "⏳ Giliran lawan",
    checkmate:`♚ Skakmat! ${colorName(gameData.winner)} menang.`,
    stalemate:"🤝 Remis — Stalemate.",
    draw:"🤝 Remis.",
    resigned:`🏆 ${colorName(gameData.winner)} menang.`,
    timeout:`⏰ Waktu habis. ${colorName(gameData.winner)} menang.`
  };
  let msg = messages[gameData.status] || "";
  if(gameData.status === "playing" && gameData.drawOffer && gameData.drawOffer !== myColor){
    msg = "🤝 Lawan menawarkan remis — tekan tombol Remis untuk menerima.";
  }
  $("gameMsg").textContent = msg;
  renderBoard(gameData.fen, myColor);
  startOnlineClock();
}

async function claimOnlineTimeout(){
  if(!roomId || !gameData || gameData.status !== "playing") return;
  try{
    await runTransaction(roomRef(), d => {
      if(!d || d.status !== "playing") return;
      const t = onlineRemaining(d);
      if(t.w > 0 && t.b > 0) return;
      return {...d, status:"timeout", winner:t.w <= 0 ? "b" : "w", whiteTime:t.w, blackTime:t.b, lastTick:Date.now()};
    });
  }catch(e){ console.error("clock:",e); }
}

function startOnlineClock(){
  clearInterval(clockTimer);
  clockTimer = setInterval(() => {
    if(solo || !gameData || gameData.status !== "playing") return;
    const t = onlineRemaining(gameData);
    $("whiteClock").textContent = formatTime(t.w);
    $("blackClock").textContent = formatTime(t.b);
    if(t.w <= 0 || t.b <= 0) claimOnlineTimeout();
  }, 200);
}

function renderBoard(fen, orientation="w"){
  try{ localChess = new Chess(fen); }catch{ localChess = new Chess(); }
  boardEl.innerHTML = "";
  const b = localChess.board();
  const ranks = orientation === "w" ? [8,7,6,5,4,3,2,1] : [1,2,3,4,5,6,7,8];
  const fs = orientation === "w" ? files : [...files].reverse();

  for(const r of ranks){
    for(const f of fs){
      const fi = files.indexOf(f);
      const sq = f + r;
      const piece = b[8-r][fi];
      const el = document.createElement("div");
      el.className = "sq " + (((fi+r)%2===0) ? "light" : "dark");
      el.dataset.square = sq;
      if(selected === sq) el.classList.add("selected");
      if(selected){
        try{
          const legal = localChess.moves({square:selected,verbose:true}).find(m => m.to === sq);
          if(legal){ el.classList.add("legal"); if(piece) el.classList.add("capture"); }
        }catch{}
      }
      if(piece){
        const span = document.createElement("span");
        span.className = `piece ${piece.color === "w" ? "piece-white" : "piece-black"}`;
        span.textContent = PIECES[piece.color === "w" ? piece.type.toUpperCase() : piece.type];
        span.setAttribute("aria-label", `${colorName(piece.color)} ${piece.type}`);
        el.appendChild(span);
      }
      el.onclick = () => clickSquare(sq);
      boardEl.appendChild(el);
    }
  }
}

async function clickSquare(sq){
  if(solo){ clickSolo(sq); return; }
  if(!gameData || gameData.status !== "playing" || gameData.turn !== myColor) return;

  const p = localChess.get(sq);
  if(!selected){
    if(p && p.color === myColor){ selected = sq; renderBoard(gameData.fen,myColor); }
    return;
  }
  if(sq === selected){ selected = null; renderBoard(gameData.fen,myColor); return; }

  const from = selected;
  selected = null;

  try{
    const result = await runTransaction(roomRef(), d => {
      if(!d || d.status !== "playing" || d.turn !== myColor) return;
      const t = onlineRemaining(d);
      if(t.w <= 0 || t.b <= 0){
        return {...d,status:"timeout",winner:t.w<=0?"b":"w",whiteTime:t.w,blackTime:t.b,lastTick:Date.now()};
      }

      const c = new Chess(d.fen);
      const piece = c.get(from);
      if(!piece || piece.color !== myColor) return;

      let move;
      try{ move = c.move({from,to:sq,promotion:"q"}); }catch{ return; }

      let status = "playing";
      let winner = "";
      if(c.isCheckmate()){ status="checkmate"; winner=myColor; }
      else if(c.isStalemate()) status="stalemate";
      else if(c.isThreefoldRepetition() || c.isInsufficientMaterial() || c.isDraw()) status="draw";

      const moves = d.moves || {};
      const id = `m_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      moves[id] = {from:move.from,to:move.to,fen:c.fen(),by:myColor,at:Date.now(),san:move.san};

      const next = {
        ...d,
        fen:c.fen(),
        turn:c.turn(),
        status,
        moves,
        lastMove:move.san,
        lastMoveAt:Date.now(),
        lastTick:Date.now(),
        drawOffer:"",
        whiteTime:t.w,
        blackTime:t.b
      };
      if(winner) next.winner = winner;
      return next;
    });

    if(!result.committed) renderOnline();
  }catch(e){ console.error("move:",e); renderOnline(); }
}

// ============================================================
// VS COMPUTER — ATURAN SAMA SEPERTI CATUR NORMAL
// 1. Hanya SATU bidak bergerak setiap giliran.
// 2. Setelah manusia jalan, giliran langsung pindah ke Computer.
// 3. Selama Computer berpikir, manusia TIDAK dapat menjalankan bidak.
// 4. Computer juga hanya boleh membuat SATU langkah legal.
// 5. Masing-masing pemain mempunyai 10 menit sendiri.
// 6. Jam pemain berhenti ketika giliran berpindah.
// ============================================================
function startSolo(){
  stopEverything();
  solo = true;
  soloEnded = false;
  aiBusy = false;
  soloInputLock = false;
  humanColor = $("computerSide").value === "b" ? "b" : "w";
  computerColor = humanColor === "w" ? "b" : "w";
  computerLevel = $("computerLevel").value || "normal";
  myColor = humanColor;
  myName = (nameInput.value.trim() || "Pemain").slice(0,20);
  localChess = new Chess();
  selected = null;
  roomId = null;
  soloWhiteTime = 600;
  soloBlackTime = 600;
  soloTurnStarted = Date.now();

  gameData = {
    fen:localChess.fen(), turn:"w", status:"playing",
    whiteName:humanColor === "w" ? myName : "Computer",
    blackName:humanColor === "b" ? myName : "Computer",
    whiteTime:600, blackTime:600
  };

  enterGame();
  $("roomTitle").textContent = "VS COMPUTER";
  $("roleText").textContent = `Anda: ${colorName(humanColor)}`;
  $("aiBadge").classList.remove("hidden");
  $("chatCard").classList.add("hidden");
  $("copyBtn").classList.add("hidden");
  $("roomInfo").textContent = "COMPUTER";
  $("roomStatus").textContent = levelName(computerLevel);
  $("aiInfo").textContent = `Level ${levelName(computerLevel)} • 10 menit per pemain • ${humanColor === "w" ? "Anda jalan pertama" : "Computer jalan pertama"}`;

  renderSolo();
  startSoloClock();

  if(computerColor === "w"){
    computerTimer = setTimeout(() => computerMove(), 350);
  }
}

function soloTimes(){
  if(!solo || soloEnded) return {w:soloWhiteTime,b:soloBlackTime};
  const elapsed = Math.max(0,(Date.now()-soloTurnStarted)/1000);
  if(localChess.turn() === "w") return {w:Math.max(0,soloWhiteTime-elapsed),b:soloBlackTime};
  return {w:soloWhiteTime,b:Math.max(0,soloBlackTime-elapsed)};
}

function commitSoloClock(color){
  const elapsed = Math.max(0,(Date.now()-soloTurnStarted)/1000);
  if(color === "w") soloWhiteTime = Math.max(0,soloWhiteTime-elapsed);
  else soloBlackTime = Math.max(0,soloBlackTime-elapsed);
  soloTurnStarted = Date.now();
}

function finishSolo(message){
  if(soloEnded) return;
  soloEnded = true;
  aiBusy = false;
  soloInputLock = true;
  if(computerTimer) clearTimeout(computerTimer);
  computerTimer = null;
  clearInterval(clockTimer);
  selected = null;
  $("gameMsg").textContent = message;
  renderBoard(localChess.fen(),humanColor);
}

function soloGameResult(){
  if(localChess.isCheckmate()){
    const winner = localChess.turn() === "w" ? "b" : "w";
    return `♚ Skakmat! ${winner === humanColor ? "Anda menang!" : "Computer menang!"}`;
  }
  if(localChess.isStalemate()) return "🤝 Remis — Stalemate.";
  if(localChess.isThreefoldRepetition()) return "🤝 Remis — posisi tiga kali terulang.";
  if(localChess.isInsufficientMaterial()) return "🤝 Remis — material tidak cukup.";
  if(localChess.isDraw()) return "🤝 Remis.";
  return "";
}

function renderSolo(){
  if(!solo) return;
  renderBoard(localChess.fen(),humanColor);
  const t = soloTimes();
  $("whiteClock").textContent = formatTime(t.w);
  $("blackClock").textContent = formatTime(t.b);

  if(t.w <= 0 || t.b <= 0){
    finishSolo(`⏰ Waktu ${t.w <= 0 ? "Putih" : "Hitam"} habis. ${t.w <= 0 ? "Hitam" : "Putih"} menang.`);
    return;
  }

  const result = soloGameResult();
  if(result){ $("gameMsg").textContent = result; return; }
  if(aiBusy){ $("gameMsg").textContent = `🤖 Computer (${levelName(computerLevel)}) sedang berpikir...`; return; }
  if(localChess.isCheck()){
    $("gameMsg").textContent = localChess.turn() === humanColor ? "⚠️ Anda sedang di-skak!" : "⚠️ Computer sedang di-skak!";
    return;
  }
  $("gameMsg").textContent = localChess.turn() === humanColor ? "🎯 Giliran Anda — pilih 1 bidak lalu 1 kotak tujuan" : "⏳ Giliran Computer";
}

function clickSolo(sq){
  // HARD LOCK: tidak ada input manusia saat bukan giliran manusia,
  // saat AI berpikir, atau saat satu langkah sedang diproses.
  if(!solo || soloEnded || aiBusy || soloInputLock || localChess.isGameOver()) return;
  if(localChess.turn() !== humanColor) return;

  const t = soloTimes();
  if(t[humanColor] <= 0){
    finishSolo(`⏰ Waktu Anda habis. ${colorName(computerColor)} menang.`);
    return;
  }

  const p = localChess.get(sq);
  if(!selected){
    if(p && p.color === humanColor){
      selected = sq;
      renderSolo();
    }
    return;
  }

  if(sq === selected){
    selected = null;
    renderSolo();
    return;
  }

  const from = selected;
  const targetPiece = localChess.get(sq);
  let move;

  try{
    move = localChess.move({from,to:sq,promotion:"q"});
  }catch{
    if(targetPiece && targetPiece.color === humanColor) selected = sq;
    else renderSolo();
    return;
  }

  // Begitu satu langkah legal dilakukan, kunci input manusia SEBELUM
  // giliran berpindah. Ini mencegah klik ganda / dua bidak sekaligus.
  selected = null;
  soloInputLock = true;
  commitSoloClock(humanColor);
  gameData.fen = localChess.fen();
  gameData.turn = localChess.turn();

  const result = soloGameResult();
  renderSolo();
  if(result){ finishSolo(result); return; }

  computerTimer = setTimeout(() => computerMove(), 180);
}

// ============================================================
// COMPUTER LEVELS
// Easy       : langkah legal + sederhana, sengaja tidak terlalu kuat
// Normal     : minimax depth 2
// Professional: minimax depth 3 + evaluasi posisi lebih dalam
// World Class: minimax depth 4 + evaluasi posisi + quiescence sederhana
// Semua level memakai ATURAN CATUR YANG SAMA.
// ============================================================
const VALUE = {p:100,n:320,b:330,r:500,q:900,k:20000};
const LEVELS = {
  easy:{depth:1,time:120,random:true},
  normal:{depth:2,time:550,random:false},
  professional:{depth:3,time:1800,random:false},
  world:{depth:4,time:4200,random:false}
};

function evaluate(c){
  let score = 0;
  const b = c.board();
  for(let r=0;r<8;r++){
    for(let f=0;f<8;f++){
      const p = b[r][f];
      if(!p) continue;
      let v = VALUE[p.type] || 0;
      const center = (3.5-Math.abs(3.5-f)) + (3.5-Math.abs(3.5-r));

      if(p.type === "n") v += center * 10;
      if(p.type === "b") v += center * 7;
      if(p.type === "q") v += center * 3;
      if(p.type === "r") v += center * 2;
      if(p.type === "p") v += (p.color === "w" ? 6-r : r-1) * 4;
      if(p.type === "k") v -= center * 3;

      score += p.color === "w" ? v : -v;
    }
  }

  if(c.isCheck()) score += c.turn() === "w" ? -45 : 45;
  return computerColor === "w" ? score : -score;
}

function orderedMoves(c){
  return c.moves({verbose:true}).sort((a,b) => {
    const score = m => (m.captured ? VALUE[m.captured] * 10 : 0) +
      (m.promotion ? VALUE[m.promotion] : 0) +
      (m.san && m.san.includes("+") ? 80 : 0);
    return score(b)-score(a);
  });
}

function search(c,depth,alpha,beta,deadline){
  if(Date.now() > deadline) throw new Error("search-timeout");

  if(c.isCheckmate()){
    return c.turn() === computerColor ? -999999-depth : 999999+depth;
  }
  if(c.isDraw() || c.isStalemate() || c.isThreefoldRepetition() || c.isInsufficientMaterial()) return 0;
  if(depth <= 0) return evaluate(c);

  const maximizing = c.turn() === computerColor;
  let best = maximizing ? -Infinity : Infinity;

  for(const m of orderedMoves(c)){
    c.move(m);
    const value = search(c,depth-1,alpha,beta,deadline);
    c.undo();

    if(maximizing){
      best = Math.max(best,value);
      alpha = Math.max(alpha,best);
    }else{
      best = Math.min(best,value);
      beta = Math.min(beta,best);
    }
    if(beta <= alpha) break;
  }
  return best;
}

function chooseAIMove(){
  const cfg = LEVELS[computerLevel] || LEVELS.normal;
  const moves = orderedMoves(localChess);
  if(!moves.length) return null;

  if(cfg.random){
    const captures = moves.filter(m => m.captured);
    const checks = moves.filter(m => m.san && m.san.includes("+"));
    if(captures.length && Math.random() < 0.60) return captures[Math.floor(Math.random()*captures.length)];
    if(checks.length && Math.random() < 0.25) return checks[Math.floor(Math.random()*checks.length)];
    return moves[Math.floor(Math.random()*moves.length)];
  }

  const maximizing = computerColor === localChess.turn();
  const deadline = Date.now() + cfg.time;
  let bestMove = moves[0];

  for(let depth=1; depth<=cfg.depth; depth++){
    try{
      let bestScore = maximizing ? -Infinity : Infinity;
      let depthBest = bestMove;
      for(const m of orderedMoves(localChess)){
        localChess.move(m);
        const score = search(localChess,depth-1,-Infinity,Infinity,deadline);
        localChess.undo();
        if((maximizing && score > bestScore) || (!maximizing && score < bestScore)){
          bestScore = score;
          depthBest = m;
        }
      }
      bestMove = depthBest;
    }catch{
      break;
    }
  }
  return bestMove;
}

function computerMove(){
  computerTimer = null;
  if(!solo || soloEnded || aiBusy || localChess.isGameOver()) return;
  if(localChess.turn() !== computerColor) return;

  const before = soloTimes();
  if(before[computerColor] <= 0){
    finishSolo(`⏰ Waktu Computer habis. ${colorName(humanColor)} menang.`);
    return;
  }

  aiBusy = true;
  soloInputLock = true;
  renderSolo();

  setTimeout(() => {
    try{
      if(!solo || soloEnded || localChess.turn() !== computerColor) return;

      const move = chooseAIMove();
      const afterThinking = soloTimes();

      // Waktu Computer tetap berjalan ketika AI berpikir.
      if(afterThinking[computerColor] <= 0){
        finishSolo(`⏰ Waktu Computer habis. ${colorName(humanColor)} menang.`);
        return;
      }

      if(!move){
        const result = soloGameResult();
        finishSolo(result || "🤝 Remis.");
        return;
      }

      // Tepat SATU langkah Computer.
      localChess.move({from:move.from,to:move.to,promotion:move.promotion || "q"});
      commitSoloClock(computerColor);
      gameData.fen = localChess.fen();
      gameData.turn = localChess.turn();

      const result = soloGameResult();
      if(result){
        finishSolo(result);
        return;
      }
    }catch(e){
      console.error("AI:",e);
    }finally{
      if(!soloEnded){
        aiBusy = false;
        soloInputLock = false;
        renderSolo();
      }
    }
  }, 40);
}

function startSoloClock(){
  clearInterval(clockTimer);
  clockTimer = setInterval(() => {
    if(!solo || soloEnded) return;
    const t = soloTimes();
    $("whiteClock").textContent = formatTime(t.w);
    $("blackClock").textContent = formatTime(t.b);
    if(t.w <= 0 || t.b <= 0){
      finishSolo(`⏰ Waktu ${t.w <= 0 ? "Putih" : "Hitam"} habis. ${t.w <= 0 ? "Hitam" : "Putih"} menang.`);
    }
  }, 200);
}

// ============================================================
// CHAT
// ============================================================
function listenChat(){
  if(!roomId || solo) return;
  if(chatUnsubscribe) chatUnsubscribe();
  chatUnsubscribe = onValue(ref(db,`rooms/${roomId}/chat`), snap => {
    const list = $("chatList");
    list.innerHTML = "";
    snap.forEach(ch => {
      const d = ch.val();
      const el = document.createElement("div");
      el.className = "bubble";
      el.innerHTML = `<b>${escapeHtml(d.name || "Pemain")}</b> ${escapeHtml(d.text || "")}`;
      list.appendChild(el);
    });
    list.scrollTop = list.scrollHeight;
  });
}
function escapeHtml(t){
  return String(t).replace(/[&<>"']/g,c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
$("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  if(solo) return;
  const text = $("chatInput").value.trim();
  if(!text || !roomId) return;
  try{ await set(push(ref(db,`rooms/${roomId}/chat`)),{name:myName,text,at:serverTimestamp()}); $("chatInput").value=""; }
  catch(e){ console.error("chat:",e); }
});

// ============================================================
// BUTTONS
// ============================================================
$("createBtn").onclick = () => validConfig() ? createRoom() : $("lobbyMsg").textContent = "Firebase belum dikonfigurasi.";
$("joinBtn").onclick = () => validConfig() ? joinRoom() : $("lobbyMsg").textContent = "Firebase belum dikonfigurasi.";
$("computerBtn").onclick = startSolo;

$("copyBtn").onclick = async () => {
  if(!roomId) return;
  const url = location.href.split("#")[0] + `#room=${roomId}`;
  try{
    await navigator.clipboard.writeText(url);
    $("copyBtn").textContent = "✓ Link Tersalin";
    setTimeout(() => $("copyBtn").textContent = "🔗 Salin Undangan",1500);
  }catch{ alert("Kode room: " + roomId); }
};

$("resignBtn").onclick = async () => {
  if(solo){
    if(!confirm("Yakin menyerah?")) return;
    finishSolo("🏳 Anda menyerah. Computer menang.");
    return;
  }
  if(!gameData || gameData.status !== "playing") return;
  if(!confirm("Yakin menyerah?")) return;
  await update(roomRef(),{status:"resigned",winner:myColor === "w" ? "b" : "w",lastTick:Date.now()});
};

$("drawBtn").onclick = async () => {
  if(solo){
    if(confirm("Akhiri permainan dan nyatakan remis?")) finishSolo("🤝 Remis.");
    return;
  }
  if(!gameData || gameData.status !== "playing") return;
  const offer = gameData.drawOffer || "";
  if(offer && offer !== myColor){
    if(confirm("Lawan menawarkan remis. Terima?")) await update(roomRef(),{status:"draw",drawOffer:"",lastTick:Date.now()});
    else await update(roomRef(),{drawOffer:""});
    return;
  }
  if(offer === myColor) return;
  await update(roomRef(),{drawOffer:myColor});
  $("gameMsg").textContent = "🤝 Tawaran remis dikirim. Tunggu jawaban lawan.";
};

function stopEverything(){
  if(roomUnsubscribe) roomUnsubscribe();
  if(chatUnsubscribe) chatUnsubscribe();
  clearInterval(clockTimer);
  if(computerTimer) clearTimeout(computerTimer);
  roomUnsubscribe = null;
  chatUnsubscribe = null;
  clockTimer = null;
  computerTimer = null;
  selected = null;
  aiBusy = false;
  soloInputLock = false;
}

$("newBtn").onclick = () => {
  stopEverything();
  roomId = null;
  gameData = null;
  solo = false;
  soloEnded = true;
  location.href = location.pathname;
};

if(validConfig()){
  $("connection").textContent = "● Online";
  $("connection").className = "status online";
}

const hash = location.hash.match(/^#room=([A-Z0-9]+)$/i);
if(hash){
  roomInput.value = hash[1].toUpperCase();
  $("lobbyMsg").textContent = "Masukkan nama lalu tekan Gabung.";
}
