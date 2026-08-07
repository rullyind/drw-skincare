/* =========================================================
   RARA DRW SKINCARE
   PRICE AUTH SYNC — FINAL
   ---------------------------------------------------------
   LOGIN → LEVEL HARGA OTOMATIS

   Director
   Manager
   Supervisor
   Reseller
   Umum

   Sumber level:
   localStorage → drwPriceLevel
========================================================= */

(function () {

    "use strict";

    const LEVELS = {
        director: "Director",
        manager: "Manager",
        supervisor: "Supervisor",
        reseller: "Reseller",
        umum: "Umum"
    };

    const DEFAULT_LEVEL = "umum";


    /* =====================================================
       NORMALIZE LEVEL
    ===================================================== */

    function normalizeLevel(level) {

        level = String(level || "")
            .toLowerCase()
            .trim();

        return LEVELS[level]
            ? level
            : DEFAULT_LEVEL;
    }


    /* =====================================================
       SYNC LEVEL DARI LOGIN
    ===================================================== */

    function syncPriceLevel() {

        let level =
            localStorage.getItem("drwPriceLevel");

        level = normalizeLevel(level);

        localStorage.setItem(
            "drwPriceLevel",
            level
        );

        /* Jika fungsi price-level.js tersedia */
        if (
            typeof window.setPriceLevel === "function"
        ) {

            window.setPriceLevel(level);

        }

        console.log(
            "DRW PRICE AUTH SYNC →",
            LEVELS[level],
            "(" + level + ")"
        );

        return level;
    }


    /* =====================================================
       AMBIL LEVEL USER
    ===================================================== */

    function getAuthPriceLevel() {

        return normalizeLevel(
            localStorage.getItem(
                "drwPriceLevel"
            )
        );

    }


    /* =====================================================
       NAMA LEVEL
    ===================================================== */

    function getAuthPriceLevelName() {

        const level =
            getAuthPriceLevel();

        return LEVELS[level];

    }


    /* =====================================================
       TAMPILKAN LEVEL USER
    ===================================================== */

    function renderAuthPriceLevel() {

        const level =
            getAuthPriceLevel();

        const name =
            LEVELS[level];


        document
            .querySelectorAll(
                ".drw-price-level"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });


        document
            .querySelectorAll(
                "[data-price-level]"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });


        document
            .querySelectorAll(
                ".drw-user-level"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });

    }


    /* =====================================================
       EVENT LOGIN BERHASIL
    ===================================================== */

    window.addEventListener(
        "drwLoginChanged",
        function (event) {

            if (
                event.detail &&
                event.detail.level
            ) {

                const level =
                    normalizeLevel(
                        event.detail.level
                    );

                localStorage.setItem(
                    "drwPriceLevel",
                    level
                );

            }

            syncPriceLevel();

            renderAuthPriceLevel();

            /* Refresh harga */
            if (
                typeof window.renderPrices ===
                "function"
            ) {

                window.renderPrices();

            }

        }
    );


    /* =====================================================
       EVENT LEVEL HARGA BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwPriceLevelChanged",
        function () {

            renderAuthPriceLevel();

        }
    );


    /* =====================================================
       INIT
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            syncPriceLevel();

            renderAuthPriceLevel();

        }
    );


    /* =====================================================
       EXPORT
    ===================================================== */

    window.DRW_AUTH_PRICE_LEVELS =
        LEVELS;

    window.getAuthPriceLevel =
        getAuthPriceLevel;

    window.getAuthPriceLevelName =
        getAuthPriceLevelName;

    window.syncPriceLevel =
        syncPriceLevel;


    console.log(
        "RARA DRW — Price Auth Sync FINAL ✓"
    );

})();