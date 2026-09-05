import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getDatabase, ref, onValue, runTransaction, get } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const safe = s => String(s ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const key = s => encodeURIComponent(String(s || "").trim().toLowerCase()).replace(/%/g, "_").slice(0, 120);
const uidKey = s => String(s || "").replace(/[^a-zA-Z0-9_-]/g, "_");
const SCORE = { win:50, draw:25, loss:-13, resign:-70, exit:-100 };
const LABEL = { win:"Menang", draw:"Remis", loss:"Kalah", resign:"Menyerah", exit:"Keluar Game" };
let user = null;
let gameId = null;
let gameMode = null;
let scored = false;
let rankingUnsubs = [];
let gameRoomUnsub = null;
let bound = false;

function playerRef() { return ref(db, `chessPlayers/${uidKey(user.uid)}`); }
function accountMessage(e) {
  const c = e?.code || "";
  if (c.includes("email-already-in-use")) return "Email sudah terdaftar. Silakan Login.";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "Email atau password salah.";
  if (c.includes("invalid-email")) return "Format email tidak valid.";
  if (c.includes("weak-password")) return "Password terlalu lemah. Gunakan minimal 6 karakter.";
  if (c.includes("operation-not-allowed")) return "Login Email/Password belum diaktifkan di Firebase Authentication.";
  if (c.includes("network-request-failed")) return "Koneksi internet bermasalah. Coba lagi.";
  if (c.includes("too-many-requests")) return "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.";
  return e?.message || "Terjadi kesalahan.";
}
function setMsg(text) { const e = $("accountMsg"); if (e) e.textContent = text || ""; }
function openAccount() { $("accountModal")?.classList.remove("hidden"); if (user && $("accountName")) $("accountName").value = user.displayName || ""; }
function closeAccount() { $("accountModal")?.classList.add("hidden"); }

async function ensurePlayer() {
  if (!user) return;
  await runTransaction(playerRef(), value => {
    const v = value || {};
    return {
      uid:user.uid, name:user.displayName || v.name || "Pemain", email:user.email || v.email || "",
      points:Number(v.points || 0), computerPoints:Number(v.computerPoints || 0), onlinePoints:Number(v.onlinePoints || 0),
      wins:Number(v.wins || 0), draws:Number(v.draws || 0), losses:Number(v.losses || 0), resigns:Number(v.resigns || 0), exits:Number(v.exits || 0),
      games:Number(v.games || 0), computerGames:Number(v.computerGames || 0), onlineGames:Number(v.onlineGames || 0),
      createdAt:v.createdAt || Date.now(), updatedAt:Date.now()
    };
  });
}

async function register() {
  const name = String($("accountName")?.value || "").trim().replace(/[<>]/g, "").slice(0,20);
  const email = String($("accountEmail")?.value || "").trim().toLowerCase();
  const password = String($("accountPassword")?.value || "");
  if (name.length < 2) return setMsg("Nama minimal 2 karakter.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMsg("Masukkan email yang benar.");
  if (password.length < 6) return setMsg("Password minimal 6 karakter.");
  setMsg("Membuat akun...");
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName:name });
    user = credential.user;
    await ensurePlayer();
    localStorage.setItem("chessPlayerName", name);
    await renderAccount();
    setMsg("Akun berhasil dibuat. Selamat bermain!");
    setTimeout(closeAccount, 500);
  } catch (e) { console.error(e); setMsg(accountMessage(e)); }
}

async function login() {
  const email = String($("accountEmail")?.value || "").trim().toLowerCase();
  const password = String($("accountPassword")?.value || "");
  if (!email || !password) return setMsg("Masukkan email dan password.");
  setMsg("Memeriksa akun...");
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    user = credential.user;
    await ensurePlayer();
    localStorage.setItem("chessPlayerName", user.displayName || "");
    await renderAccount();
    setMsg("Login berhasil.");
    setTimeout(closeAccount, 350);
  } catch (e) { console.error(e); setMsg(accountMessage(e)); }
}

async function refresh() {
  if (!user) return;
  try {
    const snap = await get(playerRef());
    const v = snap.val() || {};
    if ($("myPoints")) $("myPoints").textContent = `${Number(v.points || 0)} P`;
    if ($("myWins")) $("myWins").textContent = Number(v.wins || 0);
  } catch (e) { console.warn("Gagal membaca profil:", e); }
}

