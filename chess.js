import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    update,
    onValue,
    push,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

import { firebaseConfig } from "./firebase-config.js";

import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm";


// =====================================================
// FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(
    app,
    "https://d2t-catur-online-default-rtdb.asia-southeast1.firebasedatabase.app"
);


// =====================================================
// ELEMENT
// =====================================================

const $ = id => document.getElementById(id);

const boardEl = $("board");
const lobby = $("lobby");
const game = $("game");

const nameInput = $("playerName");
const roomInput = $("roomInput");


// =====================================================
// GAME VARIABLES
// =====================================================

let roomId = null;
let myColor = null;
let myName = "";

let selected = null;
let gameData = null;

let localChess = new Chess();

let roomUnsubscribe = null;
let chatUnsubscribe = null;
let clockTimer = null;


// =====================================================
// CHESS PIECES
// =====================================================

const PIECES = {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",

    P: "♙",
    N: "♘",
    B: "♗",
    R: "♖",
    Q: "♕",
    K: "♔"
};

const files = ["a","b","c","d","e","f","g","h"];


// =====================================================
// FIREBASE CONFIG CHECK
// =====================================================

function validConfig() {

    return (
        firebaseConfig &&
        firebaseConfig.apiKey &&
        !String(firebaseConfig.apiKey).startsWith("TEMPEL")
    );

}


// =====================================================
// CONNECTION STATUS
// =====================================================

const connectedRef = ref(db, ".info/connected");

onValue(connectedRef, snapshot => {

    const el = $("connection");

    if (snapshot.val() === true) {

        el.textContent = "● Online";

        el.className = "status online";

    } else {

        el.textContent = "● Menghubungkan...";

        el.className = "status offline";

    }

});


// =====================================================
// ROOM
// =====================================================

function roomRef() {

    return ref(db, `rooms/${roomId}`);

}


function makeRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}


// =====================================================
// ENTER GAME
// =====================================================

function enterGame() {

    lobby.classList.add("hidden");

    game.classList.remove("hidden");

    selected = null;

    $("lobbyMsg").textContent = "";

    listenRoom();

    listenChat();

}


// =====================================================
// LISTEN ROOM
// =====================================================

function listenRoom() {

    if (!roomId) return;

    if (roomUnsubscribe) {
        roomUnsubscribe();
    }

    roomUnsubscribe = onValue(
        roomRef(),
        snapshot => {

            if (!snapshot.exists()) {

                $("gameMsg").textContent =
                    "Room sudah tidak tersedia.";

                return;
            }

            gameData = snapshot.val();

            renderGame();

        }
    );

}


// =====================================================
// CREATE ROOM
// =====================================================

async function createRoom() {

    try {

        myName =
            (
                nameInput.value.trim() ||
                "Pemain " + Math.floor(Math.random() * 9999)
            ).slice(0, 20);

        roomId = makeRoomCode();

        myColor = "w";

        const chess = new Chess();

        const data = {

            createdAt: serverTimestamp(),

            status: "waiting",

            fen: chess.fen(),

            turn: "w",

            whiteName: myName,

            blackName: "",

            whiteTime: 600,

            blackTime: 600,

            lastTick: Date.now(),

            createdBy: myName,

            winner: "",

            lastMove: ""

        };


        await set(roomRef(), data);


        roomInput.value = roomId;

        enterGame();


        $("gameMsg").textContent =
            `Room ${roomId} berhasil dibuat. Kirim kode ini kepada teman.`;

        console.log("ROOM DIBUAT:", roomId);

    }

    catch (error) {

        console.error(error);

        $("lobbyMsg").textContent =
            "Gagal membuat room: " + error.message;

    }

}


// =====================================================
// JOIN ROOM
// =====================================================

