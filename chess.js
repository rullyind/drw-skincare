import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const boardEl = $("board"), lobby = $("lobby"), game = $("game"), nameInput = $("playerName"), roomInput = $("roomInput");
const files = ["a","b","c","d","e","f","g","h"];
const PIECES = { p:"♟", n:"♞", b:"♝", r:"♜", q:"♛", k:"♚", P:"♙", N:"♘", B:"♗", R:"♖", Q:"♕", K:"♔" };
let roomId = null, myColor = null, myName = "", selected = null, gameData = null, localChess = new Chess();
let roomUnsubscribe = null, chatUnsubscribe = null, clockTimer = null;
let solo = false, computerColor = "b", humanColor = "w", computerLevel = "normal", aiBusy = false;
let soloWhiteTime = 600, soloBlackTime = 600, soloTurnStarted = 0, soloEnded = false;

function validConfig(){ return firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("TEMPEL"); }
function roomRef(){ return ref(db, `rooms/${roomId}`); }
function makeRoomCode(){ return Math.random().toString(36).substring(2,8).toUpperCase(); }
function formatTime(s){ s = Math.max(0, Math.ceil(s)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function enterGame(){ lobby.classList.add("hidden"); game.classList.remove("hidden"); selected = null; $("lobbyMsg").textContent = ""; }
function levelName(x){ return {easy:"Easy",normal:"Normal",professional:"Professional",world:"World Class"}[x] || x; }

onValue(ref(db,".info/connected"), s => {
    const e = $("connection"); if(!e) return;
    if(s.val() === true){ e.textContent = "● Online"; e.className = "status online"; }
    else { e.textContent = "● Menghubungkan..."; e.className = "status offline"; }
});

document.querySelectorAll('input[name="gameMode"]').forEach(r => r.addEventListener("change", () => {
    const computer = r.value === "computer";
    $("computerSettings").classList.toggle("hidden", !computer);
    $("onlineSettings").classList.toggle("hidden", computer);
    $("lobbyMsg").textContent = "";
}));

async function createRoom(){
    try{
        solo = false;
        myName = (nameInput.value.trim() || `Pemain ${Math.floor(Math.random()*9999)}`).slice(0,20);
        roomId = makeRoomCode(); myColor = "w";
        const c = new Chess();
        await set(roomRef(), { createdAt:serverTimestamp(), status:"waiting", fen:c.fen(), turn:"w", whiteName:myName, blackName:"", whiteTime:600, blackTime:600, lastTick:Date.now(), createdBy:myName, winner:"", lastMove:"", drawOffer:"" });
        roomInput.value = roomId; enterGame(); listenRoom(); listenChat();
        $("roomInfo").textContent = roomId; $("roomStatus").textContent = "Menunggu pemain...";
    }catch(e){ console.error(e); $("lobbyMsg").textContent = "Gagal membuat room: " + e.message; }
}

async function joinRoom(){
    try{
        solo = false;
        const code = roomInput.value.trim().toUpperCase();
        if(!code){ $("lobbyMsg").textContent = "Masukkan kode room."; return; }
        myName = (nameInput.value.trim() || `Pemain ${Math.floor(Math.random()*9999)}`).slice(0,20);
        roomId = code;
        const snap = await new Promise(resolve => onValue(roomRef(),resolve,{onlyOnce:true}));
        if(!snap.exists()){ $("lobbyMsg").textContent = "Room tidak ditemukan."; return; }
        const d = snap.val();
        if(d.blackName){ $("lobbyMsg").textContent = "Room sudah penuh."; return; }
        myColor = "b";
        await update(roomRef(), { blackName:myName, status:"playing", lastTick:Date.now() });
        enterGame(); listenRoom(); listenChat();
    }catch(e){ console.error(e); $("lobbyMsg").textContent = "Gagal bergabung: " + e.message; }
}

function listenRoom(){
    if(!roomId) return;
    if(roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = onValue(roomRef(), s => {
        if(!s.exists()){ gameData=null; $("gameMsg").textContent="Room sudah tidak tersedia."; return; }
        gameData=s.val(); renderOnline();
    });
}

function renderOnline(){
    if(!gameData) return;
    $("roomTitle").textContent = `ROOM ${roomId}`;
    $("roleText").textContent = `Anda: ${myColor==="w"?"Putih":"Hitam"}`;
    $("aiBadge").classList.add("hidden"); $("chatCard").classList.remove("hidden"); $("copyBtn").classList.remove("hidden");
    $("whiteName").textContent=gameData.whiteName||"Menunggu...";
    $("blackName").textContent=gameData.blackName||"Menunggu...";
    $("roomInfo").textContent=roomId; $("roomStatus").textContent=gameData.status||"Menunggu pemain...";
    let wt=Number(gameData.whiteTime ?? 600), bt=Number(gameData.blackTime ?? 600);
    if(gameData.status==="playing"){
        const elapsed=Math.max(0,(Date.now()-Number(gameData.lastTick||Date.now()))/1000);
        if(gameData.turn==="w") wt=Math.max(0,wt-elapsed); else bt=Math.max(0,bt-elapsed);
    }
    $("whiteClock").textContent=formatTime(wt); $("blackClock").textContent=formatTime(bt);
    const statusText={
        waiting:"Menunggu pemain kedua...", playing:gameData.turn===myColor?"🎯 Giliran Anda":"⏳ Giliran lawan",
        checkmate:`♚ Skakmat! ${gameData.winner==="w"?"Putih":"Hitam"} menang.`, stalemate:"Remis — Stalemate.", draw:"Remis.",
        resigned:`🏆 ${gameData.winner==="w"?"Putih":"Hitam"} menang.`, timeout:`⏰ Waktu habis. ${gameData.winner==="w"?"Putih":"Hitam"} menang.`
    };
    $("gameMsg").textContent=statusText[gameData.status]||"";
    renderBoard(gameData.fen,myColor); startOnlineClock();
}

function startOnlineClock(){
    clearInterval(clockTimer);
    clockTimer=setInterval(async()=>{
        if(solo||!gameData||gameData.status!=="playing") return;
        let wt=Number(gameData.whiteTime ?? 600),bt=Number(gameData.blackTime ?? 600);
        const e=Math.max(0,(Date.now()-Number(gameData.lastTick||Date.now()))/1000);
        if(gameData.turn==="w") wt=Math.max(0,wt-e); else bt=Math.max(0,bt-e);
        $("whiteClock").textContent=formatTime(wt); $("blackClock").textContent=formatTime(bt);
        if(wt<=0||bt<=0){
            await update(roomRef(),{status:"timeout",winner:wt<=0?"b":"w",whiteTime:wt,blackTime:bt,lastTick:Date.now()});
        }
    },500);
}

function renderBoard(fen,orientation="w"){
    try{ localChess=new Chess(fen); }catch{ localChess=new Chess(); }
    boardEl.innerHTML="";
    const b=localChess.board();
    const ranks=orientation==="w"?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
    const fs=orientation==="w"?files:[...files].reverse();
    for(const r of ranks) for(const f of fs){
        const sq=f+r, piece=b[8-r][files.indexOf(f)], el=document.createElement("div");
        el.className="sq "+(((files.indexOf(f)+r)%2===0)?"light":"dark"); el.dataset.square=sq;
        if(selected===sq) el.classList.add("selected");
        if(selected){
            try{
                const m=localChess.moves({square:selected,verbose:true}).find(x=>x.to===sq);
                if(m){ el.classList.add("legal"); if(piece) el.classList.add("capture"); }
            }catch{}
        }
        if(piece){
            const span=document.createElement("span");
            span.className=`piece ${piece.color==="w"?"piece-white":"piece-black"}`;
            span.textContent=PIECES[piece.color==="w"?piece.type.toUpperCase():piece.type];
            span.setAttribute("aria-label",`${piece.color==="w"?"Putih":"Hitam"} ${piece.type}`);
            el.appendChild(span);
        }
        el.onclick=()=>clickSquare(sq); boardEl.appendChild(el);
    }
}

async function clickSquare(sq){
    if(solo){ clickSolo(sq); return; }
    if(!gameData||gameData.status!=="playing"||gameData.turn!==myColor) return;
    const p=localChess.get(sq);
    if(!selected){ if(p&&p.color===myColor){ selected=sq; renderBoard(gameData.fen,myColor); } return; }
    if(sq===selected){ selected=null; renderBoard(gameData.fen,myColor); return; }
    let move;
    try{ move=localChess.move({from:selected,to:sq,promotion:"q"}); }
    catch{ if(p&&p.color===myColor) selected=sq; else selected=null; renderBoard(gameData.fen,myColor); return; }
    selected=null;
    const fen=localChess.fen(), now=Date.now();
    let status="playing", winner="";
    if(localChess.isCheckmate()){ status="checkmate"; winner=myColor; }
    else if(localChess.isStalemate()) status="stalemate";
    else if(localChess.isDraw()) status="draw";
    const moves=gameData.moves||{};
    const mr=push(ref(db,`rooms/${roomId}/moves`));
    moves[mr.key]={from:move.from,to:move.to,fen,by:myColor,at:now,san:move.san};
    const u={fen,turn:localChess.turn(),status,moves,lastMove:move.san,lastMoveAt:now,lastTick:now,drawOffer:""};
    if(winner) u.winner=winner;
    await update(roomRef(),u);
}

// ===================== VS COMPUTER =====================
function startSolo(){
    solo=true; soloEnded=false; aiBusy=false;
    humanColor=$("computerSide").value; computerColor=humanColor==="w"?"b":"w";
    computerLevel=$("computerLevel").value; myColor=humanColor;
    myName=(nameInput.value.trim()||"Pemain").slice(0,20);
    localChess=new Chess(); selected=null; roomId=null;
    soloWhiteTime=600; soloBlackTime=600; soloTurnStarted=Date.now();
    gameData={fen:localChess.fen(),turn:"w",status:"playing",whiteName:humanColor==="w"?myName:"Computer",blackName:humanColor==="b"?myName:"Computer",whiteTime:600,blackTime:600};
    enterGame();
    $("roomTitle").textContent="VS COMPUTER"; $("roleText").textContent=`Anda: ${humanColor==="w"?"Putih":"Hitam"}`;
    $("aiBadge").classList.remove("hidden"); $("chatCard").classList.add("hidden"); $("copyBtn").classList.add("hidden");
    $("roomInfo").textContent="COMPUTER"; $("roomStatus").textContent=levelName(computerLevel);
    $("aiInfo").textContent=`Level: ${levelName(computerLevel)} • ${humanColor==="w"?"Anda jalan pertama":"Computer jalan pertama"}`;
    renderSolo(); startSoloClock();
    if(computerColor==="w") setTimeout(computerMove,500);
}

function soloTimes(){
    if(!solo||soloEnded) return {w:soloWhiteTime,b:soloBlackTime};
    const elapsed=Math.max(0,(Date.now()-soloTurnStarted)/1000);
    return localChess.turn()==="w"?{w:Math.max(0,soloWhiteTime-elapsed),b:soloBlackTime}:{w:soloWhiteTime,b:Math.max(0,soloBlackTime-elapsed)};
}
function commitSoloClock(){
    const t=soloTimes(); soloWhiteTime=t.w; soloBlackTime=t.b; soloTurnStarted=Date.now(); return t;
}
function finishSolo(message){ soloEnded=true; aiBusy=false; clearInterval(clockTimer); selected=null; $("gameMsg").textContent=message; }

function renderSolo(){
    if(!solo)return;
    renderBoard(localChess.fen(),humanColor);
    const t=soloTimes(); $("whiteClock").textContent=formatTime(t.w); $("blackClock").textContent=formatTime(t.b);
    if(t.w<=0||t.b<=0){ finishSolo(`⏰ Waktu habis. ${t.w<=0?"Hitam":"Putih"} menang.`); return; }
    let msg;
    if(localChess.isCheckmate()) msg=`♚ Skakmat! ${localChess.turn()==="w"?"Hitam":"Putih"} menang.`;
    else if(localChess.isStalemate()) msg="🤝 Remis — Stalemate.";
    else if(localChess.isThreefoldRepetition()) msg="🤝 Remis — posisi tiga kali terulang.";
    else if(localChess.isDrawByFiftyMoves()) msg="🤝 Remis — aturan 50 langkah.";
    else if(localChess.isInsufficientMaterial()) msg="🤝 Remis — material tidak cukup.";
    else if(aiBusy) msg=`🤖 Computer (${levelName(computerLevel)}) sedang berpikir...`;
    else if(localChess.isCheck()) msg=localChess.turn()===humanColor?"⚠️ Anda sedang di-skak!":"⚠️ Computer sedang di-skak!";
    else msg=localChess.turn()===humanColor?"🎯 Giliran Anda":"⏳ Giliran Computer";
    $("gameMsg").textContent=msg;
}

function clickSolo(sq){
    if(!solo||soloEnded||aiBusy||localChess.isGameOver()||localChess.turn()!==humanColor)return;
    const p=localChess.get(sq);
    if(!selected){ if(p&&p.color===humanColor){selected=sq;renderSolo();} return; }
    if(sq===selected){selected=null;renderSolo();return;}
    let move;
    try{move=localChess.move({from:selected,to:sq,promotion:"q"});}
    catch{if(p&&p.color===humanColor)selected=sq;else selected=null;renderSolo();return;}
    selected=null; commitSoloClock(); renderSolo();
    if(localChess.isGameOver()){ finishSolo(localChess.isCheckmate()?`♚ Skakmat! ${humanColor==="w"?"Anda menang!":"Computer menang!"}`:"🤝 Remis."); return; }
    setTimeout(computerMove,220);
}

const VALUE={p:100,n:320,b:330,r:500,q:900,k:20000};
const LEVELS={
    easy:{depth:1,time:120,random:true},
    normal:{depth:2,time:450,random:false},
    professional:{depth:3,time:1400,random:false},
    world:{depth:4,time:3200,random:false}
};

function evaluate(c){
    let score=0; const b=c.board();
    for(let r=0;r<8;r++)for(let f=0;f<8;f++){
        const p=b[r][f]; if(!p)continue;
        let v=VALUE[p.type]||0;
        const center=(3.5-Math.abs(3.5-f))+(3.5-Math.abs(3.5-r));
        if(p.type==="n"||p.type==="b")v+=center*8;
        if(p.type==="q")v+=center*3;
        if(p.type==="p")v+=(p.color==="w"?(6-r):(r-1))*3;
        if(p.type==="k")v-=center*2;
        score+=p.color==="w"?v:-v;
    }
    if(c.isCheck()) score += c.turn()===computerColor ? -45 : 45;
    return computerColor==="w"?score:-score;
}
function orderedMoves(c){
    return c.moves({verbose:true}).sort((a,b)=>{
        const av=(a.captured?VALUE[a.captured]:0)+(a.promotion?VALUE[a.promotion]:0)+(a.san&&a.san.includes("+")?60:0);
        const bv=(b.captured?VALUE[b.captured]:0)+(b.promotion?VALUE[b.promotion]:0)+(b.san&&b.san.includes("+")?60:0);
        return bv-av;
    });
}
function search(c,depth,alpha,beta,maximizing,deadline){
    if(Date.now()>deadline)throw new Error("timeout");
    if(c.isCheckmate())return c.turn()===computerColor?-999999-depth:999999+depth;
    if(c.isDraw()||c.isStalemate()||depth<=0)return evaluate(c);
    let best=maximizing?-Infinity:Infinity;
    for(const m of orderedMoves(c)){
        c.move(m); const v=search(c,depth-1,alpha,beta,!maximizing,deadline); c.undo();
        if(maximizing){best=Math.max(best,v);alpha=Math.max(alpha,best);}else{best=Math.min(best,v);beta=Math.min(beta,best);}
        if(beta<=alpha)break;
    }
    return best;
}
function chooseAIMove(){
    const cfg=LEVELS[computerLevel]||LEVELS.normal, moves=orderedMoves(localChess); if(!moves.length)return null;
    if(cfg.random){
        const captures=moves.filter(m=>m.captured), checks=moves.filter(m=>m.san&&m.san.includes("+"));
        const pool=captures.length&&Math.random()<0.65?captures:(checks.length&&Math.random()<0.25?checks:moves);
        return pool[Math.floor(Math.random()*pool.length)];
    }
    let bestMove=moves[0], bestScore=-Infinity, maximizing=computerColor==="w";
    if(!maximizing)bestScore=Infinity;
    const deadline=Date.now()+cfg.time;
    for(let depth=1;depth<=cfg.depth;depth++){
        try{
            let bd=bestMove,bv=maximizing?-Infinity:Infinity;
            for(const m of orderedMoves(localChess)){
                localChess.move(m); const v=search(localChess,depth-1,-Infinity,Infinity,!maximizing,deadline); localChess.undo();
                if((maximizing&&v>bv)||(!maximizing&&v<bv)){bv=v;bd=m;}
            }
            bestMove=bd; bestScore=bv;
        }catch{break;}
    }
    return bestMove;
}
function computerMove(){
    if(!solo||soloEnded||aiBusy||localChess.isGameOver()||localChess.turn()!==computerColor)return;
    aiBusy=true; renderSolo();
    setTimeout(()=>{
        try{
            const m=chooseAIMove();
            if(m){localChess.move({from:m.from,to:m.to,promotion:m.promotion||"q"});commitSoloClock();}
            if(localChess.isGameOver()){
                finishSolo(localChess.isCheckmate()?`♚ Skakmat! ${computerColor===humanColor?"Anda menang!":"Computer menang!"}`:"🤝 Remis.");
                return;
            }
        }catch(e){console.error("AI:",e);}
        finally{if(!soloEnded)aiBusy=false;}
        renderSolo();
    },50);
}
function startSoloClock(){
    clearInterval(clockTimer);
    clockTimer=setInterval(()=>{if(!solo||soloEnded||localChess.isGameOver())return;renderSolo();},250);
}

// ===================== CHAT =====================
function listenChat(){
    if(!roomId)return; if(chatUnsubscribe)chatUnsubscribe();
    chatUnsubscribe=onValue(ref(db,`rooms/${roomId}/chat`),s=>{
        const list=$("chatList"); list.innerHTML="";
        s.forEach(ch=>{const d=ch.val(),el=document.createElement("div");el.className="bubble";el.innerHTML=`<b>${escapeHtml(d.name||"Pemain")}</b> ${escapeHtml(d.text||"")}`;list.appendChild(el);});
        list.scrollTop=list.scrollHeight;
    });
}
function escapeHtml(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
$("chatForm").addEventListener("submit",async e=>{
    e.preventDefault(); if(solo)return; const text=$("chatInput").value.trim(); if(!text||!roomId)return;
    await set(push(ref(db,`rooms/${roomId}/chat`)),{name:myName,text,at:serverTimestamp()}); $("chatInput").value="";
});

// ===================== BUTTONS =====================
$("createBtn").onclick=()=>validConfig()?createRoom():$("lobbyMsg").textContent="Firebase belum dikonfigurasi.";
$("joinBtn").onclick=()=>validConfig()?joinRoom():$("lobbyMsg").textContent="Firebase belum dikonfigurasi.";
$("computerBtn").onclick=startSolo;
$("copyBtn").onclick=async()=>{if(!roomId)return;const url=location.href.split("#")[0]+`#room=${roomId}`;try{await navigator.clipboard.writeText(url);$("copyBtn").textContent="✓ Link Tersalin";setTimeout(()=>$("copyBtn").textContent="🔗 Salin Undangan",1500);}catch{alert("Kode room: "+roomId);}};
$("resignBtn").onclick=async()=>{
    if(solo){if(!confirm("Yakin menyerah?"))return;finishSolo("🏳 Anda menyerah. Computer menang.");return;}
    if(!gameData||gameData.status!=="playing")return; if(!confirm("Yakin menyerah?"))return;
    await update(roomRef(),{status:"resigned",winner:myColor==="w"?"b":"w",lastTick:Date.now()});
};
$("drawBtn").onclick=async()=>{
    if(solo){if(confirm("Akhiri permainan dan nyatakan remis?"))finishSolo("🤝 Remis.");return;}
    if(!gameData||gameData.status!=="playing")return;
    const offer=gameData.drawOffer||"";
    if(offer&&offer!==myColor){if(confirm("Lawan menawarkan remis. Terima?"))await update(roomRef(),{status:"draw",drawOffer:"",lastTick:Date.now()});else await update(roomRef(),{drawOffer:""});return;}
    if(offer===myColor)return;
    await update(roomRef(),{drawOffer:myColor,lastTick:Date.now()});
    $("gameMsg").textContent="🤝 Tawaran remis dikirim. Tunggu jawaban lawan.";
};
$("newBtn").onclick=()=>{
    if(roomUnsubscribe)roomUnsubscribe(); if(chatUnsubscribe)chatUnsubscribe(); clearInterval(clockTimer);
    roomUnsubscribe=null;chatUnsubscribe=null;roomId=null;gameData=null;solo=false;soloEnded=true;aiBusy=false;
    location.href=location.pathname;
};

if(validConfig()){ $("connection").textContent="● Online"; $("connection").className="status online"; }
const hash=location.hash.match(/^#room=([A-Z0-9]+)$/i);
if(hash){roomInput.value=hash[1].toUpperCase();$("lobbyMsg").textContent="Masukkan nama lalu tekan Gabung.";}
