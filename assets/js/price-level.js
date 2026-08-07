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
/* =========================================================
   RARA DRW SKINCARE
   PRICE LEVEL VIEW SELECTOR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const selector =
        document.getElementById("priceLevelSelector");

    const select =
        document.getElementById("priceLevelSelect");

    if (!selector || !select) {
        console.log("Price Level Selector tidak ditemukan.");
        return;
    }


    /* =====================================================
       LEVEL HIERARCHY

       1 = Director
       2 = Manager
       3 = Supervisor
       4 = Reseller
       5 = Umum
    ===================================================== */

    const levelOrder = {
        director: 1,
        manager: 2,
        supervisor: 3,
        reseller: 4,
        umum: 5
    };


    /* =====================================================
       AMBIL LEVEL USER

       Menggunakan DRW_PRICE jika tersedia
    ===================================================== */

    let currentLevel = "umum";

    if (
        typeof DRW_PRICE !== "undefined" &&
        typeof DRW_PRICE.getLevel === "function"
    ) {

        currentLevel =
            String(DRW_PRICE.getLevel()).toLowerCase();

    }


    console.log(
        "PRICE SELECTOR USER:",
        currentLevel
    );


    /* =====================================================
       FILTER OPTION
    ===================================================== */

    const currentRank =
        levelOrder[currentLevel] || 5;


    Array.from(select.options).forEach(function (option) {

        const optionLevel =
            String(option.value).toLowerCase();

        const optionRank =
            levelOrder[optionLevel];


        /*
         * User hanya boleh melihat:
         *
         * level dirinya sendiri
         * level di bawahnya
         */

        if (
            optionRank &&
            optionRank < currentRank
        ) {

            option.remove();

        }

    });


    /* =====================================================
       DEFAULT LEVEL
    ===================================================== */

    select.value = currentLevel;


    /*
     * Jika tidak ditemukan,
     * gunakan level pertama yang tersedia
     */

    if (!select.value) {

        select.selectedIndex = 0;

    }


    /* =====================================================
       PERUBAHAN HARGA
    ===================================================== */

    select.addEventListener(
        "change",
        function () {

            const selectedLevel =
                this.value;

            console.log(
                "Harga yang dipilih:",
                selectedLevel
            );


            /*
             * Simpan pilihan sementara
             */

            sessionStorage.setItem(
                "drwSelectedPriceLevel",
                selectedLevel
            );


            /*
             * Render ulang produk
             *
             * products-page.js akan membaca
             * pilihan harga tersebut.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "drwPriceLevelChanged",
                    {
                        detail: {
                            level: selectedLevel
                        }
                    }
                )
            );

        }
    );

});