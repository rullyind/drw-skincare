/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS PAGE — FINAL V2
   =========================================================

   SISTEM:
   ✓ 98 PRODUCTS
   ✓ Director
   ✓ Manager
   ✓ Supervisor
   ✓ Reseller
   ✓ Umum
   ✓ Login / Price Level
   ✓ Search
   ✓ Category Filter
   ✓ Pagination
   ✓ Product Detail
   ✓ Shopping Cart
   ✓ Dynamic Price

   TERHUBUNG DENGAN:

   products-data.js
   price-level.js
   auth.js
   price-auth-sync.js
   cart.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const PRODUCTS_PER_PAGE = 12;

    let currentCategory = "Semua Produk";

    let currentSearch = "";

    let currentPage = 1;


    console.log(
        "================================="
    );

    console.log(
        "RARA DRW — PRODUCTS PAGE FINAL V2"
    );

    console.log(
        "=================================");


    /* =====================================================
       GET PRODUCTS GRID
    ===================================================== */

    function getGrid() {

        return document.getElementById(
            "productsGrid"
        );

    }


    /* =====================================================
       GET ACTIVE PRICE LEVEL
    ===================================================== */

    function getCurrentLevel() {

        if (
            typeof window.getPriceLevel ===
            "function"
        ) {

            return window.getPriceLevel();

        }


        return (
            localStorage.getItem(
                "drwPriceLevel"
            ) || "umum"
        );

    }


    /* =====================================================
       GET LEVEL NAME
    ===================================================== */

    function getCurrentLevelName() {

        const level =
            getCurrentLevel();


        const names = {

            director: "Director",

            manager: "Manager",

            supervisor: "Supervisor",

            reseller: "Reseller",

            umum: "Umum"

        };


        return (
            names[level] ||
            "Umum"
        );

    }


    /* =====================================================
       GET PRODUCT PRICE
    ===================================================== */

    function getProductPrice(product) {

        if (!product) {

            return 0;

        }


        const productId =
            product.id ||
            product.slug ||
            "";


        /*
         * PRIORITAS 1
         * price-level.js
         */

        if (
            typeof window.getProductPrice ===
            "function"
        ) {

            const specialPrice =
                window.getProductPrice(
                    productId
                );


            if (
                typeof specialPrice ===
                    "number" &&
                specialPrice > 0
            ) {

                return specialPrice;

            }

        }


        /*
         * PRIORITAS 2
         * Harga dari products-data.js
         */

        return Number(

            product.price ||

            product.harga ||

            product.priceUmum ||

            0

        );

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(price) {

        if (
            price === null ||
            price === undefined ||
            isNaN(price)
        ) {

            return "Rp 0";

        }


        return (
            "Rp " +
            Number(price)
                .toLocaleString("id-ID")
        );

    }


    /* =====================================================
       PRODUCT URL
    ===================================================== */

    function getProductUrl(product) {

        const id =
            product.id ||
            product.slug ||
            "";


        return (
            "product-detail.html?id=" +
            encodeURIComponent(id)
        );

    }


    /* =====================================================
       GET FILTERED PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        if (
            !window.DRW_PRODUCTS ||
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
           CATEGORY FILTER
        ================================================= */

        if (
            currentCategory &&
            currentCategory !==
                "Semua Produk"
        ) {

            products =
                products.filter(
                    function (product) {

                        const category =
                            String(
                                product.category ||
                                product.kategori ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        return (
                            category ===
                            String(
                                currentCategory
                            )
                            .trim()
                            .toLowerCase()
                        );

                    }
                );

        }


        /* =================================================
           SEARCH FILTER
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
            product.id ||
            product.slug ||
            "";


        const price =
            getProductPrice(product);


        const url =
            getProductUrl(product);


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        card.dataset.id =
            id;


        card.innerHTML = `

            <!-- PRODUCT IMAGE -->

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


            <!-- PRODUCT CONTENT -->

            <div class="product-card-content">


                <!-- CATEGORY -->

                <div class="product-category">

                    ${category}

                </div>


                <!-- PRODUCT NAME -->

                <h3 class="product-title">

                    <a href="${url}">

                        ${name}

                    </a>

                </h3>


                <!-- DESCRIPTION -->

                <p class="product-description">

                    ${description}

                </p>


                <!-- PRICE -->

                <div class="product-price">

                    ${formatRupiah(price)}

                </div>


                <!-- LEVEL -->

                <div class="product-price-level">

                    Harga
                    <strong>
                        ${getCurrentLevelName()}
                    </strong>

                </div>


                <!-- FOOTER -->

                <div class="product-card-footer">


                    <!-- VIEW -->

                    <a
                        href="${url}"
                        class="product-view-link"
                    >

                        Lihat Produk

                        <span>
                            →
                        </span>

                    </a>


                    <!-- CART -->

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


        console.log(
            "Produk ditemukan:",
            products.length
        );


        /* =================================================
           EMPTY
        ================================================= */

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

                        Coba gunakan kata
                        pencarian atau kategori lain.

                    </p>

                </div>

            `;


            renderPagination(0);

            return;

        }


        /* =================================================
           PAGINATION
        ================================================= */

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


        /* =================================================
           CLEAR
        ================================================= */

        grid.innerHTML = "";


        /* =================================================
           RENDER
        ================================================= */

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

    }


    /* =====================================================
       CART BUTTON
    ===================================================== */

    function bindCartButtons() {

        const buttons =
            document.querySelectorAll(
                ".add-cart-btn"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            button.dataset.productId;


                        /*
                         * PRIORITAS:
                         * DRW_CART
                         */

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


                        /*
                         * FALLBACK LOCAL STORAGE
                         */

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


                        } else {

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
                            JSON.stringify(cart)
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
       BUTTON ADDED EFFECT
    ===================================================== */

    function showAddedState(button) {

        const originalHTML =
            button.innerHTML;


        button.classList.add(
            "added"
        );


        button.innerHTML = `

            <i
                class="fa-solid fa-check"
            ></i>

            Ditambahkan

        `;


        setTimeout(
            function () {

                button.classList.remove(
                    "added"
                );


                button.innerHTML =
                    originalHTML;

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


        /* =================================================
           PREVIOUS
        ================================================= */

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


        /* =================================================
           PAGE NUMBERS
        ================================================= */

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


        /* =================================================
           NEXT
        ================================================= */

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
       CREATE PAGE BUTTON
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

        const buttons =
            document.querySelectorAll(
                "[data-category]"
            );


        buttons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        currentCategory =
                            button.dataset.category;


                        currentPage =
                            1;


                        buttons.forEach(
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


        if (!input) {

            console.warn(
                "#productSearch tidak ditemukan."
            );

            return;

        }


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
       PRICE LEVEL UI
    ===================================================== */

    function updatePriceLevelUI() {

        const level =
            getCurrentLevel();


        const levelName =
            getCurrentLevelName();


        /*
         * #currentPriceLevel
         */

        const levelText =
            document.getElementById(
                "currentPriceLevel"
            );


        if (levelText) {

            levelText.textContent =
                levelName;

        }


        /*
         * .drw-price-level
         */

        const levelElements =
            document.querySelectorAll(
                ".drw-price-level"
            );


        levelElements.forEach(
            function (element) {

                element.textContent =
                    levelName;

            }
        );


        /*
         * SELECTOR
         */

        const selectors =
            document.querySelectorAll(
                ".drw-price-selector"
            );


        selectors.forEach(
            function (selector) {

                selector.value =
                    level;

            }
        );


        console.log(
            "DRW PRICE LEVEL:",
            level
        );

    }


    /* =====================================================
       LISTEN PRICE LEVEL CHANGED
    ===================================================== */

    function bindPriceLevelEvents() {

        window.addEventListener(
            "drwPriceLevelChanged",
            function () {

                console.log(
                    "Price level berubah."
                );


                currentPage =
                    1;


                updatePriceLevelUI();


                renderProducts();

            }
        );


        window.addEventListener(
            "drwPriceChanged",
            function () {

                console.log(
                    "Harga berubah."
                );


                currentPage =
                    1;


                updatePriceLevelUI();


                renderProducts();

            }
        );

    }


    /* =====================================================
       SELECTOR LEVEL
    ===================================================== */

    function bindPriceSelector() {

        const selectors =
            document.querySelectorAll(
                ".drw-price-selector"
            );


        selectors.forEach(
            function (selector) {

                selector.value =
                    getCurrentLevel();


                selector.addEventListener(
                    "change",
                    function () {

                        if (
                            typeof
                                window.setPriceLevel ===
                                "function"
                        ) {

                            window.setPriceLevel(
                                this.value
                            );

                        } else {

                            localStorage.setItem(
                                "drwPriceLevel",
                                this.value
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
       INITIALIZE
    ===================================================== */

    function initProductsPage() {

        console.log(
            "▶ products-page.js aktif"
        );


        /*
         * CHECK PRODUCT DATA
         */

        if (
            !window.DRW_PRODUCTS ||
            !Array.isArray(
                window.DRW_PRODUCTS
            )
        ) {

            console.error(
                "❌ DRW_PRODUCTS belum tersedia."
            );


            return;

        }


        console.log(
            "Jumlah produk:",
            window.DRW_PRODUCTS.length
        );


        /*
         * CHECK GRID
         */

        const grid =
            getGrid();


        if (!grid) {

            console.error(
                "❌ #productsGrid tidak ditemukan."
            );


            return;

        }


        /*
         * INITIALIZE
         */

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
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initProductsPage
        );

    } else {

        initProductsPage();

    }


    /* =====================================================
       GLOBAL
    ===================================================== */

    window.renderProducts =
        renderProducts;


    window.refreshProducts =
        renderProducts;


})();