async function joinRoom() {

    try {

        const code =
            roomInput.value.trim().toUpperCase();

        if (!code) {

            $("lobbyMsg").textContent =
                "Masukkan kode room.";

            return;

        }


        myName =
            (
                nameInput.value.trim() ||
                "Pemain " + Math.floor(Math.random() * 9999)
            ).slice(0, 20);


        roomId = code;


        const snapshot =
            await new Promise(resolve => {

                onValue(
                    roomRef(),
                    resolve,
                    { onlyOnce: true }
                );

            });


        if (!snapshot.exists()) {

            $("lobbyMsg").textContent =
                "Room tidak ditemukan.";

            return;

        }


        const data = snapshot.val();


        if (data.blackName) {

            $("lobbyMsg").textContent =
                "Room sudah penuh.";

            return;

        }


        myColor = "b";


        await update(
            roomRef(),
            {

                blackName: myName,

                status: "playing",

                lastTick: Date.now()

            }
        );


        enterGame();


        console.log(
            "BERGABUNG ROOM:",
            roomId
        );

    }

    catch (error) {

        console.error(error);

        $("lobbyMsg").textContent =
            "Gagal bergabung: " + error.message;

    }

}


// =====================================================
// RENDER GAME
// =====================================================

function renderGame() {

    if (!gameData) return;


    $("roomTitle").textContent =
        `ROOM ${roomId}`;


    $("roleText").textContent =
        `Anda: ${myColor === "w" ? "Putih" : "Hitam"}`;


    $("whiteName").textContent =
        gameData.whiteName || "Menunggu...";


    $("blackName").textContent =
        gameData.blackName || "Menunggu...";


    let whiteTime =
        Number(gameData.whiteTime ?? 600);

    let blackTime =
        Number(gameData.blackTime ?? 600);


    if (gameData.status === "playing") {

        const elapsed =
            Math.max(
                0,
                (Date.now() - Number(gameData.lastTick || Date.now())) / 1000
            );


        if (gameData.turn === "w") {

            whiteTime =
                Math.max(0, whiteTime - elapsed);

        } else {

            blackTime =
                Math.max(0, blackTime - elapsed);

        }

    }


    $("whiteClock").textContent =
        formatTime(whiteTime);


    $("blackClock").textContent =
        formatTime(blackTime);


    const messages = {

        waiting:
            "Menunggu pemain kedua...",

        playing:
            gameData.turn === myColor
                ? "🎯 Giliran Anda"
                : "⏳ Giliran lawan",

        checkmate:
            `♚ Skakmat! ${gameData.winner === "w" ? "Putih" : "Hitam"} menang.`,

        stalemate:
            "Remis — Stalemate.",

        draw:
            "Remis.",

        resigned:
            `🏆 ${gameData.winner === "w" ? "Putih" : "Hitam"} menang.`,

        timeout:
            `⏰ Waktu habis. ${gameData.winner === "w" ? "Putih" : "Hitam"} menang.`

    };


    $("gameMsg").textContent =
        messages[gameData.status] || "";


    renderBoard();

    startClock();

}


// =====================================================
// FORMAT CLOCK
// =====================================================

function formatTime(seconds) {

    seconds = Math.max(
        0,
        Math.ceil(seconds)
    );

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        String(seconds % 60).padStart(2, "0");

    return `${minutes}:${secs}`;

}


// =====================================================
// CLOCK
// =====================================================

function startClock() {

    clearInterval(clockTimer);


    clockTimer =
        setInterval(async () => {

            if (
                !gameData ||
                gameData.status !== "playing"
            ) {

                return;

            }


            let whiteTime =
                Number(gameData.whiteTime ?? 600);

            let blackTime =
                Number(gameData.blackTime ?? 600);


            const elapsed =
                Math.max(
                    0,
                    (Date.now() - Number(gameData.lastTick || Date.now())) / 1000
                );


            if (gameData.turn === "w") {

                whiteTime =
                    Math.max(0, whiteTime - elapsed);

            } else {

                blackTime =
                    Math.max(0, blackTime - elapsed);

            }


            $("whiteClock").textContent =
                formatTime(whiteTime);


            $("blackClock").textContent =
                formatTime(blackTime);


            if (
                whiteTime <= 0 ||
                blackTime <= 0
            ) {

                const winner =
                    gameData.turn === "w"
                        ? "b"
                        : "w";


                await update(
                    roomRef(),
                    {

                        status: "timeout",

                        winner,

                        whiteTime,

                        blackTime,

                        lastTick: Date.now()

                    }
                );

            }

        }, 500);

}


