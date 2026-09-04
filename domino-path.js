/* =========================================================
   MBICUKIA DOMINO — AUTOMATIC CHAIN PATH V2
   Visual board enhancement only.
   - Batu dibuat berdampingan dengan jarak yang nyaman.
   - Urutan visual mengikuti angka yang tersambung.
   - Orientasi batu otomatis mengikuti ujung rantai.
   - Path berbelok otomatis.
   - Tidak mengubah Firebase, giliran, hand, atau aturan game.
   ========================================================= */
(function () {
  "use strict";

  const MAX_TILES = 28;
  const STYLE_ID = "d2t-domino-path-v2-style";

  /* ---------------------------------------------------------
     STYLE TAMBAHAN
     Grid diperlebar agar batu tidak saling menempel.
  --------------------------------------------------------- */
  function installVisualStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .table-wrap .board {
        --cell: 88px !important;
        grid-template-columns: repeat(12, var(--cell)) !important;
        grid-template-rows: repeat(5, var(--cell)) !important;
        width: calc(12 * var(--cell)) !important;
        min-width: calc(12 * var(--cell)) !important;
        height: calc(5 * var(--cell)) !important;
        min-height: calc(5 * var(--cell)) !important;
        column-gap: 0 !important;
        row-gap: 0 !important;
      }

      .table-wrap .board > .board-tile {
        width: 50px !important;
        height: 86px !important;
        margin: 0 !important;
        flex: none !important;
        transform-origin: center center !important;
        transition: transform .22s ease, left .22s ease, top .22s ease !important;
      }

      .table-wrap .board > .board-tile .domino-half .pip {
        width: 8px !important;
        height: 8px !important;
      }

      .table-wrap .board > .board-tile.auto-path-tile {
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.96),
          inset 0 -2px 4px rgba(70,55,35,.15),
          0 5px 12px rgba(0,0,0,.34) !important;
      }

      @media (max-width: 700px) {
        .table-wrap .board {
          --cell: 76px !important;
        }
        .table-wrap .board > .board-tile {
          width: 43px !important;
          height: 74px !important;
        }
        .table-wrap .board > .board-tile .domino-half .pip {
          width: 7px !important;
          height: 7px !important;
        }
      }

      @media (max-width: 480px) {
        .table-wrap .board {
          --cell: 68px !important;
        }
        .table-wrap .board > .board-tile {
          width: 40px !important;
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

  /* ---------------------------------------------------------
     PATH

     1-7   : kanan
     8-9   : naik di kanan
     10-17 : kiri
     18-20 : turun di kiri
     21-28 : kanan
  --------------------------------------------------------- */
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

    addHorizontal(4, 3, 9); // 1-7
    addVertical(10, 3, 2);  // 8-9
    addHorizontal(2, 9, 2); // 10-17
    addVertical(2, 3, 5);   // 18-20
    addHorizontal(5, 3, 10);// 21-28

    return path.slice(0, Math.min(Number(count) || 0, MAX_TILES));
  }

  function getBoardElement() {
    return document.getElementById("board") || document.querySelector(".board");
  }

  function getBoardTiles(board) {
    return Array.from(board.querySelectorAll(":scope > .board-tile"));
  }

  function tileValues(tile) {
    return {
      a: Number(tile.dataset.a),
      b: Number(tile.dataset.b)
    };
  }

  /* ---------------------------------------------------------
     SUSUN ULANG SECARA VISUAL BERDASARKAN ANGKA

     Contoh:
       6|4 -> 4|2 -> 2|5 -> 5|5

     Jika batu berikutnya mempunyai angka yang cocok di sisi
     belakang, batu akan diputar supaya angka yang sama benar-
     benar berada di sisi yang menyambung.

     DOM diurutkan hanya untuk tampilan. Data game/Firebase tidak
     disentuh.
  --------------------------------------------------------- */
  function buildVisualChain(tiles) {
    if (tiles.length <= 1) return tiles.slice();

    const unused = tiles.slice();
    const chain = [];

    // Batu pertama tetap mengikuti urutan game.
    const first = unused.shift();
    chain.push({ element: first, matchSide: "none" });

    let openNumber = tileValues(first).b;

    while (unused.length) {
      let foundIndex = -1;
      let matchSide = "none";

      // Prioritaskan batu yang angka pertamanya sama dengan ujung.
      for (let i = 0; i < unused.length; i++) {
        const t = tileValues(unused[i]);
        if (t.a === openNumber) {
          foundIndex = i;
          matchSide = "a";
          break;
        }
      }

      // Kalau angka cocok ada di sisi kedua, batu dibalik secara visual.
      if (foundIndex < 0) {
        for (let i = 0; i < unused.length; i++) {
          const t = tileValues(unused[i]);
          if (t.b === openNumber) {
            foundIndex = i;
            matchSide = "b";
            break;
          }
        }
      }

      // Tidak ada batu yang cocok: sisanya tetap ditampilkan.
      if (foundIndex < 0) {
        unused.forEach(element => chain.push({ element, matchSide: "none" }));
        break;
      }

      const picked = unused.splice(foundIndex, 1)[0];
      const values = tileValues(picked);

      chain.push({ element: picked, matchSide });
      openNumber = matchSide === "a" ? values.b : values.a;
    }

    return chain;
  }

  /* ---------------------------------------------------------
     ORIENTASI BATU

     Base tile = angka a di atas, b di bawah.

     Horizontal:
       rotate(-90) => a di kiri, b di kanan.
       rotate(90)  => a di kanan, b di kiri.

     Vertical:
       rotate(0)   => a di atas, b di bawah.
       rotate(180) => a di bawah, b di atas.
  --------------------------------------------------------- */
  function getRotation(item, pathPoint, previousNumber) {
    const { a, b } = tileValues(item.element);

    if (pathPoint.direction === "vertical") {
      if (previousNumber == null) return 0;
      if (a === previousNumber) return 0;
      if (b === previousNumber) return 180;
      return 0;
    }

    if (previousNumber == null) return -90;
    if (a === previousNumber) return -90;
    if (b === previousNumber) return 90;
    return -90;
  }

  function applyDominoPath() {
    const board = getBoardElement();
    if (!board) return;

    installVisualStyle();

    const originalTiles = getBoardTiles(board);
    if (!originalTiles.length) return;

    const visualChain = buildVisualChain(originalTiles);
    const path = buildDominoPath(visualChain.length);

    // Urutan DOM visual mengikuti rantai angka.
    visualChain.forEach(item => board.appendChild(item.element));

    let previousNumber = null;

    visualChain.forEach((item, index) => {
      const tile = item.element;
      const point = path[index];
      if (!point) return;

      const values = tileValues(tile);
      const rotation = getRotation(item, point, previousNumber);

      tile.classList.add("auto-path-tile");
      tile.style.gridColumn = String(point.col);
      tile.style.gridRow = String(point.row);
      tile.style.transform = `rotate(${rotation}deg)`;
      tile.style.transformOrigin = "center center";
      tile.style.zIndex = String(10 + index);
      tile.style.margin = "0";

      // Simpan info untuk debugging.
      tile.dataset.pathIndex = String(index + 1);
      tile.dataset.pathDirection = point.direction;
      tile.dataset.pathRotation = String(rotation);

      // Tentukan angka yang terbuka di ujung kanan rantai.
      if (previousNumber == null) {
        previousNumber = values.b;
      } else if (values.a === previousNumber) {
        previousNumber = values.b;
      } else if (values.b === previousNumber) {
        previousNumber = values.a;
      } else {
        previousNumber = values.b;
      }
    });
  }

  function installObserver() {
    const board = getBoardElement();
    if (!board) return false;

    applyDominoPath();

    if (!board.__d2tDominoPathObserver) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(() => {
          // appendChild di applyDominoPath juga mengubah childList,
          // tetapi observer tidak dibuat ulang dan render kedua tidak
          // menyebabkan perubahan data game.
          if (!board.__d2tDominoPathApplying) {
            board.__d2tDominoPathApplying = true;
            try {
              applyDominoPath();
            } finally {
              board.__d2tDominoPathApplying = false;
            }
          }
        });
      });

      observer.observe(board, {
        childList: true,
        subtree: false
      });

      board.__d2tDominoPathObserver = observer;
    }

    return true;
  }

  function boot() {
    installVisualStyle();

    if (installObserver()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (installObserver() || attempts >= 40) {
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
    apply: applyDominoPath,
    buildVisualChain
  };
})();
