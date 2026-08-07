/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL SYSTEM — ACCESS CONTROL
========================================================= */

(function () {

    "use strict";

    const LEVEL_ORDER = [
        "director",
        "manager",
        "supervisor",
        "reseller",
        "umum"
    ];

    const LEVEL_NAME = {
        director: "Director",
        manager: "Manager",
        supervisor: "Supervisor",
        reseller: "Reseller",
        umum: "Umum"
    };

    /* =====================================================
       AMBIL LEVEL LOGIN
    ===================================================== */

    function getLevel() {

        const level =
            localStorage.getItem("drwPriceLevel") ||
            localStorage.getItem("priceLevel") ||
            localStorage.getItem("userLevel") ||
            localStorage.getItem("role") ||
            "umum";

        return String(level).toLowerCase().trim();
    }


    /* =====================================================
       LEVEL YANG BOLEH DILIHAT
    ===================================================== */

    function getAllowedLevels() {

        const currentLevel = getLevel();

        const index =
            LEVEL_ORDER.indexOf(currentLevel);

        if (index === -1) {
            return ["umum"];
        }

        return LEVEL_ORDER.slice(index);
    }


    /* =====================================================
       NAMA LEVEL
    ===================================================== */

    function getLevelName(level) {

        return LEVEL_NAME[level] || "Umum";

    }


    /* =====================================================
       CEK AKSES
    ===================================================== */

    function canViewLevel(level) {

        level = String(level).toLowerCase();

        return getAllowedLevels().includes(level);

    }


    /* =====================================================
       HARGA
       Mengambil harga sesuai level
    ===================================================== */

    function getPrice(productId, level = null) {

        const selectedLevel =
            String(level || getLevel()).toLowerCase();

        if (!canViewLevel(selectedLevel)) {

            console.warn(
                "Akses harga ditolak:",
                selectedLevel
            );

            return null;
        }

        /*
         * BAGIAN INI MENYESUAIKAN DATA HARGA
         * DENGAN DATA PRODUK ANDA
         */

        const product =
            window.DRW_PRODUCTS?.find(
                p => String(p.id) === String(productId)
            );

        if (!product) {

            console.warn(
                "Produk tidak ditemukan:",
                productId
            );

            return null;
        }


        /* ---------------------------------------------
           Jika produk memiliki object prices
        --------------------------------------------- */

        if (product.prices) {

            const price =
                product.prices[selectedLevel];

            if (price !== undefined) {
                return Number(price);
            }

        }


        /* ---------------------------------------------
           Format harga alternatif
        --------------------------------------------- */

        const key =
            "price_" + selectedLevel;

        if (product[key] !== undefined) {
            return Number(product[key]);
        }


        /* ---------------------------------------------
           Harga umum sebagai fallback
        --------------------------------------------- */

        if (
            selectedLevel === "umum" &&
            product.price !== undefined
        ) {
            return Number(product.price);
        }


        console.warn(
            "Harga level tidak ditemukan:",
            selectedLevel,
            product
        );

        return null;
    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatPrice(price) {

        if (
            price === null ||
            price === undefined ||
            isNaN(price)
        ) {
            return "-";
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(price);

    }


    /* =====================================================
       EXPORT GLOBAL
    ===================================================== */

    window.DRW_PRICE = {

        getLevel,
        getLevelName,

        getAllowedLevels,
        canViewLevel,

        getPrice,
        formatPrice

    };


    console.log(
        "DRW PRICE LEVEL AKTIF:",
        getLevel()
    );

    console.log(
        "HARGA YANG BOLEH DILIHAT:",
        getAllowedLevels()
    );

})();