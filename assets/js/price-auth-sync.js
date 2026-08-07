/* =========================================================
   RARA DRW SKINCARE
   PRICE AUTH SYNC — SAFE FINAL

   LOGIN → LEVEL HARGA

   Director
   Manager
   Supervisor
   Reseller
   Umum

   Sumber:
   localStorage → drwPriceLevel

   PENTING:
   File ini HANYA membaca level login.
   Tidak memanggil setPriceLevel saat INIT.
   Tidak membuat loop dengan price-level.js.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       LEVEL
    ===================================================== */

    const LEVELS = {

        director: "Director",

        manager: "Manager",

        supervisor: "Supervisor",

        reseller: "Reseller",

        umum: "Umum"

    };


    const DEFAULT_LEVEL = "umum";


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalizeLevel(level) {

        level = String(level || "")
            .toLowerCase()
            .trim();

        if (
            Object.prototype.hasOwnProperty
                .call(LEVELS, level)
        ) {

            return level;

        }

        return DEFAULT_LEVEL;

    }


    /* =====================================================
       GET LEVEL
    ===================================================== */

    function getAuthPriceLevel() {

        return normalizeLevel(
            localStorage.getItem(
                "drwPriceLevel"
            )
        );

    }


    /* =====================================================
       GET LEVEL NAME
    ===================================================== */

    function getAuthPriceLevelName() {

        const level =
            getAuthPriceLevel();

        return LEVELS[level];

    }


    /* =====================================================
       SYNC LEVEL
       
       HANYA memastikan localStorage mempunyai
       nilai valid.

       TIDAK memanggil setPriceLevel()
       agar tidak bentrok dengan price-level.js.
    ===================================================== */

    function syncPriceLevel() {

        const current =
            localStorage.getItem(
                "drwPriceLevel"
            );

        const level =
            normalizeLevel(current);

        if (current !== level) {

            localStorage.setItem(
                "drwPriceLevel",
                level
            );

        }

        return level;

    }


    /* =====================================================
       RENDER LEVEL
    ===================================================== */

    function renderAuthPriceLevel() {

        const level =
            getAuthPriceLevel();

        const name =
            LEVELS[level];


        /* .drw-price-level */

        document
            .querySelectorAll(
                ".drw-price-level"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });


        /* #currentPriceLevel */

        document
            .querySelectorAll(
                "#currentPriceLevel"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });


        /* .drw-user-level */

        document
            .querySelectorAll(
                ".drw-user-level"
            )
            .forEach(function (element) {

                element.textContent =
                    name;

            });


        /* data attribute KHUSUS level */

        document.documentElement
            .setAttribute(
                "data-auth-price-level",
                level
            );

    }


    /* =====================================================
       REFRESH
       
       Jika price-level.js sudah tersedia,
       minta price-level.js melakukan refresh.
    ===================================================== */

    function refreshPriceSystem() {

        renderAuthPriceLevel();


        /* Jangan panggil setPriceLevel.
           Hanya refresh tampilan harga. */

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.refresh ===
            "function"
        ) {

            window.DRW_PRICE.refresh();

            return;

        }


        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.renderPrices ===
            "function"
        ) {

            window.DRW_PRICE.renderPrices();

            return;

        }


        if (
            typeof window.renderPrices ===
            "function"
        ) {

            window.renderPrices();

        }

    }


    /* =====================================================
       LOGIN BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwLoginChanged",
        function (event) {

            let level =
                null;


            if (
                event &&
                event.detail &&
                event.detail.level
            ) {

                level =
                    normalizeLevel(
                        event.detail.level
                    );

                localStorage.setItem(
                    "drwPriceLevel",
                    level
                );

            }


            syncPriceLevel();

            refreshPriceSystem();


            console.log(
                "DRW AUTH → PRICE LEVEL:",
                getAuthPriceLevelName()
            );

        }
    );


    /* =====================================================
       PRICE LEVEL BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwPriceChanged",
        function () {

            renderAuthPriceLevel();

        }
    );


    window.addEventListener(
        "drwPriceLevelChanged",
        function () {

            renderAuthPriceLevel();

        }
    );


    /* =====================================================
       DOM READY
    ===================================================== */

    function init() {

        syncPriceLevel();

        renderAuthPriceLevel();


        console.log(
            "RARA DRW — PRICE AUTH SYNC READY ✓"
        );

        console.log(
            "Current Level:",
            getAuthPriceLevelName()
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }


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

    window.renderAuthPriceLevel =
        renderAuthPriceLevel;


})();