// =====================================================
// BOARD
// =====================================================

function renderBoard() {

    if (!gameData) return;


    try {

        localChess =
            new Chess(gameData.fen);

    }

    catch {

        localChess =
            new Chess();

    }


    boardEl.innerHTML = "";


    const board =
        localChess.board();


    const orientation =
        myColor === "b"
            ? "b"
            : "w";


    const ranks =
        orientation === "w"
            ? [8,7,6,5,4,3,2,1]
            : [1,2,3,4,5,6,7,8];


    const fs =
        orientation === "w"
            ? files
            : [...files].reverse();


    for (const r of ranks) {

        for (const f of fs) {

            const sq =
                `${f}${r}`;


            const piece =
                board[8 - r][files.indexOf(f)];


            const div =
                document.createElement("div");


            div.className =
                "sq " +
                (
                    ((files.indexOf(f) + r) % 2 === 0)
                        ? "light"
                        : "dark"
                );


            div.dataset.square = sq;


            if (selected === sq) {

                div.classList.add("selected");

            }


            if (selected) {

                try {

                    const moves =
                        localChess.moves({
                            square: selected,
                            verbose: true
                        });


                    const legal =
                        moves.find(
                            m => m.to === sq
                        );


                    if (legal) {

                        div.classList.add("legal");

                        if (piece) {

                            div.classList.add("capture");

                        }

                    }

                }

                catch {}

            }


            if (piece) {

                const span =
                    document.createElement("span");


                span.className =
                    "piece";


                span.textContent =
                    PIECES[
                        piece.color === "w"
                            ? piece.type.toUpperCase()
                            : piece.type
                    ];


                div.appendChild(span);

            }


            div.onclick =
                () => clickSquare(sq);


            boardEl.appendChild(div);

        }

    }

}


// =====================================================
// CLICK SQUARE
// =====================================================

async function clickSquare(sq) {

    if (
        !gameData ||
        gameData.status !== "playing" ||
        gameData.turn !== myColor
    ) {

        return;

    }


    const piece =
        localChess.get(sq);


    if (!selected) {

        if (
            piece &&
            piece.color === myColor
        ) {

            selected = sq;

            renderBoard();

        }

        return;

    }


    if (sq === selected) {

        selected = null;

        renderBoard();

        return;

    }


    let move;


    try {

        move =
            localChess.move({
                from: selected,
                to: sq,
                promotion: "q"
            });

    }

    catch {

        if (
            piece &&
            piece.color === myColor
        ) {

            selected = sq;

        } else {

            selected = null;

        }

        renderBoard();

        return;

    }


    selected = null;


    const nextTurn =
        localChess.turn();


    const fen =
        localChess.fen();


    const now =
        Date.now();


    let status = "playing";

    let winner = "";


    if (localChess.isCheckmate()) {

        status = "checkmate";

        winner = myColor;

    }

    else if (localChess.isStalemate()) {

        status = "stalemate";

    }

    else if (localChess.isDraw()) {

        status = "draw";

    }


    const moves =
        gameData.moves || {};


    const moveRef =
        push(
            ref(db, `rooms/${roomId}/moves`)
        );


    moves[moveRef.key] = {

        from: move.from,

        to: move.to,

        fen,

        by: myColor,

        at: now,

        san: move.san

    };


    const updateData = {

        fen,

        turn: nextTurn,

        status,

        moves,

        lastMove: move.san,

        lastMoveAt: now,

        lastTick: now

    };


    if (winner) {

        updateData.winner =
            winner;

    }


    await update(
        roomRef(),
        updateData
    );

}


// =====================================================
// CHAT
// =====================================================

