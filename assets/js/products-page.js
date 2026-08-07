/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS PAGE — FINAL
   98 PRODUCTS
   SEARCH + FILTER + PAGINATION
   PRICE LEVEL SUPPORT
========================================================= */

(function () {

    function initProductsPage() {

        console.log("✓ products-page.js aktif");

        /* =====================================================
           CHECK DATABASE
        ===================================================== */

        if (
            typeof DRW_PRODUCTS === "undefined" ||
            !Array.isArray(DRW_PRODUCTS)
        ) {
            console.error("❌ DRW_PRODUCTS tidak ditemukan.");
            return;
        }

        console.log(
            "✓ Database produk:",
            DRW_PRODUCTS.length
        );


        /* =====================================================
           FIND ELEMENTS
        ===================================================== */

        const productsGrid =
            document.getElementById("productsGrid");

        const searchInput =
            document.getElementById("productSearch");

        const filterButtons =
            document.querySelectorAll(
                ".product-filter-btn"
            );


        /* =====================================================
           GRID CHECK
        ===================================================== */

        if (!productsGrid) {

            console.error(
                "❌ #productsGrid tidak ditemukan."
            );

            return;
        }

        console.log(
            "✓ #productsGrid ditemukan"
        );


        /* =====================================================
           SETTINGS
        ===================================================== */

        const productsPerPage = 12;

        let currentPage = 1;

        let currentCategory = "all";

        let currentSearch = "";


        /* =====================================================
           FORMAT RUPIAH
        ===================================================== */

        function formatRupiah(number) {

            return (
                "Rp " +
                Number(number || 0)
                    .toLocaleString("id-ID")
            );

        }


        /* =====================================================
           PRODUCT URL
        ===================================================== */

        function getProductUrl(product) {

            return (
                "product-detail.html?id=" +
                encodeURIComponent(product.id)
            );

        }


        /* =====================================================
           GET PRICE
        ===================================================== */

        function getProductPrice(product) {

            /*
               PRIORITAS:
               1. DRW_PRICE
               2. product.price
            */

            if (
                typeof DRW_PRICE !== "undefined" &&
                typeof DRW_PRICE.getPrice === "function"
            ) {

                const price =
                    DRW_PRICE.getPrice(product.id);

                if (
                    typeof price === "number" &&
                    price > 0
                ) {

                    return price;

                }

            }

            return Number(product.price || 0);

        }


        /* =====================================================
           FILTER
        ===================================================== */

        function getFilteredProducts() {

            return DRW_PRODUCTS.filter(
                function (product) {

                    const category =
                        String(
                            product.category || ""
                        ).toLowerCase();

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();

                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const categoryMatch =
                        currentCategory === "all" ||
                        category ===
                        currentCategory.toLowerCase();


                    const searchMatch =
                        currentSearch === "" ||
                        name.includes(currentSearch) ||
                        category.includes(currentSearch) ||
                        description.includes(currentSearch);


                    return (
                        categoryMatch &&
                        searchMatch
                    );

                }
            );

        }


        /* =====================================================
           RENDER PRODUCTS
        ===================================================== */

        function renderProducts() {

            const filteredProducts =
                getFilteredProducts();


            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        filteredProducts.length /
                        productsPerPage
                    )
                );


            if (
                currentPage >
                totalPages
            ) {

                currentPage =
                    totalPages;

            }


            const startIndex =
                (currentPage - 1) *
                productsPerPage;


            const visibleProducts =
                filteredProducts.slice(
                    startIndex,
                    startIndex +
                    productsPerPage
                );


            productsGrid.innerHTML = "";


            /* =================================================
               EMPTY
            ================================================= */

            if (!visibleProducts.length) {

                productsGrid.innerHTML = `

                    <div class="products-empty">

                        <h3>
                            Produk tidak ditemukan
                        </h3>

                        <p>
                            Coba gunakan kata pencarian
                            atau kategori lainnya.
                        </p>

                    </div>

                `;

                renderPagination(0);

                return;

            }


            /* =================================================
               CREATE CARDS
            ================================================= */

            visibleProducts.forEach(
                function (product) {

                    const article =
                        document.createElement(
                            "article"
                        );


                    article.className =
                        "product-page-card";


                    const image =
                        product.image ||
                        "assets/images/products/default-product.jpg";


                    const category =
                        product.category ||
                        "SKINCARE";


                    const description =
                        product.description ||
                        "Produk DRW Skincare untuk melengkapi rutinitas perawatan Anda.";


                    const productUrl =
                        getProductUrl(product);


                    const finalPrice =
                        getProductPrice(product);


                    /* =================================================
                       BADGE
                    ================================================= */

                    let badge = "";

                    if (product.badge) {

                        badge = `

                            <span class="product-badge">

                                ${product.badge}

                            </span>

                        `;

                    }


                    /* =================================================
                       CARD
                    ================================================= */

                    article.innerHTML = `

                        <a
                            href="${productUrl}"
                            class="product-page-image"
                        >

                            ${badge}

                            <img
                                src="${image}"
                                alt="${product.name || "DRW Skincare Product"}"
                                loading="lazy"
                                onerror="
                                    this.onerror=null;
                                    this.src='assets/images/products/default-product.jpg';
                                "
                            >

                        </a>


                        <div class="product-page-info">

                            <span class="product-page-category">

                                ${category}

                            </span>


                            <h3>

                                ${product.name || "DRW Skincare"}

                            </h3>


                            <p class="product-page-description">

                                ${description}

                            </p>


                            <div class="product-page-price">

                                ${formatRupiah(finalPrice)}

                            </div>


                            <div class="product-page-bottom">

                                <a
                                    href="${productUrl}"
                                    class="product-view-link"
                                >

                                    Lihat Produk
                                    <span>→</span>

                                </a>


                                <button
                                    type="button"
                                    class="product-cart-btn"
                                    data-product-id="${product.id}"
                                >

                                    🛍 Tambah Keranjang

                                </button>

                            </div>

                        </div>

                    `;


                    productsGrid.appendChild(
                        article
                    );

                }
            );


            /* =================================================
               CART BUTTON
            ================================================= */

            const cartButtons =
                productsGrid.querySelectorAll(
                    ".product-cart-btn"
                );


            cartButtons.forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const productId =
                                this.dataset.productId;


                            const product =
                                DRW_PRODUCTS.find(
                                    function (item) {

                                        return (
                                            String(item.id) ===
                                            String(productId)
                                        );

                                    }
                                );


                            if (!product) {

                                console.error(
                                    "Produk tidak ditemukan:",
                                    productId
                                );

                                return;

                            }


                            /* =================================================
                               CART SYSTEM
                            ================================================= */

                            if (
                                typeof addToCart ===
                                "function"
                            ) {

                                addToCart(
                                    product,
                                    1
                                );

                            }

                            else if (
                                typeof DRW_CART !==
                                "undefined" &&
                                typeof DRW_CART.add ===
                                "function"
                            ) {

                                DRW_CART.add(
                                    product,
                                    1
                                );

                            }

                            else {

                                console.warn(
                                    "Fungsi cart belum tersedia."
                                );

                            }

                        }
                    );

                }
            );


            renderPagination(
                totalPages
            );

        }


        /* =====================================================
           PAGINATION
        ===================================================== */

        function renderPagination(
            totalPages
        ) {

            let pagination =
                document.querySelector(
                    ".products-pagination"
                );


            if (!pagination) {

                pagination =
                    document.createElement(
                        "div"
                    );

                pagination.className =
                    "products-pagination";


                productsGrid.parentElement.appendChild(
                    pagination
                );

            }


            pagination.innerHTML = "";


            if (totalPages <= 1) {

                return;

            }


            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.textContent =
                    page;


                if (
                    page ===
                    currentPage
                ) {

                    button.classList.add(
                        "pagination-active"
                    );

                }


                button.addEventListener(
                    "click",
                    function () {

                        currentPage =
                            page;


                        renderProducts();


                        window.scrollTo({

                            top:
                                document.querySelector(
                                    ".products-section"
                                )?.offsetTop || 0,

                            behavior:
                                "smooth"

                        });

                    }
                );


                pagination.appendChild(
                    button
                );

            }


            /* NEXT */

            if (
                currentPage <
                totalPages
            ) {

                const nextButton =
                    document.createElement(
                        "button"
                    );


                nextButton.type =
                    "button";


                nextButton.textContent =
                    "→";


                nextButton.addEventListener(
                    "click",
                    function () {

                        currentPage++;


                        renderProducts();


                        window.scrollTo({

                            top:
                                document.querySelector(
                                    ".products-section"
                                )?.offsetTop || 0,

                            behavior:
                                "smooth"

                        });

                    }
                );


                pagination.appendChild(
                    nextButton
                );

            }

        }


        /* =====================================================
           FILTER BUTTON
        ===================================================== */

        filterButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        filterButtons.forEach(
                            function (btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        currentCategory =
                            button.dataset.category ||
                            "all";


                        currentPage = 1;


                        renderProducts();

                    }
                );

            }
        );


        /* =====================================================
           SEARCH
        ===================================================== */

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function () {

                    currentSearch =
                        searchInput.value
                            .trim()
                            .toLowerCase();


                    currentPage = 1;


                    renderProducts();

                }
            );

        }


        /* =====================================================
           INITIAL RENDER
        ===================================================== */

        renderProducts();


        console.log(
            "✓ DRW Products Page Loaded"
        );

        console.log(
            "✓ Total products:",
            DRW_PRODUCTS.length
        );

    }


    /* =========================================================
       START SYSTEM
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initProductsPage
        );

    }

    else {

        /*
           PENTING:
           Kalau script dipanggil setelah
           DOM sudah selesai, langsung jalan.
        */

        initProductsPage();

    }

})();