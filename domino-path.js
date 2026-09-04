/* =========================================================
   MBICUKIA DOMINO — AUTOMATIC MATCHING PATH V4
   VISUAL BOARD ONLY
   ========================================================= */
(function () {
  "use strict";

  const MAX_TILES = 28;
  const STYLE_ID = "d2t-domino-path-v4-style";

  function installVisualStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* =====================================================
         JARAK BATU — SENGAJA DIBUAT LEBIH LONGGAR
         Ukuran cell jauh lebih besar daripada ukuran batu,
         sehingga batu tidak mungkin saling menempel.
         ===================================================== */
      .table-wrap .board {
        --cell: 110px !important;
        display: grid !important;
        grid-template-columns: repeat(12, var(--cell)) !important;
        grid-template-rows: repeat(5, var(--cell)) !important;
        width: calc(12 * var(--cell)) !important;
        min-width: calc(12 * var(--cell)) !important;
        height: calc(5 * var(--cell)) !important;
        min-height: calc(5 * var(--cell)) !important;
        gap: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .table-wrap .board > .board-tile {
        width: 46px !important;
        height: 80px !important;
        min-width: 46px !important;
        min-height: 80px !important;
        max-width: 46px !important;
        max-height: 80px !important;
        margin: 0 !important;
        padding: 4px !important;
        flex: none !important;
        box-sizing: border-box !important;
        transform-origin: center center !important;
        transition: transform .2s ease !important;
      }

      .table-wrap .board > .board-tile .domino-half .pip {
        width: 8px !important;
        height: 8px !important;
      }

      /* Ruang visual tambahan di antara batu */
      .table-wrap .board > .board-tile.auto-path-tile {
        outline: 0 solid transparent !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.98),
          inset 0 -2px 4px rgba(70,55,35,.16),
          0 5px 14px rgba(0,0,0,.36) !important;
      }

      @media (max-width: 900px) {
        .table-wrap .board {
          --cell: 96px !important;
        }
        .table-wrap .board > .board-tile {
          width: 43px !important;
          height: 76px !important;
          min-width: 43px !important;
          max-width: 43px !important;
          min-height: 76px !important;
          max-height: 76px !important;
        }
      }

      @media (max-width: 700px) {
        .table-wrap .board {
          --cell: 86px !important;
        }
        .table-wrap .board > .board-tile {
          width: 40px !important;
          height: 70px !important;
          min-width: 40px !important;
          max-width: 40px !important;
          min-height: 70px !important;
          max-height: 70px !important;
        }
        .table-wrap .board > .board-tile .domino-half .pip {
          width: 7px !important;
          height: 7px !important;
        }
      }

      @media (max-width: 480px) {
        .table-wrap .board {
          --cell: 78px !important;
        }
        .table-wrap .board > .board-tile {
          width: 36px !important;
          height: 64px !important;
          min-width: 36px !important;
          max-width: 36px !important;
          min-height: 64px !important;
          max-height: 64px !important;
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
     PATH 28 BATU
     kanan -> atas -> kiri -> bawah -> kanan
     ========================================================= */
  function buildDominoPath(count) {
    const path = [];

    function horizontal(row, from, to) {
      const step = from <= to ? 1 : -1;
      for (let col = from; ; col += step) {
        path.push({ col, row, direction: "horizontal" });
        if (col === to) break;
      }
    }

    function vertical(col, from, to) {
      const step = from <= to ? 1 : -1;
      for (let row = from; ; row += step) {
        path.push({ col, row, direction: "vertical" });
        if (row === to) break;
      }
    }

    horizontal(4, 3, 9); // 1-7 kanan
    vertical(10, 3, 2);  // 8-9 atas
    horizontal(2, 9, 2); // 10-17 kiri
    vertical(2, 3, 5);   // 18-20 bawah
    horizontal(5, 3, 10);// 21-28 kanan

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

  /* =========================================================
     CARI RANTAI BERDASARKAN ANGKA
     Contoh hasil:
       6|4 -> 4|2 -> 2|5 -> 5|5
     ========================================================= */
  function buildVisualChain(tiles) {
    if (tiles.length <= 1) {
      return tiles.map(tile => {
        const v = values(tile);
        return { element: tile, left: v.a, right: v.b, unmatched: false };
      });
    }

    const unused = tiles.slice();
    const chain = [];

    const first = unused.shift();
    const fv = values(first);
    chain.push({
      element: first,
      left: fv.a,
      right: fv.b,
      unmatched: false
    });

    let open = fv.b;

    while (unused.length) {
      let index = -1;
      let reverse = false;

      // Cari angka yang sama pada sisi pertama.
      for (let i = 0; i < unused.length; i++) {
        if (values(unused[i]).a === open) {
          index = i;
          reverse = false;
          break;
        }
      }

      // Kalau ada pada sisi kedua, balik batu.
      if (index < 0) {
        for (let i = 0; i < unused.length; i++) {
          if (values(unused[i]).b === open) {
            index = i;
            reverse = true;
            break;
          }
        }
      }

      // Sisa batu yang tidak bisa disambungkan tetap ditampilkan.
      if (index < 0) {
        unused.forEach(tile => {
          const v = values(tile);
          chain.push({
            element: tile,
            left: v.a,
            right: v.b,
            unmatched: true
          });
        });
        break;
      }

      const tile = unused.splice(index, 1)[0];
      const v = values(tile);
      const left = reverse ? v.b : v.a;
      const right = reverse ? v.a : v.b;

      chain.push({
        element: tile,
        left,
        right,
        unmatched: false
      });

      open = right;
    }

    return chain;
  }

  /* =========================================================
     ROTASI
     Batu asli:
       a = atas
       b = bawah

     -90 = a kiri / b kanan
      90 = b kiri / a kanan
       0 = a atas / b bawah
     180 = b atas / a bawah
     ========================================================= */
  function getRotation(item, point, index, path) {
    const v = values(item.element);
    const sameOrder = item.left === v.a && item.right === v.b;

    const previous = path[index - 1] || null;
    const next = path[index + 1] || null;

    if (point.direction === "horizontal") {
      const movingRight = next
        ? next.col > point.col
        : previous
          ? point.col > previous.col
          : true;

      if (movingRight) return sameOrder ? -90 : 90;
      return sameOrder ? 90 : -90;
    }

    const movingDown = next
      ? next.row > point.row
      : previous
        ? point.row > previous.row
        : true;

    if (movingDown) return sameOrder ? 0 : 180;
    return sameOrder ? 180 : 0;
  }

  function apply() {
    const board = getBoard();
    if (!board) return;

    installVisualStyle();

    const tiles = getTiles(board);
    if (!tiles.length) return;

    const chain = buildVisualChain(tiles);
    const path = buildDominoPath(chain.length);

    // Hanya urutan DOM visual yang diubah.
    const wanted = chain.map(item => item.element);
    const current = getTiles(board);
    const different = current.length !== wanted.length || current.some((tile, i) => tile !== wanted[i]);

    if (different) {
      wanted.forEach(tile => board.appendChild(tile));
    }

    chain.forEach((item, index) => {
      const tile = item.element;
      const point = path[index];
      if (!point) return;

      const rotation = getRotation(item, point, index, path);

      tile.classList.add("auto-path-tile");
      tile.style.gridColumn = String(point.col);
      tile.style.gridRow = String(point.row);
      tile.style.transform = `rotate(${rotation}deg)`;
      tile.style.transformOrigin = "center center";
      tile.style.margin = "0";
      tile.style.zIndex = String(100 + index);

      tile.dataset.pathIndex = String(index + 1);
      tile.dataset.pathDirection = point.direction;
      tile.dataset.pathRotation = String(rotation);
      tile.dataset.chainLeft = String(item.left);
      tile.dataset.chainRight = String(item.right);
      tile.dataset.chainMatched = item.unmatched ? "false" : "true";
    });
  }

  function boot() {
    installVisualStyle();

    const start = () => {
      apply();

      const board = getBoard();
      if (!board || board.__d2tPathObserver) return;

      const observer = new MutationObserver(() => {
        if (board.__d2tPathTimer) return;
        board.__d2tPathTimer = requestAnimationFrame(() => {
          board.__d2tPathTimer = 0;
          apply();
        });
      });

      observer.observe(board, { childList: true });
      board.__d2tPathObserver = observer;
    };

    if (getBoard()) {
      start();
      return;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (getBoard()) {
        clearInterval(timer);
        start();
      } else if (tries >= 60) {
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
    apply,
    buildVisualChain
  };
})();
