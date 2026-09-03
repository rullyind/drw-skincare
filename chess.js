import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, push, serverTimestamp, onDisconnect } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const $ = id => document.getElementById(id);
const boardEl=$("board"), lobby=$("lobby"), game=$("game");
const nameInput=$("playerName"), roomInput=$("roomInput");
let roomId=null, myColor=null, myName="", selected=null, gameData=null, localChess=new Chess();
let clockTimer=null, lastServerTick=Date.now();

const PIECES={p:"♟",n:"♞",b:"♝",r:"♜",q:"♛",k:"♚",P:"♙",N:"♘",B:"♗",R:"♖",Q:"♕",K:"♔"};
const files=["a","b","c","d","e","f","g","h"];

function validConfig(){
  return firebaseConfig && !String(firebaseConfig.apiKey).startsWith("TEMPEL");
}
function setConn(ok,msg){$("connection").textContent="● "+msg;$("connection").className="status "+(ok?"online":"offline");}
function makeRoomCode(){return Math.random().toString(36).slice(2,8).toUpperCase();}
function roomRef(){return ref(db,`rooms/${roomId}`);}

function renderBoard(){
  if(!gameData) return;
  try{localChess=new Chess(gameData.fen||new Chess().fen())}catch{localChess=new Chess()}
  boardEl.innerHTML="";
  const board=localChess.board();
  const orientation=myColor==="b" ? "b":"w";
  const ranks=orientation==="w"?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
  const fs=orientation==="w"?files:[...files].reverse();
  for(const r of ranks) for(const f of fs){
    const sq=`${f}${r}`, piece=board[8-r][files.indexOf(f)];
    const div=document.createElement("div");
    div.className="sq "+(((files.indexOf(f)+r)%2===0)?"light":"dark");
    div.dataset.square=sq;
    if(selected===sq) div.classList.add("selected");
    if(selected){
      try{
        const moves=localChess.moves({square:selected,verbose:true});
        const mv=moves.find(m=>m.to===sq);
        if(mv){div.classList.add("legal");if(piece)div.classList.add("capture")}
      }catch{}
    }
    if(piece){
      const span=document.createElement("span");span.className="piece";
      span.textContent=PIECES[piece.color==="w"?piece.type.toUpperCase():piece.type];
      div.appendChild(span);
    }
    div.onclick=()=>clickSquare(sq);
    boardEl.appendChild(div);
  }
}

async function clickSquare(sq){
  if(!gameData || gameData.status!=="playing" || gameData.turn!==myColor) return;
  const piece=localChess.get(sq);
  if(!selected){
    if(piece && piece.color===myColor) {selected=sq;renderBoard()}
    return;
  }
  if(sq===selected){selected=null;renderBoard();return}
  let move;
  try{
    move=localChess.move({from:selected,to:sq,promotion:"q"});
  }catch(e){
    if(piece && piece.color===myColor) selected=sq; else selected=null;
    renderBoard(); return;
  }
  selected=null;
  const nextTurn=localChess.turn();
  const fen=localChess.fen();
  const now=Date.now();
  const status=localChess.isCheckmate()?"checkmate":localChess.isStalemate()?"stalemate":localChess.isDraw()?"draw":"playing";
  const moves=gameData.moves||{};
  const mkey=push(ref(db,`rooms/${roomId}/moves`)).key;
  moves[mkey]={from:move.from,to:move.to,fen,by:myColor,at:now,san:move.san};
  await update(roomRef(),{fen,turn:nextTurn,status,moves,lastMove:move.san,lastMoveAt:now});
}

function startClock(){
  clearInterval(clockTimer);
  clockTimer=setInterval(()=>{
    if(!gameData || gameData.status!=="playing") return;
    const now=Date.now();
    const elapsed=Math.max(0,(now-(gameData.lastTick||now))/1000);
    let w=Number(gameData.whiteTime??600), b=Number(gameData.blackTime??600);
    if(gameData.turn==="w") w=Math.max(0,w-elapsed); else b=Math.max(0,b-elapsed);
    $("whiteClock").textContent=fmt(w);$("blackClock").textContent=fmt(b);
    if((gameData.turn==="w"&&w<=0)||(gameData.turn==="b"&&b<=0)){
      const winner=gameData.turn==="w"?"b":"w";
      update(roomRef(),{status:"timeout",winner,lastTick:Date.now()});
    }
  },500);
}
function fmt(s){s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}

function renderGame(){
  if(!gameData)return;
  $("whiteName").textContent=gameData.whiteName||"Menunggu...";
  $("blackName").textContent=gameData.blackName||"Menunggu...";
  $("roomTitle").textContent=`ROOM ${roomId}`;
  $("roleText").textContent=`Anda: ${myColor==="w"?"Putih":"Hitam"}`;
  const now=Date.now(), elapsed=gameData.status==="playing"?Math.max(0,(now-(gameData.lastTick||now))/1000):0;
  let wt=Number(gameData.whiteTime??600),bt=Number(gameData.blackTime??600);
  if(gameData.status==="playing"){if(gameData.turn==="w")wt-=elapsed;else bt-=elapsed}
  $("whiteClock").textContent=fmt(wt);$("blackClock").textContent=fmt(bt);
  const msgs={waiting:"Menunggu pemain kedua...",playing:gameData.turn===myColor?"Giliran Anda":"Giliran lawan",checkmate:"Skakmat! Permainan selesai.",stalemate:"Stalemate. Remis.",draw:"Remis.",resigned:`${gameData.winner==="w"?"Putih":"Hitam"} menang.`,timeout:`Waktu habis. ${gameData.winner==="w"?"Putih":"Hitam"} menang.`};
  $("gameMsg").textContent=msgs[gameData.status]||"";
  renderBoard();startClock();
}

