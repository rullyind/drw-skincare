    /* =========================================================
   DRW SKINCARE
   PRODUCT PAGE JS
   FINAL VERSION
   Compatible with:
   - product.js
   - DRW_PRODUCTS
   - drwCart
   - cart.js
   - products.html
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productGrid =
        document.querySelector("#productGrid") ||
        document.querySelector(".product-grid") ||
        document.querySelector(".products-grid");

    const categoryFilter =
        document.querySelector("#categoryFilter");

    const searchInput =
        document.querySelector("#productSearch");

    const searchButton =
        document.querySelector("#productSearchButton");

    const resetButton =
        document.querySelector("#resetFilter");

    const resultCount =
        document.querySelector("#productResultCount");

    const categoryContainer =
        document.querySelector("#categoryFilters");

    const cartCount =
        document.querySelector("#cartCount");


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    let products = [];

    if (typeof DRW_PRODUCTS !== "undefined" && Array.isArray(DRW_PRODUCTS)) {

        products = DRW_PRODUCTS.map(function (product, index) {

            return {
                id:
                    product.id ||
                    "drw-product-" + index,

                name:
                    product.name ||
                    product.nama ||
                    "Produk DRW Skincare",

                category:
                    product.category ||
                    product.kategori ||
                    "Perawatan Wajah",

                price:
                    Number(
                        product.price ??
                        product.harga ??
                        0
                    ),

                image:
                    product.image ||
                    product.gambar ||
                    "assets/images/logo/logo.png",

                description:
                    product.description ||
                    product.deskripsi ||
                    "Produk DRW Skincare untuk melengkapi rutinitas perawatan dan kecantikan sehari-hari."
            };

        });

    } else {

        console.error(
            "DRW_PRODUCTS tidak ditemukan. Pastikan product.js dimuat sebelum product-page.js."
        );

    }


    /* =====================================================
       STATE
    ===================================================== */

    let currentSearch = "";
    let currentCategory = "all";


    /* =====================================================
       URL PARAMETER
    ===================================================== */

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlSearch =
        urlParams.get("search");

    const urlCategory =
        urlParams.get("category");


    if (urlSearch) {
        currentSearch = urlSearch.trim().toLowerCase();

        if (searchInput) {
            searchInput.value = urlSearch;
        }
    }

    if (urlCategory) {
        currentCategory =
            urlCategory.trim().toLowerCase();
    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(number) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        ).format(Number(number) || 0);

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .trim();

    }


    /* =====================================================
       CREATE CATEGORY FILTER
    ===================================================== */

    function buildCategoryFilters() {

        if (!categoryContainer) return;

        const categories = [
            ...new Set(
                products
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ];

        categoryContainer.innerHTML = "";

        /* ALL */

        const allButton =
            document.createElement("button");

        allButton.type = "button";
        allButton.className =
            "category-filter-btn active";

        allButton.dataset.category = "all";

        allButton.innerHTML =
            `<i class="fa-solid fa-border-all"></i>
             <span>Semua Produk</span>`;

        categoryContainer.appendChild(allButton);


        /* CATEGORY */

        categories.forEach(function (category) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "category-filter-btn";

            button.dataset.category =
                normalizeText(category);

            button.innerHTML =
                `<i class="fa-solid fa-sparkles"></i>
                 <span>${escapeHTML(category)}</span>`;

            categoryContainer.appendChild(button);

        });


        updateCategoryButtonState();

    }


    /* =====================================================
       UPDATE CATEGORY ACTIVE
    ===================================================== */

    function updateCategoryButtonState() {

        const buttons =
            document.querySelectorAll(
                ".category-filter-btn"
            );

        buttons.forEach(function (button) {

            const category =
                normalizeText(
                    button.dataset.category
                );

            button.classList.toggle(
                "active",
                category === currentCategory
            );

        });

    }


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        return products.filter(function (product) {

            const productName =
                normalizeText(product.name);

            const productCategory =
                normalizeText(product.category);

            const productDescription =
                normalizeText(product.description);


            /* SEARCH */

            const matchesSearch =
                !currentSearch ||
                productName.includes(currentSearch) ||
                productCategory.includes(currentSearch) ||
                productDescription.includes(currentSearch);


            /* CATEGORY */

            const matchesCategory =
                currentCategory === "all" ||
                productCategory === currentCategory;


            return matchesSearch && matchesCategory;

        });

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts() {

        if (!productGrid) {

            console.warn(
                "Container product grid tidak ditemukan."
            );

            return;

        }


        const filteredProducts =
            getFilteredProducts();


        productGrid.innerHTML = "";


        /* EMPTY */

        if (!filteredProducts.length) {

            productGrid.innerHTML = `

                <div class="product-empty-state">

                    <div class="empty-icon">
                        <i class="fa-solid fa-face-sad-tear"></i>
                    </div>

                    <h3>Produk Tidak Ditemukan</h3>

                    <p>
                        Maaf, produk yang Anda cari belum tersedia.
                        Silakan coba kata kunci atau kategori lainnya.
                    </p>

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="emptyResetButton">

                        <i class="fa-solid fa-rotate-left"></i>

                        Tampilkan Semua Produk

                    </button>

                </div>

            `;


            const emptyReset =
                document.querySelector(
                    "#emptyResetButton"
                );


            if (emptyReset) {

                emptyReset.addEventListener(
                    "click",
                    resetFilters
                );

            }


            updateResultCount(0);

            return;

        }


        /* PRODUCTS */

        filteredProducts.forEach(function (product) {

            const card =
                document.createElement("article");

            card.className =
                "product-card product-page-card";


            card.dataset.productId =
                product.id;


            card.innerHTML = `

                <div class="product-image-wrap">

                    <a
                        href="product-detail.html?id=${encodeURIComponent(product.id)}"
                        class="product-image-link"
                        aria-label="Lihat ${escapeHTML(product.name)}">

                        <img
                            class="product-image"
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy"
                            onerror="this.src='assets/images/logo/logo.png';">

                    </a>

                </div>


                <div class="product-card-content">

                    <div class="product-category">
                        ${escapeHTML(product.category)}
                    </div>


                    <h3 class="product-title">
                        <a
                            href="product-detail.html?id=${encodeURIComponent(product.id)}">

                            ${escapeHTML(product.name)}

                        </a>
                    </h3>


                    <p class="product-description">

                        ${escapeHTML(product.description)}

                    </p>


                    <div class="product-price">

                        ${formatRupiah(product.price)}

                    </div>


                    <div class="product-card-footer">

                        <a
                            href="product-detail.html?id=${encodeURIComponent(product.id)}"
                            class="product-view-link">

                            Lihat Detail
                            <i class="fa-solid fa-arrow-right"></i>

                        </a>


                        <button
                            type="button"
                            class="add-cart-btn product-add-cart"
                            data-product-id="${escapeHTML(product.id)}">

                            <i class="fa-solid fa-bag-shopping"></i>

                            Tambah

                        </button>

                    </div>

                </div>

            `;


            productGrid.appendChild(card);

        });


        updateResultCount(
            filteredProducts.length
        );

        attachProductEvents();

    }


    /* =====================================================
       RESULT COUNT
    ===================================================== */

    function updateResultCount(count) {

        if (!resultCount) return;

        resultCount.textContent =
            `${count} produk ditemukan`;

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    function addToCart(productId, quantity = 1) {

        const product =
            products.find(function (item) {

                return String(item.id) ===
                    String(productId);

            });


        if (!product) {

            console.error(
                "Produk tidak ditemukan:",
                productId
            );

            return;

        }


        let cart = [];

        try {

            const savedCart =
                localStorage.getItem("drwCart");

            cart =
                savedCart
                    ? JSON.parse(savedCart)
                    : [];

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            console.error(
                "Gagal membaca drwCart:",
                error
            );

            cart = [];

        }


        const existingIndex =
            cart.findIndex(function (item) {

                return String(
                    item.id ||
                    item.productId
                ) === String(product.id);

            });


        if (existingIndex !== -1) {

            const oldQty =
                Number(
                    cart[existingIndex].qty ??
                    cart[existingIndex].quantity ??
                    0
                );

            const newQty =
                oldQty + Number(quantity);


            cart[existingIndex] = {

                ...cart[existingIndex],

                id: product.id,

                name: product.name,

                category: product.category,

                price: product.price,

                image: product.image,

                description: product.description,

                qty: newQty,

                quantity: newQty

            };

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                category: product.category,

                price: product.price,

                image: product.image,

                description: product.description,

                qty: Number(quantity),

                quantity: Number(quantity)

            });

        }


        localStorage.setItem(
            "drwCart",
            JSON.stringify(cart)
        );


        updateCartCount();


        showCartNotification(
            product.name,
            quantity
        );

    }


    /* =====================================================
       BUY NOW
    ===================================================== */

    function buyNow(productId) {

        const product =
            products.find(function (item) {

                return String(item.id) ===
                    String(productId);

            });


        if (!product) return;


        const buyNowProduct = {

            id: product.id,

            name: product.name,

            category: product.category,

            price: product.price,

            image: product.image,

            description: product.description,

            qty: 1,

            quantity: 1

        };


        localStorage.setItem(
            "drwProduct",
            JSON.stringify(buyNowProduct)
        );


        window.location.href =
            "checkout.html";

    }


    /* =====================================================
       PRODUCT EVENTS
    ===================================================== */

    function attachProductEvents() {

        const addButtons =
            document.querySelectorAll(
                ".product-add-cart"
            );


        addButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        this.dataset.productId;

                    addToCart(productId, 1);

                }
            );

        });

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        if (!cartCount) return;


        let cart = [];

        try {

            cart =
                JSON.parse(
                    localStorage.getItem("drwCart")
                ) || [];

        } catch (error) {

            cart = [];

        }


        if (!Array.isArray(cart)) {
            cart = [];
        }


        const totalItems =
            cart.reduce(
                function (total, item) {

                    return total +
                        Number(
                            item.qty ??
                            item.quantity ??
                            0
                        );

                },
                0
            );


        cartCount.textContent =
            totalItems;


        cartCount.style.display =
            totalItems > 0
                ? "grid"
                : "grid";

    }


    /* =====================================================
       CART NOTIFICATION
    ===================================================== */

    function showCartNotification(
        productName,
        quantity
    ) {

        const oldNotification =
            document.querySelector(
                ".drw-cart-notification"
            );


        if (oldNotification) {
            oldNotification.remove();
        }


        const notification =
            document.createElement("div");


        notification.className =
            "drw-cart-notification";


        notification.innerHTML = `

            <div class="drw-cart-notification-icon">

                <i class="fa-solid fa-check"></i>

            </div>

            <div class="drw-cart-notification-text">

                <strong>Berhasil ditambahkan</strong>

                <span>
                    ${escapeHTML(productName)}
                    ${quantity > 1 ? ` × ${quantity}` : ""}
                </span>

            </div>

            <a href="cart.html">
                Lihat Keranjang
            </a>

        `;


        document.body.appendChild(
            notification
        );


        requestAnimationFrame(function () {

            notification.classList.add(
                "show"
            );

        });


        setTimeout(function () {

            notification.classList.remove(
                "show"
            );


            setTimeout(function () {

                notification.remove();

            }, 300);

        }, 3000);

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function performSearch() {

        currentSearch =
            searchInput
                ? normalizeText(searchInput.value)
                : "";


        renderProducts();

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                currentSearch =
                    normalizeText(
                        this.value
                    );

                renderProducts();

            }
        );


        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    performSearch();

                }

            }
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            performSearch
        );

    }


    /* =====================================================
       CATEGORY SELECT
    ===================================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function () {

                currentCategory =
                    normalizeText(
                        this.value
                    ) || "all";

                updateCategoryButtonState();

                renderProducts();

            }
        );

    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    if (categoryContainer) {

        categoryContainer.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".category-filter-btn"
                    );


                if (!button) return;


                currentCategory =
                    normalizeText(
                        button.dataset.category
                    ) || "all";


                updateCategoryButtonState();

                renderProducts();

            }
        );

    }


    /* =====================================================
       RESET FILTER
    ===================================================== */

    function resetFilters() {

        currentSearch = "";

        currentCategory = "all";


        if (searchInput) {
            searchInput.value = "";
        }


        if (categoryFilter) {
            categoryFilter.value = "all";
        }


        updateCategoryButtonState();

        renderProducts();

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetFilters
        );

    }


    /* =====================================================
       SEARCH OVERLAY
       Compatible with:
       #searchButton
       #globalProductSearch
       #searchResults
    ===================================================== */

    const searchOverlay =
        document.querySelector(
            ".search-overlay"
        );

    const globalSearch =
        document.querySelector(
            "#globalProductSearch"
        );

    const searchResults =
        document.querySelector(
            "#searchResults"
        );

    const searchClose =
        document.querySelector(
            ".search-close"
        );


    function openSearchOverlay() {

        if (!searchOverlay) return;

        searchOverlay.classList.add(
            "active"
        );


        setTimeout(function () {

            if (globalSearch) {
                globalSearch.focus();
            }

        }, 100);

    }


    function closeSearchOverlay() {

        if (!searchOverlay) return;

        searchOverlay.classList.remove(
            "active"
        );

    }


    const globalSearchButton =
        document.querySelector(
            "#searchButton"
        );


    if (globalSearchButton) {

        globalSearchButton.addEventListener(
            "click",
            function (event) {

                if (searchOverlay) {

                    event.preventDefault();

                    openSearchOverlay();

                }

            }
        );

    }


    if (searchClose) {

        searchClose.addEventListener(
            "click",
            closeSearchOverlay
        );

    }


    if (searchOverlay) {

        searchOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    searchOverlay
                ) {

                    closeSearchOverlay();

                }

            }
        );

    }


    /* =====================================================
       GLOBAL SEARCH RESULTS
    ===================================================== */

    function renderGlobalSearchResults(
        keyword
    ) {

        if (!searchResults) return;


        const query =
            normalizeText(keyword);


        if (!query) {

            searchResults.innerHTML = `
                <div class="search-empty">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>Mulai ketik nama produk yang dicari.</p>
                </div>
            `;

            return;

        }


        const results =
            products.filter(function (product) {

                return (
                    normalizeText(product.name)
                        .includes(query) ||

                    normalizeText(product.category)
                        .includes(query) ||

                    normalizeText(product.description)
                        .includes(query)
                );

            }).slice(0, 8);


        if (!results.length) {

            searchResults.innerHTML = `

                <div class="search-empty">

                    <i class="fa-regular fa-face-frown"></i>

                    <p>
                        Produk "${escapeHTML(keyword)}"
                        tidak ditemukan.
                    </p>

                </div>

            `;

            return;

        }


        searchResults.innerHTML =
            results.map(function (product) {

                return `

                    <div
                        class="global-search-item"
                        data-product-id="${escapeHTML(product.id)}">

                        <img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                            onerror="this.src='assets/images/logo/logo.png';">

                        <div class="global-search-info">

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <small>
                                ${escapeHTML(product.category)}
                            </small>

                            <b>
                                ${formatRupiah(product.price)}
                            </b>

                        </div>

                        <i class="fa-solid fa-chevron-right"></i>

                    </div>

                `;

            }).join("");

    }


    if (globalSearch) {

        globalSearch.addEventListener(
            "input",
            function () {

                renderGlobalSearchResults(
                    this.value
                );

            }
        );


        globalSearch.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Enter") {
                    return;
                }


                const keyword =
                    normalizeText(
                        this.value
                    );


                if (!keyword) return;


                window.location.href =
                    "products.html?search=" +
                    encodeURIComponent(keyword);

            }
        );

    }


    if (searchResults) {

        searchResults.addEventListener(
            "click",
            function (event) {

                const item =
                    event.target.closest(
                        ".global-search-item"
                    );


                if (!item) return;


                const productId =
                    item.dataset.productId;


                window.location.href =
                    "product-detail.html?id=" +
                    encodeURIComponent(productId);

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeSearchOverlay();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    buildCategoryFilters();

    renderProducts();

    updateCartCount();


    /* =====================================================
       LISTEN FOR STORAGE CHANGES
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === "drwCart"
            ) {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "DRW Product Page loaded:",
        products.length,
        "products"
    );

});