(function () {
  "use strict";

  /* =========================================================
     MBICUKIA DOMINO
     DOMINO1.JS — FINAL
     LOCAL + FIREBASE ONLINE
     2 / 3 / 4 PEMAIN
     REALTIME HAND SYNC
     ========================================================= */

  /* =========================================================
     HELPER
     ========================================================= */

  const $ = (id) => document.getElementById(id);

  const POINTS = [3, 2, 1, 0];

  const LEAGUE_KEY = "d2t_domino_local_league_v2";
  const NAME_KEY = "d2t_domino_local_names_v2";

  let mode = "local";

  /* =========================================================
     FIREBASE
     ========================================================= */

  let db = null;
  let auth = null;
  let currentUid = null;

  let firebaseReady = false;

  let roomId = null;
  let roomData = null;

  let roomUnsub = null;
  let actionUnsub = null;
  let handUnsub = null;

  /* =========================================================
     ONLINE STATE
     ========================================================= */

  let onlineHand = [];

  let processingActions = {};
  let onlineRendering = false;

  /* =========================================================
     LOCAL STATE
     ========================================================= */

  let localPlayers = [];
  let localBoard = [];
  let localLeft = null;
  let localRight = null;
  let localTurn = 0;
  let localBoneyard = [];
  let localRound = 1;
  let localFinished = false;
  let localResults = [];

  /* =========================================================
     DOMINO DECK
     ========================================================= */

  function deck28() {
    const deck = [];

    for (let a = 0; a <= 6; a++) {
      for (let b = a; b <= 6; b++) {
        deck.push([a, b]);
      }
    }

    return deck;
  }

  function shuffle(arr) {
    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  function cloneTile(tile) {
    return tile ? [Number(tile[0]), Number(tile[1])] : null;
  }

  function tileKey(tile) {
    if (!tile) return "";
    return `${tile[0]}-${tile[1]}`;
  }

  function sumPips(hand) {
    return (hand || []).reduce(
      (sum, tile) => sum + Number(tile[0]) + Number(tile[1]),
      0
    );
  }

  function encodeTile(tile) {
    return `${Number(tile[0])}-${Number(tile[1])}`;
  }

  function decodeTile(value) {
    if (Array.isArray(value)) {
      return [Number(value[0]), Number(value[1])];
    }

    if (typeof value !== "string") {
      return null;
    }

    const parts = value.split("-").map(Number);

    if (
      parts.length !== 2 ||
      !Number.isFinite(parts[0]) ||
      !Number.isFinite(parts[1])
    ) {
      return null;
    }

    return [parts[0], parts[1]];
  }

  function encodeTiles(tiles) {
    return (tiles || []).map(encodeTile);
  }

  function decodeTiles(tiles) {
    return (tiles || [])
      .map(decodeTile)
      .filter(Boolean);
  }

  /* =========================================================
     SAFE FIREBASE SERVER TIMESTAMP
     ========================================================= */

  function serverTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  /* =========================================================
     UI
     ========================================================= */

  function show(id) {
    const el = $(id);
    if (el) el.classList.remove("hidden");
  }

  function hide(id) {
    const el = $(id);
    if (el) el.classList.add("hidden");
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text ?? "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(text, type) {
    const el = $("status");

    if (!el) return;

    el.textContent = text || "";

    el.classList.remove("success", "error", "warning");

    if (type) {
      el.classList.add(type);
    }
  }

  function setFirebaseStatus(text, type) {
    const el = $("firebaseStatus");

    if (!el) return;

    el.textContent = text || "";

    el.classList.remove("success", "error", "warning");

    if (type) {
      el.classList.add(type);
    }
  }

  /* =========================================================
     LOCAL STORAGE
     ========================================================= */

  function loadLeague() {
    try {
      return JSON.parse(localStorage.getItem(LEAGUE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveLeague(data) {
    localStorage.setItem(LEAGUE_KEY, JSON.stringify(data));
  }

  function getSavedNames() {
    try {
      return JSON.parse(localStorage.getItem(NAME_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveNames() {
    localStorage.setItem(
      NAME_KEY,
      JSON.stringify({
        name1: $("name1")?.value || "",
        name2: $("name2")?.value || "",
        name3: $("name3")?.value || "",
        onlineName: $("onlineName")?.value || ""
      })
    );
  }

  function loadNames() {
    const names = getSavedNames();

    if ($("name1")) $("name1").value = names.name1 || "";
    if ($("name2")) $("name2").value = names.name2 || "";
    if ($("name3")) $("name3").value = names.name3 || "";
    if ($("onlineName")) $("onlineName").value = names.onlineName || "";
  }

  /* =========================================================
     FIREBASE INIT
     ========================================================= */

  async function initFirebase() {
    try {
      if (!window.firebase) {
        throw new Error("Firebase SDK tidak ditemukan.");
      }

      const config = window.D2T_FIREBASE_CONFIG;

      if (!config) {
        throw new Error("D2T_FIREBASE_CONFIG tidak ditemukan.");
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }

      auth = firebase.auth();
      db = firebase.firestore();

      await auth.signInAnonymously();

      currentUid = auth.currentUser?.uid || null;

      if (!currentUid) {
        throw new Error("UID Firebase tidak tersedia.");
      }

      firebaseReady = true;

      setFirebaseStatus("Firebase Connected", "success");

      $("createRoomBtn")?.removeAttribute("disabled");
      $("joinRoomBtn")?.removeAttribute("disabled");

      return true;
    } catch (error) {
      console.error("Firebase Error:", error);

      firebaseReady = false;

      setFirebaseStatus(
        "Firebase gagal: " + (error.message || "Unknown error"),
        "error"
      );

      return false;
    }
  }

  /* =========================================================
     ROOM ID
     ========================================================= */

  function randomRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
  }

  /* =========================================================
     PLAYERS
     ========================================================= */

  function playerList(data = roomData) {
    if (!data || !Array.isArray(data.players)) {
      return [];
    }

    return [...data.players].sort(
      (a, b) => Number(a.seat || 0) - Number(b.seat || 0)
    );
  }

  function currentOnlinePlayer() {
    return playerList().find(
      (p) => p.uid === currentUid
    );
  }

  function currentOnlineTurnPlayer() {
    const players = playerList();

    return players.find(
      (p) => Number(p.seat) === Number(roomData?.turn)
    ) || players[0];
  }

  /* =========================================================
     CREATE ROOM
     ========================================================= */

  async function createRoom() {
    if (!firebaseReady || !db || !currentUid) {
      setFirebaseStatus("Firebase belum siap.", "error");
      return;
    }

    const input = $("onlineName");

    const name =
      String(input?.value || "").trim() ||
      "Pemain";

    saveNames();

    try {
      const code = randomRoomCode();

      const roomRef = db.collection("rooms").doc(code);

      const initialRoom = {
        code,
        hostUid: currentUid,
        players: [
          {
            uid: currentUid,
            name,
            seat: 0,
            handCount: 0,
            pips: 0
          }
        ],
        status: "lobby",
        round: 0,
        board: [],
        left: null,
        right: null,
        turn: 0,
        boneyard: [],
        finished: false,
        results: [],
        createdAt: serverTimestamp()
      };

      await roomRef.set(initialRoom);

      roomId = code;

      onlineHand = [];

      subscribeRoom();
      subscribeMyHand();

      showApp();

      setStatus(
        "Room berhasil dibuat. Bagikan kode room kepada teman.",
        "success"
      );
    } catch (error) {
      console.error(error);

      setFirebaseStatus(
        "Gagal membuat room: " + (error.message || "Unknown error"),
        "error"
      );
    }
  }

  /* =========================================================
     JOIN ROOM
     ========================================================= */

  async function joinRoom() {
    if (!firebaseReady || !db || !currentUid) {
      setFirebaseStatus("Firebase belum siap.", "error");
      return;
    }

    const code = String(
      $("roomCodeInput")?.value || ""
    )
      .trim()
      .toUpperCase();

    const name =
      String(
        $("onlineName")?.value || ""
      ).trim() || "Pemain";

    if (!code) {
      setFirebaseStatus("Masukkan kode room.", "warning");
      return;
    }

    try {
      const roomRef = db.collection("rooms").doc(code);

      const snap = await roomRef.get();

      if (!snap.exists) {
        setFirebaseStatus("Room tidak ditemukan.", "error");
        return;
      }

      const data = snap.data() || {};

      const players = Array.isArray(data.players)
        ? [...data.players]
        : [];

      const already = players.find(
        (p) => p.uid === currentUid
      );

      if (already) {
        roomId = code;

        subscribeRoom();
        subscribeMyHand();

        showApp();

        setStatus(
          "Anda kembali ke room " + code + ".",
          "success"
        );

        return;
      }

      if (data.status === "playing") {
        setFirebaseStatus(
          "Game sudah dimulai. Tidak bisa masuk ronde ini.",
          "warning"
        );
        return;
      }

      if (players.length >= 4) {
        setFirebaseStatus(
          "Room sudah penuh. Maksimal 4 pemain.",
          "error"
        );
        return;
      }

      const usedSeats = players.map(
        (p) => Number(p.seat)
      );

      let seat = 0;

      while (usedSeats.includes(seat)) {
        seat++;
      }

      players.push({
        uid: currentUid,
        name,
        seat,
        handCount: 0,
        pips: 0
      });

      await roomRef.update({
        players
      });

      roomId = code;

      onlineHand = [];

      subscribeRoom();
      subscribeMyHand();

      showApp();

      setStatus(
        "Berhasil masuk room " + code + ".",
        "success"
      );
    } catch (error) {
      console.error(error);

      setFirebaseStatus(
        "Gagal bergabung: " + (error.message || "Unknown error"),
        "error"
      );
    }
  }

  /* =========================================================
     SUBSCRIBE ROOM
     ========================================================= */

  function subscribeRoom() {
    if (roomUnsub) {
      roomUnsub();
      roomUnsub = null;
    }

    if (!db || !roomId) return;

    const roomRef = db.collection("rooms").doc(roomId);

    roomUnsub = roomRef.onSnapshot(
      (snap) => {
        if (!snap.exists) {
          setStatus("Room sudah tidak tersedia.", "error");
          return;
        }

        const data = snap.data() || {};

        roomData = {
          ...data,
          board: decodeTiles(data.board || []),
          boneyard: decodeTiles(data.boneyard || []),
          left: decodeTile(data.left),
          right: decodeTile(data.right)
        };

        renderOnlineRoom();

        if (roomData.status === "playing") {
          renderOnlineGame();
        }
      },
      (error) => {
        console.error("Room listener error:", error);

        setStatus(
          "Gagal sinkronisasi room: " +
            (error.message || "Unknown error"),
          "error"
        );
      }
    );
  }

  /* =========================================================
     ★ CRITICAL FIX
     REALTIME LISTENER UNTUK KARTU PEMAIN
     ========================================================= */

  function subscribeMyHand() {
    if (handUnsub) {
      handUnsub();
      handUnsub = null;
    }

    onlineHand = [];

    if (!db || !roomId || !currentUid) {
      return;
    }

    const handRef = db
      .collection("rooms")
      .doc(roomId)
      .collection("hands")
      .doc(currentUid);

    handUnsub = handRef.onSnapshot(
      (snap) => {
        if (!snap.exists) {
          onlineHand = [];
        } else {
          const data = snap.data() || {};

          onlineHand = decodeTiles(
            data.tiles || []
          );
        }

        console.log(
          "HAND UPDATE:",
          currentUid,
          onlineHand
        );

        if (
          roomData &&
          roomData.status === "playing"
        ) {
          renderOnlineGame();
        }
      },
      (error) => {
        console.error(
          "Hand listener error:",
          error
        );

        setStatus(
          "Kartu gagal disinkronkan: " +
            (error.message || "Firestore Rules"),
          "error"
        );
      }
    );
  }

  /* =========================================================
     GET HAND
     ========================================================= */

  async function getMyHandOnline() {
    if (!db || !roomId || !currentUid) {
      return [];
    }

    try {
      const snap = await db
        .collection("rooms")
        .doc(roomId)
        .collection("hands")
        .doc(currentUid)
        .get();

      if (!snap.exists) {
        return [];
      }

      return decodeTiles(
        snap.data()?.tiles || []
      );
    } catch (error) {
      console.error(
        "getMyHandOnline error:",
        error
      );

      return [];
    }
  }

  /* =========================================================
     START ONLINE ROUND
     ========================================================= */

  async function startOnlineRound() {
    if (!db || !roomId || !roomData) {
      return;
    }

    if (roomData.hostUid !== currentUid) {
      setStatus(
        "Hanya host yang dapat memulai ronde.",
        "warning"
      );
      return;
    }

    const players = playerList();

    if (players.length < 2) {
      setStatus(
        "Minimal 2 pemain untuk memulai.",
        "warning"
      );
      return;
    }

    if (players.length > 4) {
      setStatus(
        "Maksimal 4 pemain.",
        "error"
      );
      return;
    }

    try {
      const deck = shuffle(deck28());

      const hands = {};

      players.forEach((player) => {
        hands[player.uid] = deck.splice(0, 7);
      });

      const nextRound =
        Number(roomData.round || 0) + 1;

      const batch = db.batch();

      /* -----------------------------------------
         BAGIKAN 7 KARTU KE SEMUA PEMAIN
         ----------------------------------------- */

      players.forEach((player) => {
        const handRef = db
          .collection("rooms")
          .doc(roomId)
          .collection("hands")
          .doc(player.uid);

        batch.set(
          handRef,
          {
            uid: player.uid,
            round: nextRound,
            tiles: encodeTiles(
              hands[player.uid]
            ),
            handCount: 7,
            pips: sumPips(
              hands[player.uid]
            ),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      });

      /* -----------------------------------------
         ROOM
         ----------------------------------------- */

      const updatedPlayers =
        players.map((player) => ({
          uid: player.uid,
          name: player.name,
          seat: Number(player.seat),
          handCount: 7,
          pips: sumPips(
            hands[player.uid]
          )
        }));

      const roomRef = db
        .collection("rooms")
        .doc(roomId);

      batch.update(roomRef, {
        status: "playing",
        round: nextRound,
        players: updatedPlayers,

        board: [],
        left: null,
        right: null,

        turn: 0,

        boneyard: encodeTiles(deck),

        finished: false,
        results: [],

        startedAt: serverTimestamp()
      });

      await batch.commit();

      onlineHand =
        hands[currentUid] || [];

      setStatus(
        "Ronde " +
          nextRound +
          " dimulai. Selamat bermain!",
        "success"
      );
    } catch (error) {
      console.error(
        "startOnlineRound:",
        error
      );

      setStatus(
        "Gagal memulai ronde: " +
          (error.message || "Unknown error"),
        "error"
      );
    }
  }

  /* =========================================================
     RENDER ONLINE ROOM / LOBBY
     ========================================================= */

  function renderOnlineRoom() {
    if (!roomData) return;

    const players = playerList();

    setText(
      "roomCode",
      roomData.code || roomId || "ONLINE"
    );

    setText(
      "onlineState",
      roomData.status === "playing"
        ? "Online • Bermain"
        : "Online • Menunggu"
    );

    const waiting = $("waitingCard");

    if (
      roomData.status === "lobby" &&
      waiting
    ) {
      show("waitingCard");

      setText(
        "waitingText",
        `Pemain ${players.length}/4 • Bagikan kode ${roomData.code}`
      );

      renderLobbyPlayers();

      const startBtn =
        $("startOnlineBtn");

      if (startBtn) {
        startBtn.disabled =
          roomData.hostUid !== currentUid ||
          players.length < 2;
      }
    } else {
      hide("waitingCard");
    }
  }

  function renderLobbyPlayers() {
    const container = $("roomPlayers");

    if (!container) return;

    const players = playerList();

    container.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const player = players[i];

      const div =
        document.createElement("div");

      div.className =
        "lobby-player" +
        (player ? " filled" : "");

      if (player) {
        const host =
          player.uid === roomData.hostUid
            ? " 👑"
            : "";

        const me =
          player.uid === currentUid
            ? " (Anda)"
            : "";

        div.innerHTML = `
          <strong>
            ${escapeHtml(player.name)}
            ${host}
          </strong>
          <small>
            Pemain ${Number(player.seat) + 1}${me}
          </small>
        `;
      } else {
        div.innerHTML = `
          <strong>Menunggu...</strong>
          <small>Slot kosong</small>
        `;
      }

      container.appendChild(div);
    }
  }

  /* =========================================================
     RENDER ONLINE GAME
     ========================================================= */

  function renderOnlineGame() {
    if (!roomData) return;

    if (onlineRendering) {
      return;
    }

    onlineRendering = true;

    try {
      const players = playerList();

      setText(
        "roomCode",
        roomData.code || roomId
      );

      setText(
        "onlineState",
        "Online • " +
          (roomData.status === "playing"
            ? "Bermain"
            : "Menunggu")
      );

      setText(
        "roundNo",
        String(roomData.round || 1)
      );

      renderOnlinePlayers(
        players
      );

      renderBoard(
        roomData.board || [],
        roomData.left,
        roomData.right
      );

      setText(
        "boneyardInfo",
        `Sisa tumpukan: ${
          (roomData.boneyard || []).length
        }`
      );

      const turnPlayer =
        currentOnlineTurnPlayer();

      setText(
        "turnName",
        turnPlayer?.name || "-"
      );

      if (
        roomData.status !== "playing"
      ) {
        return;
      }

      if (roomData.finished) {
        renderOnlineResults();
        return;
      }

      renderOnlineHand();
    } finally {
      onlineRendering = false;
    }
  }

  /* =========================================================
     ONLINE PLAYERS
     ========================================================= */

  function renderOnlinePlayers(players) {
    const container = $("players");

    if (!container) return;

    container.innerHTML = "";

    players.forEach((player) => {
      const isTurn =
        Number(player.seat) ===
        Number(roomData.turn);

      const isMe =
        player.uid === currentUid;

      const div =
        document.createElement("div");

      div.className =
        "player" +
        (isTurn ? " active" : "") +
        (isMe ? " me" : "");

      div.innerHTML = `
        <div class="player-name">
          ${escapeHtml(player.name)}
          ${
            player.uid === roomData.hostUid
              ? " 👑"
              : ""
          }
          ${isMe ? " • Anda" : ""}
        </div>

        <div class="player-info">
          ${Number(player.handCount || 0)} batu
          • ${Number(player.pips || 0)} angka
        </div>
      `;

      container.appendChild(div);
    });
  }

  /* =========================================================
     BOARD
     ========================================================= */

  function renderBoard(
    board,
    left,
    right
  ) {
    const container = $("board");

    if (!container) return;

    container.innerHTML = "";

    if (!board || board.length === 0) {
      const empty =
        document.createElement("div");

      empty.className = "empty";
      empty.textContent = "Meja domino";

      container.appendChild(empty);

      return;
    }

    board.forEach((tile) => {
      const el =
        document.createElement("div");

      el.className = "domino board-tile";

      el.innerHTML = `
        <span>${tile[0]}</span>
        <i></i>
        <span>${tile[1]}</span>
      `;

      container.appendChild(el);
    });
  }

  /* =========================================================
     TILE DISPLAY
     ========================================================= */

  function createTileElement(
    tile,
    options = {}
  ) {
    const el =
      document.createElement("button");

    el.type = "button";

    el.className =
      "domino tile" +
      (options.disabled
        ? " disabled"
        : "");

    el.dataset.index =
      options.index ?? "";

    el.innerHTML = `
      <span>${tile[0]}</span>
      <i></i>
      <span>${tile[1]}</span>
    `;

    return el;
  }

  /* =========================================================
     ONLINE HAND
     ========================================================= */

  function renderOnlineHand() {
    const handContainer = $("hand");

    if (!handContainer) return;

    handContainer.innerHTML = "";

    const me =
      currentOnlinePlayer();

    const turnPlayer =
      currentOnlineTurnPlayer();

    const myTurn =
      !!me &&
      !!turnPlayer &&
      turnPlayer.uid === currentUid &&
      Number(roomData.turn) ===
        Number(me.seat);

    setText(
      "handTitle",
      myTurn
        ? "Kartu Anda • GILIRAN ANDA"
        : "Kartu Anda"
    );

    if (!onlineHand.length) {
      const empty =
        document.createElement("div");

      empty.className = "empty";
      empty.textContent =
        roomData.finished
          ? "Ronde selesai"
          : "Menunggu kartu...";

      handContainer.appendChild(empty);

      updateOnlineControls(
        myTurn
      );

      return;
    }

    onlineHand.forEach(
      (tile, index) => {
        const canPlay =
          myTurn &&
          canOnlinePlay(
            tile,
            roomData.board || []
          );

        const el =
          createTileElement(
            tile,
            {
              index,
              disabled:
                !myTurn || !canPlay
            }
          );

        if (myTurn) {
          el.addEventListener(
            "click",
            () => {
              openOnlineTileChoice(
                index
              );
            }
          );
        }

        handContainer.appendChild(el);
      }
    );

    updateOnlineControls(
      myTurn
    );
  }

  /* =========================================================
     ONLINE CONTROL
     ========================================================= */

  function updateOnlineControls(
    myTurn
  ) {
    const draw =
      $("drawBtn");

    const pass =
      $("passBtn");

    const canDraw =
      myTurn &&
      (roomData?.boneyard || [])
        .length > 0;

    if (draw) {
      draw.disabled = !canDraw;
    }

    if (pass) {
      pass.disabled = !myTurn;
    }
  }

  /* =========================================================
     VALIDATE TILE
     ========================================================= */

  function canOnlinePlay(
    tile,
    board
  ) {
    if (!tile) return false;

    if (!board || board.length === 0) {
      return true;
    }

    const first =
      board[0];

    const last =
      board[board.length - 1];

    return (
      tile[0] === first[0] ||
      tile[1] === first[0] ||
      tile[0] === last[1] ||
      tile[1] === last[1]
    );
  }

  /* =========================================================
     NORMALIZE TILE
     ========================================================= */

  function normalizeTile(
    tile,
    target
  ) {
    if (!tile) return null;

    const a = Number(tile[0]);
    const b = Number(tile[1]);

    if (a === target) {
      return [a, b];
    }

    if (b === target) {
      return [b, a];
    }

    return null;
  }

  /* =========================================================
     PLACE TILE
     ========================================================= */

  function placeOnline(
    board,
    tile,
    side
  ) {
    const nextBoard =
      (board || []).map(
        cloneTile
      );

    if (!tile) {
      return null;
    }

    if (
      nextBoard.length === 0
    ) {
      nextBoard.push(
        cloneTile(tile)
      );

      return {
        board: nextBoard,
        left: nextBoard[0],
        right: nextBoard[0]
      };
    }

    const first =
      nextBoard[0];

    const last =
      nextBoard[
        nextBoard.length - 1
      ];

    if (side === "left") {
      const normalized =
        normalizeTile(
          tile,
          first[0]
        );

      if (!normalized) {
        return null;
      }

      nextBoard.unshift(
        normalized
      );
    } else {
      const normalized =
        normalizeTile(
          tile,
          last[1]
        );

      if (!normalized) {
        return null;
      }

      nextBoard.push(
        normalized
      );
    }

    return {
      board: nextBoard,
      left: nextBoard[0],
      right:
        nextBoard[
          nextBoard.length - 1
        ]
    };
  }

  /* =========================================================
     CHOOSE SIDE
     ========================================================= */

  function openOnlineTileChoice(
    index
  ) {
    if (
      !roomData ||
      roomData.status !== "playing" ||
      roomData.finished
    ) {
      return;
    }

    const me =
      currentOnlinePlayer();

    const turnPlayer =
      currentOnlineTurnPlayer();

    if (
      !me ||
      !turnPlayer ||
      turnPlayer.uid !== currentUid
    ) {
      setStatus(
        "Belum giliran Anda.",
        "warning"
      );
      return;
    }

    const tile =
      onlineHand[index];

    if (!tile) return;

    const board =
      roomData.board || [];

    if (board.length === 0) {
      sendOnlineAction(
        "play",
        index,
        "right"
      );

      return;
    }

    const first =
      board[0];

    const last =
      board[board.length - 1];

    const canLeft =
      tile[0] === first[0] ||
      tile[1] === first[0];

    const canRight =
      tile[0] === last[1] ||
      tile[1] === last[1];

    if (canLeft && canRight) {
      const useLeft =
        confirm(
          `Batu ${tile[0]}-${tile[1]}\n\n` +
          `OK = taruh di KIRI\n` +
          `Batal = taruh di KANAN`
        );

      sendOnlineAction(
        "play",
        index,
        useLeft
          ? "left"
          : "right"
      );

      return;
    }

    if (canLeft) {
      sendOnlineAction(
        "play",
        index,
        "left"
      );

      return;
    }

    if (canRight) {
      sendOnlineAction(
        "play",
        index,
        "right"
      );

      return;
    }

    setStatus(
      "Batu tersebut tidak cocok dengan meja.",
      "warning"
    );
  }

  /* =========================================================
     SEND ONLINE ACTION
     ========================================================= */

  async function sendOnlineAction(
    type,
    index,
    side
  ) {
    if (!db || !roomId || !roomData) {
      return;
    }

    if (
      roomData.status !== "playing" ||
      roomData.finished
    ) {
      return;
    }

    const me =
      currentOnlinePlayer();

    const turnPlayer =
      currentOnlineTurnPlayer();

    if (
      !me ||
      !turnPlayer ||
      turnPlayer.uid !== currentUid
    ) {
      setStatus(
        "Belum giliran Anda.",
        "warning"
      );
      return;
    }

    try {
      await db
        .collection("rooms")
        .doc(roomId)
        .collection("actions")
        .add({
          uid: currentUid,
          type: type,
          index:
            index === undefined
              ? null
              : Number(index),
          side: side || null,
          round: Number(
            roomData.round || 0
          ),
          createdAt:
            serverTimestamp()
        });

      setStatus(
        type === "play"
          ? "Mengirim langkah..."
          : type === "draw"
          ? "Mengambil batu..."
          : "Pass...",
        ""
      );
    } catch (error) {
      console.error(
        "sendOnlineAction:",
        error
      );

      setStatus(
        "Gagal mengirim langkah: " +
          (error.message || "Firestore Rules"),
        "error"
      );
    }
  }

  /* =========================================================
     SUBSCRIBE ACTIONS
     ========================================================= */

  function subscribeActions() {
    if (actionUnsub) {
      actionUnsub();
      actionUnsub = null;
    }

    if (!db || !roomId) {
      return;
    }

    actionUnsub = db
      .collection("rooms")
      .doc(roomId)
      .collection("actions")
      .orderBy("createdAt", "asc")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges()
            .forEach((change) => {
              if (
                change.type !== "added"
              ) {
                return;
              }

              const action =
                change.doc.data();

              const actionId =
                change.doc.id;

              if (
                processingActions[actionId]
              ) {
                return;
              }

              if (
                roomData?.hostUid !==
                currentUid
              ) {
                return;
              }

              processingActions[
                actionId
              ] = true;

              hostProcessAction(
                actionId,
                action
              ).catch((error) => {
                console.error(
                  "hostProcessAction:",
                  error
                );

                delete processingActions[
                  actionId
                ];
              });
            });
        },
        (error) => {
          console.error(
            "Actions listener:",
            error
          );
        }
      );
  }

  /* =========================================================
     HOST PROCESS ACTION
     ========================================================= */

  async function hostProcessAction(
    actionId,
    action
  ) {
    if (
      !db ||
      !roomId ||
      !roomData
    ) {
      return;
    }

    if (
      roomData.status !== "playing" ||
      roomData.finished
    ) {
      return;
    }

    const players =
      playerList();

    if (!players.length) {
      return;
    }

    const turnPlayer =
      currentOnlineTurnPlayer();

    if (!turnPlayer) {
      return;
    }

    if (
      action.uid !== turnPlayer.uid
    ) {
      return;
    }

    if (
      Number(action.round) !==
      Number(roomData.round)
    ) {
      return;
    }

    const handRef =
      db
        .collection("rooms")
        .doc(roomId)
        .collection("hands")
        .doc(turnPlayer.uid);

    const roomRef =
      db
        .collection("rooms")
        .doc(roomId);

    const handSnap =
      await handRef.get();

    const roomSnap =
      await roomRef.get();

    if (!handSnap.exists ||
        !roomSnap.exists) {
      return;
    }

    const freshRoom =
      roomSnap.data() || {};

    const hand =
      decodeTiles(
        handSnap.data()?.tiles || []
      );

    let board =
      decodeTiles(
        freshRoom.board || []
      );

    let boneyard =
      decodeTiles(
        freshRoom.boneyard || []
      );

    let left =
      decodeTile(
        freshRoom.left
      );

    let right =
      decodeTile(
        freshRoom.right
      );

    let newHand =
      [...hand];

    let nextTurn =
      Number(freshRoom.turn || 0);

    let boardChanged =
      false;

    let handChanged =
      false;

    let drawOnly =
      false;

    /* =====================================================
       PLAY
       ===================================================== */

    if (
      action.type === "play"
    ) {
      const index =
        Number(action.index);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= hand.length
      ) {
        return;
      }

      const tile =
        hand[index];

      const side =
        action.side === "left"
          ? "left"
          : "right";

      const placement =
        placeOnline(
          board,
          tile,
          side
        );

      if (!placement) {
        return;
      }

      board =
        placement.board;

      left =
        placement.left;

      right =
        placement.right;

      newHand.splice(
        index,
        1
      );

      boardChanged = true;
      handChanged = true;
    }

    /* =====================================================
       DRAW
       ===================================================== */

    else if (
      action.type === "draw"
    ) {
      if (
        boneyard.length === 0
      ) {
        return;
      }

      const drawn =
        boneyard.pop();

      newHand.push(
        drawn
      );

      handChanged = true;
      drawOnly = true;
    }

    /* =====================================================
       PASS
       ===================================================== */

    else if (
      action.type === "pass"
    ) {
      if (
        boneyard.length > 0
      ) {
        return;
      }

      const hasPlayable =
        newHand.some(
          (tile) =>
            canOnlinePlay(
              tile,
              board
            )
        );

      if (hasPlayable) {
        return;
      }
    } else {
      return;
    }

    /* =====================================================
       UPDATE HAND
       ===================================================== */

    const handUpdate = {
      tiles: encodeTiles(
        newHand
      ),
      handCount:
        newHand.length,
      pips:
        sumPips(newHand),
      round:
        Number(
          freshRoom.round || 0
        ),
      updatedAt:
        serverTimestamp()
    };

    await handRef.set(
      handUpdate,
      { merge: true }
    );

    /* =====================================================
       DRAW:
       GILIRAN TETAP
       ===================================================== */

    if (drawOnly) {
      const updatedPlayers =
        players.map(
          (player) => {
            if (
              player.uid ===
              turnPlayer.uid
            ) {
              return {
                ...player,
                handCount:
                  newHand.length,
                pips:
                  sumPips(newHand)
              };
            }

            return player;
          }
        );

      await roomRef.update({
        players:
          updatedPlayers,
        boneyard:
          encodeTiles(
            boneyard
          ),
        updatedAt:
          serverTimestamp()
      });

      return;
    }

    /* =====================================================
       UPDATE PLAYER INFO
       ===================================================== */

    let updatedPlayers =
      players.map(
        (player) => {
          if (
            player.uid ===
            turnPlayer.uid
          ) {
            return {
              ...player,
              handCount:
                newHand.length,
              pips:
                sumPips(newHand)
            };
          }

          return player;
        }
      );

    /* =====================================================
       CHECK FINISH
       ===================================================== */

    if (
      newHand.length === 0
    ) {
      const resultData =
        calculateOnlineResults(
          updatedPlayers,
          {
            uid:
              turnPlayer.uid,
            name:
              turnPlayer.name,
            seat:
              turnPlayer.seat,
            handCount: 0,
            pips: 0
          }
        );

      await roomRef.update({
        players:
          updatedPlayers,

        board:
          encodeTiles(board),

        left:
          left
            ? encodeTile(left)
            : null,

        right:
          right
            ? encodeTile(right)
            : null,

        boneyard:
          encodeTiles(boneyard),

        finished:
          true,

        status:
          "playing",

        results:
          resultData,

        updatedAt:
          serverTimestamp()
      });

      return;
    }

    /* =====================================================
       CHECK BLOCK
       ===================================================== */

    const blocked =
      await isOnlineBlocked(
        board,
        boneyard,
        updatedPlayers
      );

    if (blocked) {
      const resultData =
        calculateBlockedResults(
          updatedPlayers
        );

      await roomRef.update({
        players:
          updatedPlayers,

        board:
          encodeTiles(board),

        left:
          left
            ? encodeTile(left)
            : null,

        right:
          right
            ? encodeTile(right)
            : null,

        boneyard:
          encodeTiles(boneyard),

        finished:
          true,

        status:
          "playing",

        results:
          resultData,

        updatedAt:
          serverTimestamp()
      });

      return;
    }

    /* =====================================================
       NEXT TURN
       ===================================================== */

    const currentIndex =
      players.findIndex(
        (player) =>
          Number(player.seat) ===
          Number(
            freshRoom.turn
          )
      );

    let nextIndex =
      currentIndex + 1;

    if (
      nextIndex >=
      players.length
    ) {
      nextIndex = 0;
    }

    nextTurn =
      Number(
        players[nextIndex].seat
      );

    /* =====================================================
       UPDATE ROOM
       ===================================================== */

    await roomRef.update({
      players:
        updatedPlayers,

      board:
        boardChanged
          ? encodeTiles(board)
          : freshRoom.board || [],

      left:
        left
          ? encodeTile(left)
          : null,

      right:
        right
          ? encodeTile(right)
          : null,

      boneyard:
        encodeTiles(boneyard),

      turn:
        nextTurn,

      finished:
        false,

      updatedAt:
        serverTimestamp()
    });
  }

  /* =========================================================
     ONLINE BLOCK CHECK
     ========================================================= */

  async function isOnlineBlocked(
    board,
    boneyard,
    players
  ) {
    if (
      boneyard &&
      boneyard.length > 0
    ) {
      return false;
    }

    if (
      !players ||
      players.length === 0
    ) {
      return false;
    }

    for (
      const player of players
    ) {
      try {
        const snap =
          await db
            .collection("rooms")
            .doc(roomId)
            .collection("hands")
            .doc(player.uid)
            .get();

        if (!snap.exists) {
          return false;
        }

        const hand =
          decodeTiles(
            snap.data()?.tiles || []
          );

        const playable =
          hand.some(
            (tile) =>
              canOnlinePlay(
                tile,
                board
              )
          );

        if (playable) {
          return false;
        }
      } catch (error) {
        console.error(
          "isOnlineBlocked:",
          error
        );

        return false;
      }
    }

    return true;
  }

  /* =========================================================
     ONLINE RESULTS
     ========================================================= */

  function calculateOnlineResults(
    players,
    winner
  ) {
    const list =
      players.map(
        (player) => ({
          uid:
            player.uid,
          name:
            player.name,
          seat:
            Number(player.seat),
          pips:
            player.uid === winner.uid
              ? 0
              : Number(
                  player.pips || 0
                ),
          handCount:
            player.uid === winner.uid
              ? 0
              : Number(
                  player.handCount || 0
                )
        })
      );

    list.sort(
      (a, b) => {
        if (
          a.uid === winner.uid
        ) {
          return -1;
        }

        if (
          b.uid === winner.uid
        ) {
          return 1;
        }

        return (
          Number(a.pips) -
          Number(b.pips)
        );
      }
    );

    return list.map(
      (item, index) => ({
        ...item,
        rank:
          index + 1,
        points:
          POINTS[index] ?? 0
      })
    );
  }

  function calculateBlockedResults(
    players
  ) {
    const list =
      players.map(
        (player) => ({
          uid:
            player.uid,
          name:
            player.name,
          seat:
            Number(player.seat),
          pips:
            Number(
              player.pips || 0
            ),
          handCount:
            Number(
              player.handCount || 0
            )
        })
      );

    list.sort(
      (a, b) =>
        Number(a.pips) -
        Number(b.pips)
    );

    return list.map(
      (item, index) => ({
        ...item,
        rank:
          index + 1,
        points:
          POINTS[index] ?? 0
      })
    );
  }

  /* =========================================================
     RENDER ONLINE RESULT
     ========================================================= */

  function renderOnlineResults() {
    if (!roomData?.finished) {
      return;
    }

    const results =
      Array.isArray(
        roomData.results
      )
        ? roomData.results
        : [];

    if (!results.length) {
      return;
    }

    showModal(
      "Ronde Selesai",
      "Hasil ronde online",
      results
    );

    const nextBtn =
      $("nextBtn");

    if (nextBtn) {
      nextBtn.disabled =
        roomData.hostUid !==
        currentUid;
    }
  }

  /* =========================================================
     SHOW APP
     ========================================================= */

  function showApp() {
    hide("loginScreen");
    show("app");

    setText(
      "welcome",
      mode === "online"
        ? "Mode Online"
        : "Mode Lokal"
    );
  }

  /* =========================================================
     LOCAL GAME
     ========================================================= */

  function getHumanCount() {
    return Number(
      $("humanCount")?.value || 1
    );
  }

  function createLocalPlayers() {
    const humanCount =
      getHumanCount();

    const names = [
      String(
        $("name1")?.value || ""
      ).trim() ||
        "Pemain 1",

      String(
        $("name2")?.value || ""
      ).trim() ||
        "Pemain 2",

      String(
        $("name3")?.value || ""
      ).trim() ||
        "Pemain 3"
    ];

    const players = [];

    for (
      let i = 0;
      i < humanCount;
      i++
    ) {
      players.push({
        id: `local-${i}`,
        name:
          names[i] ||
          `Pemain ${i + 1}`,
        seat: i,
        human: true,
        hand: [],
        pips: 0,
        handCount: 0
      });
    }

    while (
      players.length < 4
    ) {
      const seat =
        players.length;

      players.push({
        id:
          `local-ai-${seat}`,
        name:
          `AI ${seat + 1}`,
        seat,
        human: false,
        hand: [],
        pips: 0,
        handCount: 0
      });
    }

    return players;
  }

  /* =========================================================
     START LOCAL
     ========================================================= */

  function startLocalGame(
    newRound = true
  ) {
    saveNames();

    mode = "local";

    localPlayers =
      createLocalPlayers();

    const deck =
      shuffle(deck28());

    localPlayers.forEach(
      (player) => {
        player.hand =
          deck.splice(0, 7);

        player.handCount =
          player.hand.length;

        player.pips =
          sumPips(
            player.hand
          );
      }
    );

    localBoneyard =
      deck;

    localBoard = [];
    localLeft = null;
    localRight = null;
    localTurn = 0;
    localFinished = false;
    localResults = [];

    if (newRound) {
      localRound = 1;
    }

    showApp();

    setText(
      "roomCode",
      "LOCAL"
    );

    setText(
      "onlineState",
      "Lokal"
    );

    setText(
      "roundNo",
      String(localRound)
    );

    hide("waitingCard");

    setStatus(
      "Game lokal dimulai.",
      "success"
    );

    renderLocalGame();
  }

  /* =========================================================
     RENDER LOCAL
     ========================================================= */

  function renderLocalGame() {
    renderLocalPlayers();

    renderBoard(
      localBoard,
      localLeft,
      localRight
    );

    setText(
      "boneyardInfo",
      `Sisa tumpukan: ${localBoneyard.length}`
    );

    const turnPlayer =
      localPlayers[
        localTurn
      ];

    setText(
      "turnName",
      turnPlayer?.name || "-"
    );

    if (localFinished) {
      renderLocalResults();
      return;
    }

    renderLocalHand();
  }

  /* =========================================================
     LOCAL PLAYERS
     ========================================================= */

  function renderLocalPlayers() {
    const container =
      $("players");

    if (!container) return;

    container.innerHTML = "";

    localPlayers.forEach(
      (player, index) => {
        const isTurn =
          index ===
          localTurn;

        const div =
          document.createElement("div");

        div.className =
          "player" +
          (isTurn
            ? " active"
            : "");

        div.innerHTML = `
          <div class="player-name">
            ${escapeHtml(
              player.name
            )}
            ${
              player.human
                ? ""
                : " 🤖"
            }
          </div>

          <div class="player-info">
            ${player.hand.length} batu
            • ${sumPips(
                player.hand
              )} angka
          </div>
        `;

        container.appendChild(div);
      }
    );
  }

  /* =========================================================
     LOCAL HAND
     ========================================================= */

  function renderLocalHand() {
    const container =
      $("hand");

    if (!container) return;

    container.innerHTML = "";

    const player =
      localPlayers[
        localTurn
      ];

    if (!player) return;

    setText(
      "handTitle",
      player.human
        ? `${player.name} • GILIRAN ANDA`
        : `${player.name} • Giliran AI`
    );

    if (!player.human) {
      updateLocalControls(
        false
      );

      return;
    }

    player.hand.forEach(
      (tile, index) => {
        const playable =
          canOnlinePlay(
            tile,
            localBoard
          );

        const el =
          createTileElement(
            tile,
            {
              index,
              disabled:
                !playable
            }
          );

        if (playable) {
          el.addEventListener(
            "click",
            () => {
              localChooseTile(
                index
              );
            }
          );
        }

        container.appendChild(
          el
        );
      }
    );

    updateLocalControls(
      true
    );
  }

  /* =========================================================
     LOCAL CONTROL
     ========================================================= */

  function updateLocalControls(
    myTurn
  ) {
    const draw =
      $("drawBtn");

    const pass =
      $("passBtn");

    if (draw) {
      draw.disabled =
        !myTurn ||
        localBoneyard.length ===
          0;
    }

    if (pass) {
      pass.disabled =
        !myTurn;
    }
  }

  /* =========================================================
     LOCAL CHOOSE TILE
     ========================================================= */

  function localChooseTile(
    index
  ) {
    const player =
      localPlayers[
        localTurn
      ];

    if (
      !player ||
      !player.human
    ) {
      return;
    }

    const tile =
      player.hand[index];

    if (!tile) return;

    if (
      localBoard.length === 0
    ) {
      localPlayTile(
        index,
        "right"
      );

      return;
    }

    const first =
      localBoard[0];

    const last =
      localBoard[
        localBoard.length - 1
      ];

    const canLeft =
      tile[0] === first[0] ||
      tile[1] === first[0];

    const canRight =
      tile[0] === last[1] ||
      tile[1] === last[1];

    if (
      canLeft &&
      canRight
    ) {
      const left =
        confirm(
          `Batu ${tile[0]}-${tile[1]}\n\n` +
          `OK = KIRI\n` +
          `Batal = KANAN`
        );

      localPlayTile(
        index,
        left
          ? "left"
          : "right"
      );

      return;
    }

    if (canLeft) {
      localPlayTile(
        index,
        "left"
      );
      return;
    }

    if (canRight) {
      localPlayTile(
        index,
        "right"
      );
      return;
    }

    setStatus(
      "Batu tidak cocok dengan meja.",
      "warning"
    );
  }

  /* =========================================================
     LOCAL PLAY
     ========================================================= */

  function localPlayTile(
    index,
    side
  ) {
    const player =
      localPlayers[
        localTurn
      ];

    if (!player) return;

    const tile =
      player.hand[index];

    if (!tile) return;

    const placement =
      placeOnline(
        localBoard,
        tile,
        side
      );

    if (!placement) {
      setStatus(
        "Batu tidak cocok.",
        "warning"
      );
      return;
    }

    localBoard =
      placement.board;

    localLeft =
      placement.left;

    localRight =
      placement.right;

    player.hand.splice(
      index,
      1
    );

    player.handCount =
      player.hand.length;

    player.pips =
      sumPips(
        player.hand
      );

    if (
      player.hand.length === 0
    ) {
      finishLocalGame(
        player
      );
      return;
    }

    nextLocalTurn();
  }

  /* =========================================================
     LOCAL DRAW
     ========================================================= */

  function localDraw() {
    const player =
      localPlayers[
        localTurn
      ];

    if (
      !player ||
      !player.human
    ) {
      return;
    }

    if (
      localBoneyard.length === 0
    ) {
      setStatus(
        "Tumpukan sudah habis.",
        "warning"
      );
      return;
    }

    const tile =
      localBoneyard.pop();

    player.hand.push(
      tile
    );

    player.handCount =
      player.hand.length;

    player.pips =
      sumPips(
        player.hand
      );

    setStatus(
      `${player.name} mengambil batu ${tile[0]}-${tile[1]}.`,
      ""
    );

    renderLocalGame();

    /* Setelah mengambil, tetap giliran pemain.
       Jika batu cocok, pemain dapat langsung memainkannya. */
  }

  /* =========================================================
     LOCAL PASS
     ========================================================= */

  function localPass() {
    const player =
      localPlayers[
        localTurn
      ];

    if (
      !player ||
      !player.human
    ) {
      return;
    }

    if (
      localBoneyard.length > 0
    ) {
      setStatus(
        "Masih ada batu di tumpukan. Ambil batu dulu.",
        "warning"
      );
      return;
    }

    const playable =
      player.hand.some(
        (tile) =>
          canOnlinePlay(
            tile,
            localBoard
          )
      );

    if (playable) {
      setStatus(
        "Masih ada batu yang bisa dimainkan.",
        "warning"
      );
      return;
    }

    nextLocalTurn();
  }

  /* =========================================================
     NEXT LOCAL TURN
     ========================================================= */

  function nextLocalTurn() {
    localTurn++;

    if (
      localTurn >=
      localPlayers.length
    ) {
      localTurn = 0;
    }

    renderLocalGame();

    const player =
      localPlayers[
        localTurn
      ];

    if (
      player &&
      !player.human
    ) {
      setTimeout(
        localAiTurn,
        500
      );
    }
  }

  /* =========================================================
     AI TURN
     ========================================================= */

  function localAiTurn() {
    if (
      mode !== "local" ||
      localFinished
    ) {
      return;
    }

    const player =
      localPlayers[
        localTurn
      ];

    if (
      !player ||
      player.human
    ) {
      return;
    }

    let playableIndex =
      -1;

    for (
      let i = 0;
      i < player.hand.length;
      i++
    ) {
      if (
        canOnlinePlay(
          player.hand[i],
          localBoard
        )
      ) {
        playableIndex = i;
        break;
      }
    }

    if (
      playableIndex >= 0
    ) {
      const tile =
        player.hand[
          playableIndex
        ];

      let side =
        "right";

      if (
        localBoard.length > 0
      ) {
        const first =
          localBoard[0];

        const last =
          localBoard[
            localBoard.length - 1
          ];

        const left =
          tile[0] === first[0] ||
          tile[1] === first[0];

        const right =
          tile[0] === last[1] ||
          tile[1] === last[1];

        if (left && !right) {
          side = "left";
        } else if (
          left &&
          right
        ) {
          side =
            Math.random() < 0.5
              ? "left"
              : "right";
        }
      }

      localPlayTile(
        playableIndex,
        side
      );

      return;
    }

    if (
      localBoneyard.length > 0
    ) {
      const tile =
        localBoneyard.pop();

      player.hand.push(
        tile
      );

      player.handCount =
        player.hand.length;

      player.pips =
        sumPips(
          player.hand
        );

      renderLocalGame();

      setTimeout(
        localAiTurn,
        400
      );

      return;
    }

    setTimeout(
      () => {
        nextLocalTurn();
      },
      300
    );
  }

  /* =========================================================
     LOCAL FINISH
     ========================================================= */

  function finishLocalGame(
    winner
  ) {
    localFinished = true;

    localResults =
      localPlayers
        .map(
          (player) => ({
            id:
              player.id,
            name:
              player.name,
            pips:
              player.id ===
              winner.id
                ? 0
                : sumPips(
                    player.hand
                  ),
            handCount:
              player.hand.length
          })
        )
        .sort(
          (a, b) =>
            a.pips - b.pips
        )
        .map(
          (player, index) => ({
            ...player,
            rank:
              index + 1,
            points:
              POINTS[index] ?? 0
          })
        );

    updateLocalLeague();

    renderLocalGame();
  }

  /* =========================================================
     LOCAL LEAGUE
     ========================================================= */

  function updateLocalLeague() {
    const league =
      loadLeague();

    localResults.forEach(
      (result) => {
        if (
          !league[result.name]
        ) {
          league[result.name] = {
            rounds: 0,
            wins: 0,
            points: 0
          };
        }

        league[result.name]
          .rounds++;

        league[result.name]
          .points +=
            Number(
              result.points || 0
            );

        if (
          Number(result.rank) === 1
        ) {
          league[result.name]
            .wins++;
        }
      }
    );

    saveLeague(
      league
    );
  }

  function renderStandings() {
    const tbody =
      $("standings");

    if (!tbody) return;

    const league =
      loadLeague();

    const list =
      Object.entries(
        league
      )
        .map(
          ([name, data]) => ({
            name,
            rounds:
              Number(
                data.rounds || 0
              ),
            wins:
              Number(
                data.wins || 0
              ),
            points:
              Number(
                data.points || 0
              )
          })
        )
        .sort(
          (a, b) =>
            b.points -
            a.points
        );

    tbody.innerHTML = "";

    list.forEach(
      (player, index) => {
        const tr =
          document.createElement("tr");

        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${escapeHtml(
            player.name
          )}</td>
          <td>${player.rounds}</td>
          <td>${player.wins}</td>
          <td>${player.points}</td>
        `;

        tbody.appendChild(
          tr
        );
      }
    );

    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            Belum ada data liga.
          </td>
        </tr>
      `;
    }
  }

  /* =========================================================
     LOCAL RESULT
     ========================================================= */

  function renderLocalResults() {
    if (
      !localResults.length
    ) {
      return;
    }

    showModal(
      "Ronde Selesai",
      "Hasil ronde lokal",
      localResults
    );

    const nextBtn =
      $("nextBtn");

    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  /* =========================================================
     MODAL
     ========================================================= */

  function showModal(
    title,
    sub,
    results
  ) {
    const modal =
      $("modal");

    if (!modal) return;

    setText(
      "modalTitle",
      title
    );

    setText(
      "modalSub",
      sub
    );

    const resultBox =
      $("results");

    if (!resultBox) return;

    resultBox.innerHTML = "";

    results.forEach(
      (result) => {
        const div =
          document.createElement("div");

        div.className =
          "result-row";

        div.innerHTML = `
          <div>
            <strong>
              #${result.rank}
              ${escapeHtml(
                result.name
              )}
            </strong>
            <small>
              ${Number(
                result.pips || 0
              )} angka
            </small>
          </div>

          <strong>
            +${Number(
              result.points || 0
            )}
          </strong>
        `;

        resultBox.appendChild(
          div
        );
      }
    );

    show("modal");
  }

  function closeModal() {
    hide("modal");
  }

  /* =========================================================
     NEXT ROUND
     ========================================================= */

  async function nextRound() {
    closeModal();

    if (mode === "local") {
      localRound++;

      startLocalGame(
        false
      );

      return;
    }

    if (
      mode === "online" &&
      roomData &&
      roomData.hostUid ===
        currentUid
    ) {
      await startOnlineRound();
    }
  }

  /* =========================================================
     LEAVE / MENU
     ========================================================= */

  function goMenu() {
    if (roomUnsub) {
      roomUnsub();
      roomUnsub = null;
    }

    if (actionUnsub) {
      actionUnsub();
      actionUnsub = null;
    }

    if (handUnsub) {
      handUnsub();
      handUnsub = null;
    }

    roomId = null;
    roomData = null;
    onlineHand = [];
    processingActions = {};

    mode = "local";

    hide("app");
    show("loginScreen");

    closeModal();

    setText(
      "roomCode",
      "LOCAL"
    );

    setText(
      "onlineState",
      "Lokal"
    );
  }

  /* =========================================================
     COPY ROOM
     ========================================================= */

  async function copyRoom() {
    const code =
      roomData?.code ||
      roomId;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        code
      );

      setStatus(
        "Kode room berhasil disalin: " +
          code,
        "success"
      );
    } catch (error) {
      window.prompt(
        "Salin kode room:",
        code
      );
    }
  }

  /* =========================================================
     TABS
     ========================================================= */

  function switchMode(
    newMode
  ) {
    mode = newMode;

    const localTab =
      $("localTab");

    const onlineTab =
      $("onlineTab");

    const localPanel =
      $("localPanel");

    const onlinePanel =
      $("onlinePanel");

    if (
      newMode === "local"
    ) {
      localTab?.classList.add(
        "active"
      );

      onlineTab?.classList.remove(
        "active"
      );

      localPanel?.classList.remove(
        "hidden"
      );

      onlinePanel?.classList.add(
        "hidden"
      );
    } else {
      localTab?.classList.remove(
        "active"
      );

      onlineTab?.classList.add(
        "active"
      );

      localPanel?.classList.add(
        "hidden"
      );

      onlinePanel?.classList.remove(
        "hidden"
      );

      if (
        firebaseReady
      ) {
        setFirebaseStatus(
          "Firebase Connected",
          "success"
        );
      }
    }
  }

  /* =========================================================
     HUMAN COUNT UI
     ========================================================= */

  function updateHumanInputs() {
    const count =
      getHumanCount();

    if (count >= 2) {
      $("name2Wrap")
        ?.classList.remove(
          "hidden"
        );
    } else {
      $("name2Wrap")
        ?.classList.add(
          "hidden"
        );
    }

    if (count >= 3) {
      $("name3Wrap")
        ?.classList.remove(
          "hidden"
        );
    } else {
      $("name3Wrap")
        ?.classList.add(
          "hidden"
        );
    }
  }

  /* =========================================================
     RESET LEAGUE
     ========================================================= */

  function resetLeague() {
    const yes =
      confirm(
        "Hapus semua data Liga lokal?"
      );

    if (!yes) return;

    localStorage.removeItem(
      LEAGUE_KEY
    );

    renderStandings();

    setStatus(
      "Data Liga berhasil dihapus.",
      "success"
    );
  }

  /* =========================================================
     EVENT HANDLERS
     ========================================================= */

  function bindEvents() {
    $("localTab")
      ?.addEventListener(
        "click",
        () =>
          switchMode(
            "local"
          )
      );

    $("onlineTab")
      ?.addEventListener(
        "click",
        () =>
          switchMode(
            "online"
          )
      );

    $("humanCount")
      ?.addEventListener(
        "change",
        updateHumanInputs
      );

    $("startLocalBtn")
      ?.addEventListener(
        "click",
        () =>
          startLocalGame(
            true
          )
      );

    $("createRoomBtn")
      ?.addEventListener(
        "click",
        createRoom
      );

    $("joinRoomBtn")
      ?.addEventListener(
        "click",
        joinRoom
      );

    $("roomCodeInput")
      ?.addEventListener(
        "input",
        (event) => {
          event.target.value =
            event.target.value
              .toUpperCase()
              .replace(
                /[^A-Z0-9]/g,
                ""
              )
              .slice(0, 6);
        }
      );

    $("startOnlineBtn")
      ?.addEventListener(
        "click",
        startOnlineRound
      );

    $("drawBtn")
      ?.addEventListener(
        "click",
        () => {
          if (
            mode === "local"
          ) {
            localDraw();
          } else {
            sendOnlineAction(
              "draw"
            );
          }
        }
      );

    $("passBtn")
      ?.addEventListener(
        "click",
        () => {
          if (
            mode === "local"
          ) {
            localPass();
          } else {
            sendOnlineAction(
              "pass"
            );
          }
        }
      );

    $("newGameBtn")
      ?.addEventListener(
        "click",
        goMenu
      );

    $("leagueBtn")
      ?.addEventListener(
        "click",
        () => {
          renderStandings();

          $("gamePage")
            ?.classList.remove(
              "active"
            );

          $("leaguePage")
            ?.classList.add(
              "active"
            );
        }
      );

    $("resetLeague")
      ?.addEventListener(
        "click",
        resetLeague
      );

    $("copyRoomBtn")
      ?.addEventListener(
        "click",
        copyRoom
      );

    $("nextBtn")
      ?.addEventListener(
        "click",
        nextRound
      );

    $("modal")
      ?.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            $("modal")
          ) {
            closeModal();
          }
        }
      );
  }

  /* =========================================================
     NAV PAGE
     ========================================================= */

  function setupPageNavigation() {
    $("newGameBtn")
      ?.addEventListener(
        "click",
        () => {
          $("leaguePage")
            ?.classList.remove(
              "active"
            );

          $("gamePage")
            ?.classList.add(
              "active"
            );
        }
      );
  }

  /* =========================================================
     INITIALIZE
     ========================================================= */

  async function init() {
    loadNames();

    updateHumanInputs();

    bindEvents();

    setupPageNavigation();

    switchMode(
      "local"
    );

    renderStandings();

    setFirebaseStatus(
      "Menghubungkan Firebase...",
      ""
    );

    await initFirebase();

    /*
     * Anonymous Auth berhasil.
     * Sekarang listener action boleh dipasang
     * jika room sudah tersedia.
     */

    if (
      roomId
    ) {
      subscribeActions();
      subscribeMyHand();
    }
  }

  /* =========================================================
     AUTH STATE
     ========================================================= */

  function watchAuth() {
    if (
      !auth
    ) {
      return;
    }

    auth.onAuthStateChanged(
      (user) => {
        if (user) {
          currentUid =
            user.uid;

          console.log(
            "Firebase UID:",
            currentUid
          );

          if (
            roomId
          ) {
            subscribeMyHand();
            subscribeActions();
          }
        }
      }
    );
  }

  /* =========================================================
     START
     ========================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    async () => {
      await init();

      watchAuth();

      console.log(
        "Mbicukia Domino FINAL loaded."
      );
    }
  );

})();
