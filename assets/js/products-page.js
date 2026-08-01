/* =========================================
   DRW SKINCARE
   PRODUCTS PAGE SYSTEM
   SEARCH + FILTER + PAGINATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       CHECK DATABASE
    ========================================== */

    if (
        typeof DRW_PRODUCTS === "undefined" ||
        !Array.isArray(DRW_PRODUCTS)
    ) {

        console.error("DRW_PRODUCTS tidak ditemukan.");

        return;

    }


    /* =========================================
       ELEMENTS
    ========================================== */

    const productsGrid =
        document.getElementById("productsGrid");

    const searchInput =
        document.getElementById("productSearch");

    const filterButtons =
        document.querySelectorAll(
            ".product-filter-btn"
        );


    if (!productsGrid) {

        console.error(
            "#productsGrid tidak ditemukan."
        );

        return;

    }


    /* =========================================
       SETTINGS
    ========================================== */

    const productsPerPage = 3;

    let currentPage = 1;

    let currentCategory = "all";

    let currentSearch = "";


    /* =========================================
       FORMAT RUPIAH
    ========================================== */

    function formatRupiah(number) {

        return "Rp " +
            Number(number || 0)
                .toLocaleString("id-ID");

    }


    /* =========================================
       CREATE PRODUCT URL
    ========================================== */

    function getProductUrl(product) {

        return (
            "product-detail.html?id=" +
            encodeURIComponent(product.id)
        );

    }


    /* =========================================
       FILTER PRODUCTS
    ========================================== */

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


                /* CATEGORY */

                const categoryMatch =
                    currentCategory === "all" ||
                    category ===
                    currentCategory.toLowerCase();


                /* SEARCH */

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


    /* =========================================
       RENDER PRODUCTS
    ========================================== */

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


        /* Jika halaman melebihi jumlah halaman */

        if (currentPage > totalPages) {

            currentPage = totalPages;

        }


        const startIndex =
            (currentPage - 1) *
            productsPerPage;


        const endIndex =
            startIndex +
            productsPerPage;


        const visibleProducts =
            filteredProducts.slice(
                startIndex,
                endIndex
            );


        /* CLEAR */

        productsGrid.innerHTML = "";


        /* EMPTY */

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


        /* CREATE CARDS */

        visibleProducts.forEach(
            function (product, index) {

                const article =
                    document.createElement("article");


                article.className =
                    "product-page-card";


                /*
                   BEST SELLER
                */

                let badge = "";


                if (
                    product.badge
                ) {

                    badge = `

                        <span class="product-badge">
                            ${product.badge}
                        </span>

                    `;

                }


                /*
                   IMAGE
                */

                const image =
                    product.image ||
                    "assets/images/product1.png";


                /*
                   CATEGORY
                */

                const category =
                    product.category ||
                    "SKINCARE";


                /*
                   DESCRIPTION
                */

                const description =
                    product.description ||
                    "Produk skincare DRW untuk melengkapi rutinitas perawatan kulit Anda.";


                /*
                   URL DETAIL
                */

                const productUrl =
                    getProductUrl(product);


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


                        <div class="product-page-bottom">

                            <strong>

                                ${formatRupiah(product.price)}

                            </strong>


                            <a
                                href="${productUrl}"
                                class="product-view-link"
                            >

                                View →

                            </a>

                        </div>

                    </div>

                `;


                productsGrid.appendChild(
                    article
                );

            }
        );


        renderPagination(
            totalPages
        );

    }


    /* =========================================
       PAGINATION
    ========================================== */

    function renderPagination(totalPages) {

        let pagination =
            document.querySelector(
                ".products-pagination"
            );


        if (!pagination) {

            pagination =
                document.createElement("div");

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


        /*
           PAGE BUTTONS
        */

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.textContent =
                page;


            if (
                page === currentPage
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


        /*
           NEXT BUTTON
        */

        if (
            currentPage < totalPages
        ) {

            const nextButton =
                document.createElement("button");


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


    /* =========================================
       FILTER BUTTON
    ========================================== */

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


    /* =========================================
       SEARCH
    ========================================== */

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


    /* =========================================
       INITIAL RENDER
    ========================================== */

    renderProducts();


    /* =========================================
       DEBUG
    ========================================== */

    console.log(
        "DRW Products Page Loaded"
    );


    console.log(
        "Total products:",
        DRW_PRODUCTS.length
    );

});