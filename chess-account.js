import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getDatabase, ref, onValue, runTransaction, onDisconnect, set, get } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getDatabase(app,"https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $=id=>document.getElementById(id);
const safe=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const uidKey=uid=>String(uid).replace(/[^a-zA-Z0-9_-]/g,"_");

let currentUser=null;
let currentGame=null;
let scoreRecorded=false;

function pointsLabel(n){return `${Number(n||0)} P`}
function rankPath(uid){return ref(db,`chessPlayers/${uidKey(uid)}`)}

async function ensurePlayer(user,name){
  if(!user)return;
  await runTransaction(rankPath(user.uid),v=>v||{uid:user.uid,name:name||user.displayName||"Pemain",email:user.email||"",points:0,wins:0,draws:0,losses:0,resigns:0,exits:0,games:0,createdAt:Date.now(),updatedAt:Date.now()});
}

function openAccount(){ $("accountModal")?.classList.remove("hidden"); }
function closeAccount(){ $("accountModal")?.classList.add("hidden"); }

async function register(){
  const name=$("accountName").value.trim(),email=$("accountEmail").value.trim(),pass=$("accountPassword").value;
  if(name.length<2)return $("accountMsg").textContent="Nama minimal 2 karakter.";
  if(pass.length<6)return $("accountMsg").textContent="Password minimal 6 karakter.";
  try{const c=await createUserWithEmailAndPassword(auth,email,pass);await updateProfile(c.user,{displayName:name});await ensurePlayer(c.user,name);$("accountMsg").textContent="Akun berhasil dibuat. Selamat bermain!";}catch(e){$("accountMsg").textContent=authMessage(e)}
}
async function login(){
  const email=$("accountEmail").value.trim(),pass=$("accountPassword").value;
  try{await signInWithEmailAndPassword(auth,email,pass);$("accountMsg").textContent="Login berhasil.";}catch(e){$("accountMsg").textContent=authMessage(e)}
}
async function logout(){await signOut(auth)}
function authMessage(e){const c=e?.code||"";return c.includes("invalid-credential")||c.includes("wrong-password")?"Email atau password salah.":c.includes("email-already")?"Email sudah terdaftar.":c.includes("invalid-email")?"Format email tidak valid.":e?.message||"Terjadi kesalahan."}

function renderAccount(){
  const box=$("accountStatus"),userName=$("accountUserName"),btn=$("accountLoginBtn"),out=$("accountLogoutBtn");
  if(!box)return;
  if(currentUser){box.textContent=`👤 ${currentUser.displayName||"Pemain"}`;userName.textContent=currentUser.displayName||"Pemain";btn.classList.add("hidden");out.classList.remove("hidden");$("accountModal")?.classList.add("hidden");$("playerName").value=currentUser.displayName||$("playerName").value;}
  else{box.textContent="👤 Belum Login";userName.textContent="Belum login";btn.classList.remove("hidden");out.classList.add("hidden");}
}

function awardType(type){return {win:50,draw:25,loss:-13,resign:-70,exit:-100}[type]??0}
async function award(type,mode="online",extra={}){
  if(!currentUser||scoreRecorded)return;
  const gameId=extra.gameId||currentGame?.id;
  if(!gameId)return;
  scoreRecorded=true;
  const p=awardType(type);
  const claim=ref(db,`chessScoreClaims/${uidKey(currentUser.uid)}/${uidKey(gameId)}`);
  const guard=await runTransaction(claim,v=>v||{type,points:p,mode,at:Date.now()});
  if(!guard.committed)return;
  await runTransaction(rankPath(currentUser.uid),v=>{v=v||{uid:currentUser.uid,name:currentUser.displayName||"Pemain",points:0,wins:0,draws:0,losses:0,resigns:0,exits:0,games:0};v.name=currentUser.displayName||v.name||"Pemain";v.points=Number(v.points||0)+p;v.games=Number(v.games||0)+1;if(type==="win")v.wins=Number(v.wins||0)+1;if(type==="draw")v.draws=Number(v.draws||0)+1;if(type==="loss")v.losses=Number(v.losses||0)+1;if(type==="resign")v.resigns=Number(v.resigns||0)+1;if(type==="exit")v.exits=Number(v.exits||0)+1;v.updatedAt=Date.now();return v});
  refreshMyScore();
}

async function refreshMyScore(){if(!currentUser)return;const s=await get(rankPath(currentUser.uid));const v=s.val()||{};$("myPoints")&&( $("myPoints").textContent=pointsLabel(v.points));$("myWins")&&($("myWins").textContent=v.wins||0)}

function renderRanking(mode,el){
  onValue(ref(db,"chessPlayers"),snap=>{
    const rows=[];snap.forEach(c=>{const v=c.val();if(!mode||v)rows.push(v)});
    rows.sort((a,b)=>Number(b.points||0)-Number(a.points||0)||Number(b.wins||0)-Number(a.wins||0));
    el.innerHTML=rows.slice(0,50).map((v,i)=>`<div class="rank-row ${currentUser&&v.uid===currentUser.uid?"me":""}"><span class="rank-no">${i<3?["🥇","🥈","🥉"][i]:i+1}</span><span class="rank-player"><b>${safe(v.name||"Pemain")}</b><small>${v.wins||0} Menang • ${v.losses||0} Kalah • ${v.draws||0} Remis</small></span><strong class="rank-points">${pointsLabel(v.points)}</strong></div>`).join("")||`<div class="rank-empty">Belum ada pemain.</div>`;
  });
}

function setupRanking(){const a=$("globalRanking"),b=$("computerRanking");if(a)renderRanking("all",a);if(b)renderRanking("all",b)}

function bind(){
  $("accountLoginBtn")?.addEventListener("click",openAccount);
  $("accountCloseBtn")?.addEventListener("click",closeAccount);
  $("registerBtn")?.addEventListener("click",register);
  $("loginBtn")?.addEventListener("click",login);
  $("accountLogoutBtn")?.addEventListener("click",logout);
  $("accountWinBtn")?.addEventListener("click",()=>award("win"));
  setupRanking();
  onAuthStateChanged(auth,async user=>{currentUser=user;if(user){await ensurePlayer(user,user.displayName||"Pemain");refreshMyScore()}renderAccount()});
  window.chessAccount={setGame:(id,mode="online")=>{currentGame={id,mode};scoreRecorded=false},award,awardType,logout,getUser:()=>currentUser,openAccount};
  window.addEventListener("beforeunload",()=>{if(currentUser&&currentGame&&!scoreRecorded) navigator.sendBeacon?.("","")});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
