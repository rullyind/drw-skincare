/* =========================================================
   MBICUKIA DOMINO — AUTOMATIC BOARD PATH
   Visual positioning only.

   Fungsi:
   - Batu tidak lagi tersusun lurus panjang.
   - Path bergerak horizontal lalu berbelok otomatis.
   - Saat mencapai sisi kanan: naik.
   - Kemudian bergerak kembali ke kiri.
   - Saat mencapai sisi kiri: turun.
   - Maksimal 28 batu sesuai double-six domino.
   - Tidak mengubah aturan game, giliran, Firebase, atau hand.
   ========================================================= */
(function () {
  "use strict";

  const MAX_TILES = 28;

  /*
     Jalur dibuat mengikuti grid domino1.css:

       row 4 : col 3 -> 9  = 7 batu
       col 10: row 3 -> 2   = 2 batu
       row 2 : col 9 -> 2   = 8 batu
       col 2 : row 3 -> 5   = 3 batu
       row 5 : col 3 -> 10  = 8 batu

     Total = 28 posisi.
  */
  function buildDominoPath(count) {
    const path = [];

    const addHorizontal = (row, from, to, rotate) => {
      const step = from <= to ? 1 : -1;

      for (let col = from; ; col += step) {
        path.push({
          col,
          row,
          rotate
        });

        if (col === to) break;
      }
    };

    const addVertical = (col, from, to, rotate) => {
      const step = from <= to ? 1 : -1;

      for (let row = from; ; row += step) {
        path.push({
          col,
          row,
          rotate
        });

        if (row === to) break;
      }
    };

    // 1-7: bergerak ke kanan.
    addHorizontal(4, 3, 9, 90);

    // 8-9: belok naik di kanan.
    addVertical(10, 3, 2, 0);

    // 10-17: bergerak kembali ke kiri.
    addHorizontal(2, 9, 2, 90);

    // 18-20: belok turun di kiri.
    addVertical(2, 3, 5, 0);

    // 21-28: bergerak lagi ke kanan.
    addHorizontal(5, 3, 10, 90);

    return path.slice(0, Math.min(Number(count) || 0, MAX_TILES));
  }

  function getBoardElement() {
    return document.getElementById("board") ||
      document.querySelector(".board");
  }

  function getBoardTiles(board) {
    return Array.from(
      board.querySelectorAll(":scope > .board-tile")
    );
  }

  function applyDominoPath() {
    const board = getBoardElement();
    if (!board) return;

    const tiles = getBoardTiles(board);

    if (!tiles.length) return;

    const path = buildDominoPath(tiles.length);

    tiles.forEach((tile, index) => {
      const point = path[index];
      if (!point) return;

      tile.classList.add("auto-path-tile");

      tile.style.gridColumn = String(point.col);
      tile.style.gridRow = String(point.row);
      tile.style.transform = `rotate(${point.rotate}deg)`;
      tile.style.transformOrigin = "center center";
      tile.style.zIndex = String(10 + index);
    });
  }

  function installObserver() {
    const board = getBoardElement();
    if (!board) return false;

    applyDominoPath();

    // Render online/local mengganti innerHTML board.
    // Observer otomatis menjalankan path kembali setelah perubahan.
    if (!board.__d2tDominoPathObserver) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(applyDominoPath);
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
    if (installObserver()) return;

    // domino1.js mungkin dibuat setelah DOM siap.
    // Coba beberapa kali tanpa mengganggu game.
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;

      if (installObserver() || attempts >= 30) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // Bisa dipakai untuk debug dari console bila diperlukan.
  window.D2T_DOMINO_PATH = {
    build: buildDominoPath,
    apply: applyDominoPath
  };
})();
