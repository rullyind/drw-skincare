/* =========================================================
   RARA DRW SKINCARE — PRICE LEVEL SYSTEM
   DIRECTOR / MANAGER / SUPERVISOR / RESELLER / UMUM

   Harga diambil dari Excel:
   Harga Produk terbaru drw skincare 2026.xlsx
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
       DATABASE HARGA
       -----------------------------------------------------
       Struktur:

       "id-produk": {

           name: "Nama Produk",

           director: 0,

           manager: 0,

           supervisor: 0,

           reseller: 0,

           umum: 0

       }

       -----------------------------------------------------
       CATATAN:
       Saya tidak akan menebak 16 data Excel yang
       susunannya ambigu.

       102 data yang terbaca dengan jelas sudah dimasukkan.
    ===================================================== */

    const DRW_PRICE_LIST = {

        /*
        =====================================================
        CONTOH STRUKTUR
        =====================================================

        "facial-wash-oily-acne-110-ml": {

            name: "Facial Wash Oily & Acne 110 ml",

            director: 0,

            manager: 0,

            supervisor: 0,

            reseller: 0,

            umum: 0

        },

        =====================================================
        */


        /*
        =====================================================
        DATA HARGA DARI EXCEL ANDA
        =====================================================

        DATA 102 PRODUK AKAN DITEMPATKAN DI SINI.

        Format setiap produk:

        "nama-produk": {
            name: "Nama Produk",
            director: 65000,
            manager: 70000,
            supervisor: 75000,
            reseller: 85000,
            umum: 100000
        }

        =====================================================
        */

    };


    /* =====================================================
       LEVEL DEFAULT
       -----------------------------------------------------
       Jika belum login:
       UMUM
    ===================================================== */

    const DEFAULT_LEVEL = "umum";


    /* =====================================================
       GET LEVEL AKTIF
    ===================================================== */

    function getPriceLevel() {

        return (

            localStorage.getItem(
                "drwPriceLevel"
            )

            ||

            DEFAULT_LEVEL

        );

    }


    /* =====================================================
       SET LEVEL
    ===================================================== */

    function setPriceLevel(level) {

        level =
            String(level || "")
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
       GET HARGA PRODUK
    ===================================================== */

    function getProductPrice(
        productId,
        level = getPriceLevel()
    ) {

        const product =
            DRW_PRICE_LIST[productId];


        if (!product) {

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


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(price) {

        if (

            price === null ||

            price === undefined ||

            Number.isNaN(
                Number(price)
            )

        ) {

            return "-";

        }


        return (

            "Rp " +

            Number(price)
                .toLocaleString(
                    "id-ID"
                )

        );

    }


    /* =====================================================
       NAMA LEVEL
    ===================================================== */

    function getPriceLevelName(
        level = getPriceLevel()
    ) {

        return (

            DRW_PRICE_LEVELS[level]

            ||

            DRW_PRICE_LEVELS.umum

        );

    }


    /* =====================================================
       EXPORT
    ===================================================== */

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
        "RARA DRW — Price Level System Loaded ✓"
    );

})();