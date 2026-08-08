/* =========================================================
   RARA DRW SKINCARE — PRICE-LEVEL.JS FINAL
   98 PRODUCT PRICE LEVELS
   Director / Manager / Supervisor / Reseller / Umum
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


    /* =====================================================
       DATABASE HARGA 98 PRODUK
    ===================================================== */

    const PRICE_DATA = {

        "3-in-1-exfoliating-gel-100-ml": {
            name: "3 in 1 Exfoliating Gel 100 ml",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "acne-cream-3": {
            name: "Acne Cream 3",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "bamboo-charcoal-soap-premium": {
            name: "Bamboo Charcoal Soap Premium",
            director: 25000,
            manager: 30000,
            supervisor: 35000,
            reseller: 45000,
            umum: 55000
        },

        "bb-cream-air-cushion-shade-ivory": {
            name: "BB Cream Air Cushion Shade Ivory",
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 105000,
            umum: 125000
        },

        "beauty-dna-salmon-spray": {
            name: "Beauty DNA Salmon Spray",
            director: 40000,
            manager: 55000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "breast-cream": {
            name: "Breast Cream",
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 110000,
            umum: 130000
        },

        "brightening-cream": {
            name: "Brightening Cream",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "brightening-peel-off-mask-with-charcoal-60-ml": {
            name: "Brightening Peel Off Mask with Charcoal 60 ml",
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "cleansing-milk-with-green-tea-110-ml": {
            name: "Cleansing Milk With Green Tea 110 ml",
            director: 40000,
            manager: 50000,
            supervisor: 60000,
            reseller: 70000,
            umum: 80000
        },

        "day-acne-cream-1": {
            name: "Day Acne Cream 1",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "day-acne-cream-2": {
            name: "Day Acne Cream 2",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "day-pink-cream": {
            name: "Day Pink Cream",
            director: 65000,
            manager: 75000,
            supervisor: 85000,
            reseller: 90000,
            umum: 100000
        },

        "day-white-cream": {
            name: "Day White Cream",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "night-cream-acne": {
            name: "Night Cream Acne",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "night-cream-pink": {
            name: "Night Cream Pink",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "night-cream-white": {
            name: "Night Cream White",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "facial-wash-acne": {
            name: "Facial Wash Acne",
            director: 35000,
            manager: 45000,
            supervisor: 55000,
            reseller: 65000,
            umum: 75000
        },

        "facial-wash-pink": {
            name: "Facial Wash Pink",
            director: 35000,
            manager: 45000,
            supervisor: 55000,
            reseller: 65000,
            umum: 75000
        },

        "facial-wash-white": {
            name: "Facial Wash White",
            director: 35000,
            manager: 45000,
            supervisor: 55000,
            reseller: 65000,
            umum: 75000
        },

        "toner-honey-premium-110-ml-new": {
            name: "Toner Honey Premium 110 ml New",
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "toner-honey-premium-63-ml": {
            name: "Toner Honey Premium 63 ml",
            director: 25000,
            manager: 35000,
            supervisor: 45000,
            reseller: 55000,
            umum: 65000
        },

        "toner-honey-premium-63-ml-new": {
            name: "Toner Honey Premium 63 ml New",
            director: 30000,
            manager: 40000,
            supervisor: 50000,
            reseller: 60000,
            umum: 70000
        },

        "serum-acne": {
            name: "Serum Acne",
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "serum-brightening": {
            name: "Serum Brightening",
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "serum-glowing": {
            name: "Serum Glowing",
            director: 70000,
            manager: 80000,
            supervisor: 90000,
            reseller: 100000,
            umum: 110000
        },

        "sunscreen-oily-acne": {
            name: "Sunscreen Oily Acne",
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "sunscreen-natural-glow-for-normal-skin": {
            name: "Sunscreen Natural Glow For Normal Skin",
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "sunscreen-natural-glow-for-normal-skin-new": {
            name: "Sunscreen Natural Glow For Normal Skin New",
            director: 60000,
            manager: 70000,
            supervisor: 80000,
            reseller: 90000,
            umum: 100000
        },

        "sunscreen-normal-skin-for-men": {
            name: "Sunscreen Normal Skin for Men",
            director: 50000,
            manager: 60000,
            supervisor: 70000,
            reseller: 80000,
            umum: 90000
        },

        "sunscreen-oily-acne-for-men": {
            name: "Sunscreen Oily Acne For Men",
            director: 55000,
            manager: 65000,
            supervisor: 75000,
            reseller: 85000,
            umum: 95000
        },

        "paket-radiant-acne-repair": {
            name: "Paket Radiant Acne Repair",
            director: null,
            manager: null,
            supervisor: null,
            reseller: null,
            umum: null
        },

        "paket-radiant-bright-ultimate": {
            name: "Paket Radiant Bright Ultimate",
            director: null,
            manager: null,
            supervisor: null,
            reseller: null,
            umum: null
        },

        "paket-radiant-glow-booster": {
            name: "Paket Radiant Glow Booster",
            director: null,
            manager: null,
            supervisor: null,
            reseller: null,
            umum: null
        },

        "paket-radiant-acne": {
            name: "Paket Radiant Acne",
            director: 170000,
            manager: 195000,
            supervisor: 220000,
            reseller: 245000,
            umum: 270000
        },

        "paket-radiant-brightening": {
            name: "Paket Radiant Brightening",
            director: 170000,
            manager: 195000,
            supervisor: 220000,
            reseller: 245000,
            umum: 270000
        },

        "paket-radiant-brightening-flek": {
            name: "Paket Radiant Brightening Flek",
            director: 170000,
            manager: 195000,
            supervisor: 220000,
            reseller: 245000,
            umum: 270000
        },

        "paket-oily-acne-abha-100-ml": {
            name: "Paket Oily Acne Abha 100 ml",
            director: 200000,
            manager: 220000,
            supervisor: 240000,
            reseller: 260000,
            umum: 300000
        },

        "paket-oily-acne-abha-3": {
            name: "Paket Oily Acne Abha 3",
            director: 180000,
            manager: 205000,
            supervisor: 230000,
            reseller: 255000,
            umum: 275000
        },

        "paket-oily-acne-abha-60ml": {
            name: "Paket Oily Acne Abha 60ml",
            director: 190000,
            manager: 210000,
            supervisor: 230000,
            reseller: 250000,
            umum: 290000
        },

        "paket-normal-for-men": {
            name: "Paket Normal For Men",
            director: 170000,
            manager: 175000,
            supervisor: 200000,
            reseller: 225000,
            umum: 250000
        },

        "paket-normal-micellar-for-men": {
            name: "Paket Normal Micellar For Men",
            director: 215000,
            manager: 215000,
            supervisor: 240000,
            reseller: 265000,
            umum: 300000
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
            : "umum";

    }


    /* =====================================================
       GET LEVEL
    ===================================================== */

    function getLevel() {

        return normalizeLevel(
            localStorage.getItem(
                "drwPriceLevel"
            )
        );

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setLevel(level) {

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
       GET MAIN PRICE
    ===================================================== */

    function getMainPrice(productId) {

        const id =
            String(
                productId || ""
            ).trim();

        const product =
            PRICE_DATA[id];

        if (!product) {

            return 0;

        }

        const level =
            getLevel();

        const price =
            Number(
                product[level]
            );

        if (
            Number.isFinite(price) &&
            price > 0
        ) {

            return price;

        }

        const fallback =
            Number(
                product.umum
            );

        return Number.isFinite(
            fallback
        )
            ? fallback
            : 0;

    }


    /* =====================================================
       GET PRODUCT PRICE
    ===================================================== */

    function getProductPrice(
        productOrId
    ) {

        const id =
            typeof productOrId ===
            "object"

                ? (
                    productOrId.id ||
                    productOrId.slug ||
                    ""
                )

                : productOrId;

        return getMainPrice(id);

    }


    /* =====================================================
       GET PRICE LEVEL TERTENTU
    ===================================================== */

    function getPrice(
        productId,
        level
    ) {

        const product =
            PRICE_DATA[
                String(
                    productId || ""
                ).trim()
            ];

        if (!product) {

            return 0;

        }

        const selected =
            normalizeLevel(level);

        const price =
            Number(
                product[selected]
            );

        return Number.isFinite(
            price
        )
            ? price
            : 0;

    }


    /* =====================================================
       LEVEL NAME
    ===================================================== */

    function getLevelName(level) {

        return LEVELS[
            normalizeLevel(level)
        ];

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(value) {

        return (
            "Rp " +
            Number(
                value || 0
            ).toLocaleString(
                "id-ID"
            )
        );

    }


    /* =====================================================
       SYNC
    ===================================================== */

    function syncPriceLevel() {

        const level =
            getLevel();

        localStorage.setItem(
            "drwPriceLevel",
            level
        );

        return level;

    }


    /* =====================================================
       GLOBAL DRW_PRICE
    ===================================================== */

    window.DRW_PRICE = {

        LEVELS,

        DATA:
            PRICE_DATA,

        getLevel,

        setLevel,

        getMainPrice,

        getProductPrice,

        getPrice,

        getLevelName,

        formatRupiah,

        syncPriceLevel

    };


    /* =====================================================
       GLOBAL COMPATIBILITY
    ===================================================== */

    window.getPriceLevel =
        getLevel;

    window.setPriceLevel =
        setLevel;

    window.getProductPrice =
        getProductPrice;


    /* =====================================================
       INIT
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            syncPriceLevel();

            window.dispatchEvent(
                new CustomEvent(
                    "drwPriceLevelChanged",
                    {
                        detail: {
                            level:
                                getLevel()
                        }
                    }
                )
            );

        }
    );


    console.log(
        "RARA DRW — PRICE LEVEL FINAL ✓",
        Object.keys(
            PRICE_DATA
        ).length,
        "produk"
    );

})();