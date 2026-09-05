import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const $=id=>document.getElementById(id);
let audioCtx=null,musicTimer=null,musicOn=false,musicGain=null;
function audioStart(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function tone(freq,duration,type="sine",volume=.055,delay=0){const c=audioStart(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.001,c.currentTime+delay);g.gain.linearRampToValueAtTime(volume,c.currentTime+delay+.015);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+delay+duration);o.connect(g);g.connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+duration+.04)}
function moveSound(){tone(520,.09,"triangle",.065);tone(760,.12,"sine",.035,.035)}
function captureSound(){tone(180,.11,"square",.045);tone(110,.16,"triangle",.035,.05)}
function checkSound(){tone(880,.12,"sine",.05);tone(660,.15,"sine",.04,.12)}
function win(){tone(523,.18,"sine",.06);tone(659,.18,"sine",.06,.18);tone(784,.3,"sine",.07,.36)}
function musicStep(){if(!musicOn)return;const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];const i=Date.now()/1000|0;tone(notes[i%notes.length],1.7,"sine",.012)}
function toggleMusic(){const c=audioStart();musicOn=!musicOn;if(musicOn){musicGain=c.createGain();musicGain.gain.value=.35;$("musicBtn")?.classList.add("active");$("musicBtn")&&( $("musicBtn").textContent="🔊 Musik Relaksasi: ON");musicTimer=setInterval(musicStep,1600);musicStep()}else{clearInterval(musicTimer);musicTimer=null;$("musicBtn")?.classList.remove("active");$("musicBtn")&&( $("musicBtn").textContent="🎵 Musik Relaksasi")}}
function observeBoard(){const b=$("board");if(!b)return;let last="";new MutationObserver(()=>{const state=b.innerText||b.textContent||"";if(!last){last=state;return}if(state!==last){moveSound();last=state}}).observe(b,{childList:true,subtree:true})}
function resultModal(){const msg=$("gameMsg");if(!msg)return;new MutationObserver(()=>{const t=msg.textContent||"";if(/menang|skakmat|remis|stalemate|waktu habis|menyerah/i.test(t)&&/🏆|🤝|⏰|🏳|Skakmat/i.test(t)){$("winPanel")?.classList.remove("hidden");if(/menang|Skakmat/i.test(t))win()}}).observe(msg,{childList:true,characterData:true,subtree:true})}
function bind(){ $("musicBtn")?.addEventListener("click",toggleMusic);$("winClose")?.addEventListener("click",()=>$("winPanel")?.classList.add("hidden"));observeBoard();resultModal() }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
window.chessAudio={move:moveSound,capture:captureSound,check:checkSound,win};