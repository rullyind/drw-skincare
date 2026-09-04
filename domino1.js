(function () {
  "use strict";

  /* =========================================================
     MBICUKIA DOMINO
     DOMINO1.JS — FINAL 7 KARTU
     
     MODE:
     - LOCAL
     - ONLINE FIREBASE

     ATURAN:
     - Semua pemain mendapat 7 batu
     - Tidak ada Ambil Kartu
     - Jika tidak punya batu yang cocok = PASS
     - Jika semua pemain PASS = permainan buntu
     - Angka/titik paling kecil = pemenang
     - Jika pemain menghabiskan batu = langsung menang
     ========================================================= */

  const $ = id => document.getElementById(id);

  const POINTS = [3, 2, 1, 0];

  const LEAGUE_KEY = "d2t_domino_local_league_v3";
  const NAME_KEY = "d2t_domino_local_names_v3";

  /* =========================================================
     STATE
     ========================================================= */

  let mode = "menu";

  let currentUid = null;
  let authUser = null;
  let db = null;

  let roomId = null;
  let roomData = null;

  let roomUnsub = null;
  let actionUnsub = null;

  let localGame = null;

  let league = [];

  let localPassCount = 0;

  let processingActions = new Set();

  /* =========================================================
     DOMINO DECK
     ========================================================= */

  function deck28() {
    const d = [];

    for (let a = 0; a <= 6; a++) {
      for (let b = a; b <= 6; b++) {
        d.push([a, b]);
      }
    }

    return d;
  }

  function shuffle(array) {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  function sumPips(hand) {
    return (hand || []).reduce((sum, tile) => {
      return sum + Number(tile[0]) + Number(tile[1]);
    }, 0);
  }

  function tileKey(tile) {
    return `${tile[0]}-${tile[1]}`;
  }

  /* =========================================================
     FIRESTORE TILE FORMAT
     
     Firestore tidak boleh menyimpan array di dalam array.
     
     [6,5]
     menjadi
     "6-5"
     ========================================================= */

  function encodeTile(tile) {
    return `${Number(tile[0])}-${Number(tile[1])}`;
  }

  function decodeTile(value) {
    if (Array.isArray(value)) {
      return [
        Number(value[0]),
        Number(value[1])
      ];
    }

    const parts = String(value || "").split("-");

    return [
      Number(parts[0]),
      Number(parts[1])
    ];
  }

  function encodeTiles(tiles) {
    return (tiles || []).map(encodeTile);
  }

  function decodeTiles(tiles) {
    return (tiles || []).map(decodeTile);
  }

  /* =========================================================
     HTML SAFETY
     ========================================================= */

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char])
    );
  }

  /* =========================================================
     DOMINO PIP
     ========================================================= */

  const PIP_POSITIONS = {
    0: [],
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  function pipHTML(number) {
    return `
      <div class="domino-half" aria-label="${number} titik">
        ${
          PIP_POSITIONS[number]
            .map(pos => `<span class="pip p${pos}"></span>`)
            .join("")
        }
      </div>
    `;
  }

  function tileHTML(tile, className = "tile") {
    return `
      <div
        class="${className}"
        data-a="${tile[0]}"
        data-b="${tile[1]}"
      >
        ${pipHTML(tile[0])}
        <i class="domino-divider"></i>
        ${pipHTML(tile[1])}
      </div>
    `;
  }

  /* =========================================================
     STATUS
     ========================================================= */

  function setStatus(message) {
    const el = $("status");

    if (el) {
      el.textContent = message || "";
    }
  }

  /* =========================================================
     FIREBASE
     ========================================================= */

  function firebaseReady() {
    return !!(
      window.firebase &&
      window.D2T_FIREBASE_CONFIG &&
      !String(
        window.D2T_FIREBASE_CONFIG.apiKey || ""
      ).startsWith("GANTI_")
    );
  }

  async function initFirebase() {
    const status = $("firebaseStatus");

    try {
      if (!window.firebase) {
        if (status) {
          status.textContent =
            "🔴 Firebase SDK tidak termuat.";
        }

        return;
      }

      if (!window.D2T_FIREBASE_CONFIG) {
        if (status) {
          status.textContent =
            "🔴 Konfigurasi Firebase tidak ditemukan.";
        }

        return;
      }

      if (!firebaseReady()) {
        if (status) {
          status.textContent =
            "🔴 API Key Firebase belum diisi.";
        }

        return;
      }

      let app;

      if (firebase.apps.length) {
        app = firebase.app();

        const existingProject =
          app.options?.projectId || "";

        const wantedProject =
          window.D2T_FIREBASE_CONFIG.projectId || "";

        if (
          existingProject &&
          wantedProject &&
          existingProject !== wantedProject
        ) {
          throw new Error(
            "Firebase project bentrok. Pastikan hanya Firebase Domino yang digunakan."
          );
        }
      } else {
        app = firebase.initializeApp(
          window.D2T_FIREBASE_CONFIG
        );
      }

      db = app.firestore();

      const auth = app.auth();

      if (status) {
        status.textContent =
          "⏳ Masuk sebagai pemain...";
      }

      const credential =
        await auth.signInAnonymously();

      authUser = credential.user;

      currentUid = credential.user.uid;

      if (status) {
        status.textContent =
          "🟢 Firebase terhubung.";
      }

      if ($("createRoomBtn")) {
        $("createRoomBtn").disabled = false;
      }

      if ($("joinRoomBtn")) {
        $("joinRoomBtn").disabled = false;
      }

      console.log(
        "D2T Domino Firebase:",
        currentUid
      );

    } catch (error) {

      console.error(
        "Firebase initialization error:",
        error
      );

      let message =
        error?.message ||
        error?.code ||
        String(error);

      if (
        error?.code ===
        "auth/operation-not-allowed"
      ) {
        message =
          "Anonymous Login belum diaktifkan di Firebase Authentication.";
      }

      if (
        error?.code ===
        "auth/unauthorized-domain"
      ) {
        message =
          "Domain website belum diizinkan di Firebase Authentication.";
      }

      if (
        error?.code ===
        "auth/network-request-failed"
      ) {
        message =
          "Koneksi Firebase gagal. Periksa internet.";
      }

      if (status) {
        status.textContent =
          "🔴 Firebase gagal: " + message;
      }
    }
  }

  /* =========================================================
     NAMES
     ========================================================= */

  function loadNames() {
    try {
      const names =
        JSON.parse(
          localStorage.getItem(NAME_KEY) || "[]"
        );

      if ($("name1")) {
        $("name1").value = names[0] || "";
      }

      if ($("name2")) {
        $("name2").value = names[1] || "";
      }

      if ($("name3")) {
        $("name3").value = names[2] || "";
      }

    } catch (error) {
      console.warn(
        "Gagal membaca nama pemain.",
        error
      );
    }
  }

  function saveNames() {
    localStorage.setItem(
      NAME_KEY,
      JSON.stringify([
        $("name1")?.value.trim() || "",
        $("name2")?.value.trim() || "",
        $("name3")?.value.trim() || ""
      ])
    );
  }

  /* =========================================================
     LEAGUE
     ========================================================= */

  function loadLeague() {
    try {
      league =
        JSON.parse(
          localStorage.getItem(
            LEAGUE_KEY
          ) || "[]"
        );
    } catch {
      league = [];
    }

    renderLeague();
  }

  function saveLeague() {
    localStorage.setItem(
      LEAGUE_KEY,
      JSON.stringify(league)
    );

    renderLeague();
  }

  function ensureLeague(name) {
    if (!name) return;

    if (
      !league.some(
        player => player.name === name
      )
    ) {
      league.push({
        name,
        rounds: 0,
        wins: 0,
        points: 0
      });
    }
  }

  function renderLeague() {
    const table = $("standings");

    if (!table) return;

    const sorted = [...league].sort(
      (a, b) =>
        Number(b.points) -
          Number(a.points) ||
        Number(b.wins) -
          Number(a.wins) ||
        a.name.localeCompare(b.name)
    );

    table.innerHTML = sorted
      .map(
        (player, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <b>${esc(player.name)}</b>
            </td>
            <td>${player.rounds}</td>
            <td>${player.wins}</td>
            <td>
              <b>${player.points}</b>
            </td>
          </tr>
        `
      )
      .join("");
  }

  /* =========================================================
     TAB
     ========================================================= */

  function switchTab(type) {

    if ($("localTab")) {
      $("localTab").classList.toggle(
        "active",
        type === "local"
      );
    }

    if ($("onlineTab")) {
      $("onlineTab").classList.toggle(
        "active",
        type === "online"
      );
    }

    if ($("localPanel")) {
      $("localPanel").classList.toggle(
        "hidden",
        type !== "local"
      );
    }

    if ($("onlinePanel")) {
      $("onlinePanel").classList.toggle(
        "hidden",
        type !== "online"
      );
    }
  }

  /* =========================================================
     PLAYER COUNT
     ========================================================= */

  function updateNameInputs() {

    const count =
      Number($("humanCount")?.value || 1);

    if ($("name2Wrap")) {
      $("name2Wrap").classList.toggle(
        "hidden",
        count < 2
      );
    }

    if ($("name3Wrap")) {
      $("name3Wrap").classList.toggle(
        "hidden",
        count < 3
      );
    }
  }

  /* =========================================================
     ROOM
     ========================================================= */

  function newRoomCode() {

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
      code +=
        chars[
          Math.floor(
            Math.random() * chars.length
          )
        ];
    }

    return code;
  }

  function playerList(room) {

    return [...(room?.players || [])]
      .sort(
        (a, b) =>
          Number(a.seat) -
          Number(b.seat)
      );
  }

  function roomRef() {

    if (!db || !roomId) {
      throw new Error(
        "Firebase room belum siap."
      );
    }

    return db
      .collection("rooms")
      .doc(roomId);
  }

  /* =========================================================
     CREATE ROOM
     ========================================================= */

  if ($("createRoomBtn")) {

    $("createRoomBtn").onclick =
      async function () {

        if (!db || !currentUid) {
          alert(
            "Firebase belum siap."
          );

          return;
        }

        const name =
          $("onlineName")?.value.trim();

        if (!name) {
          alert(
            "Masukkan nama pemain."
          );

          return;
        }

        roomId = newRoomCode();

        const player = {
          uid: currentUid,
          name,
          seat: 0,
          handCount: 0,
          pips: 0
        };

        try {

          await roomRef().set({

            code: roomId,

            hostUid: currentUid,

            players: [player],

            status: "lobby",

            round: 0,

            board: [],

            left: null,

            right: null,

            turn: 0,

            /* Tidak digunakan.
               Disimpan kosong agar kompatibel. */
            boneyard: [],

            /* Jumlah PASS berturut-turut */
            consecutivePasses: 0,

            finished: false,

            blocked: false,

            finishReason: null,

            results: [],

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
          });

          mode = "online";

          subscribeRoom();

          subscribeActions();

          showApp(
            name,
            roomId,
            true
          );

        } catch (error) {

          console.error(
            "Create room:",
            error
          );

          alert(
            "Gagal membuat room:\n\n" +
            error.message
          );
        }
      };
  }

  /* =========================================================
     JOIN ROOM
     ========================================================= */

  if ($("joinRoomBtn")) {

    $("joinRoomBtn").onclick =
      async function () {

        if (!db || !currentUid) {
          alert(
            "Firebase belum siap."
          );

          return;
        }

        const name =
          $("onlineName")?.value.trim();

        const code =
          $("roomCodeInput")
            ?.value
            .trim()
            .toUpperCase();

        if (!name) {
          alert(
            "Masukkan nama pemain."
          );

          return;
        }

        if (!code) {
          alert(
            "Masukkan kode room."
          );

          return;
        }

        roomId = code;

        try {

          const ref = roomRef();

          const snapshot =
            await ref.get();

          if (!snapshot.exists) {
            alert(
              "Room tidak ditemukan."
            );

            return;
          }

          const data =
            snapshot.data();

          const players =
            playerList(data);

          if (
            data.status === "playing"
          ) {
            alert(
              "Game sudah dimulai."
            );

            return;
          }

          if (
            data.status === "finished"
          ) {
            alert(
              "Room sudah selesai."
            );

            return;
          }

          if (
            players.some(
              p => p.uid === currentUid
            )
          ) {

            mode = "online";

            subscribeRoom();

            subscribeActions();

            showApp(
              name,
              code,
              currentUid === data.hostUid
            );

            return;
          }

          if (players.length >= 4) {
            alert(
              "Room sudah penuh. Maksimal 4 pemain."
            );

            return;
          }

          const seat =
            players.length;

          players.push({
            uid: currentUid,
            name,
            seat,
            handCount: 0,
            pips: 0
          });

          await ref.update({
            players
          });

          mode = "online";

          subscribeRoom();

          subscribeActions();

          showApp(
            name,
            code,
            false
          );

        } catch (error) {

          console.error(
            "Join room:",
            error
          );

          alert(
            "Gagal bergabung:\n\n" +
            error.message
          );
        }
      };
  }

  /* =========================================================
     SHOW APP
     ========================================================= */

  function showApp(
    name,
    code,
    isHost
  ) {

    if ($("loginScreen")) {
      $("loginScreen")
        .classList
        .add("hidden");
    }

    if ($("app")) {
      $("app")
        .classList
        .remove("hidden");
    }

    if ($("welcome")) {
      $("welcome").textContent =
        `${name} • Online`;
    }

    if ($("roomCode")) {
      $("roomCode").textContent =
        code;
    }

    if ($("onlineState")) {
      $("onlineState").textContent =
        isHost
          ? "Host"
          : "Online";
    }

    if ($("waitingCard")) {
      $("waitingCard")
        .classList
        .remove("hidden");
    }

    if ($("startOnlineBtn")) {
      $("startOnlineBtn")
        .classList
        .toggle(
          "hidden",
          !isHost
        );
    }

    setStatus(
      "Terhubung ke room."
    );
  }

  /* =========================================================
     SUBSCRIBE ROOM
     ========================================================= */

  function subscribeRoom() {

    if (roomUnsub) {
      roomUnsub();
    }

    roomUnsub =
      roomRef().onSnapshot(
        snapshot => {

          if (!snapshot.exists) {

            alert(
              "Room sudah dihapus."
            );

            location.reload();

            return;
          }

          const raw =
            snapshot.data();

          roomData = {

            id: snapshot.id,

            ...raw,

            board:
              decodeTiles(
                raw.board || []
              ),

            boneyard:
              decodeTiles(
                raw.boneyard || []
              )
          };

          renderOnlineRoom();

        },
        error => {

          console.error(
            "Room listener:",
            error
          );

          setStatus(
            "Koneksi Firebase: " +
            error.message
          );
        }
      );
  }

  /* =========================================================
     RENDER ONLINE ROOM
     ========================================================= */

  function renderOnlineRoom() {

    if (!roomData) return;

    const players =
      playerList(roomData);

    if ($("roomPlayers")) {

      $("roomPlayers").innerHTML =
        players
          .map(
            player => `
              <div class="slot">
                <b>
                  ${esc(player.name)}
                  ${
                    player.uid === currentUid
                      ? " 👤"
                      : ""
                  }
                </b>

                <small>
                  Kursi ${Number(player.seat) + 1}
                  ${
                    player.uid === roomData.hostUid
                      ? " • Host"
                      : ""
                  }
                </small>
              </div>
            `
          )
          .join("");
    }

if(roomData.status==="lobby"){
  $("waitingText").textContent=
    `Kode ${roomData.code} • ${ps.length}/4 pemain.`;
}else if(roomData.status==="finished"){
  $("waitingText").textContent=
    `Kode ${roomData.code} • Ronde ${roomData.round} selesai.`;
}else{
  $("waitingText").textContent=
    `Ronde ${roomData.round} sedang berjalan.`;
}
    if ($("startOnlineBtn")) {

      $("startOnlineBtn")
        .classList
        .toggle(
          "hidden",
          !(
            roomData.hostUid === currentUid &&
            roomData.status === "lobby" &&
            players.length >= 2
          )
        );
    }

$("waitingCard").classList.toggle(
  "hidden",
  roomData.status==="playing"
);
    if (
      roomData.status === "playing" ||
      roomData.status === "finished"
    ) {

      if ($("roomCode")) {
        $("roomCode").textContent =
          roomData.code;
      }

      renderOnlineGame();
    }
  }

  /* =========================================================
     START ONLINE ROUND
     
     SEMUA PEMAIN = 7 BATU
     
     Tidak ada boneyard.
     ========================================================= */

  async function startOnlineRound() {

    if (!roomData) return;

    if (
      roomData.hostUid !== currentUid
    ) {
      return;
    }

    const players =
      playerList(roomData);

    if (players.length < 2) {

      setStatus(
        "Minimal 2 pemain diperlukan."
      );

      return;
    }

    if (players.length > 4) {

      setStatus(
        "Maksimal 4 pemain."
      );

      return;
    }

    try {

      const deck =
        shuffle(deck28());

      const hands = {};

      /* Setiap pemain tepat 7 */
      players.forEach(player => {

        hands[player.uid] =
          deck.splice(0, 7);
      });

      const nextRound =
        Number(roomData.round || 0) + 1;

      const publicPlayers =
        players.map(player => ({
          ...player,

          handCount:
            hands[player.uid].length,

          pips:
            sumPips(
              hands[player.uid]
            )
        }));

      const batch =
        db.batch();

      players.forEach(player => {

        batch.set(
          roomRef()
            .collection("hands")
            .doc(player.uid),

          {
            tiles:
              encodeTiles(
                hands[player.uid]
              ),

            round: nextRound,

            updatedAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
          }
        );
      });

      await batch.commit();

      await roomRef().update({

        status: "playing",

        round: nextRound,

        players: publicPlayers,

        board: [],

        left: null,

        right: null,

        turn: 0,

        /* Tidak ada kartu cadangan */
        boneyard: [],

        /* PASS dimulai dari nol */
        consecutivePasses: 0,

        finished: false,

        blocked: false,

        finishReason: null,

        results: [],

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

      setStatus(
        "🎮 Ronde dimulai. Semua pemain mendapat 7 batu."
      );

    } catch (error) {

      console.error(
        "Start online round:",
        error
      );

      setStatus(
        "❌ Gagal memulai ronde: " +
        error.message
      );

      alert(
        "Gagal memulai ronde.\n\n" +
        error.message +
        "\n\nPastikan Firestore Rules mengizinkan penulisan."
      );
    }
  }

  if ($("startOnlineBtn")) {
    $("startOnlineBtn").onclick =
      startOnlineRound;
  }

  /* =========================================================
     ONLINE HAND
     ========================================================= */

  async function getMyHandOnline() {

    if (!currentUid) {
      return [];
    }

    const snapshot =
      await roomRef()
        .collection("hands")
        .doc(currentUid)
        .get();

    if (!snapshot.exists) {
      return [];
    }

    return decodeTiles(
      snapshot.data()?.tiles || []
    );
  }

  /* =========================================================
     CAN PLAY ONLINE
     ========================================================= */

  function canOnlinePlay(
    tile,
    board,
    left,
    right
  ) {

    if (!board.length) {
      return true;
    }

    return (
      Number(tile[0]) === Number(left) ||
      Number(tile[1]) === Number(left) ||
      Number(tile[0]) === Number(right) ||
      Number(tile[1]) === Number(right)
    );
  }

  /* =========================================================
     NORMALIZE TILE
     ========================================================= */

  function normalizeTile(
    tile,
    side,
    left,
    right
  ) {

    const t = [
      Number(tile[0]),
      Number(tile[1])
    ];

    if (
      side === "left" &&
      t[0] === Number(left) &&
      t[1] !== Number(left)
    ) {
      return [
        t[1],
        t[0]
      ];
    }

    if (
      side === "right" &&
      t[1] === Number(right) &&
      t[0] !== Number(right)
    ) {
      return [
        t[1],
        t[0]
      ];
    }

    return t;
  }

  /* =========================================================
     PLACE ONLINE TILE
     ========================================================= */

  function placeOnlineTile(
    board,
    tile,
    side,
    left,
    right
  ) {

    const t =
      normalizeTile(
        tile,
        side,
        left,
        right
      );

    if (!board.length) {

      return {
        board: [t],
        left: t[0],
        right: t[1]
      };
    }

    const result =
      board.slice();

    if (side === "left") {

      result.unshift(t);

      return {
        board: result,
        left: t[0],
        right
      };
    }

    result.push(t);

    return {
      board: result,
      left,
      right: t[1]
    };
  }

  /* =========================================================
     SEND ONLINE ACTION
     ========================================================= */

  async function sendOnlineAction(
    type,
    index = null,
    side = null
  ) {

    if (!roomData) return;

    if (
      roomData.status !== "playing"
    ) {
      return;
    }

    const players =
      playerList(roomData);

    const currentPlayer =
      players[roomData.turn];

    if (!currentPlayer) {
      return;
    }

    if (
      currentPlayer.uid !== currentUid
    ) {

      alert(
        "Bukan giliran kamu."
      );

      return;
    }

    try {

      if (type === "play") {
        setStatus(
          "Mengirim langkah..."
        );
      }

      if (type === "pass") {
        setStatus(
          "Mengirim PASS..."
        );
      }

      await roomRef()
        .collection("actions")
        .add({

          uid: currentUid,

          type,

          index,

          side,

          round:
            Number(roomData.round || 0),

          createdAtMs:
            Date.now(),

          createdAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          processed: false
        });

    } catch (error) {

      console.error(
        "Send action:",
        error
      );

      setStatus(
        "❌ Gagal mengirim langkah: " +
        error.message
      );
    }
  }

  /* =========================================================
     ACTION LISTENER
     ========================================================= */

  function subscribeActions() {

    if (actionUnsub) {
      actionUnsub();
    }

    actionUnsub =
      roomRef()
        .collection("actions")
        .orderBy(
          "createdAtMs",
          "asc"
        )
        .onSnapshot(
          snapshot => {

            snapshot
              .docChanges()
              .filter(
                change =>
                  change.type === "added"
              )
              .forEach(
                async change => {

                  if (
                    roomData?.hostUid !==
                    currentUid
                  ) {
                    return;
                  }

                  if (
                    processingActions.has(
                      change.doc.id
                    )
                  ) {
                    return;
                  }

                  processingActions.add(
                    change.doc.id
                  );

                  try {

                    await hostProcessAction(
                      change.doc.id,
                      change.doc.data()
                    );

                  } catch (error) {

                    console.error(
                      "Host action:",
                      error
                    );

                  } finally {

                    processingActions.delete(
                      change.doc.id
                    );
                  }
                }
              );
          },
          error => {

            console.error(
              "Action listener:",
              error
            );
          }
        );
  }

  /* =========================================================
     MARK ACTION
     ========================================================= */

  async function markActionProcessed(
    actionId
  ) {

    try {

      await roomRef()
        .collection("actions")
        .doc(actionId)
        .update({
          processed: true,
          processedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        });

    } catch (error) {

      console.warn(
        "Tidak dapat menandai action:",
        error
      );
    }
  }

  /* =========================================================
     HOST PROCESS ACTION
     
     INI BAGIAN PALING PENTING.
     
     consecutivePasses:
       play -> 0
       pass -> +1
     
     Jika:
       consecutivePasses >= jumlah pemain
     
     GAME LANGSUNG SELESAI.
     ========================================================= */

  async function hostProcessAction(
    actionId,
    action
  ) {

    if (!roomData) return;

    if (
      roomData.status !== "playing"
    ) {
      await markActionProcessed(
        actionId
      );

      return;
    }

    /* Ambil data ROOM TERBARU */
    const freshSnapshot =
      await roomRef().get();

    if (!freshSnapshot.exists) {
      return;
    }

    const fresh =
      freshSnapshot.data();

    const players =
      playerList(fresh);

    const turn =
      Number(fresh.turn || 0);

    const player =
      players[turn];

    if (!player) {
      return;
    }

    /* Action bukan milik pemain yang sedang giliran */
    if (
      action.uid !== player.uid
    ) {
      return;
    }

    /* Action dari ronde lama */
    if (
      Number(action.round || 0) !==
      Number(fresh.round || 0)
    ) {
      await markActionProcessed(
        actionId
      );

      return;
    }

    const handSnapshot =
      await roomRef()
        .collection("hands")
        .doc(player.uid)
        .get();

    let hand =
      decodeTiles(
        handSnapshot.data()?.tiles || []
      );

    let board =
      decodeTiles(
        fresh.board || []
      );

    let left =
      fresh.left === null ||
      fresh.left === undefined
        ? null
        : Number(fresh.left);

    let right =
      fresh.right === null ||
      fresh.right === undefined
        ? null
        : Number(fresh.right);

    let consecutivePasses =
      Number(
        fresh.consecutivePasses || 0
      );

    let changed = false;

    /* =====================================================
       PLAY
       ===================================================== */

    if (action.type === "play") {

      const index =
        Number(action.index);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= hand.length
      ) {

        await markActionProcessed(
          actionId
        );

        return;
      }

      const tile =
        hand[index];

      if (
        !canOnlinePlay(
          tile,
          board,
          left,
          right
        )
      ) {

        await markActionProcessed(
          actionId
        );

        return;
      }

      let side =
        action.side === "left" ||
        action.side === "right"
          ? action.side
          : "right";

      if (!board.length) {
        side = "right";
      }

      if (
        board.length &&
        side === "left" &&
        !(
          Number(tile[0]) === left ||
          Number(tile[1]) === left
        )
      ) {
        side = "right";
      }

      if (
        board.length &&
        side === "right" &&
        !(
          Number(tile[0]) === right ||
          Number(tile[1]) === right
        )
      ) {
        side = "left";
      }

      const placed =
        placeOnlineTile(
          board,
          tile,
          side,
          left,
          right
        );

      board =
        placed.board;

      left =
        placed.left;

      right =
        placed.right;

      hand.splice(index, 1);

      /* PEMAIN BERHASIL MAIN */
      consecutivePasses = 0;

      changed = true;
    }

    /* =====================================================
       PASS
       ===================================================== */

    else if (
      action.type === "pass"
    ) {

      /*
       * Karena sekarang TIDAK ADA AMBIL KARTU,
       * pemain boleh PASS bila tidak punya batu
       * yang bisa dipasang.
       */

      const playable =
        hand.some(tile =>
          canOnlinePlay(
            tile,
            board,
            left,
            right
          )
        );

      if (playable) {

        await markActionProcessed(
          actionId
        );

        return;
      }

      /* Pemain benar-benar tidak bisa main */
      consecutivePasses++;

      changed = true;
    }

    /* =====================================================
       ACTION TIDAK DIKENAL
       ===================================================== */

    else {

      await markActionProcessed(
        actionId
      );

      return;
    }

    if (!changed) {
      return;
    }

    /* =====================================================
       SIMPAN HAND
       ===================================================== */

    await roomRef()
      .collection("hands")
      .doc(player.uid)
      .set({

        tiles:
          encodeTiles(hand),

        round:
          Number(fresh.round || 0),

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

    /* =====================================================
       UPDATE PLAYER DATA
       ===================================================== */

    const updatedPlayers =
      players.map(p => {

        if (
          p.uid !== player.uid
        ) {
          return p;
        }

        return {
          ...p,

          handCount:
            hand.length,

          pips:
            sumPips(hand)
        };
      });

    /* =====================================================
       PEMAIN HABIS BATU
       ===================================================== */

    if (
      hand.length === 0
    ) {

      const results =
        await calculateOnlineResults(
          updatedPlayers,
          player.uid
        );

      await roomRef().update({

        board:
          encodeTiles(board),

        left,

        right,

        boneyard: [],

        players:
          updatedPlayers,

        consecutivePasses: 0,

        turn,

        status: "finished",

        finished: true,

        blocked: false,

        finishReason: "empty",

        results,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

      await markActionProcessed(
        actionId
      );

      return;
    }

    /* =====================================================
       SEMUA PEMAIN SUDAH PASS
       ===================================================== */

    if (
      action.type === "pass" &&
      consecutivePasses >=
        players.length
    ) {

      const results =
        await calculateOnlineResults(
          updatedPlayers,
          null
        );

      await roomRef().update({

        board:
          encodeTiles(board),

        left,

        right,

        boneyard: [],

        players:
          updatedPlayers,

        consecutivePasses,

        turn,

        status: "finished",

        finished: true,

        blocked: true,

        finishReason: "blocked",

        results,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

      await markActionProcessed(
        actionId
      );

      return;
    }

    /* =====================================================
       TENTUKAN GILIRAN BERIKUTNYA
       ===================================================== */

    let nextTurn = turn;

    if (
      action.type === "play" ||
      action.type === "pass"
    ) {

      nextTurn =
        (turn + 1) %
        players.length;
    }

    /* =====================================================
       UPDATE ROOM
       ===================================================== */

    await roomRef().update({

      board:
        encodeTiles(board),

      left,

      right,

      boneyard: [],

      players:
        updatedPlayers,

      turn: nextTurn,

      consecutivePasses,

      status: "playing",

      finished: false,

      blocked: false,

      finishReason: null,

      updatedAt:
        firebase.firestore
          .FieldValue
          .serverTimestamp()
    });

    await markActionProcessed(
      actionId
    );
  }

  /* =========================================================
     ONLINE RESULTS
     ========================================================= */

  async function calculateOnlineResults(
    players,
    emptyUid = null
  ) {

    const rows = [];

    for (
      const player of players
    ) {

      const snapshot =
        await roomRef()
          .collection("hands")
          .doc(player.uid)
          .get();

      const hand =
        decodeTiles(
          snapshot.data()?.tiles || []
        );

      rows.push({

        uid: player.uid,

        name: player.name,

        seat:
          Number(player.seat || 0),

        pips:
          sumPips(hand),

        handCount:
          hand.length,

        empty:
          emptyUid !== null &&
          player.uid === emptyUid
      });
    }

    rows.sort(
      (a, b) => {

        /* Jika ada pemain habis batu,
           dia selalu peringkat 1. */

        if (
          a.empty &&
          !b.empty
        ) {
          return -1;
        }

        if (
          !a.empty &&
          b.empty
        ) {
          return 1;
        }

        /* Permainan buntu:
           angka terkecil menang. */

        return (
          Number(a.pips) -
            Number(b.pips) ||

          Number(a.handCount) -
            Number(b.handCount) ||

          Number(a.seat) -
            Number(b.seat)
        );
      }
    );

    return rows.map(
      (row, index) => ({

        ...row,

        place:
          index + 1,

        points:
          POINTS[index] ?? 0
      })
    );
  }

  /* =========================================================
     RENDER ONLINE GAME
     ========================================================= */

  async function renderOnlineGame() {

    if (!roomData) {
      return;
    }

    const players =
      playerList(roomData);

    const turnPlayer =
      players[
        Number(roomData.turn || 0)
      ];

    if ($("roundNo")) {
      $("roundNo").textContent =
        roomData.round || 1;
    }

    if ($("turnName")) {
      $("turnName").textContent =
        turnPlayer?.name || "—";
    }

    /* PLAYER BOX */

    if ($("players")) {

      $("players").innerHTML =
        players
          .map(
            (player, index) => `
              <div class="player-box ${
                index === Number(roomData.turn || 0) &&
                !roomData.finished
                  ? "active"
                  : ""
              }">

                <b>
                  ${esc(player.name)}
                  ${
                    player.uid === currentUid
                      ? " 👤"
                      : ""
                  }
                </b>

                <small>
                  ${Number(player.handCount || 0)}
                  batu
                  ${
                    index ===
                    Number(roomData.turn || 0)
                      ? " • giliran"
                      : ""
                  }
                </small>

              </div>
            `
          )
          .join("");
    }

    /* BOARD */

    if ($("board")) {

      $("board").innerHTML =
        roomData.board.length
          ? roomData.board
              .map(tile =>
                tileHTML(
                  tile,
                  "board-tile"
                )
              )
              .join("")
          : `
              <div class="empty">
                Meja domino
              </div>
            `;
    }

    /* Karena tidak ada tumpukan,
       selalu 0. */

    if ($("boneyardInfo")) {
      $("boneyardInfo").textContent =
        "Tidak ada tumpukan kartu";
    }

    if ($("blockInfo")) {

      $("blockInfo").textContent =
        roomData.blocked
          ? "⛔ PERMAINAN BUNTU • ANGKA TERKECIL MENANG"
          : "";
    }

    /* GAME SELESAI */

    if (
      roomData.status === "finished"
    ) {

      if ($("waitingCard")) {
        $("waitingCard")
          .classList
          .add("hidden");
      }

      showResults(
        roomData.results || [],
        "online"
      );

      return;
    }

    /* AMBIL HAND */

    let myHand = [];

    try {

      myHand =
        await getMyHandOnline();

    } catch (error) {

      console.error(
        "Get online hand:",
        error
      );

      return;
    }

    const me =
      players.find(
        p => p.uid === currentUid
      );

    const isTurn =
      turnPlayer?.uid === currentUid;

    if ($("handTitle")) {
      $("handTitle").textContent =
        `Kartu ${me?.name || "Saya"}`;
    }

    if ($("hand")) {

      $("hand").innerHTML = "";

      myHand.forEach(
        (tile, index) => {

          const wrapper =
            document.createElement(
              "div"
            );

          wrapper.innerHTML =
            tileHTML(
              tile,
              "hand-tile"
            );

          const element =
            wrapper.firstElementChild;

          const playable =
            canOnlinePlay(
              tile,
              roomData.board,
              roomData.left,
              roomData.right
            );

          if (
            !isTurn ||
            !playable
          ) {
            element.classList.add(
              "disabled"
            );
          }

          element.onclick =
            () => {

              if (
                !isTurn ||
                !playable
              ) {
                return;
              }

              let side = "right";

              if (
                roomData.board.length
              ) {

                if (
                  Number(tile[0]) ===
                    Number(roomData.right) ||
                  Number(tile[1]) ===
                    Number(roomData.right)
                ) {

                  side = "right";

                } else {

                  side = "left";
                }
              }

              sendOnlineAction(
                "play",
                index,
                side
              );
            };

          $("hand")
            .appendChild(element);
        }
      );
    }

    /* =====================================================
       AMBIL KARTU DIHILANGKAN
       ===================================================== */

    if ($("drawBtn")) {

      $("drawBtn").style.display =
        "none";

      $("drawBtn").disabled =
        true;
    }

    /* PASS */

    if ($("passBtn")) {

      $("passBtn").style.display =
        "";

      $("passBtn").disabled =
        !isTurn;

      $("passBtn").textContent =
        "Lewat";
    }

    if (isTurn) {

      setStatus(
        "🎯 Giliran kamu."
      );

    } else {

      setStatus(
        "⏳ Menunggu giliran " +
        (turnPlayer?.name ||
          "pemain") +
        "..."
      );
    }
  }

  /* =========================================================
     RESULTS
     ========================================================= */
function showResults(res,type){
  if(!res.length)return;

  $("modalTitle").textContent=
    type==="online" ? "Ronde Online Selesai" : "Ronde Selesai";

  const blocked=
    type==="local"
      ? !!localGame?.blocked
      : roomData?.finishReason==="blocked" || roomData?.blocked===true;

  $("modalSub").textContent=
    blocked
      ? "⛔ Meja tertutup: total angka batu paling kecil menjadi pemenang."
      : "🏆 Ada pemain yang menghabiskan semua batu.";

  $("results").innerHTML=res.map(r=>`
    <div class="result-row ${r.place===1?"winner":""}">
      <b>${r.place}</b>
      <span>
        ${esc(r.name)}
        <small>
          ${r.pips} angka
          ${r.empty?" • HABIS BATU":""}
        </small>
      </span>
      <b>+${r.points}</b>
    </div>
  `).join("");

  // Tombol ronde berikutnya
  $("nextBtn").classList.toggle(
    "hidden",
    type==="online" && roomData?.hostUid!==currentUid
  );

  // =====================================================
  // TOMBOL KEMBALI KE ROOM
  // =====================================================

  let backBtn=$("backToRoomBtn");

  if(!backBtn){
    backBtn=document.createElement("button");
    backBtn.id="backToRoomBtn";
    backBtn.type="button";
    backBtn.textContent="← Kembali ke Room";

    backBtn.style.cssText=`
      display:block;
      width:100%;
      margin-top:12px;
      padding:13px 18px;
      border:1px solid rgba(255,255,255,.25);
      border-radius:14px;
      cursor:pointer;
      font-size:15px;
      font-weight:700;
      background:rgba(255,255,255,.10);
      color:inherit;
      transition:.2s ease;
    `;

    backBtn.onmouseenter=()=>{
      backBtn.style.transform="translateY(-1px)";
      backBtn.style.background="rgba(255,79,163,.18)";
    };

    backBtn.onmouseleave=()=>{
      backBtn.style.transform="translateY(0)";
      backBtn.style.background="rgba(255,255,255,.10)";
    };

    $("nextBtn").insertAdjacentElement("afterend",backBtn);
  }

  // Untuk online tampilkan tombol kembali ke room
  backBtn.style.display=type==="online" ? "block" : "none";

  backBtn.onclick=async()=>{
    $("modal").classList.add("hidden");

    if(type==="online"){
      // Tetap di halaman game/room
      document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
      $("gamePage").classList.add("active");

      // Tampilkan kembali kartu room
      $("waitingCard").classList.remove("hidden");

      // Pastikan informasi room diperbarui
      if(roomData){
        const ps=playerList(roomData);

        $("roomPlayers").innerHTML=ps.map(p=>`
          <div class="slot">
            <b>
              ${esc(p.name)}
              ${p.uid===currentUid?"👤":""}
            </b>
            <small>
              Kursi ${p.seat+1}
              ${p.uid===roomData.hostUid?" • Host":""}
            </small>
          </div>
        `).join("");

        $("waitingText").textContent=
          `Room ${roomData.code} • ${ps.length}/4 pemain. Ronde selesai.`;

        // Host bisa langsung mulai ronde berikutnya
        $("startOnlineBtn").classList.toggle(
          "hidden",
          !(roomData.hostUid===currentUid && ps.length>=2)
        );

        $("startOnlineBtn").textContent="▶ Mulai Ronde Berikutnya";

        setStatus("Kembali ke room. Tunggu host memulai ronde berikutnya.");
      }
    }else{
      // Untuk game lokal kembali ke halaman game
      document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
      $("gamePage").classList.add("active");
      setStatus("Ronde selesai.");
    }
  };

  $("modal").classList.remove("hidden");
}

  /* =========================================================
     NEXT ROUND
     ========================================================= */

  if ($("nextBtn")) {

    $("nextBtn").onclick =
      async function () {

        if ($("modal")) {
          $("modal")
            .classList
            .add("hidden");
        }

        if (
          mode === "online"
        ) {

          if (
            roomData?.hostUid ===
            currentUid
          ) {

            await startOnlineRound();
          }

        } else {

          startLocalGame();
        }
      };
  }

  /* =========================================================
     DRAW BUTTON
     
     TETAP ADA DI HTML LAMA TIDAK MASALAH.
     JAVASCRIPT MEMATIKANNYA DAN MENYEMBUNYIKANNYA.
     ========================================================= */

  if ($("drawBtn")) {

    $("drawBtn").style.display =
      "none";

    $("drawBtn").disabled =
      true;
  }

  /* =========================================================
     PASS BUTTON
     ========================================================= */

  if ($("passBtn")) {

    $("passBtn").textContent =
      "Lewat";

    $("passBtn").onclick =
      function () {

        if (
          mode === "online"
        ) {

          sendOnlineAction(
            "pass"
          );

        } else {

          localPass();
        }
      };
  }

  /* =========================================================
     LOCAL GAME
     ========================================================= */

  function startLocalGame() {

    const humanCount =
      Number(
        $("humanCount")?.value || 1
      );

    const names = [

      $("name1")
        ?.value
        .trim() || "",

      $("name2")
        ?.value
        .trim() || "",

      $("name3")
        ?.value
        .trim() || ""
    ];

    if (!names[0]) {

      alert(
        "Masukkan nama Pemain 1."
      );

      return;
    }

    for (
      let i = 0;
      i < humanCount;
      i++
    ) {

      if (!names[i]) {

        alert(
          `Masukkan nama Pemain ${i + 1}.`
        );

        return;
      }
    }

    const normalizedNames =
      names
        .slice(0, humanCount)
        .map(name =>
          name.toLowerCase()
        );

    if (
      new Set(normalizedNames)
        .size !== humanCount
    ) {

      alert(
        "Nama pemain harus berbeda."
      );

      return;
    }

    saveNames();

    mode = "local";

    const players = [];

    /* HUMAN */

    for (
      let i = 0;
      i < humanCount;
      i++
    ) {

      players.push({

        id: `local-${i}`,

        name:
          names[i],

        human: true,

        seat: i,

        hand: []
      });
    }

    /* COMPUTER */

    const computerCount =
      4 - humanCount;

    for (
      let i = 0;
      i < computerCount;
      i++
    ) {

      players.push({

        id:
          `computer-${i}`,

        name:
          `Computer ${i + 1}`,

        human: false,

        seat:
          humanCount + i,

        hand: []
      });
    }

    /* =====================================================
       DECK
       ===================================================== */

    const deck =
      shuffle(deck28());

    /* =====================================================
       SEMUA PEMAIN DAPAT 7
       ===================================================== */

    players.forEach(
      player => {

        player.hand =
          deck.splice(0, 7);
      }
    );

    /* =====================================================
       GAME
       ===================================================== */

    const oldRound =
      Number(
        localGame?.round || 0
      );

    localGame = {

      players,

      humanCount,

      round:
        oldRound + 1,

      /* Tidak digunakan */
      boneyard: [],

      board: [],

      left: null,

      right: null,

      turn: 0,

      finished: false,

      blocked: false,

      finishReason: null,

      results: []
    };

    /* PASS RESET */
    localPassCount = 0;

    /* LEAGUE */

    names
      .slice(0, humanCount)
      .forEach(ensureLeague);

    saveLeague();

    if ($("loginScreen")) {
      $("loginScreen")
        .classList
        .add("hidden");
    }

    if ($("app")) {
      $("app")
        .classList
        .remove("hidden");
    }

    if ($("welcome")) {

      $("welcome").textContent =
        `${names[0]} • Lokal`;
    }

    if ($("roomCode")) {
      $("roomCode").textContent =
        "LOCAL";
    }

    if ($("onlineState")) {
      $("onlineState").textContent =
        "Lokal";
    }

    if ($("waitingCard")) {
      $("waitingCard")
        .classList
        .add("hidden");
    }

    /* HILANGKAN DRAW */

    if ($("drawBtn")) {

      $("drawBtn").style.display =
        "none";

      $("drawBtn").disabled =
        true;
    }

    if ($("passBtn")) {

      $("passBtn").style.display =
        "";

      $("passBtn").textContent =
        "Lewat";
    }

    renderLocal();

    setStatus(
      `🎮 Giliran ${players[0].name}.`
    );

    /* Jika pemain pertama komputer */
    if (
      !players[0].human
    ) {

      setTimeout(
        localAiTurn,
        400
      );
    }
  }

  /* =========================================================
     LOCAL CAN PLAY
     ========================================================= */

  function localCanPlay(tile) {

    const game =
      localGame;

    if (!game) {
      return false;
    }

    if (
      !game.board.length
    ) {
      return true;
    }

    return (
      Number(tile[0]) ===
        Number(game.left) ||

      Number(tile[1]) ===
        Number(game.left) ||

      Number(tile[0]) ===
        Number(game.right) ||

      Number(tile[1]) ===
        Number(game.right)
    );
  }

  /* =========================================================
     LOCAL PLACE
     ========================================================= */

  function localPlaceTile(
    tile,
    side
  ) {

    const game =
      localGame;

    if (
      !game.board.length
    ) {

      game.board = [tile];

      game.left =
        Number(tile[0]);

      game.right =
        Number(tile[1]);

      return;
    }

    let placed = [
      Number(tile[0]),
      Number(tile[1])
    ];

    if (
      side === "left"
    ) {

      if (
        Number(placed[0]) !==
          Number(game.left) &&
        Number(placed[1]) ===
          Number(game.left)
      ) {

        placed = [
          placed[1],
          placed[0]
        ];
      }

      game.board.unshift(
        placed
      );

      game.left =
        Number(placed[0]);

    } else {

      if (
        Number(placed[1]) !==
          Number(game.right) &&
        Number(placed[0]) ===
          Number(game.right)
      ) {

        placed = [
          placed[1],
          placed[0]
        ];
      }

      game.board.push(
        placed
      );

      game.right =
        Number(placed[1]);
    }
  }

  /* =========================================================
     LOCAL PLAY
     ========================================================= */

  function localPlayTile(
    index
  ) {

    const game =
      localGame;

    if (
      !game ||
      game.finished
    ) {
      return;
    }

    const player =
      game.players[
        game.turn
      ];

    if (
      !player ||
      !player.human
    ) {
      return;
    }

    const tile =
      player.hand[index];

    if (!tile) {
      return;
    }

    if (
      !localCanPlay(tile)
    ) {

      setStatus(
        "Batu itu tidak bisa dimainkan."
      );

      return;
    }

    let side = "right";

    if (
      game.board.length
    ) {

      if (
        Number(tile[0]) ===
          Number(game.right) ||
        Number(tile[1]) ===
          Number(game.right)
      ) {

        side = "right";

      } else {

        side = "left";
      }
    }

    localPlaceTile(
      tile,
      side
    );

    player.hand.splice(
      index,
      1
    );

    /* BERHASIL MAIN = PASS RESET */

    localPassCount = 0;

    /* HABIS BATU */

    if (
      player.hand.length === 0
    ) {

      finishLocalGame(
        player.id,
        false
      );

      return;
    }

    /* NEXT PLAYER */

    nextLocalTurn();
  }

  /* =========================================================
     LOCAL PASS
     
     Tidak ada kartu cadangan.
     
     PASS jika benar-benar tidak
     punya batu yang bisa dimainkan.
     ========================================================= */

  function localPass() {

    const game =
      localGame;

    if (
      !game ||
      game.finished
    ) {
      return;
    }

    const player =
      game.players[
        game.turn
      ];

    if (
      !player ||
      !player.human
    ) {
      return;
    }

    const playable =
      player.hand.some(
        tile =>
          localCanPlay(tile)
      );

    if (playable) {

      setStatus(
        "⚠️ Masih ada batu yang bisa dimainkan."
      );

      return;
    }

    /* PASS VALID */

    localPassCount++;

    setStatus(
      `${player.name} PASS (${localPassCount}/${game.players.length}).`
    );

    /* =====================================================
       SEMUA PEMAIN PASS
       ===================================================== */

    if (
      localPassCount >=
      game.players.length
    ) {

      finishLocalGame(
        null,
        true
      );

      return;
    }

    /* NEXT PLAYER */

    nextLocalTurn();
  }

  /* =========================================================
     NEXT LOCAL TURN
     ========================================================= */

  function nextLocalTurn() {

    const game =
      localGame;

    if (
      !game ||
      game.finished
    ) {
      return;
    }

    game.turn =
      (
        Number(game.turn) + 1
      ) %
      game.players.length;

    renderLocal();

    const player =
      game.players[
        game.turn
      ];

    if (!player) {
      return;
    }

    if (
      player.human
    ) {

      setStatus(
        `🎯 Giliran ${player.name}.`
      );

    } else {

      setStatus(
        `🤖 ${player.name} sedang berpikir...`
      );

      setTimeout(
        localAiTurn,
        500
      );
    }
  }

  /* =========================================================
     LOCAL AI
     
     Tidak ada DRAW.
     
     Jika bisa main:
       main

     Jika tidak bisa:
       PASS otomatis
     ========================================================= */

  function localAiTurn() {

    const game =
      localGame;

    if (
      !game ||
      game.finished
    ) {
      return;
    }

    const player =
      game.players[
        game.turn
      ];

    if (
      !player ||
      player.human
    ) {
      return;
    }

    setStatus(
      `🤖 ${player.name} sedang berpikir...`
    );

    setTimeout(
      () => {

        if (
          !localGame ||
          localGame.finished
        ) {
          return;
        }

        const currentGame =
          localGame;

        const currentPlayer =
          currentGame.players[
            currentGame.turn
          ];

        if (
          !currentPlayer ||
          currentPlayer.human
        ) {
          return;
        }

        /* CARI BATU */

        const playable =
          currentPlayer.hand
            .map(
              (tile, index) => ({
                tile,
                index
              })
            )
            .filter(
              item =>
                localCanPlay(
                  item.tile
                )
            );

        /* =================================================
           AI BISA MAIN
           ================================================= */

        if (
          playable.length
        ) {

          /*
           * Pilih batu dengan angka
           * terbesar supaya AI
           * lebih cepat mengurangi
           * total titik.
           */

          playable.sort(
            (a, b) =>
              (
                Number(b.tile[0]) +
                Number(b.tile[1])
              ) -
              (
                Number(a.tile[0]) +
                Number(a.tile[1])
              )
          );

          const selected =
            playable[0];

          let side = "right";

          if (
            currentGame.board.length
          ) {

            if (
              Number(
                selected.tile[0]
              ) ===
                Number(
                  currentGame.right
                ) ||

              Number(
                selected.tile[1]
              ) ===
                Number(
                  currentGame.right
                )
            ) {

              side = "right";

            } else {

              side = "left";
            }
          }

          localPlaceTile(
            selected.tile,
            side
          );

          currentPlayer.hand.splice(
            selected.index,
            1
          );

          /* AI berhasil main */
          localPassCount = 0;

          setStatus(
            `🤖 ${currentPlayer.name} memasang batu.`
          );

          /* AI HABIS BATU */

          if (
            currentPlayer.hand.length ===
            0
          ) {

            finishLocalGame(
              currentPlayer.id,
              false
            );

            return;
          }

          nextLocalTurn();

          return;
        }

        /* =================================================
           AI TIDAK BISA MAIN
           ================================================= */

        localPassCount++;

        setStatus(
          `🤖 ${currentPlayer.name} PASS (${localPassCount}/${currentGame.players.length}).`
        );

        /* SEMUA PASS */

        if (
          localPassCount >=
          currentGame.players.length
        ) {

          finishLocalGame(
            null,
            true
          );

          return;
        }

        nextLocalTurn();

      },
      450
    );
  }

  /* =========================================================
     FINISH LOCAL GAME
     
     winnerId = pemain yang habis batu
     winnerId null = permainan buntu
     ========================================================= */

  function finishLocalGame(
    winnerId = null,
    blocked = false
  ) {

    const game =
      localGame;

    if (
      !game ||
      game.finished
    ) {
      return;
    }

    game.finished = true;

    game.blocked =
      blocked;

    game.finishReason =
      blocked
        ? "blocked"
        : "empty";

    /* =====================================================
       HITUNG SEMUA BATU
       ===================================================== */

    const results =
      game.players.map(
        player => ({

          id:
            player.id,

          name:
            player.name,

          seat:
            player.seat,

          pips:
            sumPips(
              player.hand
            ),

          handCount:
            player.hand.length,

          empty:
            winnerId !== null &&
            player.id === winnerId
        })
      );

    /* =====================================================
       URUTKAN
       ===================================================== */

    results.sort(
      (a, b) => {

        /* Pemain habis batu
           otomatis juara */

        if (
          a.empty &&
          !b.empty
        ) {
          return -1;
        }

        if (
          !a.empty &&
          b.empty
        ) {
          return 1;
        }

        /* BUNTU:
           ANGKA TERKECIL */

        return (
          Number(a.pips) -
            Number(b.pips) ||

          Number(a.handCount) -
            Number(b.handCount) ||

          Number(a.seat) -
            Number(b.seat)
        );
      }
    );

    /* =====================================================
       POINTS + LEAGUE
       ===================================================== */

    results.forEach(
      (result, index) => {

        result.place =
          index + 1;

        result.points =
          POINTS[index] ?? 0;

        ensureLeague(
          result.name
        );

        const leaguePlayer =
          league.find(
            player =>
              player.name ===
              result.name
          );

        if (leaguePlayer) {

          leaguePlayer.rounds++;

          leaguePlayer.points +=
            result.points;

          if (
            index === 0
          ) {
            leaguePlayer.wins++;
          }
        }
      }
    );

    game.results =
      results;

    saveLeague();

    renderLocal();

    showResults(
      results,
      "local"
    );

    const winner =
      results[0];

    if (blocked) {

      setStatus(
        `⛔ PERMAINAN BUNTU! ${winner?.name || "Pemenang"} menang dengan ${winner?.pips || 0} angka.`
      );

    } else {

      setStatus(
        `🏆 ${winner?.name || "Pemenang"} menang!`
      );
    }
  }

  /* =========================================================
     RENDER LOCAL
     ========================================================= */

  function renderLocal() {

    const game =
      localGame;

    if (!game) {
      return;
    }

    if ($("roundNo")) {

      $("roundNo").textContent =
        game.round;
    }

    if ($("turnName")) {

      $("turnName").textContent =
        game.players[
          game.turn
        ]?.name || "—";
    }

    /* PLAYERS */

    if ($("players")) {

      $("players").innerHTML =
        game.players
          .map(
            (player, index) => `
              <div class="player-box ${
                index === game.turn &&
                !game.finished
                  ? "active"
                  : ""
              }">

                <b>
                  ${esc(player.name)}
                  ${
                    player.human
                      ? " 👤"
                      : " 🤖"
                  }
                </b>

                <small>
                  ${player.hand.length}
                  batu
                  ${
                    index === game.turn
                      ? " • giliran"
                      : ""
                  }
                </small>

              </div>
            `
          )
          .join("");
    }

    /* BOARD */

    if ($("board")) {

      $("board").innerHTML =
        game.board.length

          ? game.board
              .map(
                tile =>
                  tileHTML(
                    tile,
                    "board-tile"
                  )
              )
              .join("")

          : `
              <div class="empty">
                Meja domino
              </div>
            `;
    }

    /* NO BONEYARD */

    if ($("boneyardInfo")) {

      $("boneyardInfo").textContent =
        "Tidak ada tumpukan kartu";
    }

    if ($("blockInfo")) {

      $("blockInfo").textContent =
        game.blocked
          ? "⛔ PERMAINAN BUNTU • ANGKA TERKECIL MENANG"
          : "";
    }

    const player =
      game.players[
        game.turn
      ];

    /* HAND */

    if (
      player &&
      player.human
    ) {

      if ($("handTitle")) {

        $("handTitle").textContent =
          `Kartu ${player.name}`;
      }

      if ($("hand")) {

        $("hand").innerHTML = "";

        player.hand.forEach(
          (tile, index) => {

            const wrapper =
              document.createElement(
                "div"
              );

            wrapper.innerHTML =
              tileHTML(
                tile,
                "hand-tile"
              );

            const element =
              wrapper.firstElementChild;

            const playable =
              localCanPlay(
                tile
              );

            if (
              !playable ||
              game.finished
            ) {

              element.classList.add(
                "disabled"
              );
            }

            element.onclick =
              () => {

                if (
                  game.finished ||
                  !playable
                ) {
                  return;
                }

                localPlayTile(
                  index
                );
              };

            $("hand")
              .appendChild(element);
          }
        );
      }

    } else {

      if ($("handTitle")) {

        $("handTitle").textContent =
          "Computer sedang berpikir...";
      }

      if ($("hand")) {

        $("hand").innerHTML =
          `
            <span class="muted">
              Tunggu giliran computer.
            </span>
          `;
      }
    }

    /* =====================================================
       DRAW = HILANG
       ===================================================== */

    if ($("drawBtn")) {

      $("drawBtn").style.display =
        "none";

      $("drawBtn").disabled =
        true;
    }

    /* =====================================================
       PASS
       ===================================================== */

    if ($("passBtn")) {

      $("passBtn").style.display =
        "";

      $("passBtn").textContent =
        "Lewat";

      $("passBtn").disabled =
        !player ||
        !player.human ||
        game.finished;
    }
  }

  /* =========================================================
     MENU
     ========================================================= */

  if ($("newGameBtn")) {

    $("newGameBtn").onclick =
      function () {

        if (roomUnsub) {
          roomUnsub();
        }

        if (actionUnsub) {
          actionUnsub();
        }

        location.reload();
      };
  }

  /* =========================================================
     LEAGUE BUTTON
     ========================================================= */
$("leagueBtn").onclick=()=>{
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  $("leaguePage").classList.add("active");
  renderLeague();

  // Buat tombol KEMBALI KE ROOM jika belum ada
  let btn=$("backToRoomFromLeague");

  if(!btn){
    btn=document.createElement("button");
    btn.id="backToRoomFromLeague";
    btn.type="button";
    btn.textContent="← Kembali ke Room";
    btn.style.cssText=`
      display:block;
      width:100%;
      max-width:420px;
      margin:18px auto;
      padding:13px 18px;
      border:0;
      border-radius:14px;
      cursor:pointer;
      font-size:15px;
      font-weight:700;
      background:linear-gradient(135deg,#ff4fa3,#ff7ac3);
      color:#fff;
      box-shadow:0 8px 24px rgba(255,79,163,.25);
    `;

    btn.onclick=()=>{
      document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
      $("gamePage").classList.add("active");

      // Jika sedang online dan sudah punya room
      if(mode==="online" && roomData){
        renderOnlineRoom();
        setStatus("Kembali ke room.");
      }else{
        setStatus("Kembali ke permainan.");
      }
    };

    $("leaguePage").appendChild(btn);
  }
};
  
  /* =========================================================
     COPY ROOM
     ========================================================= */

  if ($("copyRoomBtn")) {

    $("copyRoomBtn").onclick =
      async function () {

        const code =
          $("roomCode")
            ?.textContent || "";

        if (
          !code ||
          code === "LOCAL"
        ) {
          return;
        }

        try {

          await navigator.clipboard
            .writeText(code);

          setStatus(
            "Kode room berhasil disalin: " +
            code
          );

        } catch {

          alert(
            "Kode room: " +
            code
          );
        }
      };
  }

  /* =========================================================
     RESET LEAGUE
     ========================================================= */

  if ($("resetLeague")) {

    $("resetLeague").onclick =
      function () {

        if (
          !confirm(
            "Reset semua poin liga lokal?"
          )
        ) {
          return;
        }

        league = [];

        saveLeague();
      };
  }

  /* =========================================================
     START LOCAL BUTTON
     ========================================================= */

  if ($("startLocalBtn")) {

    $("startLocalBtn").onclick =
      startLocalGame;
  }

  /* =========================================================
     PLAYER COUNT
     ========================================================= */

  if ($("humanCount")) {

    $("humanCount").onchange =
      updateNameInputs;
  }

  /* =========================================================
     TABS
     ========================================================= */

  if ($("localTab")) {

    $("localTab").onclick =
      () => switchTab("local");
  }

  if ($("onlineTab")) {

    $("onlineTab").onclick =
      () => switchTab("online");
  }

  /* =========================================================
     OPEN GAME PAGE
     ========================================================= */

  function openGamePage() {

    document
      .querySelectorAll(".page")
      .forEach(
        page =>
          page.classList.remove(
            "active"
          )
      );

    if ($("gamePage")) {

      $("gamePage")
        .classList
        .add("active");
    }
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  if ($("createRoomBtn")) {
    $("createRoomBtn").disabled =
      true;
  }

  if ($("joinRoomBtn")) {
    $("joinRoomBtn").disabled =
      true;
  }

  /* HILANGKAN AMBIL KARTU DARI AWAL */

  if ($("drawBtn")) {

    $("drawBtn").style.display =
      "none";

    $("drawBtn").disabled =
      true;
  }

  /* PASS BUTTON */

  if ($("passBtn")) {

    $("passBtn").textContent =
      "Lewat";
  }

  loadNames();

  loadLeague();

  updateNameInputs();

  switchTab("local");

  openGamePage();

  if (firebaseReady()) {

    initFirebase();

  } else {

    if ($("firebaseStatus")) {

      $("firebaseStatus").textContent =
        "Firebase belum dikonfigurasi.";
    }
  }

})();
