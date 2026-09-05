import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig); const $=id=>document.getElementById(id);

let audioCtx=null,musicTimer=null,musicOn=false,musicGain=null;
function audioStart(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function tone(freq,duration,type="sine",volume=.055,delay=0){const c=audioStart(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.001,c.currentTime+delay);g.gain.linearRampToValueAtTime(volume,c.currentTime+delay+.015);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+delay+duration);o.connect(g);g.connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+duration+.04)}
function moveSound(){tone(520,.09,"triangle",.065);tone(760,.12,"sine",.035,.035)}
function captureSound(){tone(220,.12,"square",.045);tone(440,.18,"triangle",.055,.05)}
function checkSound(){tone(880,.14,"sine",.065);tone(660,.18,"sine",.045,.08)}
function winSound(){[523,659,784,1047].forEach((n,i)=>tone(n,.34,"sine",.065,i*.13))}
function startRelaxMusic(){if(musicOn)return;const c=audioStart();musicOn=true;musicGain=c.createGain();musicGain.gain.value=.018;musicGain.connect(c.destination);const notes=[261.63,329.63,392,523.25,392,329.63,293.66,349.23];let i=0;const play=()=>{if(!musicOn)return;const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=notes[i++%notes.length];g.gain.setValueAtTime(.001,c.currentTime);g.gain.linearRampToValueAtTime(.42,c.currentTime+.8);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+3.8);o.connect(g);g.connect(musicGain);o.start();o.stop(c.currentTime+4);musicTimer=setTimeout(play,2800)};play()}
function stopRelaxMusic(){musicOn=false;if(musicTimer)clearTimeout(musicTimer);musicTimer=null}
function toggleMusic(){if(musicOn){stopRelaxMusic();$("musicBtn")&&($("musicBtn").textContent="🎵 Musik Relaksasi")}else{startRelaxMusic();$("musicBtn")&&($("musicBtn").textContent="🔇 Matikan Musik")}}

let lastBoardSignature="";
function boardSignature(){return [...document.querySelectorAll("#board .piece")].map(x=>x.textContent+"@"+x.parentElement.dataset.square).join("|")}
function watchBoard(){const b=$("board");if(!b)return;lastBoardSignature=boardSignature();new MutationObserver(()=>{const n=boardSignature();if(!n||n===lastBoardSignature)return;const old=lastBoardSignature;lastBoardSignature=n;const oc=(old.match(/@/g)||[]).length,nc=(n.match(/@/g)||[]).length;if(nc<oc)captureSound();else moveSound();setTimeout(()=>{const m=$("gameMsg")?.textContent||"";if(/skak/i.test(m))checkSound()},30)}).observe(b,{childList:true,subtree:true})}

function showResultPanel(){const msg=$("gameMsg")?.textContent||"",panel=$("winPanel"),title=$("winTitle"),text=$("winText");if(!panel||!msg)return;if(/remis|stalemate/i.test(msg)){title.textContent="🤝 Permainan Remis";text.textContent="Pertandingan berakhir seri • +25 Point";panel.classList.remove("hidden");return}if(/Anda menang/i.test(msg)){title.textContent="🏆 Selamat Anda Menang!";text.textContent="Hebat! Anda mendapatkan +50 Point Top Global.";panel.classList.remove("hidden");winSound();return}if(/Computer menang|Anda menyerah/i.test(msg)){title.textContent=/Anda menyerah/i.test(msg)?"🏳 Anda Menyerah":"😔 Anda Kalah";text.textContent=/Anda menyerah/i.test(msg)?"Anda mendapatkan −70 Point karena menyerah.":"Anda mendapatkan −13 Point karena kalah.";panel.classList.remove("hidden")}}
function setup(){$("musicBtn")?.addEventListener("click",toggleMusic);$("winClose")?.addEventListener("click",()=>$("winPanel")?.classList.add("hidden"));["pointerdown","keydown","touchstart"].forEach(e=>document.addEventListener(e,()=>audioCtx?.state==="suspended"&&audioCtx.resume(),{passive:true}));watchBoard();const gm=$("gameMsg");if(gm)new MutationObserver(showResultPanel).observe(gm,{childList:true,characterData:true,subtree:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
window.chessAudio={move:moveSound,capture:captureSound,check:checkSound,win:winSound,startMusic:startRelaxMusic,stopMusic:stopRelaxMusic};
