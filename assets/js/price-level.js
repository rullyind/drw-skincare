/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL SYSTEM — FINAL
   =========================================================
   LEVEL HARGA:
   Director
   Manager
   Supervisor
   Reseller
   Umum

   SUMBER:
   Harga Produk terbaru drw skincare 2026.xlsx

   DEFAULT:
   Umum
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


    const DEFAULT_PRICE_LEVEL = "umum";


    /* =====================================================
       DATA HARGA PRODUK
       ===================================================== */

    const DRW_PRICE_LIST = {

        /* =========================
           BASIC PRODUCTS
        ========================= */

        "3-in-1-exfoliating-gel-100-ml": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "acne-cream-3": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "bamboo-charcoal-soap-premium": {
            director: 25000,
            manager: 30000,
            supervisor: 35000,
            reseller: 45000,
            umum: 55000
        },

        "bb-cream-air-cushion-shade-ivory": {
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 105000,
            umum: 125000
        },

        "beauty-dna-salmon-spray": {
            director: 40000,
            manager: 55000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "breast-cream": {
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 110000,
            umum: 130000
        },

        "brightening-cream": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "brightening-peel-off-mask-with-charcoal-60-ml": {
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "cleansing-milk-with-green-tea-110-ml": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "cleansing-milk-with-green-tea-63-ml": {
            director: 25000,
            manager: 35000,
            supervisor: 45000,
            reseller: 55000,
            umum: 65000
        },

        "compact-powder-natural-whitening": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "coolbright-deo-herba": {
            director: 45000,
            manager: 55000,
            supervisor: 65000,
            reseller: 75000,
            umum: 85000
        },

        "coolbright-deo-herba-strong": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },


        /* =========================
           DAILY
        ========================= */

        "daily-ceramoist-hydra-gel": {
            director: 70000,
            manager: 85000,
            supervisor: 100000,
            reseller: 110000,
            umum: 120000
        },

        "daily-compact-powder-beige": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "daily-compact-powder-natural": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "daily-compact-powder-pink": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "day-acne-cream-1": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "day-acne-cream-2": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "day-body-foundation-premium": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "day-body-lotion-premium-110-ml": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "day-pink-cream": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "day-white-cream": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },


        /* =========================
           DNA / CAPSULE
        ========================= */

        "dna-salmon-extra-marine-collagen-and-hyaluronic-acid-30-ml": {
            director: 90000,
            manager: 110000,
            supervisor: 130000,
            reseller: 145000,
            umum: 155000
        },

        "drw-kapsul-gemuk-badan-isi-60": {
            director: 125000,
            manager: 150000,
            supervisor: 175000,
            reseller: 200000,
            umum: 225000
        },

        "drw-slimming-capsule-isi-60": {
            director: 125000,
            manager: 150000,
            supervisor: 175000,
            reseller: 200000,
            umum: 225000
        },


        /* =========================
           EXFOLIATING
        ========================= */

        "exfoliating-apple-gel": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "exfoliating-strawberry-gel": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "face-mist-centella-asiatica": {
            director: 30000,
            manager: 40000,
            supervisor: 50000,
            reseller: 60000,
            umum: 75000
        },


        /* =========================
           FACIAL WASH
        ========================= */

        "facial-wash-for-normal-skin-110-ml": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "facial-wash-for-normal-skin-63-ml": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "facial-wash-oily-acne-110-ml": {
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 95000,
            umum: 105000
        },

        "facial-wash-oily-acne-63-ml": {
            director: 45000,
            manager: 55000,
            supervisor: 65000,
            reseller: 75000,
            umum: 85000
        },

        "facial-wash-pink-brightening-110-ml": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "facial-wash-pink-brightening-63-ml": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "facial-wash-tea-tree-oil-110-ml": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "facial-wash-tea-tree-oil-63-ml": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },


        /* =========================
           BODY
        ========================= */

        "firming-body-cream-pink": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "flawless-bb-cushion": {
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 105000,
            umum: 125000
        },


        /* =========================
           HAIR
        ========================= */

        "green-tea-face-mask-premium": {
            director: 30000,
            manager: 37500,
            supervisor: 45000,
            reseller: 60000,
            umum: 75000
        },

        "hair-serum-premium": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 100000,
            umum: 120000
        },

        "hair-tonic-normal-220-ml": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 100000,
            umum: 120000
        },

        "hb-dosting-75-gram": {
            director: 80000,
            manager: 90000,
            supervisor: 100000,
            reseller: 110000,
            umum: 120000
        },


        /* =========================
           SOAP
        ========================= */

        "kojic-acid-milk-soap": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "sulfur-soap-plus-milk": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },


        /* =========================
           LIP
        ========================= */

        "lipgloss-beauty-gold": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 100000
        },

        "lipgloss-beauty-gold-vit-e": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 110000
        },

        "lipgloss-beauty-pink": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 100000
        },

        "lipgloss-beauty-pink-vit-e": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 110000
        },

        "lipscare": {
            director: 80000,
            manager: 90000,
            supervisor: 100000,
            reseller: 120000,
            umum: 135000
        },


        /* =========================
           SKINCARE
        ========================= */

        "lulur-brightening-premium": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "luminous-brightening-vitamin-c-plus-collagen-serum": {
            director: 70000,
            manager: 85000,
            supervisor: 100000,
            reseller: 110000,
            umum: 120000
        },

        "moisturizer-gel-aloe-vera": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 85000
        },

        "moisturizer-gel-avocado": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 85000
        },

        "moisturizer-gel-cucumber-vit-e": {
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 85000
        },

        "rice-face-mask-limpasu": {
            director: 30000,
            manager: 37500,
            supervisor: 45000,
            reseller: 60000,
            umum: 75000
        },


        /* =========================
           SERUM
        ========================= */

        "serum-aha-bha": {
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "serum-brightening-glowing": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "serum-brightening-with-vit-c-e": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "serum-for-acne-skin": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "serum-retinol": {
            director: 70000,
            manager: 90000,
            supervisor: 100000,
            reseller: 110000,
            umum: 120000
        },


        /* =========================
           POWDER
        ========================= */

        "silky-soft-face-powder-beige": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "silky-soft-face-powder-ivory": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },

        "silky-soft-face-powder-natural": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 85000,
            umum: 100000
        },


        /* =========================
           OTHER
        ========================= */

        "snail-cream-anti-aging": {
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 120000
        },

        "strawberry-micellar-water-100-ml": {
            director: 40000,
            manager: 45000,
            supervisor: 50000,
            reseller: 55000,
            umum: 60000
        },

        "strawberry-micellar-water-63-ml": {
            director: 30000,
            manager: 35000,
            supervisor: 40000,
            reseller: 45000,
            umum: 50000
        },

        "stretchmark-cream-with-olive-oil": {
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 110000,
            umum: 130000
        },

        "sunscreen-glowing": {
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "sunscreen-for-oily-and-acne": {
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 95000,
            umum: 105000
        },

        "sunscreen-natural-glow-for-normal-skin": {
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },


        /* =========================
           TONER
        ========================= */

        "toner-honey-premium-63-ml-new": {
            director: 30000,
            manager: 40000,
            supervisor: 50000,
            reseller: 60000,
            umum: 70000
        },

        "toner-lime-premium-63-ml": {
            director: 25000,
            manager: 35000,
            supervisor: 45000,
            reseller: 55000,
            umum: 65000
        },


        /* =========================
           PAKET
        ========================= */

        "paket-acne-for-men": {
            director: 170000,
            manager: 175000,
            supervisor: 200000,
            reseller: 225000,
            umum: 250000
        },

        "paket-body-lotion-rejuvenation": {
            director: 275000,
            manager: 290000,
            supervisor: 325000,
            reseller: 360000,
            umum: 395000
        },

        "paket-brightening-3": {
            director: 160000,
            manager: 185000,
            supervisor: 210000,
            reseller: 235000,
            umum: 260000
        },

        "paket-ceramoist-acne": {
            director: 180000,
            manager: 205000,
            supervisor: 230000,
            reseller: 255000,
            umum: 280000
        },

        "paket-glow-for-men": {
            director: 170000,
            manager: 175000,
            supervisor: 200000,
            reseller: 225000,
            umum: 250000
        },

        "paket-hemat-radiant-acne-brightening-milk-cleanser": {
            director: 215000,
            manager: 250000,
            supervisor: 285000,
            reseller: 320000,
            umum: 350000
        },

        "paket-hemat-radiant-acne-micellar": {
            director: 190000,
            manager: 215000,
            supervisor: 240000,
            reseller: 265000,
            umum: 285000
        },

        "paket-lotion-rejuvenation": {
            director: 175000,
            manager: 195000,
            supervisor: 215000,
            reseller: 235000,
            umum: 255000
        },

        "paket-oily-acne-abha-100-ml": {
            director: 200000,
            manager: 220000,
            supervisor: 240000,
            reseller: 260000,
            umum: 300000
        },

        "paket-radiant-acne": {
            director: 170000,
            manager: 195000,
            supervisor: 220000,
            reseller: 245000,
            umum: 270000
        }

    };


    /* =====================================================
       NORMALIZE LEVEL
    ===================================================== */

    function normalizeLevel(level) {

        level =
            String(level || "")
                .toLowerCase()
                .trim();

        if (
            DRW_PRICE_LEVELS[level]
        ) {

            return level;

        }

        return DEFAULT_PRICE_LEVEL;

    }


    /* =====================================================
       GET LEVEL AKTIF
    ===================================================== */

    function getPriceLevel() {

        return normalizeLevel(

            localStorage.getItem(
                "drwPriceLevel"
            )

        );

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setPriceLevel(level) {

        level =
            normalizeLevel(level);


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


        return level;

    }


    /* =====================================================
       GET NAMA LEVEL
    ===================================================== */

    function getPriceLevelName(
        level
    ) {

        level =
            normalizeLevel(
                level ||
                getPriceLevel()
            );


        return DRW_PRICE_LEVELS[level];

    }


    /* =====================================================
       GET HARGA PRODUK
    ===================================================== */

    function getProductPrice(
        productId,
        level
    ) {

        const id =
            String(
                productId || ""
            )
                .toLowerCase()
                .trim();


        const product =
            DRW_PRICE_LIST[id];


        if (!product) {

            console.warn(
                "Harga produk belum ditemukan:",
                productId
            );

            return null;

        }


        level =
            normalizeLevel(
                level ||
                getPriceLevel()
            );


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


        return (
            "Rp " +
            Number(price)
                .toLocaleString("id-ID")
        );

    }


    /* =====================================================
       GET SEMUA HARGA PRODUK
    ===================================================== */

    function getAllPrices(
        productId
    ) {

        const id =
            String(
                productId || ""
            )
                .toLowerCase()
                .trim();


        const product =
            DRW_PRICE_LIST[id];


        if (!product) {

            return null;

        }


        return {

            director:
                product.director,

            manager:
                product.manager,

            supervisor:
                product.supervisor,

            reseller:
                product.reseller,

            umum:
                product.umum

        };

    }


    /* =====================================================
       RENDER HARGA DI HTML
       =====================================================

       Contoh:

       <span
           class="drw-price"
           data-product-id="facial-wash-oily-acne-110-ml">
       </span>

    */

    function renderPrices(
        root
    ) {

        root =
            root ||
            document;


        const priceElements =
            root.querySelectorAll(
                ".drw-price[data-product-id]"
            );


        priceElements.forEach(
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


        /* LEVEL */

        const levelElements =
            root.querySelectorAll(
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
       EXPORT GLOBAL
    ===================================================== */

    window.DRW_PRICE_LEVELS =
        DRW_PRICE_LEVELS;


    window.DRW_PRICE_LIST =
        DRW_PRICE_LIST;


    window.getPriceLevel =
        getPriceLevel;


    window.setPriceLevel =
        setPriceLevel;


    window.getPriceLevelName =
        getPriceLevelName;


    window.getProductPrice =
        getProductPrice;


    window.getAllPrices =
        getAllPrices;


    window.formatRupiah =
        formatRupiah;


    window.renderPrices =
        renderPrices;


    /* =====================================================
       AUTO RENDER
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            renderPrices();

        }
    );


    /* =====================================================
       LEVEL BERUBAH
    ===================================================== */

    window.addEventListener(
        "drwPriceLevelChanged",
        function () {

            renderPrices();

        }
    );


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "RARA DRW SKINCARE — PRICE LEVEL FINAL ✓"
    );

})();