/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS-DATA.JS — FINAL BADGE FIX
   =========================================================
   DIPAKAI LANGSUNG OLEH:
   - products.html
   - product-detail.html
   - cart.html
   - checkout.html

   FIX:
   - badge produk tidak lagi dihapus
   - badge berbeda setiap produk
   - tetap mempertahankan 83 produk
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       FOLDER FOTO
    ===================================================== */

    const IMAGE_FOLDER =
        "assets/images/products/";


    const PLACEHOLDER =
        IMAGE_FOLDER +
        "product-placeholder.png";


    /* =====================================================
       DATA PRODUK
    ===================================================== */

    const PRODUCTS = [

        {
            id: "3-in-1-exfoliating-gel-100-ml",
            name: "3 in 1 Exfoliating Gel 100 ml",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "3 in 1 Exfoliating Gel 100 ml 2.png",
            price: 130000,
            badge: "Komedo"
        },


        {
            id: "acne-cream-3",
            name: "Acne Cream 3",
            category: "Cream Malam",
            image: IMAGE_FOLDER + "Acne Cream 3.png",
            price: 100000,
            badge: "Jerawat"
        },


        {
            id: "bamboo-charcoal-soap-premium",
            name: "Bamboo Charcoal Soap Premium",
            category: "Body Care",
            image: IMAGE_FOLDER + "Bamboo Charcoal Soap Premium.png",
            price: 55000,
            badge: "Oily & Acne Skin"
        },


        {
            id: "bb-cream-air-cushion-shade-ivory",
            name: "BB Cream Air Cushion Shade Ivory",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "BB Cream Air Cushion Shade Ivory TO.png",
            price: 65000,
            badge: "Foundation Cair"
        },


        {
            id: "brightening-cream",
            name: "Brightening Cream",
            category: "Cream Malam",
            image: IMAGE_FOLDER + "Brightening Cream.png",
            price: 100000,
            badge: "Wajah Sedikit Kusam"
        },


        {
            id: "brightening-peel-off-mask-with-charcoal-60-ml",
            name: "Brightening Peel Off Mask with Charcoal 60 ml",
            category: "Masker",
            image: IMAGE_FOLDER + "Brightening Peel Off Mask with Charcoal 60 ml.png",
            price: 110000,
            badge: "Angkat Komedo & Mencerahkan"
        },


        {
            id: "cleansing-milk-with-green-tea-110-ml",
            name: "Cleansing Milk With Green Tea 110 ml",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Milk Cleanser 110 ml.jpg",
            price: 80000,
            badge: "Cleansing"
        },


        {
            id: "cleansing-milk-with-green-tea-63-ml",
            name: "Cleansing Milk With Green Tea 63 ml",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Milk Cleanser 110 ml.jpg",
            price: 60000,
            badge : "Cleansing"
        },


        {
            id: "compact-powder-natural-whitening",
            name: "Compact Powder Natural Whitening",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Daily Compact Powder Natural Whitening.png",
            price: 100000,
            badge: "Bedak Padat"
        },


        {
            id: "daily-compact-powder-natural",
            name: "Daily Compact Powder Natural",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Daily Compact Powder Natural Whitening.png",
            price: 100000,
            badge: "Bedak Padat "
        },


        {
            id: "day-acne-cream-1",
            name: "Day Acne Cream 1",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Acne 1.png",
            price: 100000,
            badge: "Foundation"
        },


        {
            id: "day-acne-cream-2",
            name: "Day Acne Cream 2",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Acne 2.png",
            price: 100000,
            badge: "Foundation"
        },


        {
            id: "day-pink-cream",
            name: "Day Pink Cream",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Pink.png",
            price: 100000,
            badge: "Foundation"
        },


        {
            id: "day-white-cream",
            name: "Day White Cream",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream White.png",
            price: 100000,
            badge: "Foundation"
        },


        {
            id: "flawless-bb-cushion",
            name: "Flawless BB Cushion",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Flawless BB Cushion.png",
            price: 65000,
            badge: "Bedak Cair"
        },


        {
            id: "exfoliating-apple-gel",
            name: "Exfoliating Apple Gel",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Peeling Gel Apel.jpg",
            price: 100000,
            badge: "Komedo"
        },


        {
            id: "exfoliating-strawberry-gel",
            name: "Exfoliating Strawberry Gel",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Peeling Gel Strawberry.jpg",
            price: 100000,
            badge: "Komedo"
        },


        {
            id: "paket-radiant-acne-repair",
            name: "Paket Radiant Acne Repair",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket Basic RAR.jpg",
            price: 270000,
            badge: "Jerawat & Beruntusan"
        },


        {
            id: "paket-radiant-bright-ultimate",
            name: "Paket Radiant Bright Ultimate",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket RBU Kulit Kering 2.png",
            price: 270000,
            badge: "Kusam & Flek Ringan"
        },


        {
            id: "paket-radiant-glow-booster",
            name: "Paket Radiant Glow Booster",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket Radiant Glow Booster Kulit Normal.png",
            price: 280000,
            badge: "Flek Berat/Ringan & Kusam,"
        },


        {
            id: "silky-soft-face-powder-beige",
            name: "Silky Soft Face Powder Beige",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Silky Soft Powder Beige.png",
            price: 100000,
            badge: "Bedak Tabur"
        },


        {
            id: "silky-soft-face-powder-natural",
            name: "Silky Soft Face Powder Natural",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Silky Soft Powder Natural.png",
            price: 100000,
            badge: "Bedak Tabur"
        },


        {
            id: "sunscreen-glowing",
            name: "Sunscreen Glowing",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Sunscreen Glowing.png",
            price: 100000,
            badge: "Best Seller"
        },


        {
            id: "sunscreen-for-oily-and-acne-new",
            name: "Sunscreen For Oily And Acne",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Sunscreen Oily & Acne.png",
            price: 105000,
            badge: "Best Seller"
        },


        /* =================================================
           FACIAL WASH
        ================================================= */

        {
            id: "facial-wash-for-normal-skin-110-ml",
            name: "Facial Wash For Normal Skin 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash for Normal Skin Rara Drw Skincare.png",
            price: 100000,
            badge: "Best Seller"
        },


        {
            id: "facial-wash-for-normal-skin-63-ml",
            name: "Facial Wash For Normal Skin 63 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Normal Skin 60 ml.jpg",
            price: 80000,
            badge: "Kulit Normal"
        },


        {
            id: "facial-wash-oily-acne-110-ml",
            name: "Facial Wash Oily Acne 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Oily & Acne 110 ml TO.png",
            price: 105000,
            badge: "Best Seller Wajah Berminyak & Berjerawat"
        },


        {
            id: "facial-wash-oily-acne-63-ml",
            name: "Facial Wash Oily Acne 63 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Oily & Acne 63 ml.png",
            price: 85000,
            badge: "Kulit Berminyak"
        },


        {
            id: "facial-wash-pink-brightening-110-ml",
            name: "Facial Wash Pink Brightening 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Brightening Pink 110 ml.jpg",
            price: 100000,
            badge: "Kulit Sensitif"
        },


        {
            id: "facial-wash-pink-brightening-63-ml",
            name: "Facial Wash Pink Brightening 63 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Brightening Pink 63 ml.jpg",
            price: 80000,
            badge: "Kulit Sensitif"
        },


        {
            id: "facial-wash-tea-tree-oil-110-ml",
            name: "Facial Wash Tea Tree Oil 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "facial wash tea tree oil 100 ml  new.jpg",
            price: 100000,
            badge: "Kulit Kombinasi"
        },


        {
            id: "facial-wash-tea-tree-oil-63-ml",
            name: "Facial Wash Tea Tree Oil 63 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Tea Tree Oil 60 ml.jpg",
            price: 80000,
            badge: "Kulit Kombinasi"
        },


        /* =================================================
           PRODUK LAIN
        ================================================= */

        {
            id: "beauty-dna-salmon-spray",
            name: "Beauty DNA Salmon Spray",
            category: "Spray",
            image: IMAGE_FOLDER + "Beauty DNA Salmond.jpg",
            price: 90000,
            badge: "Melembabkan & Mencerahkan"
        },


        {
            id: "breast-cream",
            name: "Breast Cream",
            category: "Body Care",
            image: IMAGE_FOLDER + "Breast Cream.png",
            price: 100000,
            badge:"Payudara"
        },


        {
            id: "daily-ceramoist-hydra-gel",
            name: "Daily Ceramoist Hydra Gel",
            category: "Perawatan Wajah",
            image:IMAGE_FOLDER + "Daily Ceramoist.jpg",
            price: 120000,
            badge:"Skin Barrier"
        },


        {
            id: "daily-compact-powder-beige",
            name: "Daily Compact Powder Beige",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "daily-compact-powder-pink",
            name: "Daily Compact Powder Pink",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "day-body-foundation-premium",
            name: "Day Body Foundation Premium",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "day-body-lotion-premium-110-ml",
            name: "Day Body Lotion Premium 110 ml",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "dna-salmon-extra-marine-collagen-and-hyaluronic-acid-30-ml",
            name: "DNA Salmon Extra Marine Collagen and Hyaluronic Acid 30 ml",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "drw-kapsul-gemuk-badan-isi-60",
            name: "DRW Kapsul Gemuk Badan Isi 60",
            category: "Supplement",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "drw-slimming-capsule-isi-60",
            name: "DRW Slimming Capsule Isi 60",
            category: "Supplement",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "face-mist-centella-asiatica",
            name: "Face Mist Centella Asiatica",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "firming-body-cream-pink",
            name: "Firming Body Cream Pink",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "green-tea-face-mask-premium",
            name: "Green Tea Face Mask Premium",
            category: "Masker",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "hair-serum-premium",
            name: "Hair Serum Premium",
            category: "Hair Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "hair-tonic-normal-220-ml",
            name: "Hair Tonic Normal 220 ml",
            category: "Hair Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "hb-dosting-75-gram",
            name: "HB Dosting 75 Gram",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "kojic-acid-milk-soap",
            name: "Kojic Acid Milk Soap",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lipgloss-beauty-gold",
            name: "Lipgloss Beauty Gold",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lipgloss-beauty-gold-vit-e",
            name: "Lipgloss Beauty Gold Vit E",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lipgloss-beauty-pink",
            name: "Lipgloss Beauty Pink",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lipgloss-beauty-pink-vit-e",
            name: "Lipgloss Beauty Pink Vit E",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lipscare",
            name: "Lipscare",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "lulur-brightening-premium",
            name: "Lulur Brightening Premium",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "luminous-brightening-vitamin-c-plus-collagen-serum",
            name: "Luminous Brightening Vitamin C Plus Collagen Serum",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "moisturizer-gel-aloe-vera",
            name: "Moisturizer Gel Aloe Vera",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "moisturizer-gel-avocado",
            name: "Moisturizer Gel Avocado",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "moisturizer-gel-cucumber-vit-e",
            name: "Moisturizer Gel Cucumber Vit E",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "rice-face-mask-limpasu",
            name: "Rice Face Mask Limpasu",
            category: "Masker",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "serum-aha-bha",
            name: "Serum AHA BHA",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "serum-brightening-glowing",
            name: "Serum Brightening Glowing",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "serum-brightening-with-vit-c-e",
            name: "Serum Brightening With Vit C E",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "serum-for-acne-skin",
            name: "Serum For Acne Skin",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "serum-retinol",
            name: "Serum Retinol",
            category: "Serum",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "silky-soft-face-powder-ivory",
            name: "Silky Soft Face Powder Ivory",
            category: "Make up & Riasan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "snail-cream-anti-aging",
            name: "Snail Cream Anti Aging",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "strawberry-micellar-water-100-ml",
            name: "Strawberry Micellar Water 100 ml",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "strawberry-micellar-water-63-ml",
            name: "Strawberry Micellar Water 63 ml",
            category: "Perawatan Wajah",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "stretchmark-cream-with-olive-oil",
            name: "Stretchmark Cream With Olive Oil",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "sulfur-soap-plus-milk",
            name: "Sulfur Soap Plus Milk",
            category: "Body Care",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "toner-honey-premium-110-ml-new",
            name: "Toner Honey Premium 110 ml",
            category: "Toner",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "toner-honey-premium-63-ml",
            name: "Toner Honey Premium 63 ml",
            category: "Toner",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "toner-lime-premium-110-ml",
            name: "Toner Lime Premium 110 ml",
            category: "Toner",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "toner-lime-premium-63-ml",
            name: "Toner Lime Premium 63 ml",
            category: "Toner",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-ceramoist-acne",
            name: "Paket Ceramoist Acne",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-ceramoist-glowing",
            name: "Paket Ceramoist Glowing",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-lotion-rejuvenation",
            name: "Paket Lotion Rejuvenation",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-oily-acne-abha-100-ml",
            name: "Paket Oily Acne ABHA 100 ml",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-oily-acne-abha-3",
            name: "Paket Oily Acne ABHA 3",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        },


        {
            id: "paket-oily-acne-abha-60ml",
            name: "Paket Oily Acne ABHA 60 ml",
            category: "Paket Perawatan",
            image: PLACEHOLDER,
            price: 0
        }

    ];


    /* =====================================================
       NORMALISASI PRODUK
       ===================================================== */

    PRODUCTS.forEach(function (product) {

        product.price =
            Number(product.price || 0);


        product.umum =
            Number(product.price || 0);


        product.director =
            Number(product.price || 0);


        product.manager =
            Number(product.price || 0);


        product.supervisor =
            Number(product.price || 0);


        product.reseller =
            Number(product.price || 0);


        product.prices = {

            director: product.director,

            manager: product.manager,

            supervisor: product.supervisor,

            reseller: product.reseller,

            umum: product.umum

        };


        product.description =
            product.description ||
            product.name +
            " merupakan produk DRW SKINCARE untuk membantu melengkapi rutinitas perawatan kecantikan sehari-hari.";


        product.stock = true;


        /*
         * =================================================
         * BADGE
         *
         * JANGAN gunakan:
         *
         * product.badge = "";
         *
         * Karena itu akan menghapus badge yang
         * sudah ditulis di data produk.
         *
         * =================================================
         */

        product.badge =
            String(product.badge || "").trim();


        product.featured = false;

    });


    /* =====================================================
       GLOBAL DATA
    ===================================================== */

    window.DRW_PRODUCTS =
        PRODUCTS;


    window.PRODUCT_DATA =
        PRODUCTS;


    window.DRW_PRODUCT_DATA =
        PRODUCTS;


    window.produk =
        PRODUCTS;


    /* =====================================================
       GET PRODUCT
    ===================================================== */

    window.getDRWProduct =
        function (id) {

            if (!id) {

                return null;

            }


            id =
                String(id)
                    .trim();


            return PRODUCTS.find(
                function (product) {

                    return (
                        String(product.id) ===
                        id
                    );

                }
            ) || null;

        };


    /* =====================================================
       GET CATEGORY
    ===================================================== */

    window.getDRWProductsByCategory =
        function (category) {

            return PRODUCTS.filter(
                function (product) {

                    return (
                        product.category ===
                        category
                    );

                }
            );

        };


    /* =====================================================
       SEARCH
    ===================================================== */

    window.searchDRWProducts =
        function (keyword) {

            const search =
                String(keyword || "")
                    .toLowerCase()
                    .trim();


            if (!search) {

                return PRODUCTS;

            }


            return PRODUCTS.filter(
                function (product) {

                    return (

                        product.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.category
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.id
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

        };


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "%c DRW SKINCARE ",
        "background:#e52d91;color:white;font-weight:bold;padding:6px 12px;border-radius:6px;"
    );


    console.log(
        "✅ PRODUCTS-DATA.JS AKTIF"
    );


    console.log(
        "✅ Jumlah produk:",
        PRODUCTS.length
    );


    console.log(
        "✅ Test Badge:",
        window.getDRWProduct(
            "3-in-1-exfoliating-gel-100-ml"
        ).badge
    );


    console.log(
        "✅ Test Acne Cream 3:",
        window.getDRWProduct(
            "acne-cream-3"
        )
    );


})();
