/* =========================================================
   MBICUKIA DOMINO — NORMAL BOARD PATH V6
   VISUAL ONLY

   ATURAN PENTING:
   - TIDAK mengacak batu.
   - TIDAK mencari pasangan angka untuk mengurutkan batu.
   - TIDAK mengubah board dari game.
   - Urutan batu 100% mengikuti roomData.board / localGame.board.
   - Batu yang dimainkan ke kiri tetap berada di ujung kiri.
   - Batu yang dimainkan ke kanan tetap berada di ujung kanan.
   - Path hanya mengatur POSISI VISUAL agar rantai domino membelok.
   - ORIENTASI SETIAP POSISI DIKUNCI agar batu lama TIDAK BERPUTAR
     ketika batu baru masuk ke meja.
   ========================================================= */
(function () {
  "use strict";

  const STYLE_ID = "d2t-domino-normal-path-v6-style";
  const MAX_TILES = 28;

  function installVisualStyle() {
    let style = document.getElementById(STYLE_ID);
    if (style) return;

    style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      .table-wrap .board {
        --cell: 96px !important;
        display: grid !important;
        grid-template-columns: repeat(12, var(--cell)) !important;
        grid-template-rows: repeat(5, var(--cell)) !important;
        width: calc(12 * var(--cell)) !important;
        min-width: calc(12 * var(--cell)) !important;
        height: calc(5 * var(--cell)) !important;
        min-height: calc(5 * var(--cell)) !important;
        padding: 0 !important;
        margin: 0 auto !important;
        gap: 0 !important;
        overflow: visible !important;
        align-items: center !important;
        justify-items: center !important;
      }

      .table-wrap .board > .board-tile {
        width: 48px !important;
        height: 84px !important;
        margin: 0 !important;
        flex: none !important;
        box-sizing: border-box !important;
        transform-origin: center center !important;
        transition: none !important;
        animation: none !important;
        z-index: 2 !important;
      }

      .table-wrap .board > .board-tile .domino-half .pip {
        width: 8px !important;
        height: 8px !important;
      }

      @media (max-width: 900px) {
        .table-wrap .board {
          --cell: 88px !important;
        }

        .table-wrap .board > .board-tile {
          width: 45px !important;
          height: 80px !important;
        }
      }

      @media (max-width: 700px) {
        .table-wrap .board {
          --cell: 80px !important;
        }

        .table-wrap .board > .board-tile {
          width: 42px !important;
          height: 74px !important;
        }

        .table-wrap .board > .board-tile .domino-half .pip {
          width: 7px !important;
          height: 7px !important;
        }
      }

      @media (max-width: 480px) {
        .table-wrap .board {
          --cell: 74px !important;
        }

        .table-wrap .board > .board-tile {
          width: 39px !important;
          height: 68px !important;
        }

        .table-wrap .board > .board-tile .domino-half .pip {
          width: 6px !important;
          height: 6px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     PATH DOMINO NORMAL — 28 POSISI

     1-8   : kanan
     9-10  : naik
     11-18 : kiri
     19-21 : turun
     22-28 : kanan
     ========================================================= */
  function buildDominoPath(count) {
    const path = [];

    const addHorizontal = (row, from, to) => {
      const step = from <= to ? 1 : -1;

      for (let col = from; ; col += step) {
        path.push({ col, row, direction: "horizontal" });
        if (col === to) break;
      }
    };

    const addVertical = (col, from, to) => {
      const step = from <= to ? 1 : -1;

      for (let row = from; ; row += step) {
        path.push({ col, row, direction: "vertical" });
        if (row === to) break;
      }
    };

    addHorizontal(4, 3, 10); // 1-8
    addVertical(10, 3, 2);   // 9-10
    addHorizontal(2, 9, 2);  // 11-18
    addVertical(2, 3, 5);    // 19-21
    addHorizontal(5, 3, 9);  // 22-28

    return path.slice(0, Math.min(Number(count) || 0, MAX_TILES));
  }

  function getBoard() {
    return document.getElementById("board") || document.querySelector(".board");
  }

  function getTiles(board) {
    return Array.from(board.querySelectorAll(":scope > .board-tile"));
  }

  /* =========================================================
     ROTASI DIKUNCI BERDASARKAN POSISI PATH.

     JANGAN menggunakan previous/next di sini.
     Kalau menggunakan next, batu di tikungan akan berubah rotasi
     saat batu berikutnya dimainkan. Itu yang membuat batu terlihat
     berputar dan membingungkan pemain.

     Jadi setiap nomor posisi punya arah tetap:
     1-8   = -90deg  (rantai ke kanan)
     9-10  = 180deg  (rantai naik)
     11-18 = 90deg   (rantai ke kiri)
     19-21 = 0deg    (rantai turun)
     22-28 = -90deg  (rantai ke kanan)
     ========================================================= */
  function getRotation(index) {
    if (index >= 0 && index <= 7) return -90;
    if (index >= 8 && index <= 9) return 180;
    if (index >= 10 && index <= 17) return 90;
    if (index >= 18 && index <= 20) return 0;
    if (index >= 21 && index <= 27) return -90;
    return 0;
  }

  function applyPath() {
    const board = getBoard();
    if (!board) return;

    installVisualStyle();

    const tiles = getTiles(board);
    if (!tiles.length) return;

    const path = buildDominoPath(tiles.length);

    tiles.forEach((tile, index) => {
      const point = path[index];
      if (!point) return;

      const rotation = getRotation(index);

      tile.classList.add("auto-path-tile");
      tile.style.gridColumn = String(point.col);
      tile.style.gridRow = String(point.row);
      tile.style.transform = `rotate(${rotation}deg)`;
      tile.style.transformOrigin = "center center";
      tile.style.zIndex = String(10 + index);
      tile.style.margin = "0";

      tile.dataset.pathIndex = String(index + 1);
      tile.dataset.pathDirection = point.direction;
      tile.dataset.pathRotation = String(rotation);
    });
  }

  function boot() {
    installVisualStyle();

    const tryInstall = () => {
      const board = getBoard();
      if (!board) return false;

      applyPath();

      if (!board.__d2tNormalPathObserver) {
        const observer = new MutationObserver(() => {
          if (board.__d2tNormalPathScheduled) return;

          board.__d2tNormalPathScheduled = true;

          requestAnimationFrame(() => {
            board.__d2tNormalPathScheduled = false;
            applyPath();
          });
        });

        observer.observe(board, {
          childList: true,
          subtree: false
        });

        board.__d2tNormalPathObserver = observer;
      }

      return true;
    };

    if (tryInstall()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;

      if (tryInstall() || attempts >= 50) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.D2T_DOMINO_PATH = {
    build: buildDominoPath,
    apply: applyPath
  };
})();
