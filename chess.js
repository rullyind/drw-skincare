import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue, push, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";

// Reuse the existing Firebase app when chess-account.js / chess-features.js
// have already initialized it. This prevents duplicate [DEFAULT] app errors.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app");
const $ = id => document.getElementById(id);
const boardEl = $("board");
const lobby = $("lobby");
const game = $("game");
const nameInput = $("playerName");