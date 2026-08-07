/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL SYSTEM — SAFE VERSION
   =========================================================

   LEVEL:
   Director
   Manager
   Supervisor
   Reseller
   Umum

   FITUR:
   - Terhubung dengan DRW_PRODUCTS
   - Tidak perlu input 98 produk
   - Harga Umum otomatis dari product.price
   - Bisa harga khusus produk tertentu
   - localStorage
   - Bisa dipakai products-page.js
   - Bisa dipakai product-detail.js
   - Bisa dipakai cart.js
   - Bisa dipakai checkout.js
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
       HARGA KHUSUS
       
       HANYA produk tertentu yang perlu harga berbeda
       dimasukkan di sini.

       Produk lain otomatis:
       semua level = product.price
    ===================================================== */

    const SPECIAL_PRICES = {

        "facial-wash-oily-acne-110-ml": {
            director: 65000,
            manager: 70000,
            supervisor: 75000,
            reseller: 85000,
            umum: 105000
        },

        "day-pink-cream": {
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
       GET LEVEL
    ===================================================== */

    function getLevel() {

        return normalizeLevel(
            localStorage.getItem("drwPriceLevel")
        );

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setLevel(level) {

        level = normalizeLevel(level);

        localStorage.setItem(
            "drwPriceLevel",
            level
        );

        window.dispatchEvent(
            new CustomEvent("drwPriceChanged", {
                detail: {
                    level: level
                }
            })
        );

        return true;
    }


    /* =====================================================
       LEVEL NAME
    ===================================================== */

    function getLevelName(level) {

        level = normalizeLevel(
            level || getLevel()
        );

        return LEVELS[level];

    }


    /* =====================================================
       CARI DRW_PRODUCTS
       
       SUPPORT:
       window.DRW_PRODUCTS
       DRW_PRODUCTS
    ===================================================== */

    function getProducts() {

        if (
            window.DRW_PRODUCTS &&
            Array.isArray(window.DRW_PRODUCTS)
        ) {
            return window.DRW_PRODUCTS;
        }

        return [];

    }


    /* =====================================================
       FIND PRODUCT
    ===================================================== */

    function findProduct(productId) {

        const products = getProducts();

        if (!products.length) {
            return null;
        }

        return products.find(function (product) {

            return String(product.id) ===
                   String(productId);

        }) || null;

    }


    /* =====================================================
       GET PRODUCT PRICE UMUM
    ===================================================== */

    function getBasePrice(product) {

        if (!product) {
            return 0;
        }

        const price =
            product.price ??
            product.harga ??
            product.priceUmum ??
            0;

        const numberPrice =
            Number(price);

        return Number.isFinite(numberPrice)
            ? numberPrice
            : 0;

    }


    /* =====================================================
       GET PRICE LIST
       
       Jika tidak ada harga khusus:
       
       Director   = product.price
       Manager    = product.price
       Supervisor = product.price
       Reseller   = product.price
       Umum       = product.price
    ===================================================== */

    function getPriceList(productId) {

        const product =
            findProduct(productId);

        const basePrice =
            getBasePrice(product);

        const special =
            SPECIAL_PRICES[
                String(productId)
            ];

        if (!special) {

            return {
                director: basePrice,
                manager: basePrice,
                supervisor: basePrice,
                reseller: basePrice,
                umum: basePrice
            };

        }

        return {

            director:
                Number(
                    special.director ??
                    basePrice
                ),

            manager:
                Number(
                    special.manager ??
                    basePrice
                ),

            supervisor:
                Number(
                    special.supervisor ??
                    basePrice
                ),

            reseller:
                Number(
                    special.reseller ??
                    basePrice
                ),

            umum:
                Number(
                    special.umum ??
                    basePrice
                )

        };

    }


    /* =====================================================
       GET MAIN PRICE
       
       Dipakai products-page.js
    ===================================================== */

    function getMainPrice(productId) {

        const level =
            getLevel();

        const prices =
            getPriceList(productId);

        return Number(
            prices[level] ??
            prices.umum ??
            0
        );

    }


    /* =====================================================
       GET PRODUCT PRICE
       
       Bisa menentukan level secara manual
    ===================================================== */

    function getProductPrice(
        productId,
        level
    ) {

        level =
            normalizeLevel(
                level || getLevel()
            );

        const prices =
            getPriceList(productId);

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

        price = Number(price);

        if (!Number.isFinite(price)) {
            price = 0;
        }

        return "Rp " +
            price.toLocaleString("id-ID");

    }


    /* =====================================================
       RENDER PRICE
       
       Support:
       
       <span
          class="drw-price"
          data-product-id="ID"
       ></span>
    ===================================================== */

    function renderPrices() {

        const elements =
            document.querySelectorAll(
                ".drw-price[data-product-id]"
            );

        elements.forEach(function (element) {

            const productId =
                element.dataset.productId;

            const price =
                getMainPrice(productId);

            element.textContent =
                formatRupiah(price);

        });


        /* LEVEL NAME */

        document
            .querySelectorAll(".drw-price-level")
            .forEach(function (element) {

                element.textContent =
                    getLevelName();

            });


        /* CURRENT LEVEL */

        document
            .querySelectorAll("#currentPriceLevel")
            .forEach(function (element) {

                element.textContent =
                    getLevelName();

            });


        /* HTML ATTRIBUTE */

        document.documentElement
            .setAttribute(
                "data-price-level",
                getLevel()
            );

    }


    /* =====================================================
       UPDATE SELECTOR
    ===================================================== */

    function initSelectors() {

        document
            .querySelectorAll(
                ".drw-price-selector"
            )
            .forEach(function (selector) {

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

            });

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    function refresh() {

        renderPrices();

    }


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

        findProduct:
            findProduct,

        getPriceList:
            getPriceList,

        getMainPrice:
            getMainPrice,

        getProductPrice:
            getProductPrice,

        formatRupiah:
            formatRupiah,

        renderPrices:
            renderPrices,

        refresh:
            refresh

    };


    /* =====================================================
       COMPATIBILITY
    ===================================================== */

    window.DRW_PRICE_LEVELS =
        LEVELS;

    window.DRW_PRICE_LIST =
        SPECIAL_PRICES;

    window.getPriceLevel =
        getLevel;

    window.setPriceLevel =
        setLevel;

    window.getProductPrice =
        getProductPrice;

    window.formatRupiah =
        formatRupiah;

    window.getPriceLevelName =
        getLevelName;


    /* =====================================================
       EVENTS
    ===================================================== */

    window.addEventListener(
        "drwPriceChanged",
        function () {

            renderPrices();

        }
    );


    /* =====================================================
       DOM READY
    ===================================================== */

    function init() {

        initSelectors();
        renderPrices();

        console.log(
            "RARA DRW — PRICE LEVEL READY:",
            getLevelName()
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

})();