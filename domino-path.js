/* =========================================================
   MBICUKIA DOMINO — NORMAL BOARD PATH V5
   VISUAL ONLY

   ATURAN PENTING:
   - TIDAK mengacak batu.
   - TIDAK mencari pasangan angka untuk mengurutkan batu.
   - TIDAK mengubah board dari game.
   - Urutan batu 100% mengikuti roomData.board / localGame.board.
   - Batu yang dimainkan ke kiri tetap berada di ujung kiri.
   - Batu yang dimainkan ke kanan tetap berada di ujung kanan.
   - Path hanya mengatur POSISI VISUAL agar rantai domino membelok.

   STRUKTUR PATH:
   - Baris bawah -> kanan
   - Belok naik
   - Baris atas -> kiri
   - Belok turun
   - Baris bawah -> kanan

   Dengan demikian rantai tidak pernah loncat diagonal di sudut.
   ========================================================= */
(function () {
  "use strict";

  const STYLE_ID = "d2t-domino-normal-path-v5-style";
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

  /* =========================================================
     PATH DOMINO NORMAL — 28 POSISI

     Setiap posisi bersebelahan dengan posisi berikutnya.
     Tidak ada lompatan diagonal di tikungan.

     1 -> 8   : bergerak kanan
     9 -> 10  : bergerak naik
     11 -> 18 : bergerak kiri
     19 -> 21 : bergerak turun
     22 -> 28 : bergerak kanan
     ========================================================= */
  function buildDominoPath(count) {
    const path = [];

    const addHorizontal = (row, from, to) => {
      const step = from <= to ? 1 : -1;

      for (let col = from; ; col += step) {
        path.push({
          col,
          row,
          direction: "horizontal"
        });

        if (col === to) break;
      }
    };

    const addVertical = (col, from, to) => {
      const step = from <= to ? 1 : -1;

      for (let row = from; ; row += step) {
        path.push({
          col,
          row,
          direction: "vertical"
        });

        if (row === to) break;
      }
    };

    // 1-8
    addHorizontal(4, 3, 10);

    // 9-10
    addVertical(10, 3, 2);

    // 11-18
    addHorizontal(2, 9, 2);

    // 19-21
    addVertical(2, 3, 5);

    // 22-28
    addHorizontal(5, 3, 9);

    return path.slice(
      0,
      Math.min(
        Number(count) || 0,
        MAX_TILES
      )
    );
  }

  function getBoard() {
    return (
      document.getElementById("board") ||
      document.querySelector(".board")
    );
  }

  function getTiles(board) {
    /* Game renderBoard memang menggunakan .board-tile. */
    return Array.from(
      board.querySelectorAll(":scope > .board-tile")
    );
  }

  /* =========================================================
     ORIENTASI BATU

     domino1.js sudah menormalisasi board menjadi:

       [leftNumber, rightNumber]

     sehingga orientasi visual TIDAK perlu mencari pasangan lagi.

     Arah path menentukan bagaimana batu diputar:

     kanan : A kiri  -> B kanan   = -90deg
     kiri  : A kanan -> B kiri    = +90deg
     turun : A atas  -> B bawah   = 0deg
     naik  : A bawah -> B atas    = 180deg
     ========================================================= */
  function getRotation(index, path) {
    const point = path[index];
    if (!point) return 0;

    const previous = path[index - 1] || null;
    const next = path[index + 1] || null;

    if (point.direction === "horizontal") {
      const movingRight = next
        ? next.col > point.col
        : previous
          ? point.col > previous.col
          : true;

      return movingRight ? -90 : 90;
    }

    const movingDown = next
      ? next.row > point.row
      : previous
        ? point.row > previous.row
        : true;

    return movingDown ? 0 : 180;
  }

  function applyPath() {
    const board = getBoard();
    if (!board) return;

    installVisualStyle();

    const tiles = getTiles(board);
    if (!tiles.length) return;

    const path = buildDominoPath(
      tiles.length
    );

    tiles.forEach((tile, index) => {
      const point = path[index];
      if (!point) return;

      const rotation = getRotation(
        index,
        path
      );

      /*
         SANGAT PENTING:
         Tidak ada appendChild.
         Tidak ada innerHTML.
         Tidak ada sort.
         Tidak ada reorder.

         DOM order adalah urutan board dari game.
      */
      tile.classList.add(
        "auto-path-tile"
      );

      tile.style.gridColumn =
        String(point.col);

      tile.style.gridRow =
        String(point.row);

      tile.style.transform =
        `rotate(${rotation}deg)`;

      tile.style.transformOrigin =
        "center center";

      tile.style.zIndex =
        String(10 + index);

      tile.style.margin = "0";

      tile.dataset.pathIndex =
        String(index + 1);

      tile.dataset.pathDirection =
        point.direction;

      tile.dataset.pathRotation =
        String(rotation);
    });
  }

  function boot() {
    installVisualStyle();

    const tryInstall = () => {
      const board = getBoard();
      if (!board) return false;

      applyPath();

      if (!board.__d2tNormalPathObserver) {
        const observer =
          new MutationObserver(() => {
            if (
              board.__d2tNormalPathScheduled
            ) {
              return;
            }

            board.__d2tNormalPathScheduled =
              true;

            requestAnimationFrame(() => {
              board.__d2tNormalPathScheduled =
                false;

              applyPath();
            });
          });

        observer.observe(board, {
          childList: true,
          subtree: false
        });

        board.__d2tNormalPathObserver =
          observer;
      }

      return true;
    };

    if (tryInstall()) return;

    let attempts = 0;

    const timer = setInterval(() => {
      attempts += 1;

      if (
        tryInstall() ||
        attempts >= 50
      ) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );
  } else {
    boot();
  }

  window.D2T_DOMINO_PATH = {
    build: buildDominoPath,
    apply: applyPath
  };
})();
