/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS PAGE — FINAL
   98 PRODUCTS
   ROLE PRICE SYSTEM
   Director
   Manager
   Supervisor
   Reseller
   Umum
========================================================= */

(function () {

    "use strict";

    console.log("=================================");
    console.log("RARA DRW — PRODUCTS PAGE FINAL");
    console.log("=================================");

    let currentCategory = "Semua Produk";
    let currentSearch = "";
    let currentPage = 1;

    const PRODUCTS_PER_PAGE = 12;

    /* =====================================================
       GET ELEMENTS
    ===================================================== */

    function getGrid() {
        return document.getElementById("productsGrid");
    }

    /* =====================================================
       GET PRICE
    ===================================================== */

    function getProductPrice(product) {

        try {

            if (
                window.DRW_PRICE &&
                typeof window.DRW_PRICE.getMainPrice === "function"
            ) {

                const price =
                    window.DRW_PRICE.getMainPrice(product.id);

                if (
                    typeof price === "number" &&
                    price > 0
                ) {
                    return price;
                }
            }

        } catch (error) {

            console.warn(
                "DRW_PRICE error:",
                error
            );

        }

        /* FALLBACK */

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

    function formatRupiah(number) {

        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }
        ).format(number);

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
       FILTER PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        if (
            !window.DRW_PRODUCTS ||
            !Array.isArray(window.DRW_PRODUCTS)
        ) {

            console.error(
                "DRW_PRODUCTS tidak ditemukan."
            );

            return [];

        }

        let products =
            window.DRW_PRODUCTS.slice();

        /* CATEGORY */

        if (
            currentCategory &&
            currentCategory !== "Semua Produk"
        ) {

            products =
                products.filter(function (product) {

                    return String(
                        product.category ||
                        product.kategori ||
                        ""
                    ).toLowerCase()
                    ===
                    currentCategory.toLowerCase();

                });

        }

        /* SEARCH */

        if (currentSearch) {

            const keyword =
                currentSearch.toLowerCase();

            products =
                products.filter(function (product) {

                    const name =
                        String(
                            product.name ||
                            product.nama ||
                            ""
                        ).toLowerCase();

                    const category =
                        String(
                            product.category ||
                            product.kategori ||
                            ""
                        ).toLowerCase();

                    return (
                        name.includes(keyword) ||
                        category.includes(keyword)
                    );

                });

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
            document.createElement("article");

        card.className =
            "product-card";

        card.dataset.id = id;

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
                        onerror="this.src='assets/images/logo/logo.png'"
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


                <div class="product-price">

                    ${formatRupiah(price)}

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

                        <i class="fa-solid fa-bag-shopping"></i>

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

        /* EMPTY */

        if (!products.length) {

            grid.innerHTML = `

                <div class="products-empty">

                    <div class="empty-icon">
                        <i class="fa-solid fa-box-open"></i>
                    </div>

                    <h3>
                        Produk tidak ditemukan
                    </h3>

                    <p>
                        Coba gunakan kata pencarian atau kategori lain.
                    </p>

                </div>

            `;

            renderPagination(0);

            return;

        }


        /* PAGINATION */

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


        /* CLEAR */

        grid.innerHTML = "";


        /* RENDER */

        visibleProducts.forEach(
            function (product) {

                grid.appendChild(
                    createProductCard(product)
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

                        if (
                            window.DRW_CART &&
                            typeof window.DRW_CART.add === "function"
                        ) {

                            window.DRW_CART.add(id);

                            return;

                        }


                        /* FALLBACK */

                        const product =
                            window.DRW_PRODUCTS.find(
                                function (item) {

                                    return String(
                                        item.id
                                    ) ===
                                    String(id);

                                }
                            );

                        if (!product) return;


                        let cart =
                            JSON.parse(
                                localStorage.getItem(
                                    "drwCart"
                                ) || "[]"
                            );


                        const existing =
                            cart.find(
                                function (item) {

                                    return String(
                                        item.id
                                    ) ===
                                    String(id);

                                }
                            );


                        if (existing) {

                            existing.qty =
                                Number(
                                    existing.qty ||
                                    1
                                ) + 1;

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

                                qty: 1

                            });

                        }


                        localStorage.setItem(
                            "drwCart",
                            JSON.stringify(cart)
                        );


                        if (
                            typeof window.updateCartCount ===
                            "function"
                        ) {

                            window.updateCartCount();

                        }


                        button.innerHTML =
                            '<i class="fa-solid fa-check"></i> Ditambahkan';


                        setTimeout(
                            function () {

                                button.innerHTML =
                                    '<i class="fa-solid fa-bag-shopping"></i> Tambah Keranjang';

                            },
                            1200
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       PAGINATION
    ===================================================== */

    function renderPagination(totalPages) {

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


        pagination.innerHTML = "";


        if (totalPages <= 1) {

            return;

        }


        /* PREVIOUS */

        if (currentPage > 1) {

            const prev =
                createPageButton(
                    "←",
                    currentPage - 1
                );

            pagination.appendChild(
                prev
            );

        }


        /* NUMBERS */

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


        /* NEXT */

        if (
            currentPage <
            totalPages
        ) {

            const next =
                createPageButton(
                    "→",
                    currentPage + 1
                );

            pagination.appendChild(
                next
            );

        }

    }


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
       CATEGORY
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

                        currentPage = 1;


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
            document.querySelector(
                "#productSearch"
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

                currentPage = 1;

                renderProducts();

            }
        );

    }


    /* =====================================================
       PRICE LEVEL UI
    ===================================================== */

    function updatePriceLevelUI() {

        const levelText =
            document.querySelector(
                "#currentPriceLevel"
            );

        if (
            !levelText ||
            !window.DRW_PRICE
        ) {

            return;

        }


        if (
            typeof window.DRW_PRICE.getLevel ===
            "function"
        ) {

            const level =
                window.DRW_PRICE.getLevel();


            levelText.textContent =
                level === "director"
                    ? "Director"
                    : level === "manager"
                    ? "Manager"
                    : level === "supervisor"
                    ? "Supervisor"
                    : level === "reseller"
                    ? "Reseller"
                    : "Umum";

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initProductsPage() {

        console.log(
            "▶ products-page.js aktif"
        );


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


        const grid =
            getGrid();


        if (!grid) {

            console.error(
                "❌ #productsGrid tidak ditemukan."
            );

            return;

        }


        bindCategoryButtons();

        bindSearch();

        updatePriceLevelUI();

        renderProducts();


        /* Jika harga/role berubah */

        window.addEventListener(
            "drwPriceChanged",
            function () {

                console.log(
                    "Harga berubah — render ulang produk."
                );

                currentPage = 1;

                updatePriceLevelUI();

                renderProducts();

            }
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


    /* GLOBAL */

    window.renderProducts =
        renderProducts;

})();