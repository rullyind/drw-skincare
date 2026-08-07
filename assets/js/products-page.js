/* =========================================================
   RARA DRW SKINCARE
   PRODUCTS-PAGE.JS FINAL
   =========================================================
   FEATURES:
   ✓ Product database
   ✓ Harga otomatis berdasarkan level login
   ✓ Director
   ✓ Manager
   ✓ Supervisor
   ✓ Reseller
   ✓ Umum
   ✓ Search
   ✓ Category filter
   ✓ Pagination
   ✓ Add to cart
   ✓ Multi product cart
   ✓ Product detail link
   ✓ Premium product card
   ✓ Button berubah menjadi CHECKLIST setelah klik
   ✓ Product modal
   ✓ Quantity modal
========================================================= */

console.log("RARA DRW - PRODUCTS PAGE FINAL");


document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CHECK PRODUCT DATABASE
    ===================================================== */

    if (
        typeof DRW_PRODUCTS === "undefined" ||
        !Array.isArray(DRW_PRODUCTS)
    ) {

        console.error("DRW_PRODUCTS tidak ditemukan.");
        return;

    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

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


    /* =====================================================
       SETTINGS
    ===================================================== */

    const productsPerPage = 12;

    let currentPage = 1;

    let currentCategory = "all";

    let currentSearch = "";

    let selectedProduct = null;

    let modalQuantity = 1;


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(number) {

        return "Rp " +
            Number(number || 0)
                .toLocaleString("id-ID");

    }


    /* =====================================================
       GET CURRENT PRICE
       DIRECTOR / MANAGER / SUPERVISOR /
       RESELLER / UMUM
    ===================================================== */

    function getCurrentPrice(product) {

        if (!product) {
            return 0;
        }


        /*
           Gunakan sistem DRW_PRICE jika tersedia.
        */

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.getPrice === "function"
        ) {

            try {

                const price =
                    Number(
                        window.DRW_PRICE.getPrice(
                            String(product.id)
                        )
                    );


                if (
                    Number.isFinite(price) &&
                    price > 0
                ) {

                    return price;

                }

            } catch (error) {

                console.warn(
                    "Gagal mengambil harga level:",
                    error
                );

            }

        }


        /*
           Fallback ke harga dasar produk.
        */

        return Number(product.price) || 0;

    }


    /* =====================================================
       GET CURRENT USER LEVEL
    ===================================================== */

    function getCurrentLevel() {

        if (
            window.DRW_PRICE &&
            typeof window.DRW_PRICE.getLevel === "function"
        ) {

            try {

                return String(
                    window.DRW_PRICE.getLevel()
                ).toLowerCase();

            } catch (error) {

                console.warn(
                    "Gagal membaca level harga.",
                    error
                );

            }

        }


        return "umum";

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
       FILTER PRODUCT
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
       ADD PRODUCT TO CART
    ===================================================== */

    function addProduct(
        product,
        quantity = 1
    ) {

        if (!product) {

            console.error(
                "Produk tidak valid."
            );

            return;

        }


        /*
           PENTING:
           Harga yang masuk ke cart adalah
           harga sesuai level pengguna.
        */

        const currentPrice =
            getCurrentPrice(product);


        const cartProduct = {

            ...product,

            price: currentPrice,

            priceLevel:
                getCurrentLevel()

        };


        /* =================================================
           DRW CART API
        ================================================= */

        if (
            window.DRWCart &&
            typeof window.DRWCart.add === "function"
        ) {

            window.DRWCart.add(
                cartProduct,
                quantity
            );

        }


        /* =================================================
           FALLBACK LOCAL STORAGE
        ================================================= */

        else {

            let cart = [];


            try {

                cart =
                    JSON.parse(
                        localStorage.getItem(
                            "drwCart"
                        )
                    ) || [];

            } catch (error) {

                cart = [];

            }


            const productId =
                String(cartProduct.id);


            const existingIndex =
                cart.findIndex(
                    function (item) {

                        return String(
                            item.id
                        ) === productId;

                    }
                );


            if (existingIndex !== -1) {

                const oldQty =
                    Number(
                        cart[existingIndex].quantity ||
                        cart[existingIndex].qty ||
                        1
                    );


                cart[existingIndex].quantity =
                    oldQty + quantity;


                cart[existingIndex].qty =
                    oldQty + quantity;


                /*
                   Update harga sesuai level terbaru.
                */

                cart[existingIndex].price =
                    currentPrice;

                cart[existingIndex].priceLevel =
                    getCurrentLevel();

            }


            else {

                cart.push({

                    id:
                        String(cartProduct.id),

                    name:
                        cartProduct.name,

                    category:
                        cartProduct.category,

                    price:
                        currentPrice,

                    priceLevel:
                        getCurrentLevel(),

                    image:
                        cartProduct.image || "",

                    qty:
                        quantity,

                    quantity:
                        quantity

                });

            }


            localStorage.setItem(
                "drwCart",
                JSON.stringify(cart)
            );

        }


        /*
           Beritahu sistem cart.
        */

        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );


        showCartMessage(
            product.name,
            quantity
        );

    }


    /* =====================================================
       CART MESSAGE
    ===================================================== */

    function showCartMessage(
        productName,
        quantity
    ) {

        let message =
            document.getElementById(
                "drwCartMessage"
            );


        if (!message) {

            message =
                document.createElement(
                    "div"
                );


            message.id =
                "drwCartMessage";


            message.style.position =
                "fixed";

            message.style.right =
                "25px";

            message.style.bottom =
                "25px";

            message.style.zIndex =
                "99999";

            message.style.padding =
                "16px 22px";

            message.style.borderRadius =
                "16px";

            message.style.background =
                "linear-gradient(135deg,#e94f91,#f47bab)";

            message.style.color =
                "#ffffff";

            message.style.fontSize =
                "14px";

            message.style.fontWeight =
                "600";

            message.style.boxShadow =
                "0 12px 35px rgba(0,0,0,.20)";

            message.style.transition =
                "opacity .3s ease, transform .3s ease";

            message.style.transform =
                "translateY(10px)";


            document.body.appendChild(
                message
            );

        }


        message.textContent =
            "✓ " +
            productName +
            " × " +
            quantity +
            " ditambahkan ke keranjang";


        message.style.opacity =
            "1";

        message.style.transform =
            "translateY(0)";


        clearTimeout(
            message._timer
        );


        message._timer =
            setTimeout(
                function () {

                    message.style.opacity =
                        "0";

                    message.style.transform =
                        "translateY(10px)";

                },
                1800
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


        if (currentPage > totalPages) {

            currentPage =
                totalPages;

        }


        const startIndex =
            (currentPage - 1) *
            productsPerPage;


        const visibleProducts =
            filteredProducts.slice(
                startIndex,
                startIndex + productsPerPage
            );


        productsGrid.innerHTML =
            "";


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


        visibleProducts.forEach(
            function (product) {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "product-page-card";


                /*
                   PENTING:
                   ID produk disimpan agar
                   sistem mudah mencari produk.
                */

                article.dataset.productId =
                    String(product.id);


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


                /*
                   HARGA SESUAI LEVEL LOGIN
                */

                const currentPrice =
                    getCurrentPrice(product);


                const currentLevel =
                    getCurrentLevel();


                article.innerHTML = `

                    <!-- PRODUCT IMAGE -->

                    <div class="product-page-image">

                        ${
                            product.badge
                            ? `
                                <span class="product-badge">
                                    ${product.badge}
                                </span>
                            `
                            : ""
                        }

                        <a
                            href="${productUrl}"
                            class="product-image-link"
                            aria-label="Lihat ${product.name}"
                        >

                            <img
                                src="${image}"
                                alt="${product.name}"
                                loading="lazy"
                            >

                        </a>

                    </div>


                    <!-- PRODUCT INFO -->

                    <div class="product-page-info">

                        <span class="product-page-category">
                            ${category}
                        </span>


                        <h3>
                            ${product.name}
                        </h3>


                        <p class="product-page-description">
                            ${description}
                        </p>


                        <!-- PRICE -->

                        <<div class="product-page-bottom">
    <strong class="drw-product-price">
        ${formatRupiah(getDisplayPrice(product))}
    </strong>


                        <!-- LEVEL PRICE -->

                        <span
                            class="product-price-level"
                            style="
                                display:block;
                                margin-top:5px;
                                font-size:11px;
                                color:#b85a7d;
                                text-transform:uppercase;
                                letter-spacing:.08em;
                            "
                        >

                            Harga ${currentLevel}

                        </span>


                        <!-- ACTION -->

                        <div class="product-page-actions">

                            <a
                                href="${productUrl}"
                                class="product-view-link"
                            >

                                Lihat Produk
                                <span>→</span>

                            </a>


                            <button
                                type="button"
                                class="product-add-cart-btn"
                                aria-label="Tambah ${product.name} ke keranjang"
                            >

                                <i class="fa-solid fa-bag-shopping"></i>

                                <span>
                                    Tambah Keranjang
                                </span>

                            </button>

                        </div>

                    </div>

                `;


                productsGrid.appendChild(
                    article
                );


                /* =================================================
                   ADD TO CART BUTTON
                ================================================= */

                const addButton =
                    article.querySelector(
                        ".product-add-cart-btn"
                    );


                if (addButton) {

                    addButton.addEventListener(
                        "click",
                        function () {

                            addProduct(
                                product,
                                1
                            );


                            /*
                               SIMPAN TEKS ASLI
                            */

                            const originalText =
                                addButton.innerHTML;


                            /*
                               UBAH MENJADI CHECKLIST
                            */

                            addButton.innerHTML = `

                                <i class="fa-solid fa-check"></i>

                                <span>
                                    Ditambahkan
                                </span>

                            `;


                            addButton.classList.add(
                                "added"
                            );


                            /*
                               Kembalikan setelah 1.5 detik
                            */

                            setTimeout(
                                function () {

                                    addButton.innerHTML =
                                        originalText;

                                    addButton.classList.remove(
                                        "added"
                                    );

                                },
                                1500
                            );

                        }
                    );

                }

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

        const pagination =
            document.getElementById(
                "productsPagination"
            );


        if (!pagination) {
            return;
        }


        pagination.innerHTML =
            "";


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


        if (
            currentPage < totalPages
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
       CATEGORY FILTER
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


                    currentPage =
                        1;


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


                currentPage =
                    1;


                renderProducts();

            }
        );

    }


    /* =====================================================
       PRODUCT MODAL
    ===================================================== */

    const modal =
        document.getElementById(
            "productModal"
        );

    const modalImage =
        document.getElementById(
            "modalProductImage"
        );

    const modalName =
        document.getElementById(
            "modalProductName"
        );

    const modalCategory =
        document.getElementById(
            "modalProductCategory"
        );

    const modalPrice =
        document.getElementById(
            "modalProductPrice"
        );

    const modalDescription =
        document.getElementById(
            "modalProductDescription"
        );

    const modalQuantityElement =
        document.getElementById(
            "modalQuantity"
        );

    const modalAddCart =
        document.getElementById(
            "modalAddCart"
        );

    const qtyMinus =
        document.getElementById(
            "qtyMinus"
        );

    const qtyPlus =
        document.getElementById(
            "qtyPlus"
        );

    const modalClose =
        document.getElementById(
            "productModalClose"
        );


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openProductModal(
        product
    ) {

        if (!modal) {
            return;
        }


        selectedProduct =
            product;


        modalQuantity =
            1;


        if (modalImage) {

            modalImage.src =
                product.image || "";

            modalImage.alt =
                product.name || "";

        }


        if (modalName) {

            modalName.textContent =
                product.name || "";

        }


        if (modalCategory) {

            modalCategory.textContent =
                product.category || "";

        }


        if (modalPrice) {

            modalPrice.textContent =
                formatRupiah(
                    getCurrentPrice(product)
                );

        }


        if (modalDescription) {

            modalDescription.textContent =
                product.description || "";

        }


        if (modalQuantityElement) {

            modalQuantityElement.textContent =
                modalQuantity;

        }


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeProductModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        selectedProduct =
            null;

    }


    /* =====================================================
       IMAGE CLICK
    ===================================================== */

    productsGrid.addEventListener(
        "click",
        function (event) {

            const imageArea =
                event.target.closest(
                    ".product-page-image"
                );


            if (!imageArea) {
                return;
            }


            /*
               Jangan modal jika pengguna
               menekan link gambar.
            */

            if (
                event.target.closest(
                    "a"
                )
            ) {

                return;

            }

        }
    );


    /* =====================================================
       MODAL QUANTITY MINUS
    ===================================================== */

    if (qtyMinus) {

        qtyMinus.addEventListener(
            "click",
            function () {

                modalQuantity =
                    Math.max(
                        1,
                        modalQuantity - 1
                    );


                if (modalQuantityElement) {

                    modalQuantityElement.textContent =
                        modalQuantity;

                }

            }
        );

    }


    /* =====================================================
       MODAL QUANTITY PLUS
    ===================================================== */

    if (qtyPlus) {

        qtyPlus.addEventListener(
            "click",
            function () {

                modalQuantity++;


                if (modalQuantityElement) {

                    modalQuantityElement.textContent =
                        modalQuantity;

                }

            }
        );

    }


    /* =====================================================
       MODAL ADD CART
    ===================================================== */

    if (modalAddCart) {

        modalAddCart.addEventListener(
            "click",
            function () {

                if (!selectedProduct) {
                    return;
                }


                addProduct(
                    selectedProduct,
                    modalQuantity
                );


                closeProductModal();

            }
        );

    }


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


    /* =====================================================
       MODAL OVERLAY
    ===================================================== */

    if (modal) {

        const overlay =
            modal.querySelector(
                ".product-modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeProductModal
            );

        }

    }


    /* =====================================================
       UPDATE PRICE WHEN AUTH / LEVEL CHANGES
    ===================================================== */

    window.addEventListener(
        "drwAuthChanged",
        function () {

            renderProducts();

        }
    );


    window.addEventListener(
        "priceLevelChanged",
        function () {

            renderProducts();

        }
    );


    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === "drwUser" ||
                event.key === "drwAuth" ||
                event.key === "drwRole"
            ) {

                renderProducts();

            }

        }
    );


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderProducts();


    console.log(
        "DRW Products Page FINAL Loaded"
    );


    console.log(
        "Total products:",
        DRW_PRODUCTS.length
    );


    console.log(
        "Price Level:",
        getCurrentLevel()
    );

});