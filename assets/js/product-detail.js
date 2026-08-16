/* =========================================================
   RARA DRW SKINCARE
   PRODUCT DETAIL.JS — FINAL FIX
   =========================================================
   FIX:
   - Membaca ?id= dari URL
   - Tidak lagi memakai Coolbright Deo Herba sebagai fallback
   - Mencari produk dari PRODUCT_DATA
   - Mencari produk dari DRW_PRODUCTS
   - Mencari produk dari PRODUCTS
   - Mencari produk dari products
   - Membuat slug otomatis
   - Nama produk -> ID otomatis
   - Gambar produk otomatis
   - Harga otomatis
   - Kategori otomatis
   - Deskripsi otomatis
   ========================================================= */

(function () {

    "use strict";

    console.log("========================================");
    console.log("DRW PRODUCT DETAIL — FINAL");
    console.log("========================================");


    /* =====================================================
       1. GET PRODUCT ID FROM URL
    ===================================================== */

    const urlParams = new URLSearchParams(window.location.search);

    const productId = (
        urlParams.get("id") ||
        ""
    ).trim().toLowerCase();


    console.log("URL PRODUCT ID:", productId);


    /* =====================================================
       2. ELEMENTS
    ===================================================== */

    const el = {

        image:
            document.getElementById("detailProductImage"),

        placeholder:
            document.getElementById("productPlaceholder"),

        badge:
            document.getElementById("detailBadge"),

        category:
            document.getElementById("detailCategory"),

        name:
            document.getElementById("detailProductName"),

        price:
            document.getElementById("detailPrice"),

        priceLevel:
            document.getElementById("detailPriceLevel"),

        description:
            document.getElementById("detailDescription"),

        breadcrumb:
            document.getElementById("breadcrumbProduct"),

        selectedName:
            document.getElementById("selectedProductName"),

        selectedList:
            document.getElementById("selectedProductsList"),

        infoDescription:
            document.getElementById("infoDescription"),

        quantity:
            document.getElementById("detailQuantity"),

        qtyMinus:
            document.getElementById("detailQtyMinus"),

        qtyPlus:
            document.getElementById("detailQtyPlus"),

        addCart:
            document.getElementById("detailAddCart"),

        buyNow:
            document.getElementById("detailBuyNow")

    };


    /* =====================================================
       3. SLUG GENERATOR
    ===================================================== */

    function makeSlug(text) {

        if (!text) {
            return "";
        }

        return String(text)

            .toLowerCase()

            .trim()

            .normalize("NFD")

            .replace(/[\u0300-\u036f]/g, "")

            .replace(/&/g, " dan ")

            .replace(/[^a-z0-9]+/g, "-")

            .replace(/^-+|-+$/g, "");

    }


    /* =====================================================
       4. NORMALIZE PRODUCT
    ===================================================== */

    function normalizeProduct(product) {

        if (!product || typeof product !== "object") {
            return null;
        }


        const name =
            product.name ||
            product.title ||
            product.productName ||
            product.nama ||
            product.namaProduk ||
            "";


        const id =
            product.id ||
            product.slug ||
            product.productId ||
            product.kode ||
            product.code ||
            makeSlug(name);


        const image =
            product.image ||
            product.img ||
            product.imageUrl ||
            product.photo ||
            product.foto ||
            product.thumbnail ||
            product.gambar ||
            "";


        const category =
            product.category ||
            product.kategori ||
            product.categoryName ||
            "DRW SKINCARE";


        const description =
            product.description ||
            product.deskripsi ||
            product.desc ||
            "Produk DRW Skincare untuk melengkapi rutinitas perawatan kulit sehari-hari.";


        const price =
            product.price ??
            product.harga ??
            product.priceUmum ??
            product.hargaUmum ??
            0;


        return {

            ...product,

            id:
                makeSlug(id) ||
                makeSlug(name),

            name:
                name,

            image:
                image,

            category:
                category,

            description:
                description,

            price:
                price

        };

    }


    /* =====================================================
       5. COLLECT ALL POSSIBLE PRODUCT DATA
    ===================================================== */

    function collectProducts() {

        const result = [];


        /* ---------------------------------------------
           PRODUCT_DATA
        --------------------------------------------- */

        if (
            Array.isArray(window.PRODUCT_DATA)
        ) {

            result.push(
                ...window.PRODUCT_DATA
            );

            console.log(
                "PRODUCT_DATA:",
                window.PRODUCT_DATA.length
            );

        }


        /* ---------------------------------------------
           DRW_PRODUCTS ARRAY
        --------------------------------------------- */

        if (
            Array.isArray(window.DRW_PRODUCTS)
        ) {

            result.push(
                ...window.DRW_PRODUCTS
            );

            console.log(
                "DRW_PRODUCTS ARRAY:",
                window.DRW_PRODUCTS.length
            );

        }


        /* ---------------------------------------------
           DRW_PRODUCTS OBJECT
        --------------------------------------------- */

        else if (
            window.DRW_PRODUCTS &&
            typeof window.DRW_PRODUCTS === "object"
        ) {

            result.push(
                ...Object.values(
                    window.DRW_PRODUCTS
                )
            );

            console.log(
                "DRW_PRODUCTS OBJECT:",
                Object.keys(window.DRW_PRODUCTS).length
            );

        }


        /* ---------------------------------------------
           PRODUCTS
        --------------------------------------------- */

        if (
            Array.isArray(window.PRODUCTS)
        ) {

            result.push(
                ...window.PRODUCTS
            );

            console.log(
                "PRODUCTS:",
                window.PRODUCTS.length
            );

        }


        /* ---------------------------------------------
           products
        --------------------------------------------- */

        if (
            Array.isArray(window.products)
        ) {

            result.push(
                ...window.products
            );

            console.log(
                "products:",
                window.products.length
            );

        }


        /* ---------------------------------------------
           PRODUCT_LIST
        --------------------------------------------- */

        if (
            Array.isArray(window.PRODUCT_LIST)
        ) {

            result.push(
                ...window.PRODUCT_LIST
            );

            console.log(
                "PRODUCT_LIST:",
                window.PRODUCT_LIST.length
            );

        }


        /* ---------------------------------------------
           NORMALIZE
        --------------------------------------------- */

        const normalized =
            result

                .map(normalizeProduct)

                .filter(Boolean);


        /* ---------------------------------------------
           REMOVE DUPLICATES
        --------------------------------------------- */

        const unique = new Map();


        normalized.forEach(product => {

            const key =
                product.id ||
                makeSlug(product.name);


            if (key) {

                unique.set(
                    key,
                    product
                );

            }

        });


        return [
            ...unique.values()
        ];

    }


    /* =====================================================
       6. FIND PRODUCT
    ===================================================== */

    function findProduct(id) {

        const products =
            collectProducts();


        console.log(
            "TOTAL PRODUCTS FOUND:",
            products.length
        );


        if (!id) {

            console.error(
                "ID PRODUK TIDAK ADA DI URL"
            );

            return null;

        }


        /* ---------------------------------------------
           EXACT ID
        --------------------------------------------- */

        let product =
            products.find(
                item =>
                    String(item.id)
                        .toLowerCase()
                    ===
                    id
            );


        if (product) {

            console.log(
                "PRODUCT FOUND BY ID:",
                product
            );

            return product;

        }


        /* ---------------------------------------------
           SLUG FROM NAME
        --------------------------------------------- */

        product =
            products.find(
                item =>
                    makeSlug(item.name)
                    ===
                    id
            );


        if (product) {

            console.log(
                "PRODUCT FOUND BY NAME SLUG:",
                product
            );

            return product;

        }


        /* ---------------------------------------------
           PARTIAL MATCH
        --------------------------------------------- */

        product =
            products.find(item => {

                const slug =
                    makeSlug(item.name);

                return (
                    slug.includes(id) ||
                    id.includes(slug)
                );

            });


        if (product) {

            console.log(
                "PRODUCT FOUND BY PARTIAL MATCH:",
                product
            );

            return product;

        }


        console.error(
            "PRODUCT TIDAK DITEMUKAN:",
            id
        );


        console.table(

            products.map(item => ({

                id:
                    item.id,

                name:
                    item.name,

                image:
                    item.image

            }))

        );


        return null;

    }


    /* =====================================================
       7. FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {

            return "Harga belum tersedia";

        }


        let number =
            Number(
                String(price)
                    .replace(/[^\d]/g, "")
            );


        if (
            !Number.isFinite(number) ||
            number <= 0
        ) {

            return "Harga belum tersedia";

        }


        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    /* =====================================================
       8. RESOLVE IMAGE PATH
    ===================================================== */

    function resolveImage(image) {

        if (!image) {
            return "";
        }


        image =
            String(image).trim();


        /* ---------------------------------------------
           FULL URL
        --------------------------------------------- */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {

            return image;

        }


        /* ---------------------------------------------
           ROOT PATH
        --------------------------------------------- */

        if (
            image.startsWith("/")
        ) {

            return image;

        }


        /* ---------------------------------------------
           ASSETS PATH
        --------------------------------------------- */

        if (
            image.startsWith("assets/")
        ) {

            return image;

        }


        /* ---------------------------------------------
           ./assets
        --------------------------------------------- */

        if (
            image.startsWith("./assets/")
        ) {

            return image.substring(2);

        }


        /* ---------------------------------------------
           DEFAULT
        --------------------------------------------- */

        return "assets/images/" + image;

    }


    /* =====================================================
       9. SHOW INVALID PRODUCT
    ===================================================== */

    function showInvalidProduct() {

        if (el.name) {

            el.name.textContent =
                "Produk Tidak Ditemukan";

        }


        if (el.category) {

            el.category.textContent =
                "DRW SKINCARE COLLECTION";

        }


        if (el.price) {

            el.price.textContent =
                "ID produk tidak valid";

        }


        if (el.description) {

            el.description.textContent =
                "Produk yang Anda pilih tidak ditemukan. Silakan kembali ke halaman produk.";

        }


        if (el.breadcrumb) {

            el.breadcrumb.textContent =
                "Detail Produk";

        }


        if (el.selectedName) {

            el.selectedName.textContent =
                "Produk utama";

        }


        if (el.infoDescription) {

            el.infoDescription.textContent =
                "Produk tidak ditemukan.";

        }


        if (el.image) {

            el.image.style.display =
                "none";

        }


        if (el.placeholder) {

            el.placeholder.style.display =
                "grid";

        }


        if (el.addCart) {

            el.addCart.disabled =
                true;

        }


        if (el.buyNow) {

            el.buyNow.disabled =
                true;

        }

    }


    /* =====================================================
       10. SHOW PRODUCT
    ===================================================== */

    function renderProduct(product) {

        if (!product) {

            showInvalidProduct();

            return;

        }


        console.log(
            "========================================"
        );

        console.log(
            "PRODUCT DETAIL LOADED"
        );

        console.log(
            "ID:",
            product.id
        );

        console.log(
            "NAME:",
            product.name
        );

        console.log(
            "IMAGE:",
            product.image
        );

        console.log(
            "PRICE:",
            product.price
        );

        console.log(
            "========================================"
        );


        /* ---------------------------------------------
           NAME
        --------------------------------------------- */

        if (el.name) {

            el.name.textContent =
                product.name;

        }


        /* ---------------------------------------------
           BREADCRUMB
        --------------------------------------------- */

        if (el.breadcrumb) {

            el.breadcrumb.textContent =
                product.name;

        }


        /* ---------------------------------------------
           CATEGORY
        --------------------------------------------- */

        if (el.category) {

            el.category.textContent =
                product.category ||
                "DRW SKINCARE";

        }


        /* ---------------------------------------------
           PRICE
        --------------------------------------------- */

        if (el.price) {

            el.price.textContent =
                formatPrice(
                    product.price
                );

        }


        /* ---------------------------------------------
           DESCRIPTION
        --------------------------------------------- */

        if (el.description) {

            el.description.textContent =
                product.description;

        }


        if (el.infoDescription) {

            el.infoDescription.textContent =
                product.description;

        }


        /* ---------------------------------------------
           SELECTED PRODUCT
        --------------------------------------------- */

        if (el.selectedName) {

            el.selectedName.textContent =
                product.name;

        }


        /* ---------------------------------------------
           IMAGE
        --------------------------------------------- */

        const imagePath =
            resolveImage(
                product.image
            );


        if (
            el.image &&
            imagePath
        ) {

            el.image.style.display =
                "block";

            el.image.src =
                imagePath;

            el.image.alt =
                product.name;


            el.image.onerror =
                function () {

                    console.error(
                        "GAMBAR TIDAK DITEMUKAN:",
                        imagePath
                    );

                    this.style.display =
                        "none";

                    if (el.placeholder) {

                        el.placeholder.style.display =
                            "grid";

                    }

                };


            el.image.onload =
                function () {

                    console.log(
                        "GAMBAR BERHASIL:",
                        imagePath
                    );

                };

        }


        /* ---------------------------------------------
           PAGE TITLE
        --------------------------------------------- */

        document.title =
            product.name +
            " | DRW Skincare";


        /* ---------------------------------------------
           ENABLE BUTTON
        --------------------------------------------- */

        if (el.addCart) {

            el.addCart.disabled =
                false;

        }


        if (el.buyNow) {

            el.buyNow.disabled =
                false;

        }


        /* ---------------------------------------------
           STORE CURRENT PRODUCT
        --------------------------------------------- */

        window.DRW_CURRENT_PRODUCT =
            product;


        try {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(product)
            );

        } catch (error) {

            console.warn(
                "Tidak dapat menyimpan drwProduct",
                error
            );

        }

    }


    /* =====================================================
       11. QUANTITY
    ===================================================== */

    let quantity = 1;


    function updateQuantity() {

        quantity =
            Math.max(
                1,
                Number(quantity) || 1
            );


        if (el.quantity) {

            el.quantity.textContent =
                quantity;

        }

    }


    if (el.qtyMinus) {

        el.qtyMinus.addEventListener(
            "click",
            function () {

                quantity--;

                updateQuantity();

            }
        );

    }


    if (el.qtyPlus) {

        el.qtyPlus.addEventListener(
            "click",
            function () {

                quantity++;

                updateQuantity();

            }
        );

    }


    /* =====================================================
       12. PACKAGE BUTTON
    ===================================================== */

    document
        .querySelectorAll(
            ".detail-option-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".detail-option-btn"
                        )
                        .forEach(btn => {

                            btn.classList.remove(
                                "active"
                            );

                        });


                    this.classList.add(
                        "active"
                    );


                    console.log(
                        "PACKAGE:",
                        this.dataset.package
                    );

                }
            );

        });


    /* =====================================================
       13. ADD TO CART
    ===================================================== */

    if (el.addCart) {

        el.addCart.addEventListener(
            "click",
            function () {

                const product =
                    window.DRW_CURRENT_PRODUCT;


                if (!product) {

                    alert(
                        "Produk tidak ditemukan."
                    );

                    return;

                }


                const qty =
                    quantity;


                console.log(
                    "ADD TO CART:",
                    product.name,
                    qty
                );


                /* -----------------------------------------
                   Compatible with existing cart.js
                ----------------------------------------- */

                if (
                    typeof window.addToCart ===
                    "function"
                ) {

                    window.addToCart(
                        product,
                        qty
                    );

                    return;

                }


                /* -----------------------------------------
                   LOCAL STORAGE FALLBACK
                ----------------------------------------- */

                let cart = [];


                try {

                    cart =
                        JSON.parse(
                            localStorage.getItem(
                                "drwCart"
                            )
                        ) || [];

                } catch {

                    cart = [];

                }


                const existing =
                    cart.find(
                        item =>
                            item.id === product.id
                    );


                if (existing) {

                    existing.qty =
                        Number(
                            existing.qty || 0
                        ) + qty;

                    existing.quantity =
                        existing.qty;

                } else {

                    cart.push({

                        ...product,

                        qty:
                            qty,

                        quantity:
                            qty

                    });

                }


                localStorage.setItem(
                    "drwCart",
                    JSON.stringify(cart)
                );


                alert(
                    product.name +
                    " berhasil ditambahkan ke keranjang."
                );


                updateCartCount();

            }
        );

    }


    /* =====================================================
       14. BUY NOW
    ===================================================== */

    if (el.buyNow) {

        el.buyNow.addEventListener(
            "click",
            function () {

                const product =
                    window.DRW_CURRENT_PRODUCT;


                if (!product) {

                    alert(
                        "Produk tidak ditemukan."
                    );

                    return;

                }


                const item = {

                    ...product,

                    qty:
                        quantity,

                    quantity:
                        quantity

                };


                localStorage.setItem(
                    "drwProduct",
                    JSON.stringify(item)
                );


                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* =====================================================
       15. CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cartCount =
            document.getElementById(
                "cartCount"
            );


        if (!cartCount) {
            return;
        }


        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "drwCart"
                    )
                ) || [];

        } catch {

            cart = [];

        }


        const count =
            cart.reduce(
                (total, item) => {

                    return total +
                        Number(
                            item.qty ||
                            item.quantity ||
                            1
                        );

                },
                0
            );


        cartCount.textContent =
            count;

    }


    /* =====================================================
       16. INIT
    ===================================================== */

    function init() {

        console.log(
            "DRW DETAIL INIT..."
        );


        if (!productId) {

            console.error(
                "URL TIDAK MEMILIKI ?id="
            );

            showInvalidProduct();

            return;

        }


        const product =
            findProduct(
                productId
            );


        renderProduct(
            product
        );


        updateQuantity();

        updateCartCount();

    }


    /* =====================================================
       17. WAIT FOR DATA
    ===================================================== */

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
