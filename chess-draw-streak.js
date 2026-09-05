/* =========================================================
   MBICUKI CATUR — DRAW STREAK PENALTY
   Aturan: setiap 3 hasil REMIS berturut-turut,
   Point TOTAL player dikurangi 50.

   - Streak disimpan di chessPlayers/{uid}
   - Diproses dengan Firebase transaction agar tidak dobel
   - Setelah penalti, streak kembali 0
   - Tidak mengubah bonus/remis yang sudah diberikan: +25 tetap masuk,
     lalu penalti -50 diterapkan saat mencapai remis ke-3.
   ========================================================= */
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const uidKey = s => String(s || "").replace(/[^a-zA-Z0-9_-]/g, "_");

let watchedUid = null;
let playerUnsub = null;
let firstSnapshot = true;
let processing = false;

function showPenalty() {
  const msg = $("gameMsg");
  if (msg) msg.textContent = "⚠️ 3 kali Remis berturut-turut — Point dikurangi 50!";

  const panel = $("winPanel");
  const text = $("winText");
  if (panel && text) {
    text.textContent = "Remis +25 Point • Bonus streak −50 Point • 3 Remis berturut-turut";
    panel.classList.remove("hidden");
  }
}

async function processPlayer(uid) {
  if (!uid || processing) return;
  processing = true;

  try {
    const playerRef = ref(db, `chessPlayers/${uidKey(uid)}`);
    const tx = await runTransaction(playerRef, value => {
      const v = value || {};
      const draws = Math.max(0, Number(v.draws || 0));
      let processed = Math.max(0, Number(v.drawsProcessed || 0));
      let streak = Math.max(0, Number(v.drawStreak || 0));

      // Jangan memproses ulang draw lama yang sudah pernah dihitung.
      if (processed >= draws) return v;

      const newDraws = draws - processed;
      processed = draws;
      streak += newDraws;

      const penalties = Math.floor(streak / 3);
      const remainingStreak = streak % 3;

      if (penalties > 0) {
        v.points = Number(v.points || 0) - (penalties * 50);
        v.drawPenaltyCount = Number(v.drawPenaltyCount || 0) + penalties;
        v.lastDrawPenalty = 50 * penalties;
        v.lastDrawPenaltyAt = Date.now();
      }

      v.drawStreak = remainingStreak;
      v.drawsProcessed = processed;
      v.updatedAt = Date.now();
      return v;
    });

    if (tx.committed) {
      const v = tx.snapshot?.val() || {};
      if (Number(v.lastDrawPenaltyAt || 0) > 0 && Number(v.lastDrawPenaltyAt) >= Date.now() - 5000) {
        showPenalty();
      }
    }
  } catch (e) {
    console.warn("Draw streak penalty:", e);
  } finally {
    processing = false;
  }
}

function watch(uid) {
  if (!uid || uid === watchedUid) return;
  if (playerUnsub) playerUnsub();
  watchedUid = uid;
  firstSnapshot = true;

  playerUnsub = onValue(ref(db, `chessPlayers/${uidKey(uid)}`), snap => {
    if (!snap.exists()) return;
    const v = snap.val() || {};

    // Pada pemasangan pertama, tandai jumlah draw lama sebagai sudah diproses.
    // Jadi aturan mulai menghitung dari pertandingan berikutnya.
    if (firstSnapshot) {
      firstSnapshot = false;
      if (Number(v.drawsProcessed || 0) < Number(v.draws || 0)) {
        runTransaction(ref(db, `chessPlayers/${uidKey(uid)}`), current => {
          const x = current || {};
          if (Number(x.drawsProcessed || 0) >= Number(x.draws || 0)) return x;
          x.drawsProcessed = Number(x.draws || 0);
          x.drawStreak = Math.max(0, Number(x.drawStreak || 0));
          return x;
        }).catch(() => {});
      }
      return;
    }

    if (Number(v.draws || 0) > Number(v.drawsProcessed || 0)) processPlayer(uid);
  }, error => console.warn("Draw streak listener:", error));
}

function pollAccount() {
  const user = window.chessAccount?.getUser?.();
  if (user?.uid) watch(user.uid);
  else if (playerUnsub) {
    playerUnsub();
    playerUnsub = null;
    watchedUid = null;
  }
}

setInterval(pollAccount, 500);
pollAccount();
