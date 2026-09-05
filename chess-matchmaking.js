import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, remove, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);

let queueUid = null;
let queueUnsub = null;
let matchUnsub = null;
let queueActive = false;
let creatingRoom = false;
let joiningRoom = false;
let handledMatch = null;

const cleanName = value => String(value || "").trim().replace(/[<>]/g, "").slice(0, 20) || "Pemain";
const safeKey = value => String(value || "").replace(/[^a-zA-Z0-9_-]/g, "_");
const pairKey = (a,b) => [String(a),String(b)].sort().map(safeKey).join("__");

function account(){ return window.chessAccount?.getUser?.() || null; }
function msg(text){ const e=$("matchmakingMsg"); if(e)e.textContent=text||""; }

function ensureStyle(){
  if($("matchmakingStyle"))return;
  const s=document.createElement("style");s.id="matchmakingStyle";
  s.textContent=`#matchmakingBox{margin-top:12px;padding:14px;border:1px solid rgba(255,79,163,.25);border-radius:16px;background:linear-gradient(135deg,rgba(255,79,163,.09),rgba(255,255,255,.035));box-shadow:0 10px 30px rgba(0,0,0,.12)}#matchmakingBox button{width:100%;padding:12px 14px;border:1px solid rgba(255,79,163,.38);border-radius:12px;background:linear-gradient(135deg,rgba(255,79,163,.18),rgba(255,183,216,.08));color:inherit;font-weight:900;cursor:pointer;transition:.2s}#matchmakingBox button:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,79,163,.16)}#matchmakingBox button.searching{background:linear-gradient(135deg,rgba(72,217,245,.16),rgba(255,255,255,.04));border-color:rgba(72,217,245,.4)}#matchmakingMsg{min-height:18px;margin-top:8px;font-size:12px;color:#cfd3df;text-align:center}`;
  document.head.appendChild(s);
}

function ensureUI(){
  if($("matchmakingBox"))return;
  const parent=$("onlineSettings");
  if(!parent)return;
  ensureStyle();
  const box=document.createElement("div");box.id="matchmakingBox";
  box.innerHTML='<button id="findOpponentBtn" type="button">🌎 Cari Lawan Otomatis</button><div id="matchmakingMsg">Cari pemain online dari mana saja tanpa memasukkan kode room.</div>';
  parent.appendChild(box);
  $("findOpponentBtn")?.addEventListener("click",toggleSearch);
}

async function cleanupQueue(){
  if(queueUnsub){queueUnsub();queueUnsub=null;}
  if(matchUnsub){matchUnsub();matchUnsub=null;}
  if(queueUid){try{await remove(ref(db,`matchmaking/${safeKey(queueUid)}`));}catch(e){console.warn("queue cleanup",e)}}
  queueUid=null;queueActive=false;handledMatch=null;creatingRoom=false;joiningRoom=false;
}

async function toggleSearch(){
  const a=account();
  if(!a){
    msg("🔐 Login / Daftar terlebih dahulu untuk mencari lawan.");
    $("accountModal")?.classList.remove("hidden");
    return;
  }
  if(queueActive){await cleanupQueue();setButton(false);msg("Pencarian lawan dibatalkan.");return;}
  await startSearch(a);
}

function setButton(active){
  const b=$("findOpponentBtn");if(!b)return;
  b.classList.toggle("searching",active);
  b.textContent=active?"⏹ Batalkan Pencarian":"🌎 Cari Lawan Otomatis";
}

async function startSearch(a){
  await cleanupQueue();
  queueUid=a.uid;queueActive=true;setButton(true);msg("🔎 Mencari pemain yang sedang menunggu... Mohon tunggu.");
  try{
    await set(ref(db,`matchmaking/${safeKey(a.uid)}`),{uid:a.uid,name:cleanName($("playerName")?.value||a.displayName),state:"searching",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    watchQueue();
  }catch(e){console.error("matchmaking start",e);await cleanupQueue();setButton(false);msg("❌ Gagal memulai pencarian. Periksa koneksi Firebase.");}
}

function watchQueue(){
  if(queueUnsub)queueUnsub();
  queueUnsub=onValue(ref(db,"matchmaking"),async snap=>{
    if(!queueActive||!snap.exists())return;
    const me=String(queueUid);
    const candidates=[];
    snap.forEach(child=>{
      const v=child.val()||{};
      if(String(v.uid)!==me&&v.state==="searching")candidates.push(v);
    });
    candidates.sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
    const opponent=candidates[0];
    if(!opponent)return;
    const key=pairKey(me,opponent.uid);
    try{
      const tx=await runTransaction(ref(db,`matchmakingMatches/${key}`),current=>{
        if(current&&current.status==="active")return current;
        return {status:"active",creatorUid:me,opponentUid:String(opponent.uid),creatorName:cleanName($("playerName")?.value||account()?.displayName),opponentName:cleanName(opponent.name),roomId:"",createdAt:Date.now()};
      });
      if(tx?.committed){
        await update(ref(db,`matchmaking/${safeKey(me)}`),{state:"matched",matchKey:key});
        await update(ref(db,`matchmaking/${safeKey(opponent.uid)}`),{state:"matched",matchKey:key});
        watchMatch(key);
      }
    }catch(e){console.warn("match claim",e)}
  });
}

function watchMatch(key){
  if(matchUnsub)matchUnsub();
  matchUnsub=onValue(ref(db,`matchmakingMatches/${key}`),async snap=>{
    const m=snap.val()||{};
    if(!m.status||m.status!=="active")return;
    if(handledMatch===key&&m.roomId)return;
    const me=String(queueUid);
    if(!m.roomId){
      if(String(m.creatorUid)===me){
        if(creatingRoom)return;
        creatingRoom=true;
        msg("🎯 Lawan ditemukan! Membuat room permainan...");
        const btn=$("createBtn");
        if(btn){btn.click();}
        let tries=0;
        const timer=setInterval(async()=>{
          tries++;
          const code=String($("roomInfo")?.textContent||$("roomInput")?.value||"").trim().toUpperCase();
          if(code&&code!=="-"){
            clearInterval(timer);handledMatch=key;
            try{await update(ref(db,`matchmakingMatches/${key}`),{roomId:code,roomCreatedAt:Date.now()});await remove(ref(db,`matchmaking/${safeKey(me)}`));}catch(e){console.warn(e)}
          }else if(tries>50){clearInterval(timer);creatingRoom=false;msg("❌ Room gagal dibuat. Silakan coba lagi.");}
        },200);
      }else{
        msg("🎯 Lawan ditemukan! Menunggu room siap...");
      }
      return;
    }
    if(String(m.creatorUid)!==me&&!joiningRoom){
      joiningRoom=true;handledMatch=key;msg("♟ Room ditemukan! Menghubungkan Anda ke lawan...");
      const input=$("roomInput");if(input)input.value=String(m.roomId).toUpperCase();
      setTimeout(()=>$("joinBtn")?.click(),250);
      try{await remove(ref(db,`matchmaking/${safeKey(me)}`));}catch(e){}
    }
  });
}

function boot(){
  ensureUI();
  setInterval(ensureUI,1000);
  window.addEventListener("beforeunload",()=>{if(queueUid)remove(ref(db,`matchmaking/${safeKey(queueUid)}`)).catch(()=>{})});
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.chessMatchmaking={start:()=>{const a=account();if(a)startSearch(a)},cancel:cleanupQueue};
