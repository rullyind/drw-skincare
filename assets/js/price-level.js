/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL SYSTEM
   ---------------------------------------------------------
   LEVEL:
   1. Director
   2. Manager
   3. Supervisor
   4. Reseller
   5. Umum

   File:
   assets/js/price-level.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       KONFIGURASI HARGA PRODUK
       -----------------------------------------------------
       MASUKKAN HARGA MASING-MASING LEVEL DI SINI.

       Contoh:

       "facial-wash-oily-acne-110-ml": {
           director: 65000,
           manager: 70000,
           supervisor: 75000,
           reseller: 85000,
           umum: 105000
       }

    ===================================================== */

    const DRW_PRICE_LIST = {

        "facial-wash-oily-acne-110-ml": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 105000

        },


        "day-cream-pink": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 100000

        },


        "brightening-cream": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 100000

        },


        "glowing-body-lotion": {

            director: 55000,

            manager: 60000,

            supervisor: 65000,

            reseller: 70000,

            umum: 80000

        }

    };


    /* =====================================================
       NAMA LEVEL
    ===================================================== */

    const DRW_PRICE_LEVELS = {

        director: "Director",

        manager: "Manager",

        supervisor: "Supervisor",

        reseller: "Reseller",

        umum: "Umum"

    };


    /* =====================================================
       LEVEL DEFAULT
    ===================================================== */

    const DEFAULT_LEVEL = "umum";


    /* =====================================================
       AMBIL LEVEL AKTIF
    ===================================================== */

    function getPriceLevel() {

        return (
            localStorage.getItem(
                "drwPriceLevel"
            ) || DEFAULT_LEVEL
        );

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setPriceLevel(level) {

        level =
            String(level)
                .toLowerCase()
                .trim();


        if (
            !DRW_PRICE_LEVELS[level]
        ) {

            console.warn(
                "Level harga tidak ditemukan:",
                level
            );

            return false;

        }


        localStorage.setItem(
            "drwPriceLevel",
            level
        );


        window.dispatchEvent(
            new CustomEvent(
                "drwPriceLevelChanged",
                {
                    detail: {
                        level: level
                    }
                }
            )
        );


        return true;

    }


    /* =====================================================
       AMBIL HARGA PRODUK
    ===================================================== */

    function getProductPrice(
        productId,
        level = getPriceLevel()
    ) {

        const product =
            DRW_PRICE_LIST[productId];


        if (!product) {

            console.warn(
                "Harga produk belum tersedia:",
                productId
            );

            return null;

        }


        return (
            product[level] ??
            product.umum ??
            null
        );

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(
        price
    ) {

        if (
            price === null ||
            price === undefined ||
            isNaN(price)
        ) {

            return "-";

        }


        return "Rp " +
            Number(price)
                .toLocaleString(
                    "id-ID"
                );

    }


    /* =====================================================
       AMBIL NAMA LEVEL
    ===================================================== */

    function getPriceLevelName(
        level = getPriceLevel()
    ) {

        return (
            DRW_PRICE_LEVELS[level] ||
            DRW_PRICE_LEVELS.umum
        );

    }


    /* =====================================================
       TAMPILKAN HARGA OTOMATIS
       -----------------------------------------------------
       HTML:

       <span
           class="drw-price"
           data-product-id="facial-wash-oily-acne-110-ml">
       </span>

    ===================================================== */

    function renderPrices() {

        const elements =
            document.querySelectorAll(
                ".drw-price[data-product-id]"
            );


        elements.forEach(
            function (element) {

                const productId =
                    element.dataset.productId;


                const price =
                    getProductPrice(
                        productId
                    );


                if (
                    price !== null
                ) {

                    element.textContent =
                        formatRupiah(
                            price
                        );

                }

            }
        );


        /* UPDATE NAMA LEVEL */

        const levelElements =
            document.querySelectorAll(
                ".drw-price-level"
            );


        levelElements.forEach(
            function (element) {

                element.textContent =
                    getPriceLevelName();

            }
        );

    }


    /* =====================================================
       DROPDOWN LEVEL HARGA
    ===================================================== */

    function createPriceLevelSelector() {

        const selectors =
            document.querySelectorAll(
                ".drw-price-selector"
            );


        selectors.forEach(
            function (selector) {

                selector.value =
                    getPriceLevel();


                selector.addEventListener(
                    "change",
                    function () {

                        setPriceLevel(
                            this.value
                        );


                        renderPrices();

                    }
                );

            }
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            renderPrices();

            createPriceLevelSelector();

        }
    );


    /* =====================================================
       JIKA LEVEL BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwPriceLevelChanged",
        function () {

            renderPrices();

        }
    );


    /* =====================================================
       EXPORT KE WINDOW
       -----------------------------------------------------
       Bisa dipakai oleh:
       app.js
       cart.js
       checkout.js
       product-detail.js
    ===================================================== */

    window.DRW_PRICE_LIST =
        DRW_PRICE_LIST;


    window.DRW_PRICE_LEVELS =
        DRW_PRICE_LEVELS;


    window.getPriceLevel =
        getPriceLevel;


    window.setPriceLevel =
        setPriceLevel;


    window.getProductPrice =
        getProductPrice;


    window.formatRupiah =
        formatRupiah;


    window.getPriceLevelName =
        getPriceLevelName;


    console.log(
        "RARA DRW — Price Level System Loaded ✓"
    );

})();