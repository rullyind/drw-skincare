import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);

/* ==========================================================
   PREMIUM CHESS AUDIO
   Tidak membutuhkan file MP3. Semua suara dibuat langsung
   melalui Web Audio sehingga tidak ada asset yang hilang.
   ========================================================== */
let audioCtx = null;
let musicTimer = null;
let musicOn = false;
let musicGain = null;

function audioStart(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq,duration,type="sine",volume=.055,delay=0){
  const ctx=audioStart();
  const o=ctx.createOscillator();
  const g=ctx.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,ctx.currentTime+delay);
  g.gain.linearRampToValueAtTime(volume,ctx.currentTime+delay+.015);
  g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+duration);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+duration+.03);
}
function moveSound(){ tone(520,.09,"triangle",.065); tone(760,.12,"sine",.035,.035); }
function captureSound(){ tone(220,.12,"square",.045); tone(440,.18,"triangle",.055,.05); }
function checkSound(){ tone(880,.14,"sine",.065); tone(660,.18,"sine",.045,.08); }
function winSound(){ [523,659,784,1047].forEach((n,i)=>tone(n,.34,"sine",.065,i*.13)); }

function startRelaxMusic(){
  if(musicOn) return;
  const ctx=audioStart(); musicOn=true;
  musicGain=ctx.createGain(); musicGain.gain.value=.018; musicGain.connect(ctx.destination);
  const notes=[261.63,329.63,392,523.25,392,329.63,293.66,349.23];
  let i=0;
  const play=()=>{
    if(!musicOn) return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type="sine"; o.frequency.value=notes[i++%notes.length];
    g.gain.setValueAtTime(0,ctx.currentTime);
    g.gain.linearRampToValueAtTime(.42,ctx.currentTime+.8);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+3.8);
    o.connect(g);g.connect(musicGain);o.start();o.stop(ctx.currentTime+4);
    musicTimer=setTimeout(play,2800);
  };
  play();
}
function stopRelaxMusic(){ musicOn=false; if(musicTimer) clearTimeout(musicTimer); musicTimer=null; }
function toggleMusic(){
  if(musicOn){ stopRelaxMusic(); if($("musicBtn")) $("musicBtn").textContent="🎵 Musik Relaksasi"; }
  else { startRelaxMusic(); if($("musicBtn")) $("musicBtn").textContent="🔇 Matikan Musik"; }
}

function setupAudio(){
  ["pointerdown","keydown","touchstart"].forEach(ev=>document.addEventListener(ev,()=>{ if(audioCtx && audioCtx.state==="suspended") audioCtx.resume(); },{passive:true}));
  $("musicBtn")?.addEventListener("click",toggleMusic);
}

/* Detect every legal move from the board message/board mutation.
   We compare board FEN snapshots from chess.js through DOM state.
   This is intentionally lightweight and does not alter game rules. */
let lastBoardSignature="";
function boardSignature(){
  return [...document.querySelectorAll("#board .piece")].map(x=>x.textContent+"@"+x.parentElement.dataset.square).join("|");
}
function watchBoard(){
  const board=$("board"); if(!board) return;
  lastBoardSignature=boardSignature();
  new MutationObserver(()=>{
    const next=boardSignature();
    if(!next || next===lastBoardSignature) return;
    const old=lastBoardSignature; lastBoardSignature=next;
    const oldCount=(old.match(/@/g)||[]).length;
    const newCount=(next.match(/@/g)||[]).length;
    if(newCount<oldCount) captureSound(); else moveSound();
    setTimeout(()=>{
      const msg=$("gameMsg")?.textContent||"";
      if(msg.includes("skak")||msg.includes("Skak")) checkSound();
    },20);
  }).observe(board,{childList:true,subtree:true});
}

/* ==========================================================
   GLOBAL LEADERBOARD
   +50 menang
   -13 kalah
   Remis = 0
   VS Computer dan Online dipisahkan.
   Satu pertandingan hanya dihitung satu kali.
   ========================================================== */
function key(name){
  return encodeURIComponent(String(name||"Pemain").trim().toLowerCase()).replace(/%/g,"_").slice(0,80);
}
function cleanName(name){ return String(name||"Pemain").trim().slice(0,20) || "Pemain"; }
function rankingPath(mode){ return ref(db,`chessLeaderboard/${mode}`); }
function gamePath(mode,gameId){ return ref(db,`chessLeaderboardGames/${mode}/${key(gameId)}`); }