async function renderAccount() {
  const loginBtn=$("accountLoginBtn"), logoutBtn=$("accountLogoutBtn");
  if (!loginBtn) return;
  if (user) {
    const name = user.displayName || "Pemain";
    if ($("accountUserName")) $("accountUserName").textContent=name;
    if ($("accountStatus")) $("accountStatus").textContent=`👤 ${name}`;
    loginBtn.classList.add("hidden"); logoutBtn?.classList.remove("hidden");
    if ($("playerName")) $("playerName").value=name;
    await refresh();
  } else {
    if ($("accountUserName")) $("accountUserName").textContent="Belum login";
    if ($("accountStatus")) $("accountStatus").textContent="👤 Belum Login";
    loginBtn.classList.remove("hidden"); logoutBtn?.classList.add("hidden");
    if ($("myPoints")) $("myPoints").textContent="0 P";
    if ($("myWins")) $("myWins").textContent="0";
    if ($("myWins")) $("myWins").textContent="0";
  }
}

function setGame(id, mode) {
  const nextId = id || null;
  const nextMode = mode || null;
  if (gameId !== nextId || gameMode !== nextMode) {
    if (gameRoomUnsub) gameRoomUnsub();
    gameRoomUnsub = null;
    gameId = nextId;
    gameMode = nextMode;
    scored = false;
  }
  if (user && gameMode === "online" && gameId && !gameRoomUnsub) watchOnlineResult(gameId);
}

function watchOnlineResult(id) {
  if (gameRoomUnsub) gameRoomUnsub();
  gameRoomUnsub = onValue(ref(db, `rooms/${id}`), snap => {
    if (!snap.exists() || !user || gameId !== id || gameMode !== "online") return;
    const d = snap.val() || {};
    let type = null;

    // ONLINE: chess.js menyimpan winner sebagai warna ("w" / "b"),
    // bukan UID. Konversikan warna pemenang ke UID room sebelum menentukan hasil akun.
    if (d.status === "draw" || d.status === "stalemate") {
      type = "draw";
    } else if (["checkmate", "timeout", "resigned"].includes(d.status) && d.winner) {
      const winnerUid = d.winner === "w" ? String(d.whiteUid || "") : d.winner === "b" ? String(d.blackUid || "") : String(d.winner || "");
      if (winnerUid) type = String(user.uid) === winnerUid ? "win" : "loss";
    }

    if (type) award(type, "online", id);
  }, error => console.warn("Pemantau hasil online:", error));
}

async function award(type, mode=gameMode, id=gameId) {
  if (!user || !id || !mode || scored || SCORE[type] === undefined) return false;
  if (mode !== "online" && mode !== "computer") return false;

  const claim = ref(db, `chessAccountClaims/${uidKey(user.uid)}/${key(`${mode}_${id}`)}`);
  try {
    let createdClaim = false;
    const tx = await runTransaction(claim, v => {
      if (v) return v;
      createdClaim = true;
      return {type, mode, points:SCORE[type], at:Date.now()};
    });
    if (!tx.committed || !createdClaim) return false;

    await runTransaction(playerRef(), v => {
      v=v||{};
      v.uid=user.uid; v.name=user.displayName||v.name||"Pemain"; v.email=user.email||v.email||"";
      v.points=Number(v.points||0)+SCORE[type];
      v[`${mode}Points`]=Number(v[`${mode}Points`]||0)+SCORE[type];
      v.games=Number(v.games||0)+1;
      v[`${mode}Games`]=Number(v[`${mode}Games`]||0)+1;
      if(type==="win")v.wins=Number(v.wins||0)+1;
      if(type==="draw")v.draws=Number(v.draws||0)+1;
      if(type==="loss")v.losses=Number(v.losses||0)+1;
      if(type==="resign")v.resigns=Number(v.resigns||0)+1;
      if(type==="exit")v.exits=Number(v.exits||0)+1;
      v.updatedAt=Date.now();
      return v;
    });

    scored=true;
    await refresh();
    showScore(type,SCORE[type]);
    return true;
  } catch(e) {
    console.error("Gagal menyimpan Point:",e);
    return false;
  }
}

function result(type) { return award(type); }

function showScore(type, points) {
  const panel=$("winPanel"); if(!panel)return;
  if($("winTitle")) $("winTitle").textContent = type==="win"?"🏆 Selamat Anda Menang!":type==="draw"?"🤝 Permainan Remis":type==="resign"?"🏳 Anda Menyerah":type==="exit"?"🚪 Anda Keluar Game":"Permainan Selesai";
  if($("winText")) $("winText").textContent=`${LABEL[type]} • ${points>0?"+":""}${points} Point`;
  panel.classList.remove("hidden");
  if(type==="win")window.chessAudio?.win?.();
}

function rankingSort(rows, mode) {
  return [...rows].sort((a,b)=>
    Number(b[`${mode}Points`]||0)-Number(a[`${mode}Points`]||0) ||
    Number(b.wins||0)-Number(a.wins||0) ||
    Number(b[`${mode}Games`]||0)-Number(a[`${mode}Games`]||0) ||
    String(a.name||"").localeCompare(String(b.name||""))
  );
}

