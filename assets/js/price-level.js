/* =========================================================
   RARA DRW SKINCARE — PRICE LEVEL DATABASE
   SOURCE: Harga Produk terbaru drw skincare 2026.xlsx

   LEVEL:
   Director
   Manager
   Supervisor
   Reseller
   Umum
========================================================= */

(function(){

"use strict";


/* =========================================================
   LEVEL HARGA
========================================================= */

const DRW_PRICE_LEVELS = {

    director: "Director",

    manager: "Manager",

    supervisor: "Supervisor",

    reseller: "Reseller",

    umum: "Umum"

};


/* =========================================================
   DATABASE HARGA
========================================================= */

const DRW_PRICE_LIST = {

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

    "cleansing-milk-with-green-tea-63-ml": {
        name: "Cleansing Milk With Green Tea 63 ml",
        director: 25000,
        manager: 35000,
        supervisor: 45000,
        reseller: 55000,
        umum: 65000
    },

    "compact-powder-natural-whitening": {
        name: "Compact Powder Natural Whitening",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "coolbright-deo-herba": {
        name: "Coolbright Deo Herba",
        director: 45000,
        manager: 55000,
        supervisor: 65000,
        reseller: 75000,
        umum: 85000
    },

    "coolbright-deo-herba-strong": {
        name: "Coolbright Deo Herba Strong",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 80000,
        umum: 90000
    },

    "daily-ceramoist-hydra-gel": {
        name: "Daily Ceramoist Hydra Gel",
        director: 70000,
        manager: 85000,
        supervisor: 100000,
        reseller: 110000,
        umum: 120000
    },

    "daily-compact-powder-beige": {
        name: "Daily Compact Powder Beige",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "daily-compact-powder-natural": {
        name: "Daily Compact Powder Natural",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "daily-compact-powder-pink": {
        name: "Daily Compact Powder Pink",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
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

    "day-body-foundation-premium": {
        name: "Day Body Foundation Premium",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "day-body-lotion-premium-110-ml": {
        name: "Day Body Lotion Premium 110 ml",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "day-pink-cream": {
        name: "Day Pink Cream",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
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

    "dna-salmon-extra-marine-collagen-and-hyaluronic-acid-30-ml": {
        name: "DNA Salmon Extra Marine Collagen and Hyaluronic Acid 30 ml",
        director: 90000,
        manager: 110000,
        supervisor: 130000,
        reseller: 145000,
        umum: 155000
    },

    "drw-kapsul-gemuk-badan-isi-60": {
        name: "DRW Kapsul Gemuk Badan isi 60",
        director: 125000,
        manager: 150000,
        supervisor: 175000,
        reseller: 200000,
        umum: 225000
    },

    "drw-slimming-capsule-isi-60": {
        name: "DRW Slimming Capsule isi 60",
        director: 125000,
        manager: 150000,
        supervisor: 175000,
        reseller: 200000,
        umum: 225000
    },

    "exfoliating-apple-gel": {
        name: "Exfoliating Apple Gel",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "exfoliating-strawberry-gel": {
        name: "Exfoliating Strawberry Gel",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "face-mist-centella-asiatica": {
        name: "Face Mist Centella Asiatica",
        director: 30000,
        manager: 40000,
        supervisor: 50000,
        reseller: 60000,
        umum: 75000
    },

    "facial-wash-for-normal-skin-110-ml": {
        name: "Facial Wash For Normal Skin 110 ml",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "facial-wash-for-normal-skin-63-ml": {
        name: "Facial Wash For Normal Skin 63 ml",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "facial-wash-oily-acne-110-ml": {
        name: "Facial Wash Oily Acne 110 ml",
        director: 65000,
        manager: 75000,
        supervisor: 85000,
        reseller: 95000,
        umum: 105000
    },

    "facial-wash-oily-acne-63-ml": {
        name: "Facial Wash Oily Acne 63 ml",
        director: 45000,
        manager: 55000,
        supervisor: 65000,
        reseller: 75000,
        umum: 85000
    },

    "facial-wash-pink-brightening-110-ml": {
        name: "Facial Wash Pink Brightening 110 ml",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "facial-wash-pink-brightening-63-ml": {
        name: "Facial Wash Pink Brightening 63 ml",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "facial-wash-tea-tree-oil-110-ml": {
        name: "Facial Wash Tea Tree Oil 110 ml",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "facial-wash-tea-tree-oil-63-ml": {
        name: "Facial Wash Tea Tree Oil 63 ml",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "firming-body-cream-pink": {
        name: "Firming Body Cream Pink",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "flawless-bb-cushion": {
        name: "Flawless BB Cushion",
        director: 65000,
        manager: 75000,
        supervisor: 85000,
        reseller: 105000,
        umum: 125000
    },

    "green-tea-face-mask-premium": {
        name: "Green Tea Face Mask Premium",
        director: 30000,
        manager: 37500,
        supervisor: 45000,
        reseller: 60000,
        umum: 75000
    },

    "hair-serum-premium": {
        name: "Hair Serum Premium",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 100000,
        umum: 120000
    },

    "hair-tonic-normal-220-ml": {
        name: "Hair Tonic Normal 220 ml",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 100000,
        umum: 120000
    },

    "hb-dosting-75-gram": {
        name: "HB Dosting 75 gram",
        director: 80000,
        manager: 90000,
        supervisor: 100000,
        reseller: 110000,
        umum: 120000
    },

    "kojic-acid-milk-soap": {
        name: "Kojic Acid Milk Soap",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "lipgloss-beauty-gold": {
        name: "Lipgloss Beauty Gold",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 80000,
        umum: 100000
    },

    "lipgloss-beauty-gold-vit-e": {
        name: "Lipgloss Beauty Gold + Vit E",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 110000
    },

    "lipgloss-beauty-pink": {
        name: "Lipgloss Beauty Pink",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 80000,
        umum: 100000
    },

    "lipgloss-beauty-pink-vit-e": {
        name: "Lipgloss Beauty Pink + Vit E",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 110000
    },

    "lipscare": {
        name: "Lipscare",
        director: 80000,
        manager: 90000,
        supervisor: 100000,
        reseller: 120000,
        umum: 135000
    },

    "lulur-brightening-premium": {
        name: "Lulur Brightening Premium",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "luminous-brightening-vitamin-c-plus-collagen-serum": {
        name: "Luminous Brightening Vitamin C plus Collagen Serum",
        director: 70000,
        manager: 85000,
        supervisor: 100000,
        reseller: 110000,
        umum: 120000
    },

    "moisturizer-gel-aloe-vera": {
        name: "Moisturizer Gel Aloe Vera",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 85000
    },

    "moisturizer-gel-avocado": {
        name: "Moisturizer Gel Avocado",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 85000
    },

    "moisturizer-gel-cucumber-vit-e": {
        name: "Moisturizer Gel Cucumber Vit E",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 85000
    },

    "rice-face-mask-limpasu": {
        name: "Rice Face Mask Limpasu",
        director: 30000,
        manager: 37500,
        supervisor: 45000,
        reseller: 60000,
        umum: 75000
    },

    "serum-aha-bha": {
        name: "Serum AHA BHA",
        director: 70000,
        manager: 80000,
        supervisor: 90000,
        reseller: 100000,
        umum: 110000
    },

    "serum-brightening-glowing": {
        name: "Serum Brightening Glowing",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "serum-brightening-with-vit-c-e": {
        name: "Serum Brightening With Vit C & E",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 80000,
        umum: 90000
    },

    "serum-for-acne-skin": {
        name: "Serum For Acne Skin",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "serum-retinol": {
        name: "Serum Retinol",
        director: 70000,
        manager: 90000,
        supervisor: 100000,
        reseller: 110000,
        umum: 120000
    },

    "silky-soft-face-powder-beige": {
        name: "Silky Soft Face Powder Beige",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "silky-soft-face-powder-ivory": {
        name: "Silky Soft Face Powder Ivory",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "silky-soft-face-powder-natural": {
        name: "Silky Soft Face Powder Natural",
        director: 50000,
        manager: 60000,
        supervisor: 70000,
        reseller: 85000,
        umum: 100000
    },

    "snail-cream-anti-aging": {
        name: "Snail Cream Anti Aging",
        director: 70000,
        manager: 80000,
        supervisor: 90000,
        reseller: 100000,
        umum: 120000
    },

    "strawberry-micellar-water-100-ml": {
        name: "Strawberry Micellar Water 100 ml",
        director: 40000,
        manager: 45000,
        supervisor: 50000,
        reseller: 55000,
        umum: 60000
    },

    "strawberry-micellar-water-63-ml": {
        name: "Strawberry Micellar Water 63 ml",
        director: 30000,
        manager: 35000,
        supervisor: 40000,
        reseller: 45000,
        umum: 50000
    },

    "stretchmark-cream-with-olive-oil": {
        name: "Stretchmark Cream With Olive Oil",
        director: 70000,
        manager: 80000,
        supervisor: 90000,
        reseller: 110000,
        umum: 130000
    },

    "sulfur-soap-plus-milk": {
        name: "Sulfur Soap Plus Milk",
        director: 40000,
        manager: 50000,
        supervisor: 60000,
        reseller: 70000,
        umum: 80000
    },

    "sunscreen-glowing": {
        name: "Sunscreen Glowing",
        director: 60000,
        manager: 70000,
        supervisor: 80000,
        reseller: 90000,
        umum: 100000
    },

    "sunscreen-for-oily-and-acne": {
        name: "Sunscreen For Oily and Acne",
        director: 65000,
        manager: 75000,
        supervisor: 85000,
        reseller: 95000,
        umum: 105000
    },

    "toner-honey-premium-63-ml-new": {
        name: "Toner Honey Premium 63 ml New",
        director: 30000,
        manager: 40000,
        supervisor: 50000,
        reseller: 60000,
        umum: 70000
    },

    "toner-lime-premium-63-ml": {
        name: "Toner Lime Premium 63 ml",
        director: 25000,
        manager: 35000,
        supervisor: 45000,
        reseller: 55000,
        umum: 65000
    },

    "paket-acne-for-men": {
        name: "Paket Acne For Men",
        director: 170000,
        manager: 175000,
        supervisor: 200000,
        reseller: 225000,
        umum: 250000
    },

    "paket-body-lotion-rejuvenation": {
        name: "Paket Body Lotion Rejuvenation",
        director: 275000,
        manager: 290000,
        supervisor: 325000,
        reseller: 360000,
        umum: 395000
    },

    "paket-brightening-3": {
        name: "Paket Brightening 3",
        director: 160000,
        manager: 185000,
        supervisor: 210000,
        reseller: 235000,
        umum: 260000
    },

    "paket-ceramoist-acne": {
        name: "Paket Ceramoist Acne",
        director: 180000,
        manager: 205000,
        supervisor: 230000,
        reseller: 255000,
        umum: 280000
    },

    "paket-glow-for-men": {
        name: "Paket Glow For Men",
        director: 170000,
        manager: 175000,
        supervisor: 200000,
        reseller: 225000,
        umum: 250000
    },

    "paket-hemat-radiant-acne-brightening-milk-cleanser": {
        name: "Paket Hemat Radiant Acne Brightening Milk Cleanser",
        director: 215000,
        manager: 250000,
        supervisor: 285000,
        reseller: 320000,
        umum: 350000
    },

    "paket-hemat-radiant-acne-micellar": {
        name: "Paket Hemat Radiant Acne Micellar",
        director: 190000,
        manager: 215000,
        supervisor: 240000,
        reseller: 265000,
        umum: 285000
    },

    "paket-lotion-rejuvenation": {
        name: "Paket Lotion Rejuvenation",
        director: 175000,
        manager: 195000,
        supervisor: 215000,
        reseller: 235000,
        umum: 255000
    },

    "paket-oily-acne-abha-100-ml": {
        name: "Paket Oily Acne Abha 100 ml",
        director: 200000,
        manager: 220000,
        supervisor: 240000,
        reseller: 260000,
        umum: 300000
    },

    "paket-radiant-acne": {
        name: "Paket Radiant Acne",
        director: 170000,
        manager: 195000,
        supervisor: 220000,
        reseller: 245000,
        umum: 270000
    }

};


/* =========================================================
   DEFAULT
========================================================= */

const DEFAULT_LEVEL = "umum";


/* =========================================================
   GET LEVEL
========================================================= */

function getPriceLevel(){

    return (

        localStorage.getItem(
            "drwPriceLevel"
        )

        ||

        DEFAULT_LEVEL

    );

}


/* =========================================================
   SET LEVEL
========================================================= */

function setPriceLevel(level){

    level =
        String(level || "")
        .toLowerCase()
        .trim();


    if(
        !DRW_PRICE_LEVELS[level]
    ){

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
                detail:{
                    level:level
                }
            }
        )

    );


    return true;

}


/* =========================================================
   GET HARGA PRODUK
========================================================= */

function getProductPrice(
    productId,
    level = getPriceLevel()
){

    const product =
        DRW_PRICE_LIST[productId];


    if(!product){

        return null;

    }


    return (

        product[level]

        ??

        product.umum

        ??

        null

    );

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value){

    if(
        value === null ||
        value === undefined
    ){

        return "-";

    }


    return (

        "Rp " +

        Number(value)
        .toLocaleString("id-ID")

    );

}


/* =========================================================
   LEVEL NAME
========================================================= */

function getPriceLevelName(
    level = getPriceLevel()
){

    return (

        DRW_PRICE_LEVELS[level]

        ||

        DRW_PRICE_LEVELS.umum

    );

}


/* =========================================================
   GLOBAL
========================================================= */

window.DRW_PRICE_LEVELS =
    DRW_PRICE_LEVELS;

window.DRW_PRICE_LIST =
    DRW_PRICE_LIST;

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
    "RARA DRW — Price Level Database Loaded ✓"
);

})();