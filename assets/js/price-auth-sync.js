/* =========================================================
   RARA DRW SKINCARE
   PRICE AUTH SYNC — FINAL
   =========================================================

   LOGIN:
   Director
   Manager
   Supervisor
   Reseller
   Umum

   SISTEM:
   auth.js
        ↓
   price-auth-sync.js
        ↓
   price-level.js
        ↓
   products / detail / cart / checkout
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       NORMALIZE LEVEL
    ===================================================== */

    function normalizeLevel(level) {

        if (!level) {
            return "umum";
        }

        const value =
            String(level)
                .trim()
                .toLowerCase();


        const map = {

            "director": "director",

            "direktur": "director",

            "manager": "manager",

            "manajer": "manager",

            "supervisor": "supervisor",

            "reseller": "reseller",

            "umum": "umum",

            "general": "umum"

        };


        return map[value] || "umum";

    }


    /* =====================================================
       GET LOGIN USER
    ===================================================== */

    function getLoggedUser() {

        try {

            /* SISTEM AUTH BARU */

            if (
                window.DRW_AUTH &&
                typeof window.DRW_AUTH.getCurrentUser ===
                "function"
            ) {

                const user =
                    window.DRW_AUTH.getCurrentUser();

                if (user) {
                    return user;
                }

            }


            /* BACKUP STORAGE */

            const saved =
                localStorage.getItem(
                    "raraDrwCurrentUser"
                );


            if (saved) {

                return JSON.parse(
                    saved
                );

            }


        } catch (error) {

            console.error(
                "DRW USER ERROR:",
                error
            );

        }


        return null;

    }


    /* =====================================================
       APPLY PRICE LEVEL
    ===================================================== */

    function syncPriceLevel() {

        const user =
            getLoggedUser();


        let level =
            "umum";


        if (user && user.role) {

            level =
                normalizeLevel(
                    user.role
                );

        }


        /* =========================================
           HUBUNGKAN KE price-level.js
        ========================================= */

        if (
            typeof window.setPriceLevel ===
            "function"
        ) {

            window.setPriceLevel(
                level
            );

        }


        /* =========================================
           SIMPAN LEVEL AKTIF
        ========================================= */

        localStorage.setItem(
            "drwActivePriceLevel",
            level
        );


        /* =========================================
           GLOBAL VARIABLE
        ========================================= */

        window.DRW_ACTIVE_PRICE_LEVEL =
            level;


        console.log(
            "DRW PRICE LEVEL:",
            level
        );


        return level;

    }


    /* =====================================================
       GET ACTIVE LEVEL
    ===================================================== */

    function getActiveLevel() {

        const user =
            getLoggedUser();


        if (
            user &&
            user.role
        ) {

            return normalizeLevel(
                user.role
            );

        }


        const saved =
            localStorage.getItem(
                "drwActivePriceLevel"
            );


        return normalizeLevel(
            saved || "umum"
        );

    }


    /* =====================================================
       GET PRICE
    ===================================================== */

    function getDRWPrice(
        productId,
        fallbackPrice = 0
    ) {

        /*
           Gunakan fungsi dari price-level.js
           jika tersedia.
        */

        if (
            typeof window.getProductPrice ===
            "function"
        ) {

            const price =
                window.getProductPrice(
                    productId
                );


            if (
                typeof price === "number" &&
                !Number.isNaN(price)
            ) {

                return price;

            }

        }


        return Number(
            fallbackPrice
        ) || 0;

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatDRWPrice(
        price
    ) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(price) || 0
        );

    }


    /* =====================================================
       UPDATE PRICE ELEMENT
       
       Bisa digunakan:
       
       <span
         class="drw-price"
         data-product-id="..."
       ></span>
    ===================================================== */

    function refreshPriceElements() {

        const elements =
            document.querySelectorAll(
                "[data-product-id].drw-price"
            );


        elements.forEach(
            function (element) {

                const productId =
                    element.dataset.productId;


                if (!productId) {
                    return;
                }


                const fallback =
                    Number(
                        element.dataset.price
                    ) || 0;


                const price =
                    getDRWPrice(
                        productId,
                        fallback
                    );


                element.textContent =
                    formatDRWPrice(
                        price
                    );

            }
        );

    }


    /* =====================================================
       EXPOSE GLOBAL
    ===================================================== */

    window.DRW_PRICE = {

        sync:
            syncPriceLevel,

        getLevel:
            getActiveLevel,

        getPrice:
            getDRWPrice,

        format:
            formatDRWPrice,

        refresh:
            refreshPriceElements

    };


    /* =====================================================
       START
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            syncPriceLevel();

            refreshPriceElements();

        }
    );


})();