function listenChat() {

    if (!roomId) return;


    if (chatUnsubscribe) {

        chatUnsubscribe();

    }


    chatUnsubscribe =
        onValue(
            ref(db, `rooms/${roomId}/chat`),
            snapshot => {

                const list =
                    $("chatList");


                list.innerHTML = "";


                snapshot.forEach(child => {

                    const data =
                        child.val();


                    const div =
                        document.createElement("div");


                    div.className =
                        "bubble";


                    div.innerHTML =
                        `<b>${escapeHtml(data.name || "Pemain")}</b>
                         ${escapeHtml(data.text || "")}`;


                    list.appendChild(div);

                });


                list.scrollTop =
                    list.scrollHeight;

            }
        );

}


function escapeHtml(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[char]
        );

}


// =====================================================
// SEND CHAT
// =====================================================

$("chatForm").addEventListener(
    "submit",
    async e => {

        e.preventDefault();


        const text =
            $("chatInput").value.trim();


        if (!text || !roomId) return;


        const message =
            push(
                ref(db, `rooms/${roomId}/chat`)
            );


        await set(
            message,
            {
                name: myName,
                text,
                at: serverTimestamp()
            }
        );


        $("chatInput").value = "";

    }
);


// =====================================================
// BUTTON CREATE
// =====================================================

$("createBtn").addEventListener(
    "click",
    async () => {

        if (!validConfig()) {

            $("lobbyMsg").textContent =
                "Firebase belum dikonfigurasi.";

            return;

        }


        await createRoom();

    }
);


// =====================================================
// BUTTON JOIN
// =====================================================

$("joinBtn").addEventListener(
    "click",
    async () => {

        if (!validConfig()) {

            $("lobbyMsg").textContent =
                "Firebase belum dikonfigurasi.";

            return;

        }


        await joinRoom();

    }
);


// =====================================================
// COPY INVITATION
// =====================================================

$("copyBtn").addEventListener(
    "click",
    async () => {

        const url =
            location.href.split("#")[0] +
            `#room=${roomId}`;


        try {

            await navigator.clipboard.writeText(url);

            $("copyBtn").textContent =
                "✓ Link Tersalin";


            setTimeout(
                () => {
                    $("copyBtn").textContent =
                        "🔗 Salin Undangan";
                },
                1500
            );

        }

        catch {

            alert(
                "Kode room: " + roomId
            );

        }

    }
);


// =====================================================
// RESIGN
// =====================================================

$("resignBtn").addEventListener(
    "click",
    async () => {

        if (
            !gameData ||
            gameData.status !== "playing"
        ) {

            return;

        }


        if (
            !confirm("Yakin menyerah?")
        ) {

            return;

        }


        const winner =
            myColor === "w"
                ? "b"
                : "w";


        await update(
            roomRef(),
            {
                status: "resigned",
                winner,
                lastTick: Date.now()
            }
        );

    }
);


// =====================================================
// DRAW
// =====================================================

$("drawBtn").addEventListener(
    "click",
    () => {

        alert(
            "Fitur tawaran remis akan kita aktifkan setelah sistem dasar multiplayer berjalan."
        );

    }
);


// =====================================================
// BACK TO LOBBY
// =====================================================

$("newBtn").addEventListener(
    "click",
    () => {

        if (roomUnsubscribe) {
            roomUnsubscribe();
        }

        if (chatUnsubscribe) {
            chatUnsubscribe();
        }

        clearInterval(clockTimer);

        location.href =
            location.pathname;

    }
);


// =====================================================
// INITIAL STATUS
// =====================================================

if (validConfig()) {

    $("connection").textContent =
        "● Online";

    $("connection").className =
        "status online";

}


// =====================================================
// ROOM FROM URL
// =====================================================

const hash =
    location.hash.match(
        /^#room=([A-Z0-9]+)$/i
    );


if (hash) {

    roomInput.value =
        hash[1].toUpperCase();


    $("lobbyMsg").textContent =
        "Masukkan nama lalu tekan Gabung.";

}
