/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL SYSTEM — FINAL
   =========================================================

   LEVEL:
   1. Director
   2. Manager
   3. Supervisor
   4. Reseller
   5. Umum

   FITUR:
   - Terhubung dengan DRW_PRODUCTS
   - Tidak perlu memasukkan 98 produk satu per satu
   - Harga Umum otomatis mengambil product.price
   - Bisa memberikan harga khusus produk tertentu
   - Bisa digunakan products-page.js
   - Bisa digunakan product-detail.js
   - Bisa digunakan cart.js
   - Bisa digunakan checkout.js
   - Tersimpan di localStorage

========================================================= */

(function () {

    "use strict";


    /* =====================================================
       LEVEL HARGA
    ===================================================== */

    const DRW_PRICE_LEVELS = {

        director: "Director",

        manager: "Manager",

        supervisor: "Supervisor",

        reseller: "Reseller",

        umum: "Umum"

    };


    /* =====================================================
       DEFAULT LEVEL
    ===================================================== */

    const DEFAULT_LEVEL = "umum";


    /* =====================================================
       HARGA KHUSUS
       
       HANYA PRODUK YANG SUDAH MEMILIKI
       HARGA KHUSUS DIMASUKKAN DI SINI.

       Produk lain otomatis mengambil:
       
       product.price = HARGA UMUM
       
    ===================================================== */

    const DRW_SPECIAL_PRICES = {

        /* =================================================
           FACIAL WASH OILY ACNE 110 ML
        ================================================= */

        "facial-wash-oily-acne-110-ml": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 105000

        },


        /* =================================================
           DAY PINK CREAM
        ================================================= */

        "day-pink-cream": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 100000

        },


        /* =================================================
           BRIGHTENING CREAM
        ================================================= */

        "brightening-cream": {

            director: 65000,

            manager: 70000,

            supervisor: 75000,

            reseller: 85000,

            umum: 100000

        },


        /* =================================================
           GLOWING BODY LOTION
        ================================================= */

        "glowing-body-lotion": {

            director: 55000,

            manager: 60000,

            supervisor: 65000,

            reseller: 70000,

            umum: 80000

        }

    };


    /* =====================================================
       AMBIL LEVEL LOGIN
    ===================================================== */

    function getLevel() {

        let level =
            localStorage.getItem(
                "drwPriceLevel"
            );


        if (!level) {

            level = DEFAULT_LEVEL;

        }


        level =
            String(level)
                .toLowerCase()
                .trim();


        if (
            !DRW_PRICE_LEVELS[level]
        ) {

            level = DEFAULT_LEVEL;

        }


        return level;

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setLevel(level) {

        level =
            String(level)
                .toLowerCase()
                .trim();


        if (
            !DRW_PRICE_LEVELS[level]
        ) {

            console.warn(
                "❌ Level harga tidak valid:",
                level
            );

            return false;

        }


        localStorage.setItem(
            "drwPriceLevel",
            level
        );


        /* EVENT */

        window.dispatchEvent(
            new CustomEvent(
                "drwPriceChanged",
                {
                    detail: {
                        level: level
                    }
                }
            )
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


        console.log(
            "💰 Level harga:",
            DRW_PRICE_LEVELS[level]
        );


        return true;

    }


    /* =====================================================
       CARI PRODUK
    ===================================================== */

    function findProduct(productId) {

        if (
            !window.DRW_PRODUCTS ||
            !Array.isArray(
                window.DRW_PRODUCTS
            )
        ) {

            return null;

        }


        return window.DRW_PRODUCTS.find(
            function (product) {

                return String(
                    product.id
                ) ===
                String(productId);

            }
        ) || null;

    }


    /* =====================================================
       AMBIL DAFTAR HARGA PRODUK
       
       JIKA ADA HARGA KHUSUS:
           gunakan harga khusus

       JIKA TIDAK:
           semua level sementara menggunakan
           harga Umum dari product.price
       
    ===================================================== */

    function getPriceList(productId) {

        const product =
            findProduct(productId);


        const special =
            DRW_SPECIAL_PRICES[
                productId
            ];


        /* -----------------------------------------------
           HARGA UMUM DARI PRODUCTS DATA
        ------------------------------------------------ */

        let umumPrice = 0;


        if (product) {

            umumPrice =
                Number(
                    product.price ||
                    product.harga ||
                    product.priceUmum ||
                    0
                );

        }


        /* -----------------------------------------------
           JIKA ADA HARGA KHUSUS
        ------------------------------------------------ */

        if (special) {

            return {

                director:
                    Number(
                        special.director ??
                        umumPrice
                    ),

                manager:
                    Number(
                        special.manager ??
                        umumPrice
                    ),

                supervisor:
                    Number(
                        special.supervisor ??
                        umumPrice
                    ),

                reseller:
                    Number(
                        special.reseller ??
                        umumPrice
                    ),

                umum:
                    Number(
                        special.umum ??
                        umumPrice
                    )

            };

        }


        /* -----------------------------------------------
           PRODUK BELUM ADA HARGA KHUSUS

           Untuk sementara semua memakai harga Umum.
        ------------------------------------------------ */

        return {

            director: umumPrice,

            manager: umumPrice,

            supervisor: umumPrice,

            reseller: umumPrice,

            umum: umumPrice

        };

    }


    /* =====================================================
       GET MAIN PRICE
       
       INI YANG DIPAKAI products-page.js
       
       window.DRW_PRICE.getMainPrice(product.id)
    ===================================================== */

    function getMainPrice(productId) {

        const level =
            getLevel();


        const prices =
            getPriceList(
                productId
            );


        return Number(
            prices[level] ??
            prices.umum ??
            0
        );

    }


    /* =====================================================
       GET PRODUCT PRICE
    ===================================================== */

    function getProductPrice(
        productId,
        level
    ) {

        level =
            level ||
            getLevel();


        level =
            String(level)
                .toLowerCase()
                .trim();


        const prices =
            getPriceList(
                productId
            );


        return Number(
            prices[level] ??
            prices.umum ??
            0
        );

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(price) {

        if (
            price === null ||
            price === undefined ||
            isNaN(price)
        ) {

            return "Rp 0";

        }


        return "Rp " +
            Number(price)
                .toLocaleString(
                    "id-ID"
                );

    }


    /* =====================================================
       GET NAMA LEVEL
    ===================================================== */

    function getLevelName(
        level
    ) {

        level =
            level ||
            getLevel();


        level =
            String(level)
                .toLowerCase()
                .trim();


        return (
            DRW_PRICE_LEVELS[level] ||
            DRW_PRICE_LEVELS.umum
        );

    }


    /* =====================================================
       ALIAS
       
       Supaya kompatibel dengan kode lama.
    ===================================================== */

    function getPriceLevel() {

        return getLevel();

    }


    function setPriceLevel(level) {

        return setLevel(level);

    }


    function getPriceLevelName(level) {

        return getLevelName(level);

    }


    /* =====================================================
       RENDER HARGA HTML
       
       HTML:
       
       <span
          class="drw-price"
          data-product-id="..."
       ></span>
       
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
                    getMainPrice(
                        productId
                    );


                element.textContent =
                    formatRupiah(
                        price
                    );

            }
        );


        /* -----------------------------------------------
           NAMA LEVEL
        ------------------------------------------------ */

        const levelElements =
            document.querySelectorAll(
                ".drw-price-level"
            );


        levelElements.forEach(
            function (element) {

                element.textContent =
                    getLevelName();

            }
        );


        /* -----------------------------------------------
           DATA ATTRIBUTE
        ------------------------------------------------ */

        document
            .documentElement
            .setAttribute(
                "data-price-level",
                getLevel()
            );

    }


    /* =====================================================
       DROPDOWN PRICE LEVEL
    ===================================================== */

    function initSelectors() {

        const selectors =
            document.querySelectorAll(
                ".drw-price-selector"
            );


        selectors.forEach(
            function (selector) {

                selector.value =
                    getLevel();


                selector.addEventListener(
                    "change",
                    function () {

                        setLevel(
                            this.value
                        );


                        renderPrices();

                    }
                );

            }
        );

    }


    /* =====================================================
       UPDATE UI LEVEL
    ===================================================== */

    function updateLevelUI() {

        const level =
            getLevel();


        const name =
            getLevelName(
                level
            );


        /* currentPriceLevel */

        const elements =
            document.querySelectorAll(
                "#currentPriceLevel"
            );


        elements.forEach(
            function (element) {

                element.textContent =
                    name;

            }
        );


        /* semua class level */

        const levelElements =
            document.querySelectorAll(
                ".drw-price-level"
            );


        levelElements.forEach(
            function (element) {

                element.textContent =
                    name;

            }
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    function initPriceSystem() {

        console.log(
            "================================="
        );

        console.log(
            "RARA DRW — PRICE SYSTEM FINAL"
        );

        console.log(
            "Level:",
            getLevelName()
        );

        console.log(
            "================================="
        );


        renderPrices();

        updateLevelUI();

        initSelectors();

    }


    /* =====================================================
       EVENT LEVEL BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwPriceChanged",
        function () {

            renderPrices();

            updateLevelUI();

        }
    );


    window.addEventListener(
        "drwPriceLevelChanged",
        function () {

            renderPrices();

            updateLevelUI();

        }
    );


    /* =====================================================
       EXPORT
    ===================================================== */

    window.DRW_PRICE = {

        getLevel:
            getLevel,

        setLevel:
            setLevel,

        getLevelName:
            getLevelName,

        getMainPrice:
            getMainPrice,

        getProductPrice:
            getProductPrice,

        getPriceList:
            getPriceList,

        formatRupiah:
            formatRupiah,

        renderPrices:
            renderPrices,

        updateLevelUI:
            updateLevelUI

    };


    /* =====================================================
       COMPATIBILITY GLOBAL
    ===================================================== */

    window.DRW_PRICE_LIST =
        DRW_SPECIAL_PRICES;


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


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initPriceSystem
        );

    } else {

        initPriceSystem();

    }


})();