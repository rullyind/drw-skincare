/* =========================================================
   MBICUKIA DOMINO — AUTOMATIC MATCHING PATH V3
   VISUAL ONLY
   - Batu tidak saling menempel.
   - Urutan visual mengikuti angka domino yang tersambung.
   - Setiap batu diputar agar angka yang sama berada di sisi sambungan.
   - Path otomatis berbelok kanan -> atas -> kiri -> bawah -> kanan.
   - Tidak mengubah Firebase, giliran, hand, atau aturan game.
   ========================================================= */
(function () {
  "use strict";

  const MAX_TILES = 28;
  const STYLE_ID = "d2t-domino-path-v3-style";

  function installVisualStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .table-wrap .board {
        --cell: 96px !important;
        grid-template-columns: repeat(12, var(--cell)) !important;
        grid-template-rows: repeat(5, var(--cell)) !important;
        width: calc(12 * var(--cell)) !important;
        min-width: calc(12 * var(--cell)) !important;
        height: calc(5 * var(--cell)) !important;
        min-height: calc(5 * var(--cell)) !important;
        column-gap: 0 !important;
        row-gap: 0 !important;
        overflow: visible !important;
      }

      .table-wrap .board > .board-tile {
        width: 50px !important;
        height: 86px !important;
        margin: 0 !important;
        padding: 4px !important;
        flex: none !important;
        transform-origin: center center !important;
        transition: transform .22s ease, grid-column .22s ease, grid-row .22s ease !important;
        box-sizing: border-box !important;
      }

      .table-wrap .board > .board-tile .domino-half {
        min-height: 0 !important;
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

      @media (max-width: 900px) {
        .table-wrap .board {
          --cell: 88px !important;
        }
        .table-wrap .board > .board-tile {
          width: 46px !important;
          height: 80px !important;
        }
      }

      @media (max-width: 700px) {
        .table-wrap .board {
          --cell: 80px !important;
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
          --cell: 74px !important;
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

  /* Jalur 28 posisi. Setiap posisi adalah titik tengah satu batu. */
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

    addHorizontal(4, 3, 9); // 1-7  -> kanan
    addVertical(10, 3, 2);  // 8-9  -> naik
    addHorizontal(2, 9, 2); // 10-17 -> kiri
    addVertical(2, 3, 5);   // 18-20 -> turun
    addHorizontal(5, 3, 10);// 21-28 -> kanan

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

  /*
     Cari rantai visual dari batu yang sedang ada di meja.
     Ini hanya mengubah urutan DOM, bukan array/data permainan.
  */
  function buildVisualChain(tiles) {
    if (tiles.length <= 1) {
      return tiles.map(element => ({ element, reversed: false }));
    }

    const unused = tiles.slice();
    const chain = [];

    // Batu pertama tetap menjadi titik awal.
    const first = unused.shift();
    let firstValues = tileValues(first);
    chain.push({
      element: first,
      reversed: false,
      left: firstValues.a,
      right: firstValues.b
    });

    let openNumber = firstValues.b;

    while (unused.length) {
      let foundIndex = -1;
      let reversed = false;

      // Prioritas: a sama dengan angka ujung rantai.
      for (let i = 0; i < unused.length; i++) {
        const v = tileValues(unused[i]);
        if (v.a === openNumber) {
          foundIndex = i;
          reversed = false;
          break;
        }
      }

      // Jika b yang sama, batu dibalik secara visual.
      if (foundIndex < 0) {
        for (let i = 0; i < unused.length; i++) {
          const v = tileValues(unused[i]);
          if (v.b === openNumber) {
            foundIndex = i;
            reversed = true;
            break;
          }
        }
      }

      // Bila tidak ada pasangan, jangan hilangkan batu.
      if (foundIndex < 0) {
        unused.forEach(element => {
          const v = tileValues(element);
          chain.push({
            element,
            reversed: false,
            left: v.a,
            right: v.b,
            unmatched: true
          });
        });
        break;
      }

      const picked = unused.splice(foundIndex, 1)[0];
      const v = tileValues(picked);
      const left = reversed ? v.b : v.a;
      const right = reversed ? v.a : v.b;

      chain.push({
        element: picked,
        reversed,
        left,
        right
      });

      openNumber = right;
    }

    return chain;
  }

  /*
     Rotasi mengikuti arah jalur dan orientasi angka.

     Batu dasar:
       a = atas
       b = bawah

     -90° : a kiri,  b kanan
      90° : b kiri,  a kanan
       0° : a atas,  b bawah
     180° : b atas,  a bawah
  */
  function rotationFor(chainItem, point, previousNumber) {
    const v = tileValues(chainItem.element);
    const start = chainItem.left;
    const end = chainItem.right;

    if (point.direction === "horizontal") {
      // Jalur horizontal bergerak mengikuti koordinat path.
      // Pada baris 4 dan 5 bergerak ke kanan; baris 2 bergerak ke kiri.
      const previousPoint = point.__previous;
      const nextPoint = point.__next;
      const movingRight = nextPoint ? nextPoint.col > point.col : previousPoint ? point.col > previousPoint.col : true;

      if (movingRight) {
        // start di kiri, end di kanan.
        return start === v.a && end === v.b ? -90 : 90;
      }

      // moving left: start berada di kanan, end di kiri.
      return start === v.a && end === v.b ? 90 : -90;
    }

    // Jalur vertikal:
    // row mengecil = bergerak ke atas, row membesar = turun.
    const previousPoint = point.__previous;
    const nextPoint = point.__next;
    const movingDown = nextPoint ? nextPoint.row > point.row : previousPoint ? point.row > previousPoint.row : true;

    if (movingDown) {
      return start === v.a && end === v.b ? 0 : 180;
    }

    return start === v.a && end === v.b ? 180 : 0;
  }

  function applyDominoPath() {
    const board = getBoardElement();
    if (!board) return;

    installVisualStyle();

    const originalTiles = getBoardTiles(board);
    if (!originalTiles.length) return;

    const visualChain = buildVisualChain(originalTiles);
    const path = buildDominoPath(visualChain.length);

    path.forEach((point, index) => {
      point.__previous = path[index - 1] || null;
      point.__next = path[index + 1] || null;
    });

    // Susun ulang DOM hanya jika memang berbeda.
    const desiredOrder = visualChain.map(item => item.element);
    const currentOrder = getBoardTiles(board);
    const changed = currentOrder.some((tile, index) => tile !== desiredOrder[index]);

    if (changed) {
      desiredOrder.forEach(tile => board.appendChild(tile));
    }

    visualChain.forEach((item, index) => {
      const tile = item.element;
      const point = path[index];
      if (!point) return;

      const rotation = rotationFor(item, point, index > 0 ? visualChain[index - 1].right : null);

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
      tile.dataset.chainLeft = String(item.left);
      tile.dataset.chainRight = String(item.right);
      tile.dataset.chainMatched = item.unmatched ? "false" : "true";
    });
  }

  function installObserver() {
    const board = getBoardElement();
    if (!board) return false;

    applyDominoPath();

    if (!board.__d2tDominoPathObserver) {
      const observer = new MutationObserver(() => {
        if (board.__d2tDominoPathScheduled) return;
        board.__d2tDominoPathScheduled = true;

        requestAnimationFrame(() => {
          board.__d2tDominoPathScheduled = false;
          applyDominoPath();
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
      if (installObserver() || attempts >= 50) {
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
