(function(){
"use strict";
/* D2T DOMINO Firebase Online + Local */
const $=id=>document.getElementById(id);
const points=[3,2,1,0];
const LEAGUE_KEY="d2t_domino_local_league_v2", NAME_KEY="d2t_domino_local_names_v2";

let mode="menu", currentUid=null, db=null, authUser=null, roomUnsub=null;
let roomId=null, roomData=null, localHand=[], localGame=null, league=[];

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function deck28(){let d=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)d.push([a,b]);return d}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function sumPips(h){return (h||[]).reduce((s,t)=>s+t[0]+t[1],0)}
function tileKey(t){return t.join("-")}
const PIP_POSITIONS={
  0:[],
  1:[4],
  2:[0,8],
  3:[0,4,8],
  4:[0,2,6,8],
  5:[0,2,4,6,8],
  6:[0,2,3,5,6,8]
};
function pipHTML(n){
  return `<div class="domino-half" aria-label="${n} titik">${
    PIP_POSITIONS[n].map(pos=>`<span class="pip p${pos}"></span>`).join("")
  }</div>`;
}
function tileHTML(t, cls="tile"){
  return `<div class="${cls}" data-a="${t[0]}" data-b="${t[1]}">
    ${pipHTML(t[0])}
    <i class="domino-divider"></i>
    ${pipHTML(t[1])}
  </div>`;
}
function setStatus(s){$("status").textContent=s}

function firebaseReady(){
  return !!(window.firebase && window.D2T_FIREBASE_CONFIG && !String(window.D2T_FIREBASE_CONFIG.apiKey||"").startsWith("GANTI_"));
}
async function initFirebase(){
  const status=$("firebaseStatus");
  if(!window.firebase){status.textContent="ðŸ”´ Firebase SDK tidak termuat.";return}
  if(!window.D2T_FIREBASE_CONFIG){status.textContent="ðŸ”´ Konfigurasi Firebase tidak ditemukan.";return}
  if(!firebaseReady()){status.textContent="ðŸ”´ API Key Firebase belum diisi.";return}
  try{
    // Pakai app DEFAULT yang sudah ada bila cocok; jangan membuat app kedua.
    let app;
    if(firebase.apps.length){
      app=firebase.app();
      const existingProject=app.options?.projectId||"";
      const wantedProject=window.D2T_FIREBASE_CONFIG.projectId||"";
      if(existingProject && wantedProject && existingProject!==wantedProject){
        throw new Error("Firebase project bentrok: halaman memakai "+existingProject+
          ", sedangkan Domino memakai "+wantedProject+
          ". Hapus semua initializeApp() Firebase lain dari domino1.html.");
      }
    }else{
      app=firebase.initializeApp(window.D2T_FIREBASE_CONFIG);
    }
    db=app.firestore();
    const auth=app.auth();
    status.textContent="â³ Masuk sebagai pemain tamuâ€¦";
    const cred=await auth.signInAnonymously();
    authUser=cred.user; currentUid=cred.user.uid;
    status.textContent="ðŸŸ¢ Login berhasil. ID pemain aktif.";
    $("createRoomBtn").disabled=false;
    $("joinRoomBtn").disabled=false;
    console.info("D2T Domino Firebase login OK:", currentUid);
  }catch(e){
    console.error("D2T Firebase login error:",e);
    let msg=e?.message||e?.code||String(e);
    if(e?.code==="auth/operation-not-allowed")
      msg="Anonymous Login belum diaktifkan di Firebase Authentication.";
    else if(e?.code==="auth/unauthorized-domain")
      msg="Domain ini belum diizinkan. Tambahkan 127.0.0.1 dan localhost di Authentication > Settings > Authorized domains.";
    else if(e?.code==="auth/network-request-failed")
      msg="Koneksi ke Firebase gagal. Periksa internet atau firewall.";
    status.textContent="ðŸ”´ Login gagal: "+msg;
  }
}

function loadNames(){
  try{const n=JSON.parse(localStorage.getItem(NAME_KEY)||"[]");$("name1").value=n[0]||"";$("name2").value=n[1]||"";$("name3").value=n[2]||""}catch{}
}
function saveNames(){localStorage.setItem(NAME_KEY,JSON.stringify([$("name1").value.trim(),$("name2").value.trim(),$("name3").value.trim()]))}
function loadLeague(){try{league=JSON.parse(localStorage.getItem(LEAGUE_KEY)||"[]")}catch{league=[]}renderLeague()}
function saveLeague(){localStorage.setItem(LEAGUE_KEY,JSON.stringify(league));renderLeague()}
function ensureLeague(name){if(name&&!league.some(x=>x.name===name))league.push({name,rounds:0,wins:0,points:0})}
function renderLeague(){
  const arr=[...league].sort((a,b)=>b.points-a.points||b.wins-a.wins||a.name.localeCompare(b.name));
  $("standings").innerHTML=arr.map((p,i)=>`<tr><td>${i+1}</td><td><b>${esc(p.name)}</b></td><td>${p.rounds}</td><td>${p.wins}</td><td><b>${p.points}</b></td></tr>`).join("");
}

$("localTab").onclick=()=>switchTab("local");
$("onlineTab").onclick=()=>switchTab("online");
function switchTab(t){
  $("localTab").classList.toggle("active",t==="local");$("onlineTab").classList.toggle("active",t==="online");
  $("localPanel").classList.toggle("hidden",t!=="local");$("onlinePanel").classList.toggle("hidden",t!=="online");
}
$("humanCount").onchange=()=>{
  const n=+$("humanCount").value;$("name2Wrap").classList.toggle("hidden",n<2);$("name3Wrap").classList.toggle("hidden",n<3);
};

// Tombol MULAI GAME lokal wajib dihubungkan ke fungsi game.
$("startLocalBtn").onclick=()=>startLocalGame();

function newRoomCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";
  for(let i=0;i<6;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;
}
function playerList(r){return (r.players||[]).sort((a,b)=>a.seat-b.seat)}
function roomRef(){return db.collection("rooms").doc(roomId)}

$("createRoomBtn").onclick=async()=>{
  if(!db||!currentUid)return alert("Firebase belum siap.");
  const name=$("onlineName").value.trim(); if(!name)return alert("Masukkan nama.");
  const code=newRoomCode(); roomId=code;
  const p={uid:currentUid,name,seat:0};
  try{
    await roomRef().set({
      code,hostUid:currentUid,players:[p],status:"lobby",round:0,
      board:[],left:null,right:null,turn:0,boneyard:[],finished:false,
      results:[],createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    mode="online";subscribeRoom();subscribeActions();showApp(name,code,true);
  }catch(e){alert("Gagal membuat room: "+e.message)}
};

$("joinRoomBtn").onclick=async()=>{
  if(!db||!currentUid)return alert("Firebase belum siap.");
  const name=$("onlineName").value.trim(), code=$("roomCodeInput").value.trim().toUpperCase();
  if(!name||code.length<4)return alert("Isi nama dan kode room.");
  roomId=code;
  try{
    const ref=roomRef(), snap=await ref.get();
    if(!snap.exists)return alert("Room tidak ditemukan.");
    const r=snap.data(), ps=playerList(r);
    if(r.status==="playing")return alert("Game sudah dimulai.");
    if(ps.some(p=>p.uid===currentUid)){mode="online";subscribeRoom();subscribeActions();showApp(name,code,ps.find(p=>p.uid===currentUid)?.uid===r.hostUid);return}
    if(ps.length>=4)return alert("Room sudah penuh (4 pemain).");
    const seat=Math.max(...ps.map(p=>p.seat),-1)+1;
    ps.push({uid:currentUid,name,seat});
    await ref.update({players:ps});
    mode="online";subscribeRoom();subscribeActions();showApp(name,code,false);
  }catch(e){alert("Gagal bergabung: "+e.message)}
};

function showApp(name,code,host){
  $("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");
  $("welcome").textContent=`${name} â€¢ Online`;$("roomCode").textContent=code;
  $("onlineState").textContent=host?"Host":"Online";
  $("waitingCard").classList.remove("hidden");
  $("startOnlineBtn").classList.toggle("hidden",!host);
  setStatus("Terhubung ke room.");
}

function subscribeRoom(){
  if(roomUnsub)roomUnsub();
  roomUnsub=roomRef().onSnapshot(s=>{
    if(!s.exists){alert("Room sudah dihapus.");location.reload();return}
    roomData={id:s.id,...s.data()};
    renderOnlineRoom();
  },e=>setStatus("Koneksi Firebase: "+e.message));
}

function renderOnlineRoom(){
  if(!roomData)return;
  const ps=playerList(roomData);
  $("roomPlayers").innerHTML=ps.map(p=>`<div class="slot"><b>${esc(p.name)} ${p.uid===currentUid?"ðŸ‘¤":""}</b><small>Kursi ${p.seat+1}${p.uid===roomData.hostUid?" â€¢ Host":""}</small></div>`).join("");
  $("waitingText").textContent=roomData.status==="lobby"
    ? `Kode ${roomData.code} â€¢ ${ps.length}/4 pemain.`
    : `Ronde ${roomData.round} sedang berjalan.`;
  $("startOnlineBtn").classList.toggle("hidden",!(roomData.hostUid===currentUid && roomData.status==="lobby" && ps.length>=2));
  $("waitingCard").classList.toggle("hidden",roomData.status==="playing"||roomData.status==="finished");
  if(roomData.status==="playing"||roomData.status==="finished"){
    $("roomCode").textContent=roomData.code;renderOnlineGame();
  }
}

async function startOnlineRound(){
  if(!roomData||roomData.hostUid!==currentUid)return;
  const ps=playerList(roomData);
  if(ps.length<2)return setStatus("Minimal 2 pemain diperlukan.");
  const d=shuffle(deck28()), hands={};
  ps.forEach(p=>hands[p.uid]=d.splice(0,7));
  const nextRound=(roomData.round||0)+1;
  const publicPlayers=ps.map(p=>({...p,handCount:7,pips:sumPips(hands[p.uid])}));
  try{
    // Tulis tangan terlebih dahulu, lalu ubah room menjadi playing.
    const batch=db.batch();
    ps.forEach(p=>batch.set(roomRef().collection("hands").doc(p.uid),{tiles:hands[p.uid],round:nextRound,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}));
    await batch.commit();
    await roomRef().update({
      status:"playing",round:nextRound,players:publicPlayers,
      board:[],left:null,right:null,turn:0,boneyard:d,finished:false,results:[],
      blocked:false,updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    setStatus("ðŸŽ® Ronde dimulai.");
  }catch(e){
    console.error("startOnlineRound",e);
    setStatus("âŒ Gagal mulai ronde: "+(e.message||e.code));
    alert("Gagal mulai ronde. Pastikan Firestore Rules sudah dipublish.\n\n"+(e.message||e.code));
  }
}
$("startOnlineBtn").onclick=startOnlineRound;

async function getMyHandOnline(){
  const s=await roomRef().collection("hands").doc(currentUid).get();
  localHand=s.exists?(s.data().tiles||[]):[];return localHand;
}
function canOnline(t){
  if(!roomData.board.length)return true;
  return t.includes(roomData.left)||t.includes(roomData.right);
}
function normalizeOnline(t,side){
  if(side==="left"&&t[1]!==roomData.left&&t[0]===roomData.left)return [t[1],t[0]];
  if(side==="right"&&t[0]!==roomData.right&&t[1]===roomData.right)return [t[1],t[0]];
  return t;
}
function placeOnline(board,t,side){
  if(!board.length)return {board:[t],left:t[0],right:t[1]};
  t=normalizeOnline(t,side);const b=board.slice();
  if(side==="left"){b.unshift(t);return {board:b,left:t[0],right:roomData.right}}
  b.push(t);return {board:b,left:roomData.left,right:t[1]};
}

async function sendOnlineAction(type,index,side){
  if(!roomData||roomData.status!=="playing")return;
  const ps=playerList(roomData), p=ps[roomData.turn];
  if(!p||p.uid!==currentUid)return alert("Bukan giliran kamu.");
  await roomRef().collection("actions").add({
    uid:currentUid,type,index:index??null,side:side||null,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  });
  // Host processes the action.
}

let actionUnsub=null;
function subscribeActions(){
  if(actionUnsub)actionUnsub();
  actionUnsub=roomRef().collection("actions").orderBy("createdAt").onSnapshot(s=>{
    s.docChanges().filter(c=>c.type==="added").forEach(async ch=>{
      const a=ch.doc.data();
      if(roomData?.hostUid===currentUid) await hostProcessAction(ch.doc.id,a);
    });
  });
}
async function hostProcessAction(actionId,a){
  if(!roomData||roomData.status!=="playing")return;
  const ps=playerList(roomData), p=ps[roomData.turn];
  if(!p||p.uid!==a.uid)return;
  const hs=await roomRef().collection("hands").doc(p.uid).get();let hand=hs.data()?.tiles||[];
  let board=roomData.board||[], left=roomData.left, right=roomData.right, boneyard=roomData.boneyard||[];
  let changed=false;

  if(a.type==="play"){
    const t=hand[a.index];
    if(!t||(!board.length?false:!(t.includes(left)||t.includes(right))))return;
    let side=a.side||(!board.length?"right":t.includes(right)?"right":"left");
    if(board.length&&side==="left"&&!t.includes(left))side="right";
    if(board.length&&side==="right"&&!t.includes(right))side="left";
    if(!board.length){board=[t];left=t[0];right=t[1]}
    else {t=normalizeOnline(t,side);if(side==="left"){board=[t,...board];left=t[0]}else{board=[...board,t];right=t[1]}}
    hand.splice(a.index,1);changed=true;
  }else if(a.type==="draw"){
    if(!boneyard.length)return;
    hand.push(boneyard[boneyard.length-1]);boneyard=boneyard.slice(0,-1);changed=true;
  }else if(a.type==="pass"){
    const hasPlayable=hand.some(t=>!board.length||t.includes(left)||t.includes(right));
    if(boneyard.length||hasPlayable)return;
    changed=true;
  }
  if(!changed)return;

  const updates={
    board,left,right,boneyard,players:ps.map(x=>x.uid===p.uid?{...x,handCount:hand.length,pips:sumPips(hand)}:x),
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  await roomRef().collection("hands").doc(p.uid).set({tiles:hand});
  if(!hand.length){updates.status="finished";updates.finished=true;updates.results=await calculateOnlineResults(ps,p.uid);await roomRef().update(updates);return}
  if(a.type==="draw"){await roomRef().update(updates);return}
  const next=(roomData.turn+1)%ps.length;
  updates.turn=next;
  const allBlocked=await isOnlineBlocked(ps,board,left,right,boneyard);
  if(allBlocked){updates.status="finished";updates.finished=true;updates.blocked=true;updates.results=await calculateOnlineResults(ps,null);await roomRef().update(updates);return}
  await roomRef().update(updates);
}
async function isOnlineBlocked(ps,board,left,right,boneyard){
  if(boneyard.length)return false;
  for(const p of ps){
    const s=await roomRef().collection("hands").doc(p.uid).get(),h=s.data()?.tiles||[];
    if(h.some(t=>!board.length||t.includes(left)||t.includes(right)))return false;
  }
  return true;
}
async function calculateOnlineResults(ps,emptyUid){
  const rows=[];
  for(const p of ps){
    const s=await roomRef().collection("hands").doc(p.uid).get(),h=s.data()?.tiles||[];
    rows.push({uid:p.uid,name:p.name,pips:sumPips(h),empty:p.uid===emptyUid});
  }
  rows.sort((a,b)=>{
    if(a.empty&&!b.empty)return -1;if(b.empty&&!a.empty)return 1;
    return a.pips-b.pips||a.seat-b.seat;
  });
  return rows.map((r,i)=>({...r,place:i+1,points:points[i]||1}));
}

async function renderOnlineGame(){
  const ps=playerList(roomData);
  $("roundNo").textContent=roomData.round||1;
  const turnP=ps[roomData.turn];$("turnName").textContent=turnP?.name||"â€”";
  $("players").innerHTML=ps.map((p,i)=>`<div class="player-box ${i===roomData.turn&&!roomData.finished?"active":""}">
    <b>${esc(p.name)} ${p.uid===currentUid?"ðŸ‘¤":""}</b><small>${p.handCount??"?"} kartu ${i===roomData.turn?"â€¢ giliran":""}</small>
  </div>`).join("");
  const board=$("board");board.innerHTML=roomData.board?.length?roomData.board.map(t=>tileHTML(t,"board-tile")).join(""):"<div class='empty'>Meja domino</div>";
  $("boneyardInfo").textContent=`Sisa tumpukan: ${(roomData.boneyard||[]).length}`;
  $("blockInfo").textContent=roomData.blocked?"â›” Meja tertutup â€¢ hitung angka terkecil":"";
  if(roomData.status==="finished"){
    $("waitingCard").classList.add("hidden");showResults(roomData.results||[],"online");return;
  }
  await getMyHandOnline();
  const me=ps.find(p=>p.uid===currentUid), isTurn=turnP?.uid===currentUid;
  $("handTitle").textContent=`Kartu ${me?.name||"Saya"}`;
  $("hand").innerHTML=localHand.map((t,i)=>{
    const e=document.createElement("div");e.innerHTML=tileHTML(t,"hand-tile");const el=e.firstElementChild;
    if(!isTurn||!canOnline(t))el.classList.add("disabled");
    el.onclick=()=>{if(isTurn&&canOnline(t)){const side=!roomData.board.length?"right":t.includes(roomData.right)?"right":"left";sendOnlineAction("play",i,side)}};
    return el.outerHTML;
  }).join("");
  $("drawBtn").disabled=!isTurn||!(roomData.boneyard||[]).length;
  $("passBtn").disabled=!isTurn;
  setStatus(isTurn?"ðŸŽ¯ Giliran kamu.":"Menunggu giliran "+(turnP?.name||"pemain")+"â€¦");
}

function showResults(res,type){
  if(!res.length)return;
  $("modalTitle").textContent=type==="online"?"Ronde Online Selesai":"Ronde Selesai";
  const blocked=type==="local" ? !!localGame?.blocked : res.every(r=>!r.empty);
  $("modalSub").textContent=blocked?"Meja tertutup: total angka batu paling kecil menjadi pemenang.":"Ada pemain yang menghabiskan semua batu.";
  $("results").innerHTML=res.map(r=>`<div class="result-row ${r.place===1?"winner":""}">
    <b>${r.place}</b><span>${esc(r.name)}<small>${r.pips} angka ${r.empty?"â€¢ HABIS BATU":""}</small></span><b>+${r.points}</b>
  </div>`).join("");
  $("nextBtn").classList.toggle("hidden",type==="online"&&roomData?.hostUid!==currentUid);
  $("modal").classList.remove("hidden");
}
$("nextBtn").onclick=async()=>{
  $("modal").classList.add("hidden");
  if(mode==="online"){
    if(roomData?.hostUid===currentUid)await startOnlineRound();
  }else startLocalGame();
};

$("drawBtn").onclick=()=>{
  if(mode==="online"){sendOnlineAction("draw");return}
  localAction({type:"draw"});
};
$("passBtn").onclick=()=>{
  if(mode==="online"){sendOnlineAction("pass");return}
  localAction({type:"pass"});
};

function startLocalGame(){
  const n=+$("humanCount").value,names=[$("name1").value.trim(),$("name2").value.trim(),$("name3").value.trim()];
  if(!names[0])return alert("Masukkan nama Pemain 1.");
  for(let i=0;i<n;i++)if(!names[i])return alert(`Masukkan nama Pemain ${i+1}.`);
  if(new Set(names.slice(0,n).map(x=>x.toLowerCase())).size!==n)return alert("Nama pemain harus berbeda.");
  saveNames();mode="local";
  const players=[];for(let i=0;i<n;i++)players.push({name:names[i],human:true,hand:[]});
  for(let i=n;i<4;i++)players.push({name:`Computer ${i-n+1}`,human:false,hand:[]});
  const d=shuffle(deck28());players.forEach(p=>p.hand=d.splice(0,7));
  localGame={players,humanCount:n,round:(localGame?.round||0)+1,boneyard:d,board:[],left:null,right:null,turn:0,finished:false,blocked:false};
  ensureLeague(names[0]);names.slice(0,n).forEach(ensureLeague);saveLeague();
  $("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");
  $("welcome").textContent=`${names[0]} â€¢ ${n} orang vs ${4-n} computer`;$("roomCode").textContent="LOCAL";$("onlineState").textContent="Lokal";
  $("waitingCard").classList.add("hidden");renderLocal();setStatus(`Giliran ${players[0].name}.`);
}
function localCan(t){return !localGame.board.length||t.includes(localGame.left)||t.includes(localGame.right)}
function localPlace(t,side){
  if(!localGame.board.length){localGame.board=[t];localGame.left=t[0];localGame.right=t[1];return}
  if(side==="left"){if(t[1]!==localGame.left&&t[0]===localGame.left)t=[t[1],t[0]];localGame.board.unshift(t);localGame.left=t[0]}
  else {if(t[0]!==localGame.right&&t[1]===localGame.right)t=[t[1],t[0]];localGame.board.push(t);localGame.right=t[1]}
}
function localAction(a){
  const g=localGame,p=g.players[g.turn];if(!p||g.finished||!p.human)return;
  if(a.type==="play"){const t=p.hand[a.index];if(!t||!localCan(t))return setStatus("Batu itu tidak bisa dipasang.");
    localPlace(t,!g.board.length?"right":t.includes(g.right)?"right":"left");p.hand.splice(a.index,1);
  }else if(a.type==="draw"){if(!g.boneyard.length)return setStatus("Tumpukan kosong.");p.hand.push(g.boneyard.pop());renderLocal();setStatus(`${p.name} mengambil 1 batu.`);return}
  else if(a.type==="pass"){if(g.boneyard.length||p.hand.some(localCan))return setStatus("Belum boleh lewat.");}
  if(!p.hand.length)return finishLocal(g.turn);

  // Jika tumpukan habis dan tidak ada satu pun pemain yang bisa memasang batu,
  // ronde berakhir karena meja tertutup/buntu.
  if(!g.boneyard.length){
    const allBlocked=g.players.every(pl=>!pl.hand.some(t=>localCan(t)));
    if(allBlocked)return finishLocal(null,true);
  }

  g.turn=(g.turn+1)%g.players.length;renderLocal();if(!g.players[g.turn].human)setTimeout(cpuTurn,90);
}
function cpuTurn(){
  const g=localGame;
  if(!g || g.finished) return;

  const p=g.players[g.turn];
  if(!p || p.human) return;

  setStatus(`${p.name} sedang berpikir...`);

  setTimeout(()=>{
    if(!localGame || localGame.finished) return;

    const gg=localGame;
    const pp=gg.players[gg.turn];
    if(!pp || pp.human) return;

    // Cari batu yang bisa dipasang.
    const cand=pp.hand
      .map((t,i)=>({t,i}))
      .filter(x=>localCan(x.t))
      .sort((a,b)=>(b.t[0]+b.t[1])-(a.t[0]+a.t[1]));

    if(cand.length){
      const pick=cand[0];

      // CPU memasang LANGSUNG. Jangan memakai localAction(),
      // karena localAction memang hanya menerima pemain manusia.
      const side=!gg.board.length
        ? "right"
        : pick.t.includes(gg.right)
          ? "right"
          : "left";

      localPlace(pick.t, side);
      pp.hand.splice(pick.i,1);

      setStatus(`${pp.name} memasang batu.`);
      if(!pp.hand.length){
        finishLocal(gg.turn);
        return;
      }
    } else if(gg.boneyard.length){
      // Ambil satu batu dan cek lagi hampir seketika.
      pp.hand.push(gg.boneyard.pop());
      renderLocal();

      setStatus(`${pp.name} mengambil 1 batu.`);
      setTimeout(cpuTurn,90);
      return;
    } else {
      // Tidak ada batu cocok dan tumpukan kosong: CPU WAJIB lewat.
      setStatus(`${pp.name} tidak punya batu yang cocok — lewat.`);
    }

    // Cek apakah semua pemain sudah buntu.
    if(!gg.boneyard.length){
      const allBlocked=gg.players.every(pl=>!pl.hand.some(t=>localCan(t)));
      if(allBlocked){
        finishLocal(null,true);
        return;
      }
    }

    // Pindah ke pemain berikutnya.
    gg.turn=(gg.turn+1)%gg.players.length;
    renderLocal();

    if(!gg.finished){
      if(gg.players[gg.turn].human){
        setStatus(`Giliran ${gg.players[gg.turn].name}.`);
      }else{
        setTimeout(cpuTurn,90);
      }
    }
  },90);
}
function finishLocal(winner=null,blocked=false){
  const g=localGame;g.finished=true;g.blocked=blocked;
  const res=g.players.map((p,i)=>({name:p.name,pips:sumPips(p.hand),empty:i===winner,uid:i}));
  res.sort((a,b)=>{if(a.empty&&!b.empty)return-1;if(b.empty&&!a.empty)return 1;return a.pips-b.pips});
  res.forEach((r,i)=>{r.place=i+1;r.points=points[i]||1;ensureLeague(r.name);const x=league.find(q=>q.name===r.name);x.rounds++;x.points+=r.points;if(i===0)x.wins++});
  saveLeague();showResults(res,"local");renderLocal();
}
function renderLocal(){
  const g=localGame;if(!g)return;
  $("roundNo").textContent=g.round;$("turnName").textContent=g.players[g.turn]?.name||"â€”";
  $("players").innerHTML=g.players.map((p,i)=>`<div class="player-box ${i===g.turn&&!g.finished?"active":""}"><b>${esc(p.name)} ${p.human?"ðŸ‘¤":"ðŸ¤–"}</b><small>${p.hand.length} kartu ${i===g.turn?"â€¢ giliran":""}</small></div>`).join("");
  $("board").innerHTML=g.board.length?g.board.map(t=>tileHTML(t,"board-tile")).join(""):"<div class='empty'>Meja domino</div>";
  $("boneyardInfo").textContent=`Sisa tumpukan: ${g.boneyard.length}`;
  $("blockInfo").textContent=g.blocked?"â›” Meja tertutup â€¢ hitung angka terkecil":"";
  const p=g.players[g.turn];
  if(p?.human){$("handTitle").textContent=`Kartu ${p.name}`;$("hand").innerHTML="";p.hand.forEach((t,i)=>{const e=document.createElement("div");e.innerHTML=tileHTML(t,"hand-tile");const el=e.firstElementChild;if(!localCan(t))el.classList.add("disabled");el.onclick=()=>localCan(t)&&localAction({type:"play",index:i});$("hand").appendChild(el)})}
  else {$("handTitle").textContent="Computer sedang berpikirâ€¦";$("hand").innerHTML="<span class='muted'>Tunggu giliran computer.</span>"}
  $("drawBtn").disabled=!p?.human||g.finished||!g.boneyard.length;$("passBtn").disabled=!p?.human||g.finished;
}
$("newGameBtn").onclick=()=>{if(roomUnsub)roomUnsub();if(actionUnsub)actionUnsub();location.reload()};
$("leagueBtn").onclick=()=>{document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$("leaguePage").classList.add("active");renderLeague()};
$("copyRoomBtn").onclick=async()=>{const c=$("roomCode").textContent;if(c!=="LOCAL"){try{await navigator.clipboard.writeText(c);setStatus("Kode room disalin: "+c)}catch{alert(c)}}};
$("resetLeague").onclick=()=>{if(confirm("Reset semua poin liga lokal?")){league=[];saveLeague()}};

function openGamePage(){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$("gamePage").classList.add("active")}
function updateNameInputs(){
  const n=+$("humanCount").value;
  $("name2Wrap").classList.toggle("hidden",n<2);
  $("name3Wrap").classList.toggle("hidden",n<3);
}

$("createRoomBtn").disabled=true;
$("joinRoomBtn").disabled=true;
loadNames();loadLeague();updateNameInputs();switchTab("local");openGamePage();
if(firebaseReady())initFirebase();else $("firebaseStatus").textContent="Isi firebase-config.js untuk mengaktifkan mode online.";

})();
