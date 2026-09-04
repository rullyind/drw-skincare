(function () {
  "use strict";

  /* =========================================================
     MBICUKIA DOMINO
     DOMINO1.JS — FINAL UTUH
     
     MODE:
     - LOCAL
     - ONLINE FIREBASE

     ATURAN:
     - 2 sampai 4 pemain
     - Semua pemain mendapat 7 batu
     - Tidak ada ambil batu
     - Jika tidak punya batu yang cocok = PASS / LEWAT
     - Jika semua pemain PASS = permainan buntu
     - Jika pemain habis batu = langsung menang
     - Jika buntu = total titik paling kecil menang
     - Poin:
         Juara 1 = 3
         Juara 2 = 2
         Juara 3 = 1
         Juara 4 = 0

     FIREBASE:
     - Anonymous Authentication
     - Firestore
     - rooms/{ROOM}
     - rooms/{ROOM}/hands/{UID}
     - rooms/{ROOM}/actions/{ACTION}
     ========================================================= */

  const $ = id => document.getElementById(id);

  const POINTS = [3, 2, 1, 0];

  const LEAGUE_KEY = "d2t_domino_local_league_v4";
  const NAME_KEY = "d2t_domino_local_names_v4";

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
      return (
        sum +
        Number(tile?.[0] || 0) +
        Number(tile?.[1] || 0)
      );
    }, 0);
  }

  function tileKey(tile) {
    return `${Number(tile?.[0])}-${Number(tile?.[1])}`;
  }

  /* =========================================================
     FIRESTORE TILE FORMAT

     Firestore:
     tidak menggunakan array di dalam array.

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
      Number(parts[0] || 0),
      Number(parts[1] || 0)
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
          (PIP_POSITIONS[number] || [])
            .map(
              pos =>
                `<span class="pip p${pos}"></span>`
            )
            .join("")
        }
      </div>
    `;
  }

  function tileHTML(tile, className = "tile") {
    const a = Number(tile[0]);
    const b = Number(tile[1]);

    return `
      <div
        class="${className}"
        data-a="${a}"
        data-b="${b}"
      >
        ${pipHTML(a)}
        <i class="domino-divider"></i>
        ${pipHTML(b)}
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
            "Firebase project bentrok. Pastikan Firebase Domino menggunakan project yang benar."
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
          "⏳ Menghubungkan Firebase...";
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
        "MBICUKIA DOMINO Firebase UID:",
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

      if ($("createRoomBtn")) {
        $("createRoomBtn").disabled = true;
      }

      if ($("joinRoomBtn")) {
        $("joinRoomBtn").disabled = true;
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
     LOCAL LEAGUE
     ========================================================= */

  function loadLeague() {
    try {
      league =
        JSON.parse(
          localStorage.getItem(
            LEAGUE_KEY
          ) || "[]"
        );

      if (!Array.isArray(league)) {
        league = [];
      }

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

    const arr = [...league]
      .sort(
        (a, b) =>
          Number(b.points || 0) -
            Number(a.points || 0) ||

          Number(b.wins || 0) -
            Number(a.wins || 0) ||

          String(a.name || "")
            .localeCompare(
              String(b.name || "")
            )
      );

    table.innerHTML =
      arr
        .map(
          (p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <b>${esc(p.name)}</b>
              </td>
              <td>${Number(p.rounds || 0)}</td>
              <td>${Number(p.wins || 0)}</td>
              <td>
                <b>${Number(p.points || 0)}</b>
              </td>
            </tr>
          `
        )
        .join("");
  }

  /* =========================================================
     ONLINE LEAGUE
     ========================================================= */

  function normalizeOnlineLeague(list) {
    return (Array.isArray(list) ? list : [])
      .map(p => ({
        uid: p.uid,
        name: p.name || "Pemain",
        rounds: Number(p.rounds || 0),
        wins: Number(p.wins || 0),
        points: Number(p.points || 0)
      }))
      .filter(p => p.uid);
  }

  function renderOnlineLeagueData(list) {
    const table = $("standings");

    if (!table) return;

    const arr = normalizeOnlineLeague(list)
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.wins - a.wins ||
          a.name.localeCompare(b.name)
      );

    table.innerHTML =
      arr
        .map(
          (p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <b>${esc(p.name)}</b>
              </td>
              <td>${p.rounds}</td>
              <td>${p.wins}</td>
              <td>
                <b>${p.points}</b>
              </td>
            </tr>
          `
        )
        .join("");
  }

  async function renderOnlineLeague() {
    if (!roomId || !db) {
      renderOnlineLeagueData([]);
      return;
    }

    try {
      const snapshot =
        await roomRef().get();

      if (!snapshot.exists) {
        renderOnlineLeagueData([]);
        return;
      }

      const data = snapshot.data();

      renderOnlineLeagueData(
        data.onlineLeague || []
      );

    } catch (error) {
      console.error(
        "renderOnlineLeague:",
        error
      );

      setStatus(
        "Gagal membaca Liga Online."
      );
    }
  }

  async function updateOnlineLeague(results) {
    if (
      !roomId ||
      !results ||
      !results.length
    ) {
      return;
    }

    try {
      const snap =
        await roomRef().get();

      if (!snap.exists) {
        return;
      }

      const room = snap.data();

      const oldLeague =
        normalizeOnlineLeague(
          room.onlineLeague || []
        );

      const leagueMap = {};

      oldLeague.forEach(player => {
        leagueMap[player.uid] = {
          uid: player.uid,
          name: player.name,
          rounds: player.rounds,
          wins: player.wins,
          points: player.points
        };
      });

      results.forEach(
        (result, index) => {
          if (!result.uid) return;

          if (!leagueMap[result.uid]) {
            leagueMap[result.uid] = {
              uid: result.uid,
              name:
                result.name || "Pemain",
              rounds: 0,
              wins: 0,
              points: 0
            };
          }

          const player =
            leagueMap[result.uid];

          player.name =
            result.name || player.name;

          player.rounds += 1;

          player.points +=
            Number(result.points || 0);

          if (index === 0) {
            player.wins += 1;
          }
        }
      );

      const currentPlayers =
        playerList(room);

      const activeUids =
        new Set(
          currentPlayers.map(
            p => p.uid
          )
        );

      const finalLeague =
        Object.values(leagueMap)
          .filter(
            p =>
              activeUids.has(p.uid)
          )
          .sort(
            (a, b) =>
              b.points - a.points ||
              b.wins - a.wins ||
              a.name.localeCompare(
                b.name
              )
          );

      await roomRef().update({
        onlineLeague: finalLeague,

        onlineLeagueUpdatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

      console.log(
        "Liga Online diperbarui:",
        finalLeague
      );

    } catch (error) {
      console.error(
        "updateOnlineLeague:",
        error
      );
    }
  }

  /* =========================================================
     LEAGUE BUTTON
     ========================================================= */

  function setupLeagueButton() {
    if (!$("leagueBtn")) return;

    $("leagueBtn").onclick =
      async function () {

        document
          .querySelectorAll(".page")
          .forEach(
            page =>
              page.classList.remove(
                "active"
              )
          );

        if ($("leaguePage")) {
          $("leaguePage")
            .classList
            .add("active");
        }

        if (
          mode === "online" &&
          roomId
        ) {
          await renderOnlineLeague();
        } else {
          renderLeague();
        }

        createLeagueBackButton();
      };
  }

  function createLeagueBackButton() {
    if (!$("leaguePage")) return;

    let btn =
      $("backToRoomFromLeague");

    if (!btn) {
      btn =
        document.createElement(
          "button"
        );

      btn.id =
        "backToRoomFromLeague";

      btn.type = "button";

      btn.textContent =
        "← Kembali ke Room";

      btn.style.cssText = `
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
        background:linear-gradient(
          135deg,
          #ff4fa3,
          #ff7ac3
        );
        color:#fff;
        box-shadow:
          0 8px 24px
          rgba(255,79,163,.25);
      `;

      $("leaguePage")
        .appendChild(btn);
    }

    btn.onclick = () => {

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

      if (
        mode === "online" &&
        roomData
      ) {
        renderOnlineRoom();

        setStatus(
          "Kembali ke room."
        );
      } else {
        setStatus(
          "Kembali ke permainan."
        );
      }
    };
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
            Math.random() *
              chars.length
          )
        ];
    }

    return code;
  }

  function playerList(room) {
    return [...(room?.players || [])]
      .sort(
        (a, b) =>
          Number(a.seat || 0) -
          Number(b.seat || 0)
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
          $("onlineName")
            ?.value
            .trim();

        if (!name) {
          alert(
            "Masukkan nama pemain."
          );
          return;
        }

        roomId =
          newRoomCode();

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

            hostUid:
              currentUid,

            players: [
              player
            ],

            status:
              "lobby",

            round: 0,

            board: [],

            left: null,

            right: null,

            turn: 0,

            boneyard: [],

            consecutivePasses: 0,

            finished: false,

            blocked: false,

            finishReason: null,

            results: [],

            onlineLeague: [],

            createdAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp(),

            updatedAt:
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
            (
              error.message ||
              error.code ||
              error
            )
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
          $("onlineName")
            ?.value
            .trim();

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

          const ref =
            roomRef();

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
            data.status ===
            "playing"
          ) {
            alert(
              "Game sudah dimulai. Tunggu ronde selesai."
            );
            return;
          }

          if (
            players.some(
              p =>
                p.uid ===
                currentUid
            )
          ) {

            mode = "online";

            subscribeRoom();
            subscribeActions();

            showApp(
              name,
              code,
              currentUid ===
                data.hostUid
            );

            return;
          }

          if (
            players.length >= 4
          ) {
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
            players,

            updatedAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
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
            (
              error.message ||
              error.code ||
              error
            )
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
        `${name} • ${
          mode === "online"
            ? "Online"
            : "Lokal"
        }`;
    }

    if ($("roomCode")) {
      $("roomCode").textContent =
        code;
    }

    if ($("onlineState")) {
      $("onlineState").textContent =
        isHost
          ? "Host"
          : mode === "online"
            ? "Online"
            : "Lokal";
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

    if ($("leaveRoomBtn")) {
      $("leaveRoomBtn").style.display =
        mode === "online"
          ? "block"
          : "none";
    }

    setStatus(
      mode === "online"
        ? "Terhubung ke room."
        : "Permainan lokal."
    );
  }

  /* =========================================================
     SUBSCRIBE ROOM
     ========================================================= */

  function subscribeRoom() {

    if (roomUnsub) {
      roomUnsub();
      roomUnsub = null;
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

            id:
              snapshot.id,

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
            (
              error.message ||
              error.code ||
              error
            )
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

    /* =====================================================
       ROOM PLAYERS
       ===================================================== */

    if ($("roomPlayers")) {

      $("roomPlayers").innerHTML =
        players
          .map(
            player => `
              <div class="slot">
                <b>
                  ${esc(player.name)}
                  ${
                    player.uid ===
                    currentUid
                      ? " 👤"
                      : ""
                  }
                </b>

                <small>
                  Kursi ${
                    Number(
                      player.seat || 0
                    ) + 1
                  }

                  ${
                    player.uid ===
                    roomData.hostUid
                      ? " • Host"
                      : ""
                  }
                </small>
              </div>
            `
          )
          .join("");
    }

    /* =====================================================
       WAITING TEXT

       FIX:
       sebelumnya memakai "ps.length"
       padahal ps tidak ada.
       ===================================================== */

    if ($("waitingText")) {

      if (
        roomData.status ===
        "lobby"
      ) {

        $("waitingText").textContent =
          `Kode ${
            roomData.code
          } • ${
            players.length
          }/4 pemain.`;

      } else if (
        roomData.status ===
        "finished"
      ) {

        $("waitingText").textContent =
          `Kode ${
            roomData.code
          } • Ronde ${
            roomData.round || 0
          } selesai.`;

      } else {

        $("waitingText").textContent =
          `Ronde ${
            roomData.round || 0
          } sedang berjalan.`;
      }
    }

    /* =====================================================
       START BUTTON
       ===================================================== */

    if ($("startOnlineBtn")) {

      const canStart =
        roomData.hostUid ===
          currentUid &&

        roomData.status ===
          "lobby" &&

        players.length >= 2;

      $("startOnlineBtn")
        .classList
        .toggle(
          "hidden",
          !canStart
        );

      if (
        roomData.status ===
        "finished"
      ) {
        $("startOnlineBtn")
          .textContent =
          "▶ Mulai Ronde Berikutnya";
      } else {
        $("startOnlineBtn")
          .textContent =
          "▶ Mulai Ronde";
      }
    }

    /* =====================================================
       WAITING CARD
       ===================================================== */

    if ($("waitingCard")) {

      $("waitingCard")
        .classList
        .toggle(
          "hidden",
          roomData.status ===
            "playing"
        );
    }

    /* =====================================================
       LEAVE BUTTON
       ===================================================== */

    if ($("leaveRoomBtn")) {

      $("leaveRoomBtn").style.display =
        mode === "online"
          ? "block"
          : "none";
    }

    /* =====================================================
       GAME
       ===================================================== */

    if (
      roomData.status ===
        "playing" ||
      roomData.status ===
        "finished"
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
     ========================================================= */

  async function startOnlineRound() {

    if (!roomData) return;

    if (
      roomData.hostUid !==
      currentUid
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

      /* =====================================================
         SEMUA PEMAIN TEPAT 7 BATU
         ===================================================== */

      players.forEach(
        player => {

          hands[player.uid] =
            deck.splice(0, 7);
        }
      );

      const nextRound =
        Number(
          roomData.round || 0
        ) + 1;

      const publicPlayers =
        players.map(
          player => ({
            ...player,

            handCount:
              hands[player.uid]
                .length,

            pips:
              sumPips(
                hands[player.uid]
              )
          })
        );

      /* =====================================================
         SIMPAN HAND SEMUA PEMAIN
         ===================================================== */

      const batch =
        db.batch();

      players.forEach(
        player => {

          batch.set(
            roomRef()
              .collection("hands")
              .doc(player.uid),

            {
              tiles:
                encodeTiles(
                  hands[player.uid]
                ),

              round:
                nextRound,

              updatedAt:
                firebase.firestore
                  .FieldValue
                  .serverTimestamp()
            }
          );
        }
      );

      await batch.commit();

      /* =====================================================
         RESET ACTION LAMA

         Action lama tidak boleh ikut ronde baru.
         Kita tidak perlu menghapus action.
         Host akan menolak action dengan round lama.
         ===================================================== */

      await roomRef().update({

        status:
          "playing",

        round:
          nextRound,

        players:
          publicPlayers,

        board: [],

        left: null,

        right: null,

        turn: 0,

        boneyard: [],

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
        (
          error.message ||
          error.code ||
          error
        )
      );

      alert(
        "Gagal memulai ronde.\n\n" +
        (
          error.message ||
          error.code ||
          error
        ) +
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

    if (
      !currentUid ||
      !roomId ||
      !db
    ) {
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

    if (!tile) {
      return false;
    }

    if (!board.length) {
      return true;
    }

    return (
      Number(tile[0]) ===
        Number(left) ||

      Number(tile[1]) ===
        Number(left) ||

      Number(tile[0]) ===
        Number(right) ||

      Number(tile[1]) ===
        Number(right)
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

     INI BAGIAN PENTING UNTUK MEMASUKKAN BATU KE MEJA.
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

    /* =====================================================
       MEJA MASIH KOSONG
       ===================================================== */

    if (!board.length) {

      return {
        board: [t],

        left:
          Number(t[0]),

        right:
          Number(t[1])
      };
    }

    const result =
      board.slice();

    /* =====================================================
       PASANG KIRI
       ===================================================== */

    if (side === "left") {

      let placed = [
        Number(t[0]),
        Number(t[1])
      ];

      if (
        Number(placed[1]) ===
        Number(left)
      ) {

        placed = [
          placed[1],
          placed[0]
        ];
      }

      result.unshift(
        placed
      );

      return {
        board: result,

        left:
          Number(placed[0]),

        right:
          Number(right)
      };
    }

    /* =====================================================
       PASANG KANAN
       ===================================================== */

    let placed = [
      Number(t[0]),
      Number(t[1])
    ];

    if (
      Number(placed[0]) ===
      Number(right)
    ) {

      /* Sudah benar */

    } else if (
      Number(placed[1]) ===
      Number(right)
    ) {

      placed = [
        placed[1],
        placed[0]
      ];
    }

    result.push(
      placed
    );

    return {
      board: result,

      left:
        Number(left),

      right:
        Number(placed[1])
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
      roomData.status !==
      "playing"
    ) {
      return;
    }

    const players =
      playerList(roomData);

    const turn =
      Number(
        roomData.turn || 0
      );

    const currentPlayer =
      players[turn];

    if (!currentPlayer) {
      return;
    }

    if (
      currentPlayer.uid !==
      currentUid
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

          uid:
            currentUid,

          type,

          index,

          side,

          round:
            Number(
              roomData.round || 0
            ),

          createdAtMs:
            Date.now(),

          createdAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          processed:
            false
        });

    } catch (error) {

      console.error(
        "Send action:",
        error
      );

      setStatus(
        "❌ Gagal mengirim langkah: " +
        (
          error.message ||
          error.code ||
          error
        )
      );
    }
  }

  /* =========================================================
     ACTION LISTENER
     ========================================================= */

  function subscribeActions() {

    if (actionUnsub) {
      actionUnsub();
      actionUnsub = null;
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
                  change.type ===
                  "added"
              )
              .forEach(
                async change => {

                  /* =================================================
                     HANYA HOST MEMPROSES ACTION
                     ================================================= */

                  if (
                    roomData?.hostUid !==
                    currentUid
                  ) {
                    return;
                  }

                  const actionId =
                    change.doc.id;

                  if (
                    processingActions.has(
                      actionId
                    )
                  ) {
                    return;
                  }

                  processingActions.add(
                    actionId
                  );

                  try {

                    await hostProcessAction(
                      actionId,
                      change.doc.data()
                    );

                  } catch (error) {

                    console.error(
                      "Host action error:",
                      error
                    );

                  } finally {

                    processingActions.delete(
                      actionId
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

            setStatus(
              "Action Firebase error: " +
              (
                error.message ||
                error.code ||
                error
              )
            );
          }
        );
  }

  /* =========================================================
     MARK ACTION PROCESSED
     ========================================================= */

  async function markActionProcessed(
    actionId
  ) {

    if (!actionId) return;

    try {

      await roomRef()
        .collection("actions")
        .doc(actionId)
        .update({

          processed:
            true,

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
     ONLINE RESULTS
     ========================================================= */

  async function calculateOnlineResults(
    players,
    winnerUid = null
  ) {

    const list =
      playerList({
        players
      });

    const results = [];

    /* =====================================================
       AMBIL HAND TERBARU SEMUA PEMAIN
       ===================================================== */

    for (
      const player of list
    ) {

      let hand = [];

      try {

        const snap =
          await roomRef()
            .collection("hands")
            .doc(player.uid)
            .get();

        if (snap.exists) {
          hand =
            decodeTiles(
              snap.data()?.tiles || []
            );
        }

      } catch (error) {

        console.error(
          "Gagal membaca hand:",
          player.uid,
          error
        );

        hand = [];
      }

      results.push({

        uid:
          player.uid,

        name:
          player.name,

        seat:
          Number(
            player.seat || 0
          ),

        pips:
          sumPips(hand),

        handCount:
          hand.length,

        empty:
          winnerUid !== null &&
          player.uid === winnerUid
      });
    }

    /* =====================================================
       URUTKAN HASIL

       1. Kalau ada pemain habis batu,
          dia juara.

       2. Kalau buntu,
          angka/titik paling kecil menang.

       3. Jika sama,
          jumlah batu paling sedikit.

       4. Jika masih sama,
          nomor kursi.
       ===================================================== */

    results.sort(
      (a, b) => {

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

    results.forEach(
      (result, index) => {

        result.place =
          index + 1;

        result.points =
          POINTS[index] ?? 0;
      }
    );

    return results;
  }

  /* =========================================================
     HOST PROCESS ACTION

     INI OTAK GAME ONLINE.

     Semua langkah pemain masuk sebagai ACTION.
     HOST memvalidasi dan memperbarui Firestore.

     PLAY:
       - cek giliran
       - cek batu
       - cek cocok
       - masukkan batu ke board
       - hapus batu dari hand
       - reset PASS
       - update turn

     PASS:
       - cek benar-benar tidak punya batu cocok
       - tambah consecutivePasses
       - update turn

     SELESAI:
       - habis batu
       - semua PASS
     ========================================================= */

  async function hostProcessAction(
    actionId,
    action
  ) {

    if (!roomData) {
      return;
    }

    /* =====================================================
       ROOM TERBARU
       ===================================================== */

    const freshSnapshot =
      await roomRef().get();

    if (!freshSnapshot.exists) {
      return;
    }

    const fresh =
      freshSnapshot.data();

    /* =====================================================
       JIKA BUKAN PLAYING
       ===================================================== */

    if (
      fresh.status !==
      "playing"
    ) {

      await markActionProcessed(
        actionId
      );

      return;
    }

    /* =====================================================
       PEMAIN
       ===================================================== */

    const players =
      playerList(fresh);

    const turn =
      Number(
        fresh.turn || 0
      );

    const player =
      players[turn];

    if (!player) {
      return;
    }

    /* =====================================================
       CEK PEMILIK ACTION
       ===================================================== */

    if (
      action.uid !==
      player.uid
    ) {

      await markActionProcessed(
        actionId
      );

      return;
    }

    /* =====================================================
       CEK RONDE
       ===================================================== */

    if (
      Number(
        action.round || 0
      ) !==
      Number(
        fresh.round || 0
      )
    ) {

      await markActionProcessed(
        actionId
      );

      return;
    }

    /* =====================================================
       HAND PEMAIN
       ===================================================== */

    const handSnapshot =
      await roomRef()
        .collection("hands")
        .doc(player.uid)
        .get();

    if (
      !handSnapshot.exists
    ) {

      await markActionProcessed(
        actionId
      );

      return;
    }

    let hand =
      decodeTiles(
        handSnapshot
          .data()
          ?.tiles || []
      );

    /* =====================================================
       BOARD
       ===================================================== */

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

    /* =====================================================
       PLAY
       ===================================================== */

    if (
      action.type ===
      "play"
    ) {

      const index =
        Number(action.index);

      /* =================================================
         VALIDASI INDEX
         ================================================= */

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

      /* =================================================
         VALIDASI TILE
         ================================================= */

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

      /* =================================================
         SIDE
         ================================================= */

      let side =
        action.side === "left" ||
        action.side === "right"
          ? action.side
          : "right";

      /* Meja kosong selalu menjadi kanan */
      if (!board.length) {
        side = "right";
      }

      /* =================================================
         PASTIKAN SIDE BENAR
         ================================================= */

      if (
        board.length &&
        side === "left"
      ) {

        const matchLeft =
          Number(tile[0]) ===
            Number(left) ||

          Number(tile[1]) ===
            Number(left);

        if (!matchLeft) {
          side = "right";
        }
      }

      if (
        board.length &&
        side === "right"
      ) {

        const matchRight =
          Number(tile[0]) ===
            Number(right) ||

          Number(tile[1]) ===
            Number(right);

        if (!matchRight) {

          const matchLeft =
            Number(tile[0]) ===
              Number(left) ||

            Number(tile[1]) ===
              Number(left);

          if (matchLeft) {
            side = "left";
          }
        }
      }

      /* =================================================
         PASANG BATU

         INI AKAN MEMPERBARUI:
         board
         left
         right
         ================================================= */

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

      /* =================================================
         HAPUS BATU DARI HAND
         ================================================= */

      hand.splice(
        index,
        1
      );

      /* =================================================
         MAIN BERHASIL = PASS RESET
         ================================================= */

      consecutivePasses = 0;

      /* =================================================
         SIMPAN HAND PEMAIN
         ================================================= */

      await roomRef()
        .collection("hands")
        .doc(player.uid)
        .set({

          tiles:
            encodeTiles(hand),

          round:
            Number(
              fresh.round || 0
            ),

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        });

      /* =================================================
         UPDATE DATA PEMAIN
         ================================================= */

      const updatedPlayers =
        players.map(
          p => {

            if (
              p.uid !==
              player.uid
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
          }
        );

      /* =================================================
         PEMAIN HABIS BATU
         ================================================= */

      if (
        hand.length === 0
      ) {

        const results =
          await calculateOnlineResults(
            updatedPlayers,
            player.uid
          );

        const updates = {

          board:
            encodeTiles(board),

          left,

          right,

          boneyard: [],

          players:
            updatedPlayers,

          turn,

          consecutivePasses: 0,

          status:
            "finished",

          finished:
            true,

          blocked:
            false,

          finishReason:
            "empty",

          results,

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        };

        /* =================================================
           SIMPAN HASIL RONDE
           ================================================= */

        await roomRef().update(
          updates
        );

        /* =================================================
           UPDATE LIGA ONLINE
           ================================================= */

        await updateOnlineLeague(
          results
        );

        await markActionProcessed(
          actionId
        );

        return;
      }

      /* =================================================
         LANJUT KE PEMAIN BERIKUTNYA
         ================================================= */

      const nextTurn =
        (
          turn + 1
        ) %
        updatedPlayers.length;

      await roomRef().update({

        board:
          encodeTiles(board),

        left,

        right,

        boneyard: [],

        players:
          updatedPlayers,

        turn:
          nextTurn,

        consecutivePasses,

        status:
          "playing",

        finished:
          false,

        blocked:
          false,

        finishReason:
          null,

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
       PASS
       ===================================================== */

    if (
      action.type ===
      "pass"
    ) {

      /* =================================================
         CEK APAKAH PEMAIN SEBENARNYA MASIH BISA MAIN
         ================================================= */

      const playable =
        hand.some(
          tile =>
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

      /* =================================================
         PASS VALID
         ================================================= */

      consecutivePasses++;

      /* =================================================
         SEMUA PEMAIN PASS
         ================================================= */

      if (
        consecutivePasses >=
        players.length
      ) {

        /* =================================================
           HAND PEMAIN TERAKHIR SUDAH TERSIMPAN
           ================================================= */

        const updatedPlayers =
          players.map(
            p => {

              if (
                p.uid !==
                player.uid
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
            }
          );

        const results =
          await calculateOnlineResults(
            updatedPlayers,
            null
          );

        const updates = {

          board:
            encodeTiles(board),

          left,

          right,

          boneyard: [],

          players:
            updatedPlayers,

          turn,

          consecutivePasses,

          status:
            "finished",

          finished:
            true,

          blocked:
            true,

          finishReason:
            "blocked",

          results,

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        };

        /* =================================================
           SIMPAN HASIL
           ================================================= */

        await roomRef().update(
          updates
        );

        /* =================================================
           UPDATE LIGA ONLINE
           ================================================= */

        await updateOnlineLeague(
          results
        );

        await markActionProcessed(
          actionId
        );

        return;
      }

      /* =================================================
         MASIH ADA PEMAIN
         ================================================= */

      const updatedPlayers =
        players.map(
          p => {

            if (
              p.uid !==
              player.uid
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
          }
        );

      const nextTurn =
        (
          turn + 1
        ) %
        updatedPlayers.length;

      await roomRef().update({

        board:
          encodeTiles(board),

        left,

        right,

        boneyard: [],

        players:
          updatedPlayers,

        turn:
          nextTurn,

        consecutivePasses,

        status:
          "playing",

        finished:
          false,

        blocked:
          false,

        finishReason:
          null,

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
       ACTION TIDAK DIKENAL
       ===================================================== */

    await markActionProcessed(
      actionId
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

    const turn =
      Number(
        roomData.turn || 0
      );

    const turnPlayer =
      players[turn];

    /* =====================================================
       ROUND
       ===================================================== */

    if ($("roundNo")) {
      $("roundNo").textContent =
        roomData.round || 1;
    }

    if ($("turnName")) {
      $("turnName").textContent =
        turnPlayer?.name || "—";
    }

    /* =====================================================
       PLAYER BOX
       ===================================================== */

    if ($("players")) {

      $("players").innerHTML =
        players
          .map(
            (player, index) => `
              <div class="player-box ${
                index === turn &&
                !roomData.finished
                  ? "active"
                  : ""
              }">

                <b>
                  ${esc(player.name)}
                  ${
                    player.uid ===
                    currentUid
                      ? " 👤"
                      : ""
                  }
                </b>

                <small>
                  ${
                    Number(
                      player.handCount ||
                      0
                    )
                  }
                  batu

                  ${
                    index === turn &&
                    !roomData.finished
                      ? " • giliran"
                      : ""
                  }
                </small>

              </div>
            `
          )
          .join("");
    }

    /* =====================================================
       BOARD

       Semua pemain membaca board dari Firestore.
       ===================================================== */

    if ($("board")) {

      $("board").innerHTML =
        roomData.board.length

          ? roomData.board
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

    /* =====================================================
       BONEYARD
       ===================================================== */

    if ($("boneyardInfo")) {

      $("boneyardInfo").textContent =
        "Tidak ada tumpukan kartu";
    }

    /* =====================================================
       BLOCK INFO
       ===================================================== */

    if ($("blockInfo")) {

      $("blockInfo").textContent =
        roomData.blocked

          ? "⛔ PERMAINAN BUNTU • ANGKA TERKECIL MENANG"

          : "";
    }

    /* =====================================================
       GAME FINISHED
       ===================================================== */

    if (
      roomData.status ===
      "finished"
    ) {

      if ($("waitingCard")) {
        $("waitingCard")
          .classList
          .add("hidden");
      }

      if (
        roomData.results &&
        roomData.results.length
      ) {

        showResults(
          roomData.results,
          "online"
        );
      }

      return;
    }

    /* =====================================================
       AMBIL HAND SENDIRI
       ===================================================== */

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
        p =>
          p.uid ===
          currentUid
      );

    const isTurn =
      turnPlayer?.uid ===
      currentUid;

    /* =====================================================
       HAND TITLE
       ===================================================== */

    if ($("handTitle")) {

      $("handTitle").textContent =
        `Kartu ${
          me?.name ||
          "Saya"
        }`;
    }

    /* =====================================================
       RENDER HAND
       ===================================================== */

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

              let side =
                "right";

              /* =================================================
                 PILIH SISI

                 Jika cocok kanan -> kanan.
                 Kalau tidak -> kiri.
                 ================================================= */

              if (
                roomData.board.length
              ) {

                const matchesRight =
                  Number(tile[0]) ===
                    Number(
                      roomData.right
                    ) ||

                  Number(tile[1]) ===
                    Number(
                      roomData.right
                    );

                const matchesLeft =
                  Number(tile[0]) ===
                    Number(
                      roomData.left
                    ) ||

                  Number(tile[1]) ===
                    Number(
                      roomData.left
                    );

                if (
                  matchesRight
                ) {

                  side =
                    "right";

                } else if (
                  matchesLeft
                ) {

                  side =
                    "left";
                }
              }

              sendOnlineAction(
                "play",
                index,
                side
              );
            };

          $("hand")
            .appendChild(
              element
            );
        }
      );
    }

    /* =====================================================
       DRAW DIHILANGKAN
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

      $("passBtn").disabled =
        !isTurn;

      $("passBtn").textContent =
        "Lewat";
    }

    /* =====================================================
       STATUS
       ===================================================== */

    if (isTurn) {

      setStatus(
        "🎯 Giliran kamu."
      );

    } else {

      setStatus(
        "⏳ Menunggu giliran " +
        (
          turnPlayer?.name ||
          "pemain"
        ) +
        "..."
      );
    }
  }

  /* =========================================================
     LEAVE ONLINE ROOM
     ========================================================= */

  async function leaveOnlineRoom() {

    if (
      !roomId ||
      !currentUid
    ) {

      location.reload();

      return;
    }

    if (
      !confirm(
        "Keluar dari room ini?"
      )
    ) {
      return;
    }

    try {

      const ref =
        roomRef();

      const snap =
        await ref.get();

      if (!snap.exists) {

        location.reload();

        return;
      }

      const r =
        snap.data();

      let players =
        playerList(r);

      /* =====================================================
         HAPUS PEMAIN YANG KELUAR
         ===================================================== */

      players =
        players.filter(
          p =>
            p.uid !==
            currentUid
        );

      /* =====================================================
         TIDAK ADA PEMAIN LAGI
         ===================================================== */

      if (
        players.length === 0
      ) {

        await ref.update({

          players: [],

          onlineLeague: [],

          onlineLeagueUpdatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          status:
            "lobby",

          round: 0,

          board: [],

          left: null,

          right: null,

          turn: 0,

          boneyard: [],

          finished: false,

          results: [],

          consecutivePasses: 0,

          finishReason: null,

          blocked: false,

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()
        });

        if (roomUnsub) {
          roomUnsub();
          roomUnsub = null;
        }

        if (actionUnsub) {
          actionUnsub();
          actionUnsub = null;
        }

        alert(
          "Semua pemain sudah keluar. Liga Room kembali 0."
        );

        location.reload();

        return;
      }

      /* =====================================================
         HOST BARU
         ===================================================== */

      let newHostUid =
        r.hostUid;

      if (
        currentUid ===
        r.hostUid
      ) {

        newHostUid =
          players[0].uid;
      }

      /* =====================================================
         SUSUN ULANG SEAT
         ===================================================== */

      players =
        players.map(
          (p, index) => ({
            ...p,

            seat:
              index
          })
        );

      /* =====================================================
         HANYA LIGA PEMAIN YANG MASIH ADA
         ===================================================== */

      let onlineLeague =
        normalizeOnlineLeague(
          r.onlineLeague || []
        );

      const activeUids =
        new Set(
          players.map(
            p => p.uid
          )
        );

      onlineLeague =
        onlineLeague.filter(
          p =>
            activeUids.has(
              p.uid
            )
        );

      /* =====================================================
         RESET KE LOBBY

         Jika pemain keluar saat game,
         ronde dihentikan.
         ===================================================== */

      await ref.update({

        players,

        hostUid:
          newHostUid,

        onlineLeague,

        status:
          "lobby",

        finished:
          false,

        results: [],

        board: [],

        left: null,

        right: null,

        turn: 0,

        boneyard: [],

        consecutivePasses: 0,

        blocked: false,

        finishReason: null,

        updatedAt:
          firebase.firestore
            .FieldValue
            .serverTimestamp()
      });

      if (roomUnsub) {
        roomUnsub();
        roomUnsub = null;
      }

      if (actionUnsub) {
        actionUnsub();
        actionUnsub = null;
      }

      alert(
        "Kamu sudah keluar dari room."
      );

      location.reload();

    } catch (error) {

      console.error(
        "leaveOnlineRoom:",
        error
      );

      alert(
        "Gagal keluar dari room:\n\n" +
        (
          error.message ||
          error.code ||
          error
        )
      );
    }
  }

  /* =========================================================
     LEAVE ROOM BUTTON
     ========================================================= */

  function createLeaveRoomButton() {

    if ($("leaveRoomBtn")) {
      return;
    }

    if (!$("gamePage")) {
      return;
    }

    const btn =
      document.createElement(
        "button"
      );

    btn.id =
      "leaveRoomBtn";

    btn.type =
      "button";

    btn.textContent =
      "🚪 Keluar Room";

    btn.style.cssText = `
      display:none;
      width:100%;
      max-width:220px;
      margin:12px auto;
      padding:11px 16px;
      border:1px solid rgba(255,255,255,.25);
      border-radius:12px;
      cursor:pointer;
      font-size:14px;
      font-weight:700;
      background:rgba(255,80,130,.10);
      color:inherit;
    `;

    btn.onclick =
      leaveOnlineRoom;

    $("gamePage")
      .appendChild(btn);
  }

  /* =========================================================
     RESULTS
     ========================================================= */

  function showResults(
    res,
    type
  ) {

    if (
      !res ||
      !res.length
    ) {
      return;
    }

    if ($("modalTitle")) {

      $("modalTitle").textContent =
        type === "online"
          ? "Ronde Online Selesai"
          : "Ronde Selesai";
    }

    const blocked =
      type === "local"
        ? !!localGame?.blocked
        : roomData?.finishReason ===
            "blocked" ||
          roomData?.blocked === true;

    if ($("modalSub")) {

      $("modalSub").textContent =
        blocked
          ? "⛔ Meja tertutup: total angka batu paling kecil menjadi pemenang."
          : "🏆 Ada pemain yang menghabiskan semua batu.";
    }

    if ($("results")) {

      $("results").innerHTML =
        res
          .map(
            r => `
              <div class="result-row ${
                r.place === 1
                  ? "winner"
                  : ""
              }">

                <b>
                  ${r.place}
                </b>

                <span>
                  ${esc(r.name)}

                  <small>
                    ${Number(
                      r.pips || 0
                    )} angka

                    ${
                      r.empty
                        ? " • HABIS BATU"
                        : ""
                    }
                  </small>
                </span>

                <b>
                  +${Number(
                    r.points || 0
                  )}
                </b>

              </div>
            `
          )
          .join("");
    }

    /* =====================================================
       NEXT BUTTON
       ===================================================== */

    if ($("nextBtn")) {

      $("nextBtn")
        .classList
        .toggle(
          "hidden",
          type === "online" &&
            roomData?.hostUid !==
              currentUid
        );
    }

    /* =====================================================
       BACK TO ROOM
       ===================================================== */

    let backBtn =
      $("backToRoomBtn");

    if (!backBtn) {

      backBtn =
        document.createElement(
          "button"
        );

      backBtn.id =
        "backToRoomBtn";

      backBtn.type =
        "button";

      backBtn.textContent =
        "← Kembali ke Room";

      backBtn.style.cssText = `
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

      backBtn.onmouseenter =
        () => {

          backBtn.style.transform =
            "translateY(-1px)";

          backBtn.style.background =
            "rgba(255,79,163,.18)";
        };

      backBtn.onmouseleave =
        () => {

          backBtn.style.transform =
            "translateY(0)";

          backBtn.style.background =
            "rgba(255,255,255,.10)";
        };

      if ($("nextBtn")) {

        $("nextBtn")
          .insertAdjacentElement(
            "afterend",
            backBtn
          );

      } else if (
        $("results")
      ) {

        $("results")
          .insertAdjacentElement(
            "afterend",
            backBtn
          );
      }
    }

    backBtn.style.display =
      type === "online"
        ? "block"
        : "none";

    backBtn.onclick =
      async () => {

        if ($("modal")) {
          $("modal")
            .classList
            .add("hidden");
        }

        if (
          type === "online"
        ) {

          document
            .querySelectorAll(
              ".page"
            )
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

          if ($("waitingCard")) {
            $("waitingCard")
              .classList
              .remove("hidden");
          }

          if (roomData) {

            const ps =
              playerList(
                roomData
              );

            if ($("roomPlayers")) {

              $("roomPlayers")
                .innerHTML =
                ps
                  .map(
                    p => `
                      <div class="slot">
                        <b>
                          ${esc(p.name)}
                          ${
                            p.uid ===
                            currentUid
                              ? " 👤"
                              : ""
                          }
                        </b>

                        <small>
                          Kursi ${
                            Number(
                              p.seat || 0
                            ) + 1
                          }

                          ${
                            p.uid ===
                            roomData.hostUid
                              ? " • Host"
                              : ""
                          }
                        </small>
                      </div>
                    `
                  )
                  .join("");
            }

            if ($("waitingText")) {

              $("waitingText")
                .textContent =
                `Room ${
                  roomData.code
                } • ${
                  ps.length
                }/4 pemain. Ronde selesai.`;
            }

            if ($("startOnlineBtn")) {

              $("startOnlineBtn")
                .classList
                .toggle(
                  "hidden",
                  !(
                    roomData.hostUid ===
                      currentUid &&
                    ps.length >= 2
                  )
                );

              $("startOnlineBtn")
                .textContent =
                "▶ Mulai Ronde Berikutnya";
            }

            setStatus(
              "Kembali ke room. Tunggu host memulai ronde berikutnya."
            );
          }

        } else {

          document
            .querySelectorAll(
              ".page"
            )
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

          setStatus(
            "Ronde selesai."
          );
        }
      };

    if ($("modal")) {
      $("modal")
        .classList
        .remove("hidden");
    }
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
          mode ===
          "online"
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
          mode ===
          "online"
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
        $("humanCount")
          ?.value || 1
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
          `Masukkan nama Pemain ${
            i + 1
          }.`
        );

        return;
      }
    }

    const normalizedNames =
      names
        .slice(
          0,
          humanCount
        )
        .map(
          name =>
            name.toLowerCase()
        );

    if (
      new Set(
        normalizedNames
      ).size !==
      humanCount
    ) {

      alert(
        "Nama pemain harus berbeda."
      );

      return;
    }

    saveNames();

    mode =
      "local";

    const players = [];

    /* =====================================================
       HUMAN
       ===================================================== */

    for (
      let i = 0;
      i < humanCount;
      i++
    ) {

      players.push({

        id:
          `local-${i}`,

        name:
          names[i],

        human:
          true,

        seat:
          i,

        hand: []
      });
    }

    /* =====================================================
       COMPUTER

       Total maksimal 4 pemain.
       ===================================================== */

    const computerCount =
      4 -
      humanCount;

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

        human:
          false,

        seat:
          humanCount + i,

        hand: []
      });
    }

    /* =====================================================
       DECK
       ===================================================== */

    const deck =
      shuffle(
        deck28()
      );

    /* =====================================================
       SEMUA PEMAIN DAPAT 7
       ===================================================== */

    players.forEach(
      player => {

        player.hand =
          deck.splice(
            0,
            7
          );
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

      boneyard: [],

      board: [],

      left: null,

      right: null,

      turn: 0,

      finished: false,

      blocked: false,

      finishReason:
        null,

      results: []
    };

    localPassCount =
      0;

    /* =====================================================
       LOCAL LEAGUE
       ===================================================== */

    names
      .slice(
        0,
        humanCount
      )
      .forEach(
        ensureLeague
      );

    saveLeague();

    /* =====================================================
       UI
       ===================================================== */

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

      $("welcome")
        .textContent =
        `${names[0]} • Lokal`;
    }

    if ($("roomCode")) {

      $("roomCode")
        .textContent =
        "LOCAL";
    }

    if ($("onlineState")) {

      $("onlineState")
        .textContent =
        "Lokal";
    }

    if ($("waitingCard")) {

      $("waitingCard")
        .classList
        .add("hidden");
    }

    if ($("leaveRoomBtn")) {

      $("leaveRoomBtn")
        .style.display =
        "none";
    }

    if ($("drawBtn")) {

      $("drawBtn")
        .style.display =
        "none";

      $("drawBtn")
        .disabled =
        true;
    }

    if ($("passBtn")) {

      $("passBtn")
        .style.display =
        "";

      $("passBtn")
        .textContent =
        "Lewat";
    }

    renderLocal();

    setStatus(
      `🎮 Giliran ${
        players[0].name
      }.`
    );

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
     LOCAL PLACE TILE
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

      game.board = [
        [
          Number(tile[0]),
          Number(tile[1])
        ]
      ];

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

    /* =====================================================
       LEFT
       ===================================================== */

    if (
      side === "left"
    ) {

      if (
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

      /* =================================================
         RIGHT
         ================================================= */

      if (
        Number(placed[0]) ===
        Number(game.right)
      ) {

        /* benar */

      } else if (
        Number(placed[1]) ===
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

    let side =
      "right";

    if (
      game.board.length
    ) {

      const matchRight =
        Number(tile[0]) ===
          Number(game.right) ||

        Number(tile[1]) ===
          Number(game.right);

      const matchLeft =
        Number(tile[0]) ===
          Number(game.left) ||

        Number(tile[1]) ===
          Number(game.left);

      if (matchRight) {

        side =
          "right";

      } else if (
        matchLeft
      ) {

        side =
          "left";
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

    localPassCount =
      0;

    /* =====================================================
       HABIS BATU
       ===================================================== */

    if (
      player.hand.length ===
      0
    ) {

      finishLocalGame(
        player.id,
        false
      );

      return;
    }

    nextLocalTurn();
  }

  /* =========================================================
     LOCAL PASS
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
          localCanPlay(
            tile
          )
      );

    if (playable) {

      setStatus(
        "⚠️ Masih ada batu yang bisa dimainkan."
      );

      return;
    }

    localPassCount++;

    setStatus(
      `${player.name} PASS (${localPassCount}/${game.players.length}).`
    );

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
        Number(game.turn) +
        1
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

        /* =================================================
           CARI BATU YANG BISA DIMAINKAN
           ================================================= */

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
           BISA MAIN
           ================================================= */

        if (
          playable.length
        ) {

          /*
           * AI memilih batu dengan
           * jumlah titik terbesar.
           */

          playable.sort(
            (a, b) =>
              (
                Number(
                  b.tile[0]
                ) +
                Number(
                  b.tile[1]
                )
              ) -
              (
                Number(
                  a.tile[0]
                ) +
                Number(
                  a.tile[1]
                )
              )
          );

          const selected =
            playable[0];

          let side =
            "right";

          if (
            currentGame.board.length
          ) {

            const matchRight =
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
                );

            const matchLeft =
              Number(
                selected.tile[0]
              ) ===
                Number(
                  currentGame.left
                ) ||

              Number(
                selected.tile[1]
              ) ===
                Number(
                  currentGame.left
                );

            if (matchRight) {

              side =
                "right";

            } else if (
              matchLeft
            ) {

              side =
                "left";
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

          localPassCount =
            0;

          setStatus(
            `🤖 ${currentPlayer.name} memasang batu.`
          );

          /* =================================================
             AI HABIS
             ================================================= */

          if (
            currentPlayer.hand
              .length ===
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
           AI TIDAK BISA MAIN = PASS
           ================================================= */

        localPassCount++;

        setStatus(
          `🤖 ${currentPlayer.name} PASS (${localPassCount}/${currentGame.players.length}).`
        );

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

    game.finished =
      true;

    game.blocked =
      blocked;

    game.finishReason =
      blocked
        ? "blocked"
        : "empty";

    /* =====================================================
       HITUNG HASIL
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
            player.id ===
              winnerId
        })
      );

    /* =====================================================
       URUTKAN
       ===================================================== */

    results.sort(
      (a, b) => {

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
       POIN
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
        `⛔ PERMAINAN BUNTU! ${
          winner?.name ||
          "Pemenang"
        } menang dengan ${
          winner?.pips || 0
        } angka.`
      );

    } else {

      setStatus(
        `🏆 ${
          winner?.name ||
          "Pemenang"
        } menang!`
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

      $("roundNo")
        .textContent =
        game.round;
    }

    if ($("turnName")) {

      $("turnName")
        .textContent =
        game.players[
          game.turn
        ]?.name || "—";
    }

    /* =====================================================
       PLAYERS
       ===================================================== */

    if ($("players")) {

      $("players").innerHTML =
        game.players
          .map(
            (player, index) => `
              <div class="player-box ${
                index ===
                  game.turn &&
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
                  ${
                    player.hand.length
                  }
                  batu

                  ${
                    index ===
                      game.turn &&
                    !game.finished
                      ? " • giliran"
                      : ""
                  }
                </small>

              </div>
            `
          )
          .join("");
    }

    /* =====================================================
       BOARD
       ===================================================== */

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

    /* =====================================================
       NO BONEYARD
       ===================================================== */

    if ($("boneyardInfo")) {

      $("boneyardInfo")
        .textContent =
        "Tidak ada tumpukan kartu";
    }

    /* =====================================================
       BLOCK
       ===================================================== */

    if ($("blockInfo")) {

      $("blockInfo")
        .textContent =
        game.blocked

          ? "⛔ PERMAINAN BUNTU • ANGKA TERKECIL MENANG"

          : "";
    }

    const player =
      game.players[
        game.turn
      ];

    /* =====================================================
       HUMAN HAND
       ===================================================== */

    if (
      player &&
      player.human
    ) {

      if ($("handTitle")) {

        $("handTitle")
          .textContent =
          `Kartu ${
            player.name
          }`;
      }

      if ($("hand")) {

        $("hand").innerHTML =
          "";

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
              .appendChild(
                element
              );
          }
        );
      }

    } else {

      if ($("handTitle")) {

        $("handTitle")
          .textContent =
          "Computer sedang berpikir...";
      }

      if ($("hand")) {

        $("hand").innerHTML = `
          <span class="muted">
            Tunggu giliran computer.
          </span>
        `;
      }
    }

    /* =====================================================
       DRAW
       ===================================================== */

    if ($("drawBtn")) {

      $("drawBtn")
        .style.display =
        "none";

      $("drawBtn")
        .disabled =
        true;
    }

    /* =====================================================
       PASS
       ===================================================== */

    if ($("passBtn")) {

      $("passBtn")
        .style.display =
        "";

      $("passBtn")
        .textContent =
        "Lewat";

      $("passBtn")
        .disabled =
        !player ||
        !player.human ||
        game.finished;
    }
  }

  /* =========================================================
     NEW GAME BUTTON
     ========================================================= */

  if ($("newGameBtn")) {

    $("newGameBtn").onclick =
      function () {

        if (roomUnsub) {
          roomUnsub();
          roomUnsub = null;
        }

        if (actionUnsub) {
          actionUnsub();
          actionUnsub = null;
        }

        location.reload();
      };
  }

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
     RESET LOCAL LEAGUE
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
     HUMAN COUNT
     ========================================================= */

  function updateNameInputs() {

    const count =
      Number(
        $("humanCount")
          ?.value || 1
      );

    if ($("name2Wrap")) {

      $("name2Wrap")
        .classList
        .toggle(
          "hidden",
          count < 2
        );
    }

    if ($("name3Wrap")) {

      $("name3Wrap")
        .classList
        .toggle(
          "hidden",
          count < 3
        );
    }
  }

  if ($("humanCount")) {

    $("humanCount").onchange =
      updateNameInputs;
  }

  /* =========================================================
     TABS
     ========================================================= */

  function switchTab(type) {

    if ($("localTab")) {

      $("localTab")
        .classList
        .toggle(
          "active",
          type === "local"
        );
    }

    if ($("onlineTab")) {

      $("onlineTab")
        .classList
        .toggle(
          "active",
          type === "online"
        );
    }

    if ($("localPanel")) {

      $("localPanel")
        .classList
        .toggle(
          "hidden",
          type !== "local"
        );
    }

    if ($("onlinePanel")) {

      $("onlinePanel")
        .classList
        .toggle(
          "hidden",
          type !== "online"
        );
    }
  }

  if ($("localTab")) {

    $("localTab").onclick =
      () =>
        switchTab(
          "local"
        );
  }

  if ($("onlineTab")) {

    $("onlineTab").onclick =
      () =>
        switchTab(
          "online"
        );
  }

  /* =========================================================
     OPEN GAME PAGE
     ========================================================= */

  function openGamePage() {

    document
      .querySelectorAll(
        ".page"
      )
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

    $("createRoomBtn")
      .disabled =
      true;
  }

  if ($("joinRoomBtn")) {

    $("joinRoomBtn")
      .disabled =
      true;
  }

  /* =====================================================
     DRAW SELALU MATI
     ===================================================== */

  if ($("drawBtn")) {

    $("drawBtn")
      .style.display =
      "none";

    $("drawBtn")
      .disabled =
      true;
  }

  /* =====================================================
     PASS
     ===================================================== */

  if ($("passBtn")) {

    $("passBtn")
      .textContent =
      "Lewat";
  }

  /* =====================================================
     SETUP
     ===================================================== */

  createLeaveRoomButton();

  setupLeagueButton();

  loadNames();

  loadLeague();

  updateNameInputs();

  switchTab(
    "local"
  );

  openGamePage();

  /* =====================================================
     FIREBASE
     ===================================================== */

  if (
    firebaseReady()
  ) {

    initFirebase();

  } else {

    if ($("firebaseStatus")) {

      $("firebaseStatus")
        .textContent =
        "Firebase belum dikonfigurasi.";
    }
  }

})();
