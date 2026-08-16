/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS-PAGE.JS — FINAL V3

   ✓ 98 PRODUCTS
   ✓ Director
   ✓ Manager
   ✓ Supervisor
   ✓ Reseller
   ✓ Umum
   ✓ Dynamic Price
   ✓ price-level.js
   ✓ DRW_PRODUCTS
   ✓ Search
   ✓ Category Filter
   ✓ Pagination
   ✓ Product Detail
   ✓ Shopping Cart
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const PRODUCTS_PER_PAGE = 12;

    let currentCategory = "Semua Produk";

    let currentSearch = "";

    let currentPage = 1;


    /* =====================================================
       GET GRID
    ===================================================== */

    function getGrid() {

        return document.getElementById(
            "productsGrid"
        );

    }


    /* =====================================================
       GET CURRENT PRICE LEVEL
    ===================================================== */

    function getCurrentLevel() {

        /* PRIORITAS 1 — price-level.js */

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.getLevel ===
                "function"
        ) {

            return window.DRW_PRICE.getLevel();

        }


        /* PRIORITAS 2 — compatibility */

        if (
            typeof window.getPriceLevel ===
                "function"
        ) {

            return window.getPriceLevel();

        }


        /* FALLBACK */

        return String(
            localStorage.getItem(
                "drwPriceLevel"
            ) || "umum"
        )
        .toLowerCase()
        .trim();

    }


    /* =====================================================
       GET CURRENT LEVEL NAME
    ===================================================== */

    function getCurrentLevelName() {

        /* PRIORITAS price-level.js */

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.getLevelName ===
                "function"
        ) {

            return window.DRW_PRICE.getLevelName();

        }


        const names = {

            director: "Director",

            manager: "Manager",

            supervisor: "Supervisor",

            reseller: "Reseller",

            umum: "Umum"

        };


        return (
            names[getCurrentLevel()] ||
            "Umum"
        );

    }


    /* =====================================================
       GET PRODUCT PRICE — PALING PENTING
       
       HARGA LANGSUNG DARI price-level.js
    ===================================================== */

    function getProductPrice(product) {

        if (!product) {

            return 0;

        }


        const productId =
            String(
                product.id ||
                product.slug ||
                ""
            );


        /* =================================================
           PRIORITAS 1
           DRW_PRICE → price-level.js
        ================================================= */

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.getMainPrice ===
                "function"
        ) {

            const dynamicPrice =
                Number(
                    window.DRW_PRICE.getMainPrice(
                        productId
                    )
                );


            if (
                Number.isFinite(
                    dynamicPrice
                ) &&
                dynamicPrice > 0
            ) {

                return dynamicPrice;

            }

        }


        /* =================================================
           PRIORITAS 2
           GLOBAL getProductPrice
        ================================================= */

        if (
            typeof window.getProductPrice ===
                "function"
        ) {

            const dynamicPrice =
                Number(
                    window.getProductPrice(
                        productId
                    )
                );


            if (
                Number.isFinite(
                    dynamicPrice
                ) &&
                dynamicPrice > 0
            ) {

                return dynamicPrice;

            }

        }


        /* =================================================
           FALLBACK
           HARGA UMUM DARI products-data.js
        ================================================= */

        return Number(

            product.price ??
            product.harga ??
            product.priceUmum ??
            0

        );

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(price) {

        const number =
            Number(price);


        if (
            !Number.isFinite(number)
        ) {

            return "Rp 0";

        }


        return (
            "Rp " +
            number.toLocaleString(
                "id-ID"
            )
        );

    }


    /* =====================================================
       PRODUCT URL
    ===================================================== */

    function getProductUrl(product) {

        const id =
            String(
                product.id ||
                product.slug ||
                ""
            );


        return (
            "product-detail.html?id=" +
            encodeURIComponent(id)
        );

    }


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        if (
            !Array.isArray(
                window.DRW_PRODUCTS
            )
        ) {

            console.error(
                "❌ DRW_PRODUCTS tidak ditemukan."
            );

            return [];

        }


        let products =
            window.DRW_PRODUCTS.slice();


        /* =================================================
           CATEGORY
        ================================================= */

        if (
            currentCategory &&
            currentCategory !==
                "Semua Produk"
        ) {

            const category =
                String(
                    currentCategory
                )
                .trim()
                .toLowerCase();


            products =
                products.filter(
                    function (product) {

                        return (

                            String(
                                product.category ||
                                product.kategori ||
                                ""
                            )
                            .trim()
                            .toLowerCase()

                        ) === category;

                    }
                );

        }


        /* =================================================
           SEARCH
        ================================================= */

        if (currentSearch) {

            const keyword =
                currentSearch
                    .toLowerCase()
                    .trim();


            products =
                products.filter(
                    function (product) {

                        const name =
                            String(
                                product.name ||
                                product.nama ||
                                ""
                            )
                            .toLowerCase();


                        const category =
                            String(
                                product.category ||
                                product.kategori ||
                                ""
                            )
                            .toLowerCase();


                        const description =
                            String(
                                product.description ||
                                product.deskripsi ||
                                ""
                            )
                            .toLowerCase();


                        return (

                            name.includes(
                                keyword
                            ) ||

                            category.includes(
                                keyword
                            ) ||

                            description.includes(
                                keyword
                            )

                        );

                    }
                );

        }


        return products;

    }


    /* =====================================================
       CREATE PRODUCT CARD
    ===================================================== */

    function createProductCard(product) {

        const name =
            product.name ||
            product.nama ||
            "Produk DRW Skincare";


        const category =
            product.category ||
            product.kategori ||
            "DRW Skincare";


        const description =
            product.description ||
            product.deskripsi ||
            "Produk DRW Skincare untuk melengkapi rutinitas perawatan dan kecantikan sehari-hari.";


        const image =
            product.image ||
            product.gambar ||
            "assets/images/logo/logo.png";


        const id =
            String(
                product.id ||
                product.slug ||
                ""
            );


        /* =================================================
           HARGA DINAMIS
        ================================================= */

        const price =
            getProductPrice(
                product
            );


        const url =
            getProductUrl(
                product
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        card.dataset.id =
            id;


        card.innerHTML = `

            <div class="product-image-wrap">

                <a
                    href="${url}"
                    class="product-image-link"
                >

                    <img
                        src="${image}"
                        alt="${name}"
                        class="product-image"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='assets/images/logo/logo.png';
                        "
                    >

                </a>

            </div>


            <div class="product-card-content">

                <div class="product-category">

                    ${category}

                </div>


                <h3 class="product-title">

                    <a href="${url}">

                        ${name}

                    </a>

                </h3>


                <p class="product-description">

                    ${description}

                </p>


                <!-- HARGA -->

                <div
                    class="product-price"
                    data-product-id="${id}"
                >

                    ${formatRupiah(price)}

                </div>


                <!-- LEVEL HARGA -->

                <div class="product-price-level">

                    Harga

                    <strong class="drw-price-level">

                        ${getCurrentLevelName()}

                    </strong>

                </div>


                <div class="product-card-footer">

                    <a
                        href="${url}"
                        class="product-view-link"
                    >

                        Lihat Produk

                        <span>→</span>

                    </a>


                    <button
                        type="button"
                        class="add-cart-btn"
                        data-product-id="${id}"
                    >

                        <i
                            class="fa-solid fa-bag-shopping"
                        ></i>

                        Tambah Keranjang

                    </button>

                </div>

            </div>

        `;


        return card;

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts() {

        const grid =
            getGrid();


        if (!grid) {

            console.error(
                "❌ #productsGrid tidak ditemukan."
            );

            return;

        }


        const products =
            getFilteredProducts();


        if (!products.length) {

            grid.innerHTML = `

                <div class="products-empty">

                    <div class="empty-icon">

                        <i
                            class="fa-solid fa-box-open"
                        ></i>

                    </div>


                    <h3>

                        Produk tidak ditemukan

                    </h3>


                    <p>

                        Coba gunakan kata pencarian
                        atau kategori lain.

                    </p>

                </div>

            `;


            renderPagination(0);

            return;

        }


        const totalPages =
            Math.ceil(
                products.length /
                PRODUCTS_PER_PAGE
            );


        if (
            currentPage >
            totalPages
        ) {

            currentPage = 1;

        }


        const start =
            (currentPage - 1) *
            PRODUCTS_PER_PAGE;


        const end =
            start +
            PRODUCTS_PER_PAGE;


        const visibleProducts =
            products.slice(
                start,
                end
            );


        grid.innerHTML =
            "";


        visibleProducts.forEach(
            function (product) {

                grid.appendChild(
                    createProductCard(
                        product
                    )
                );

            }
        );


        renderPagination(
            totalPages
        );


        bindCartButtons();

        updatePriceLevelUI();

    }


    /* =====================================================
       CART BUTTON
    ===================================================== */

    function bindCartButtons() {

        document
            .querySelectorAll(
                ".add-cart-btn"
            )
            .forEach(
                function (button) {

                    if (
                        button.dataset.bound ===
                        "1"
                    ) {

                        return;

                    }


                    button.dataset.bound =
                        "1";


                    button.addEventListener(
                        "click",
                        function () {

                            const id =
                                button.dataset.productId;


                            /* PRIORITAS DRW_CART */

                            if (
                                window.DRW_CART &&
                                typeof
                                    window.DRW_CART.add ===
                                    "function"
                            ) {

                                window.DRW_CART.add(
                                    id
                                );


                                showAddedState(
                                    button
                                );


                                return;

                            }


                            /* FALLBACK */

                            const product =
                                window.DRW_PRODUCTS.find(
                                    function (item) {

                                        return (

                                            String(
                                                item.id
                                            ) ===
                                            String(id)

                                        );

                                    }
                                );


                            if (!product) {

                                console.error(
                                    "Produk tidak ditemukan:",
                                    id
                                );

                                return;

                            }


                            let cart =
                                JSON.parse(
                                    localStorage.getItem(
                                        "drwCart"
                                    ) || "[]"
                                );


                            const existing =
                                cart.find(
                                    function (item) {

                                        return (

                                            String(
                                                item.id
                                            ) ===
                                            String(id)

                                        );

                                    }
                                );


                            if (existing) {

                                existing.qty =
                                    Number(
                                        existing.qty ||
                                        existing.quantity ||
                                        1
                                    ) + 1;


                                existing.quantity =
                                    existing.qty;


                                /* UPDATE HARGA */

                                existing.price =
                                    getProductPrice(
                                        product
                                    );

                            }


                            else {

                                cart.push({

                                    id:
                                        product.id,

                                    name:
                                        product.name ||
                                        product.nama,

                                    image:
                                        product.image ||
                                        product.gambar,

                                    price:
                                        getProductPrice(
                                            product
                                        ),

                                    qty: 1,

                                    quantity: 1

                                });

                            }


                            localStorage.setItem(
                                "drwCart",
                                JSON.stringify(
                                    cart
                                )
                            );


                            if (
                                typeof
                                    window.updateCartCount ===
                                    "function"
                            ) {

                                window.updateCartCount();

                            }


                            showAddedState(
                                button
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       ADDED STATE
    ===================================================== */

    function showAddedState(button) {

        const oldHTML =
            button.innerHTML;


        button.classList.add(
            "added"
        );


        button.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Ditambahkan

        `;


        setTimeout(
            function () {

                button.classList.remove(
                    "added"
                );


                button.innerHTML =
                    oldHTML;

            },
            1200
        );

    }


    /* =====================================================
       PAGINATION
    ===================================================== */

    function renderPagination(
        totalPages
    ) {

        let pagination =
            document.getElementById(
                "productsPagination"
            );


        if (!pagination) {

            pagination =
                document.createElement(
                    "div"
                );


            pagination.id =
                "productsPagination";


            pagination.className =
                "products-pagination";


            const grid =
                getGrid();


            if (grid) {

                grid.parentNode.insertBefore(
                    pagination,
                    grid.nextSibling
                );

            }

        }


        pagination.innerHTML =
            "";


        if (
            totalPages <= 1
        ) {

            return;

        }


        if (
            currentPage > 1
        ) {

            pagination.appendChild(

                createPageButton(
                    "←",
                    currentPage - 1
                )

            );

        }


        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            const button =
                createPageButton(
                    i,
                    i
                );


            if (
                i === currentPage
            ) {

                button.classList.add(
                    "active"
                );

            }


            pagination.appendChild(
                button
            );

        }


        if (
            currentPage <
            totalPages
        ) {

            pagination.appendChild(

                createPageButton(
                    "→",
                    currentPage + 1
                )

            );

        }

    }


    /* =====================================================
       PAGE BUTTON
    ===================================================== */

    function createPageButton(
        text,
        page
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "page-button";


        button.textContent =
            text;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;


                renderProducts();


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );


        return button;

    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    function bindCategoryButtons() {

        document
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                function (button) {

                    if (
                        button.dataset.categoryBound ===
                        "1"
                    ) {

                        return;

                    }


                    button.dataset.categoryBound =
                        "1";


                    button.addEventListener(
                        "click",
                        function () {

                            currentCategory =
                                button.dataset.category;


                            currentPage =
                                1;


                            document
                                .querySelectorAll(
                                    "[data-category]"
                                )
                                .forEach(
                                    function (item) {

                                        item.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            renderProducts();

                        }
                    );

                }
            );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function bindSearch() {

        const input =
            document.getElementById(
                "productSearch"
            );


        if (
            !input ||
            input.dataset.bound ===
                "1"
        ) {

            return;

        }


        input.dataset.bound =
            "1";


        input.addEventListener(
            "input",
            function () {

                currentSearch =
                    input.value.trim();


                currentPage =
                    1;


                renderProducts();

            }
        );

    }


    /* =====================================================
       UPDATE PRICE LEVEL UI
    ===================================================== */

    function updatePriceLevelUI() {

        const level =
            getCurrentLevel();


        const levelName =
            getCurrentLevelName();


        /* CURRENT PRICE LEVEL */

        const levelText =
            document.getElementById(
                "currentPriceLevel"
            );


        if (levelText) {

            levelText.textContent =
                levelName;

        }


        /* LEVEL TEXT */

        document
            .querySelectorAll(
                ".drw-price-level"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        levelName;

                }
            );


        /* SELECTOR */

        document
            .querySelectorAll(
                ".drw-price-selector"
            )
            .forEach(
                function (selector) {

                    selector.value =
                        level;

                }
            );


        /* HTML DATA */

        document.documentElement
            .setAttribute(
                "data-price-level",
                level
            );

    }


    /* =====================================================
       PRICE LEVEL EVENTS
    ===================================================== */

    function bindPriceLevelEvents() {

        [
            "drwPriceLevelChanged",
            "drwPriceChanged"
        ]
        .forEach(
            function (eventName) {

                window.addEventListener(
                    eventName,
                    function () {

                        currentPage =
                            1;


                        updatePriceLevelUI();


                        renderProducts();

                    }
                );

            }
        );


        /* STORAGE */

        window.addEventListener(
            "storage",
            function (event) {

                if (
                    event.key ===
                    "drwPriceLevel"
                ) {

                    updatePriceLevelUI();

                    renderProducts();

                }

            }
        );

    }


    /* =====================================================
       PRICE LEVEL SELECTOR
    ===================================================== */

    function bindPriceSelector() {

        document
            .querySelectorAll(
                ".drw-price-selector"
            )
            .forEach(
                function (selector) {

                    if (
                        selector.dataset.drwPriceBound ===
                        "1"
                    ) {

                        return;

                    }


                    selector.dataset.drwPriceBound =
                        "1";


                    selector.value =
                        getCurrentLevel();


                    selector.addEventListener(
                        "change",
                        function () {

                            const level =
                                String(
                                    selector.value ||
                                    "umum"
                                )
                                .toLowerCase()
                                .trim();


                            if (
                                window.DRW_PRICE &&
                                typeof
                                    window.DRW_PRICE.setLevel ===
                                    "function"
                            ) {

                                window.DRW_PRICE.setLevel(
                                    level
                                );

                            }


                            else if (
                                typeof
                                    window.setPriceLevel ===
                                    "function"
                            ) {

                                window.setPriceLevel(
                                    level
                                );

                            }


                            else {

                                localStorage.setItem(
                                    "drwPriceLevel",
                                    level
                                );


                                updatePriceLevelUI();

                                renderProducts();

                            }

                        }
                    );

                }
            );

    }


    /* =====================================================
       READ CATEGORY URL
    ===================================================== */

    function readCategoryFromURL() {

        const category =
            new URLSearchParams(
                location.search
            )
            .get(
                "category"
            );


        if (!category) {

            return;

        }


        currentCategory =
            category;


        document
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                function (button) {

                    if (
                        String(
                            button.dataset.category
                        )
                        .toLowerCase() ===
                        String(category)
                        .toLowerCase()
                    ) {

                        button.classList.add(
                            "active"
                        );

                    }

                }
            );

    }


    /* =====================================================
       REFRESH PRICE
    ===================================================== */

    function refreshProductPrices() {

        updatePriceLevelUI();

        renderProducts();

    }


    /* =====================================================
       INIT
    ===================================================== */

    function initProductsPage() {

        console.log(
            "================================="
        );

        console.log(
            "RARA DRW — PRODUCTS PAGE FINAL V3"
        );

        console.log(
            "Produk:",
            window.DRW_PRODUCTS
                ? window.DRW_PRODUCTS.length
                : 0
        );

        console.log(
            "Level:",
            getCurrentLevelName()
        );

        console.log(
            "================================="
        );


        /* CHECK DATA */

        if (
            !Array.isArray(
                window.DRW_PRODUCTS
            )
        ) {

            console.error(
                "❌ DRW_PRODUCTS belum tersedia."
            );

            return;

        }


        /* CHECK GRID */

        if (!getGrid()) {

            console.error(
                "❌ #productsGrid tidak ditemukan."
            );

            return;

        }


        readCategoryFromURL();

        bindCategoryButtons();

        bindSearch();

        bindPriceLevelEvents();

        bindPriceSelector();

        updatePriceLevelUI();

        renderProducts();


        console.log(
            "✓ PRODUCTS PAGE SIAP"
        );

    }


    /* =====================================================
       WAIT FOR DRW_PRODUCTS
    ===================================================== */

    function start() {

        let attempts = 0;


        function attempt() {

            attempts++;


            if (
                Array.isArray(
                    window.DRW_PRODUCTS
                )
            ) {

                initProductsPage();

                return;

            }


            if (
                attempts < 20
            ) {

                setTimeout(
                    attempt,
                    100
                );

            }


            else {

                console.error(
                    "❌ DRW_PRODUCTS tidak tersedia."
                );

            }

        }


        attempt();

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    }

    else {

        start();

    }


    /* =====================================================
       GLOBAL
    ===================================================== */

    window.renderProducts =
        renderProducts;


    window.refreshProducts =
        renderProducts;


    window.refreshProductPrices =
        refreshProductPrices;


})();