function renderModeRanking(target, rows, mode) {
  if (!target) return;
  const label = mode === "online" ? "Room Online" : "VS Computer";
  const list = rankingSort(rows, mode);
  target.innerHTML = list.slice(0,20).map((v,i)=>
    `<div class="rank-row ${user&&v.uid===user.uid?"me":""}">
      <span class="rank-no">${i<3?["🥇","🥈","🥉"][i]:i+1}</span>
      <span class="rank-player"><b>${safe(v.name||"Pemain")}</b><small>${label} • ${Number(v[`${mode}Games`]||0)} pertandingan • W ${Number(v.wins||0)} • L ${Number(v.losses||0)} • R ${Number(v.draws||0)}</small></span>
      <strong class="rank-points">${Number(v[`${mode}Points`]||0)} P</strong>
    </div>`
  ).join("") || `<div class="rank-empty">Belum ada pemain.</div>`;
}

function renderAllPlayerStandings(rows) {
  const target = $("allPlayerStandings");
  if (!target) return;
  const list = [...rows].sort((a,b)=>
    Number(b.points||0)-Number(a.points||0) ||
    Number(b.wins||0)-Number(a.wins||0) ||
    Number(b.games||0)-Number(a.games||0) ||
    String(a.name||"").localeCompare(String(b.name||""))
  );
  if (!list.length) {
    target.innerHTML = `<div class="standings-empty">Belum ada pemain.</div>`;
    return;
  }
  target.innerHTML = `<table class="standings-table"><thead><tr><th>Rank</th><th>Player</th><th>Total Point</th><th>Pertandingan</th><th>Menang</th><th>Remis</th><th>Kalah</th></tr></thead><tbody>${list.map((v,i)=>
    `<tr class="${user&&v.uid===user.uid?"me":""}"><td class="standings-rank">${i<3?["🥇","🥈","🥉"][i]:i+1}</td><td class="standings-name">${safe(v.name||"Pemain")}</td><td class="standings-points">${Number(v.points||0)} P</td><td>${Number(v.games||0)}</td><td>${Number(v.wins||0)}</td><td>${Number(v.draws||0)}</td><td>${Number(v.losses||0)}</td></tr>`
  ).join("")}</tbody></table>`;
}

function rankings() {
  rankingUnsubs.forEach(fn=>fn?.());
  rankingUnsubs=[];
  const unsub=onValue(ref(db,"chessPlayers"),snap=>{
    const rows=[];
    snap.forEach(c=>{const v=c.val();if(v)rows.push(v);});

    renderModeRanking($("onlineRanking"), rows, "online");
    renderModeRanking($("computerRanking"), rows, "computer");
    renderAllPlayerStandings(rows);

    const onlineTitle=$("onlineRanking")?.closest(".ranking-card")?.querySelector("h2");
    const onlineNote=$("onlineRanking")?.closest(".ranking-card")?.querySelector(".rank-note");
    if(onlineTitle) onlineTitle.textContent="🌎 Klasemen Top Global — Room Online";
    if(onlineNote) onlineNote.textContent="20 pemain teratas berdasarkan Point Room Online";

    const computerTitle=$("computerRanking")?.closest(".ranking-card")?.querySelector("h2");
    const computerNote=$("computerRanking")?.closest(".ranking-card")?.querySelector(".rank-note");
    if(computerTitle) computerTitle.textContent="🤖 Klasemen Poin — VS Computer";
    if(computerNote) computerNote.textContent="20 pemain teratas berdasarkan Point VS Computer";
  });
  rankingUnsubs.push(unsub);
}

function bind() {
  if(bound)return;
  bound=true;
  $("accountLoginBtn")?.addEventListener("click",openAccount);
  $("accountCloseBtn")?.addEventListener("click",closeAccount);
  $("registerBtn")?.addEventListener("click",register);
  $("loginBtn")?.addEventListener("click",login);
  $("accountLogoutBtn")?.addEventListener("click",async()=>{try{await signOut(auth);}catch(e){console.error(e);}});
  $("winClose")?.addEventListener("click",()=>$("winPanel")?.classList.add("hidden"));
  $("playerName")?.addEventListener("input",e=>localStorage.setItem("chessPlayerName",e.target.value));
  onAuthStateChanged(auth,async u=>{
    user=u||null;
    if(user){
      try{await ensurePlayer();}catch(e){console.error(e);}
      localStorage.setItem("chessPlayerName",user.displayName||"");
      if(gameMode === "online" && gameId && !gameRoomUnsub) watchOnlineResult(gameId);
    } else {
      if(gameRoomUnsub) gameRoomUnsub();
      gameRoomUnsub=null;
    }
    await renderAccount();
  });
  rankings();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
window.chessAccount={setGame,getUser:()=>user,getGame:()=>({id:gameId,mode:gameMode}),award,result};