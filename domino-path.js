/* =========================================================
   MBICUKIA DOMINO — NORMAL BOARD PATH V4
   VISUAL ONLY

   PENTING:
   - TIDAK mengacak / menyusun ulang batu.
   - Urutan batu mengikuti ARRAY board dari game.
   - Batu baru yang dipasang ke kanan tetap menjadi ujung kanan.
   - Batu baru yang dipasang ke kiri tetap menjadi ujung kiri.
   - Angka yang tersambung tetap mengikuti left/right dari game.
   - Tidak mengubah Firebase, turn, hand, atau aturan permainan.
   ========================================================= */
(function () {
  "use strict";

  const STYLE_ID = "d2t-domino-normal-path-v4-style";
  const MAX_TILES = 28;

  function installVisualStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
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
        transition: transform .18s ease, opacity .18s ease !important;
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

  /*
     Jalur visual 28 posisi.

     Urutan INI SAMA dengan urutan board dari game.
     Tidak ada pencarian pasangan dan tidak ada reorder DOM.
  */
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

    addHorizontal(4, 3, 9);
    addVertical(10, 3, 2);
    addHorizontal(2, 9, 2);
    addVertical(2, 3, 5);
    addHorizontal(5, 3, 10);

    return path.slice(0, Math.min(Number(count) || 0, MAX_TILES));
  }

  function getBoard() {
    return document.getElementById("board") || document.querySelector(".board");
  }

  function getTiles(board) {
    return Array.from(board.querySelectorAll(":scope > .board-tile"));
  }

  function values(tile) {
    return {
      a: Number(tile.dataset.a),
      b: Number(tile.dataset.b)
    };
  }

  function sameTile(a, b) {
    return a && b &&
      Number(a.dataset.a) === Number(b.dataset.a) &&
      Number(a.dataset.b) === Number(b.dataset.b);
  }

  /*
     Tentukan orientasi berdasarkan tetangga SEBENARNYA.
     Jadi angka yang sama selalu berada di sisi sambungan.

     Default tile:
       a = atas
       b = bawah

     Rotasi:
       -90 = a kiri, b kanan
        90 = b kiri, a kanan
         0 = a atas, b bawah
       180 = b atas, a bawah
  */
  function getRotation(tile, index, tiles, path) {
    const v = values(tile);
    const point = path[index];
    if (!point) return 0;

    const previous = tiles[index - 1] || null;
    const next = tiles[index + 1] || null;
    const pv = previous ? values(previous) : null;
    const nv = next ? values(next) : null;

    let start = v.a;
    let end = v.b;

    /*
       Jika ada batu sebelumnya, sisi awal harus cocok
       dengan angka ujung batu sebelumnya.
    */
    if (pv) {
      const previousEnd = pv.b;

      if (v.a === previousEnd) {
        start = v.a;
        end = v.b;
      } else if (v.b === previousEnd) {
        start = v.b;
        end = v.a;
      }
    } else if (nv) {
      /* Batu pertama: pilih orientasi yang cocok ke batu berikutnya. */
      if (v.b === nv.a || v.b === nv.b) {
        start = v.a;
        end = v.b;
      } else if (v.a === nv.a || v.a === nv.b) {
        start = v.b;
        end = v.a;
      }
    }

    const previousPoint = path[index - 1] || null;
    const nextPoint = path[index + 1] || null;

    if (point.direction === "horizontal") {
      const movingRight = nextPoint
        ? nextPoint.col > point.col
        : previousPoint
          ? point.col > previousPoint.col
          : true;

      if (movingRight) {
        return start === v.a && end === v.b ? -90 : 90;
      }

      return start === v.a && end === v.b ? 90 : -90;
    }

    const movingDown = nextPoint
      ? nextPoint.row > point.row
      : previousPoint
        ? point.row > previousPoint.row
        : true;

    if (movingDown) {
      return start === v.a && end === v.b ? 0 : 180;
    }

    return start === v.a && end === v.b ? 180 : 0;
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

      const rotation = getRotation(tile, index, tiles, path);

      /*
         TIDAK ADA appendChild, innerHTML, sort, atau reorder.
         DOM order tetap persis dari game.
      */
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
