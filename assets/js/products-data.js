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
            badge: "Best Seller"
        },


        {
            id: "acne-cream-3",
            name: "Acne Cream 3",
            category: "Cream Malam",
            image: IMAGE_FOLDER + "Acne Cream 3.png",
            price: 100000,
            
        },


        {
            id: "bamboo-charcoal-soap-premium",
            name: "Bamboo Charcoal Soap Premium",
            category: "Body Care",
            image: IMAGE_FOLDER + "Bamboo Charcoal Soap Premium.png",
            price: 55000,
           
        },


        {
            id: "bb-cream-air-cushion-shade-ivory",
            name: "BB Cream Air Cushion Shade Ivory",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "BB Cream Air Cushion Shade Ivory TO.png",
            price: 65000,
           
        },


        {
            id: "brightening-cream",
            name: "Brightening Cream",
            category: "Cream Malam",
            image: IMAGE_FOLDER + "Brightening Cream.png",
            price: 100000,
            
        },


        {
            id: "brightening-peel-off-mask-with-charcoal-60-ml",
            name: "Brightening Peel Off Mask with Charcoal 60 ml",
            category: "Masker",
            image: IMAGE_FOLDER + "Brightening Peel Off Mask with Charcoal 60 ml.png",
            price: 110000,
            
        },


        {
            id: "cleansing-milk-with-green-tea-110-ml",
            name: "Cleansing Milk With Green Tea 110 ml",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Milk Cleanser 110 ml.jpg",
            price: 80000,
          
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
 
        },


        {
            id: "daily-compact-powder-natural",
            name: "Daily Compact Powder Natural",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Daily Compact Powder Natural Whitening.png",
            price: 100000,
 
        },


        {
            id: "day-acne-cream-1",
            name: "Day Acne Cream 1",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Acne 1.png",
            price: 100000,
       
        },


        {
            id: "day-acne-cream-2",
            name: "Day Acne Cream 2",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Acne 2.png",
            price: 100000,
        },


        {
            id: "day-pink-cream",
            name: "Day Pink Cream",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream Pink.png",
            price: 100000,
            },


        {
            id: "day-white-cream",
            name: "Day White Cream",
            category: "Cream Siang",
            image: IMAGE_FOLDER + "Day Cream White.png",
            price: 100000,
               },


        {
            id: "flawless-bb-cushion",
            name: "Flawless BB Cushion",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Flawless BB Cushion.png",
            price: 65000,
            badge: "Best Seller"
        },


        {
            id: "exfoliating-apple-gel",
            name: "Exfoliating Apple Gel",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Peeling Gel Apel.jpg",
            price: 100000,
            },


        {
            id: "exfoliating-strawberry-gel",
            name: "Exfoliating Strawberry Gel",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Peeling Gel Strawberry.jpg",
            price: 100000,
            },


        {
            id: "paket-radiant-acne-repair",
            name: "Paket Radiant Acne Repair",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket Basic RAR.jpg",
            price: 270000,
           },


        {
            id: "paket-radiant-bright-ultimate",
            name: "Paket Radiant Bright Ultimate",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket RBU Kulit Kering 2.png",
            price: 270000,
           },


        {
            id: "paket-radiant-glow-booster",
            name: "Paket Radiant Glow Booster",
            category: "Paket Perawatan",
            image: IMAGE_FOLDER + "Paket Radiant Glow Booster Kulit Normal.png",
            price: 280000,
           },


        {
            id: "silky-soft-face-powder-beige",
            name: "Silky Soft Face Powder Beige",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Silky Soft Powder Beige.png",
            price: 100000,
          },


        {
            id: "silky-soft-face-powder-natural",
            name: "Silky Soft Face Powder Natural",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Silky Soft Powder Natural.png",
            price: 100000,
           
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
            
        },


        {
            id: "facial-wash-oily-acne-110-ml",
            name: "Facial Wash Oily Acne 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Oily & Acne 110 ml TO.png",
            price: 105000,
            },


        {
            id: "facial-wash-oily-acne-63-ml",
            name: "Facial Wash Oily Acne 63 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "Facial Wash Oily & Acne 63 ml.png",
            price: 85000,
            
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
            
        },


        {
            id: "facial-wash-tea-tree-oil-110-ml",
            name: "Facial Wash Tea Tree Oil 110 ml",
            category: "Facial Wash",
            image: IMAGE_FOLDER + "facial wash tea tree oil 100 ml  new.jpg",
            price: 100000,
            
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
            
        },


        {
            id: "breast-cream",
            name: "Breast Cream",
            category: "Body Care",
            image: IMAGE_FOLDER + "Breast Cream.png",
            price: 100000,
           
        },


        {
            id: "daily-ceramoist-hydra-gel",
            name: "Daily Ceramoist Hydra Gel",
            category: "Perawatan Wajah",
            image:IMAGE_FOLDER + "Daily Ceramoist.jpg",
            price: 120000,
            
        },




        {
            id: "day-body-foundation-premium",
            name: "Day Body Foundation Premium",
            category: "Body Care",
            image: IMAGE_FOLDER + "Day Body Foundation Premium Rara Drw Skincare.png",
            price: 80000,
            
        },


        {
            id: "day-body-lotion-premium-110-ml",
            name: "Day Body Lotion Premium 110 ml",
            category: "Body Care",
            image: IMAGE_FOLDER + "day body lotion Premium Rara Drw Skincare.png",
            price: 80000,
            
        },


        {
            id: "dna-salmon-extra-marine-collagen-and-hyaluronic-acid-30-ml",
            name: "DNA Salmon Extra Marine Collagen and Hyaluronic Acid 30 ml",
            category: "Serum",
            image: IMAGE_FOLDER + "drwskincare_drwskincare_serum_wajah_dna_salmon_with_extra_marine_collagen_-_hyaluronic_acid_full03_31dcbd7d.jpg",
            price: 155000,
            
        },


        {
            id: "drw-kapsul-gemuk-badan-isi-60",
            name: "DRW Kapsul Gemuk Badan Isi 60",
            category: "Supplement",
            image: IMAGE_FOLDER + "Drw Kapsul Gemuk Badan Rara Drw Skincare.png",
            price: 225000,
            
        },


        {
            id: "drw-slimming-capsule-isi-60",
            name: "DRW Slimming Capsule Isi 60",
            category: "Supplement",
            image: IMAGE_FOLDER + "DRW Slimming Capsule Rara Drw Skincare.png",
            price: 225000,
           
        },


        {
            id: "face-mist-centella-asiatica",
            name: "Face Mist Centella Asiatica",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "face mist centella asiatica.jpg",
            price: 75000,
            badge: "Spray" 
        },


        {
            id: "firming-body-cream-green",
            name: "Firming Body Cream Green",
            category: "Body Care",
            image: IMAGE_FOLDER + "Body Firming Green.jpg",
            price: 100000,
            badge: "Program Diet" 
        },


        {
            id: "green-tea-face-mask-premium",
            name: "Green Tea Face Mask Premium",
            category: "Masker",
            image: IMAGE_FOLDER + "Masker Green Tea.jpg",
            price: 75000,
           
        },


        {
            id: "hair-serum-premium",
            name: "Hair Serum Premium",
            category: "Hair Care",
            image: IMAGE_FOLDER + "hair serum.jpg",
            price: 120000,
           
        },


        {
            id: "hair-tonic-normal-220-ml",
            name: "Hair Tonic Normal 220 ml",
            category: "Hair Care",
            image: IMAGE_FOLDER + "Hair Tonic Normal.jpeg",
            price: 120000,
            
        },


        {
            id: "hb-dosting-75-gram",
            name: "HB Dosting 75 Gram",
            category: "Body Care",
            image: IMAGE_FOLDER + "hb dosting Rara Drw skincare 2.png",
            price: 120000,
            badge : "Handbody"
        },


        {
            id: "kojic-acid-milk-soap",
            name: "Kojic Acid Milk Soap",
            category: "Body Care",
            image: IMAGE_FOLDER + "kojic acid milk soap.jpg",
            price: 80000,
          
        },


        {
            id: "lipgloss-beauty-gold",
            name: "Lipgloss Beauty Gold Vit E",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Lipgloss Beauty Gold.jpg",
            price: 110000,
            badge: "Tahan Lama"
        },


        {
            id: "lipgloss-beauty-gold-vit-e",
            name: "Lipgloss Beauty Gold Vit E",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Lipgloss Beauty Pink.jpg",
            price: 110000,
      
        },


        {
            id: "lipscare",
            name: "Lipscare",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "lipscare new.png",
            price: 135000,
          
        },


        {
            id: "luminous-brightening-vitamin-c-plus-collagen-serum",
            name: "Luminous Brightening Vitamin C Plus Collagen Serum",
            category: "Serum",
            image: IMAGE_FOLDER + "Serum Luminous.jpg",
            price: 120000,
       
        },


        {
            id: "moisturizer-gel-aloe-vera",
            name: "Moisturizer Gel Aloe Vera",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Moisture Gel Aloevera.jpg",
            price: 80000,
            
        },


        {
            id: "moisturizer-gel-avocado",
            name: "Moisturizer Gel Avocado",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Moisture Gel Avocado.jpg",
            price: 80000,
            badge:"Pelembab"
        },


        {
            id: "moisturizer-gel-cucumber-vit-e",
            name: "Moisturizer Gel Cucumber Vit E",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Moisture Gel Cucumber.jpg",
            price: 80000,
            
        },


        {
            id: "serum-aha-bha",
            name: "Serum AHA BHA",
            category: "Serum",
            image: IMAGE_FOLDER + "Serum AHA BHA.png",
            price: 110000,
            badge: "Best Seller"
        },


        {
            id: "serum-brightening-glowing",
            name: "Serum Brightening Glowing",
            category: "Serum",
            image: IMAGE_FOLDER + "Serum Brightening Glow Rara Drw Skincare.png",
            price: 100000,
        },


        {
            id: "serum-brightening-with-vit-c-e",
            name: "Serum Brightening With Vit C E",
            category: "Serum",
            image: IMAGE_FOLDER + "Serum Brightening Vit CE.jpg",
            price: 100000,
        },


        {
            id: "serum-for-acne-skin",
            name: "Serum For Acne Skin",
            category: "Serum",
            image: IMAGE_FOLDER + "Serum for Acne Skin.jpg",
            price: 100000,
        },


        {
            id: "serum-retinol",
            name: "Serum Retinol",
            category: "Serum",
            image: IMAGE_FOLDER + "serum retinol 3.jpg",
            price: 120000,
        },


        {
            id: "silky-soft-face-powder-ivory",
            name: "Silky Soft Face Powder Ivory",
            category: "Make up & Riasan",
            image: IMAGE_FOLDER + "Silky Soft Powder Ivory Rara Drw Skincare 2.jpg",
            price: 100000,
        },


        {
            id: "snail-cream-anti-aging",
            name: "Snail Cream Anti Aging",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Snail Cream Anti Aging.jpg",
            price: 120000,
        },


        {
            id: "strawberry-micellar-water-100-ml",
            name: "Strawberry Micellar Water 100 ml",
            category: "Perawatan Wajah",
            image: IMAGE_FOLDER + "Micellar water 100 ml.jpg",
            price: 60000,
        },


        {
            id: "stretchmark-cream-with-olive-oil",
            name: "Stretchmark Cream With Olive Oil",
            category: "Body Care",
            image: IMAGE_FOLDER + "streatchmark.jpg",
            price: 130000,
        },


        {
            id: "sulfur-soap-plus-milk",
            name: "Sulfur Soap Plus Milk",
            category: "Body Care",
            image: IMAGE_FOLDER + "Sulfur Soap Milk.jpg",
            price: 80000,
        },


        {
            id: "toner-honey-premium-110-ml-new",
            name: "Toner Honey Premium 110 ml",
            category: "Toner",
            image: IMAGE_FOLDER + "Toner Honey 110 ml 2.jpg",
            price: 90000,
        },


        {
            id: "toner-honey-premium-63-ml",
            name: "Toner Honey Premium 63 ml",
            category: "Toner",
            image: IMAGE_FOLDER + "Toner Honey 63 ml.jpg",
            price: 70000,
        },


        {
            id: "toner-lime-premium-110-ml",
            name: "Toner Lime Premium 110 ml",
            category: "Toner",
            image: IMAGE_FOLDER + "Toner Lime 110 ml TO.png",
            price: 70000,
        },


        {
            id: "toner-lime-premium-63-ml",
            name: "Toner Lime Premium 63 ml",
            category: "Toner",
            image: IMAGE_FOLDER + "Toner Lime Premium 63 ml .png",
            price: 90000,
        },



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