async function createRoom(){
  myName=(nameInput.value.trim()||"Pemain "+Math.floor(Math.random()*9999)).slice(0,20);
  roomId=makeRoomCode();myColor="w";
  const data={createdAt:serverTimestamp(),status:"waiting",fen:new Chess().fen(),turn:"w",whiteName:myName,whiteTime:600,blackTime:600,lastTick:Date.now(),createdBy:myName};
  await set(roomRef(),data);enterGame();
}
async function joinRoom(){
  const code=roomInput.value.trim().toUpperCase();
  if(!code)return $("lobbyMsg").textContent="Masukkan kode room.";
  myName=(nameInput.value.trim()||"Pemain "+Math.floor(Math.random()*9999)).slice(0,20);
  roomId=code;
  onValue(roomRef(),snap=>{
    if(!snap.exists()) $("lobbyMsg").textContent="Room tidak ditemukan.";
    else if(!snap.val().blackName){myColor="b";update(roomRef(),{blackName:myName,status:"playing",lastTick:Date.now()}).then(enterGame)}
    else if(snap.val().blackName===myName) {myColor="b";enterGame()}
    else {$("lobbyMsg").textContent="Room sudah penuh."}
  },{onlyOnce:true});
}
function enterGame(){
  lobby.classList.add("hidden");game.classList.remove("hidden");
  onValue(roomRef(),snap=>{
    if(!snap.exists()){alert("Room sudah dihapus.");return location.reload()}
    gameData=snap.val();setConn(true,"Online");renderGame();
  },err=>{console.error(err);setConn(false,"Database error")});
  const disc=ref(db,`rooms/${roomId}/presence/${myColor}`);
  onDisconnect(disc).set({name:myName,online:false,at:serverTimestamp()});
  set(disc,{name:myName,online:true,at:serverTimestamp()});
  if(location.hash!==`#room=${roomId}`)history.replaceState(null,"",`${location.pathname}#room=${roomId}`);
}
$("createBtn").onclick=()=>validConfig()?createRoom():$("lobbyMsg").textContent="Isi firebase-config.js terlebih dahulu.";
$("joinBtn").onclick=()=>validConfig()?joinRoom():$("lobbyMsg").textContent="Isi firebase-config.js terlebih dahulu.";
$("copyBtn").onclick=async()=>{
  const url=location.href.split("#")[0]+`#room=${roomId}`;
  await navigator.clipboard.writeText(url);$("copyBtn").textContent="✓ Link Tersalin";setTimeout(()=>$("copyBtn").textContent="🔗 Salin Undangan",1500);
};
$("resignBtn").onclick=async()=>{
  if(!gameData||gameData.status!=="playing")return;
  if(!confirm("Yakin menyerah?"))return;
  await update(roomRef(),{status:"resigned",winner:myColor==="w"?"b":"w",lastTick:Date.now()});
};
$("drawBtn").onclick=()=>alert("Untuk versi produksi, tombol ini bisa dikembangkan menjadi tawaran/remis dua langkah.");
$("newBtn").onclick=()=>location.href=location.pathname;
$("chatForm").onsubmit=async e=>{
  e.preventDefault();const text=$("chatInput").value.trim();if(!text||!roomId)return;
  const m=push(ref(db,`rooms/${roomId}/chat`));await set(m,{name:myName,text,at:serverTimestamp()});$("chatInput").value="";
};
function listenChat(){
  if(!roomId)return;
  onValue(ref(db,`rooms/${roomId}/chat`),snap=>{
    const list=$("chatList");list.innerHTML="";
    snap.forEach(c=>{const d=c.val(),div=document.createElement("div");div.className="bubble";div.innerHTML=`<b>${escapeHtml(d.name||"Pemain")}</b>${escapeHtml(d.text||"")}`;list.appendChild(div)});
    list.scrollTop=list.scrollHeight;
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
setConn(validConfig(),validConfig()?"Online":"Config Firebase belum diisi");
const hash=location.hash.match(/^#room=([A-Z0-9]+)$/i);
if(hash){roomInput.value=hash[1].toUpperCase();setTimeout(()=>$("lobbyMsg").textContent="Masukkan nama lalu tekan Gabung.",100)}
const oldJoin=$("joinBtn").onclick;
$("joinBtn").onclick=async()=>{await oldJoin?.(); if(roomId)listenChat()};
$("createBtn").addEventListener("click",()=>{setTimeout(()=>{if(roomId)listenChat()},500)});