async function addScore(mode,name,delta,win,gameId,level=""){
  if(!name || !gameId) return;
  name=cleanName(name);
  try{
    const once=await runTransaction(gamePath(mode,gameId),v=>v || {done:true,at:Date.now()});
    if(!once.committed || !once.snapshot.val() || once.snapshot.val().done!==true) return;
    /* A second transaction guard: if another browser won the race,
       transaction returns existing done object and this game must not score twice. */
    const guardRef=ref(db,`chessLeaderboardClaims/${mode}/${key(gameId)}/${key(name)}`);
    const guard=await runTransaction(guardRef,v=>v || {claimed:true,at:Date.now()});
    if(!guard.committed) return;
    const playerRef=ref(db,`chessLeaderboard/${mode}/${key(name)}`);
    await runTransaction(playerRef,v=>{
      v=v||{name,points:0,wins:0,losses:0,draws:0,games:0};
      v.name=name; v.points=Number(v.points||0)+delta; v.games=Number(v.games||0)+1;
      if(win===true) v.wins=Number(v.wins||0)+1;
      else if(win===false) v.losses=Number(v.losses||0)+1;
      else v.draws=Number(v.draws||0)+1;
      if(level) v.lastLevel=level;
      v.updatedAt=Date.now(); return v;
    });
  }catch(e){ console.warn("Leaderboard write:",e); }
}

async function recordOnline(d){
  if(!d || !["checkmate","timeout","resigned","draw","stalemate"].includes(d.status)) return;
  const gameId=d.createdAt?`${d.createdAt}_${d.whiteName}_${d.blackName}`:`${location.pathname}_${d.whiteName}_${d.blackName}_${d.lastMoveAt}`;
  if(d.status==="draw"||d.status==="stalemate"){
    await addScore("online",d.whiteName,0,null,gameId+"_w");
    await addScore("online",d.blackName,0,null,gameId+"_b");
    return;
  }
  const winner=d.winner;
  if(!winner) return;
  const wn=winner==="w"?d.whiteName:d.blackName;
  const ln=winner==="w"?d.blackName:d.whiteName;
  await addScore("online",wn,50,true,gameId+"_winner");
  await addScore("online",ln,-13,false,gameId+"_loser");
}

let lastRoomStatus="";
function watchOnlineRooms(){
  onValue(ref(db,"rooms"),snap=>{
    snap.forEach(child=>recordOnline(child.val()));
  });
}

let soloRecorded=false;
function recordSoloFromScreen(){
  if(soloRecorded) return;
  const title=$("roomTitle")?.textContent||"";
  if(!title.includes("VS COMPUTER")) return;
  const msg=$("gameMsg")?.textContent||"";
  const name=cleanName($("playerName")?.value || localStorage.getItem("chessPlayerName") || "Pemain");
  const level=(($("computerLevel")?.value)||"normal");
  if(!msg) return;
  let result=null;
  if(/Anda menang/i.test(msg)){result="win";}
  else if(/Computer menang/i.test(msg)||/waktu.*Computer/i.test(msg)){result="loss";}
  else if(/remis/i.test(msg)){result="draw";}
  else if(/waktu.*habis/i.test(msg)){
    result=msg.includes("Anda")?"loss":"win";
  }
  if(!result) return;
  soloRecorded=true;
  const gameId=`solo_${Date.now()}_${name}_${level}`;
  if(result==="win") addScore("computer",name,50,true,gameId,level);
  else if(result==="loss") addScore("computer",name,-13,false,gameId,level);
  else addScore("computer",name,0,null,gameId,level);
  setTimeout(()=>winSound(),100);
}
function resetSoloRecord(){soloRecorded=false;}

function renderRanking(mode,container){
  onValue(rankingPath(mode),snap=>{
    const rows=[]; snap.forEach(c=>rows.push(c.val()));
    rows.sort((a,b)=>Number(b.points||0)-Number(a.points||0)||Number(b.wins||0)-Number(a.wins||0));
    container.innerHTML=rows.slice(0,20).map((r,i)=>`<div class="rank-row"><span class="rank-no">${i+1}</span><b>${escapeHtml(r.name||"Pemain")}</b><span class="rank-points">${Number(r.points||0)} P</span><small>W ${r.wins||0} • L ${r.losses||0}</small></div>`).join("") || `<div class="rank-empty">Belum ada pertandingan.</div>`;
  });
}
function escapeHtml(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function setupWinWatcher(){
  const gameEl=$("game"); if(!gameEl) return;
  new MutationObserver(()=>recordSoloFromScreen()).observe(gameEl,{childList:true,subtree:true,characterData:true});
}

function setup(){
  setupAudio(); watchBoard(); setupWinWatcher(); watchOnlineRooms();
  const cw=$("computerRanking"); const ow=$("onlineRanking");
  if(cw) renderRanking("computer",cw); if(ow) renderRanking("online",ow);
  $("newBtn")?.addEventListener("click",resetSoloRecord);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",setup); else setup();

window.chessAudio={move:moveSound,capture:captureSound,check:checkSound,win:winSound,startMusic:startRelaxMusic,stopMusic:stopRelaxMusic};
