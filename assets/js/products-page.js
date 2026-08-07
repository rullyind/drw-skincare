/* =========================================================
   DRW SKINCARE
   PRODUCTS PAGE FINAL
   - PRODUCT DATABASE
   - SEARCH
   - FILTER
   - PAGINATION
   - ADD TO CART
   - MULTI PRODUCT CART
   - PRODUCT MODAL
========================================================= */
console.log("PRODUCTS-PAGE JS TERBACA");

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
        console.error("#productsGrid tidak ditemukan.");
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
       PRODUCT URL
    ===================================================== */

    function getProductUrl(product) {

        return (
            "product-detail.html?id=" +
            encodeURIComponent(product.id)
        );

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
       ADD PRODUCT TO CART
    ===================================================== */

    function addProduct(product, quantity = 1) {

        if (!product) {
            console.error("Produk tidak valid.");
            return;
        }


        /*
           Gunakan API DRWCart dari app.js
        */

        if (
            window.DRWCart &&
            typeof window.DRWCart.add === "function"
        ) {

            window.DRWCart.add(
                product,
                quantity
            );

        } else {

            /*
               Fallback jika DRWCart belum tersedia
            */

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
                String(product.id);


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

            } else {

                cart.push({

                    id:
                        String(product.id),

                    name:
                        product.name,

                    category:
                        product.category,

                    price:
                        Number(product.price) || 0,

                    image:
                        product.image || "",

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
           Beritahu sistem lain bahwa cart berubah.
        */

        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );


        /*
           Feedback
        */

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
                "14px";

            message.style.background =
                "#e0528b";

            message.style.color =
                "#ffffff";

            message.style.fontSize =
                "14px";

            message.style.fontWeight =
                "600";

            message.style.boxShadow =
                "0 12px 35px rgba(0,0,0,.18)";

            message.style.transition =
                "opacity .3s ease";


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


        clearTimeout(
            message._timer
        );


        message._timer =
            setTimeout(
                function () {

                    message.style.opacity =
                        "0";

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


                article.innerHTML = `

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

                        <img
                            src="${image}"
                            alt="${product.name}"
                            loading="lazy"
                        >

                    </div>


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


                        <div class="product-page-bottom">

                            <strong>
                                ${formatRupiah(product.price)}
                            </strong>

                        </div>


                        <div
                            class="product-page-actions"
                            style="
                                display:flex;
                                gap:10px;
                                margin-top:16px;
                                flex-wrap:wrap;
                            "
                        >

                            <a
                                href="${productUrl}"
                                class="product-view-link"
                            >
                                Lihat Produk →
                            </a>
                            <button
                                type="button"
                                
                                
                            <a
                                href="${productUrl}"
                                class="product-view-link"
                            >
            
                            </a>
                                +Tambah Keranjang 
                                <i class=" Pink Bag </i>
                                <i class-" setelah di klik +Tambah Keranjang kemudian tulisan berubah jadi Checklist </i>
                                   </button>

                        </div>

                    </div>

                `;


                productsGrid.appendChild(
                    article
                );


                /*
                   Tombol ADD TO BAG
                */

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


                            const originalText =
                                addButton.innerHTML;


                            addButton.innerHTML =
                                `
                                <i class="fa-solid fa-check"></i>
                                ADDED
                                `;


                            setTimeout(
                                function () {

                                    addButton.innerHTML =
                                        originalText;

                                },
                                1200
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

    function renderPagination(totalPages) {

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
       MODAL
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


    function openProductModal(product) {

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
                    product.price
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


    /*
       Klik area gambar / produk
    */

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
               Jangan membuka modal jika
               pengguna sedang klik elemen lain.
            */

            const article =
                imageArea.closest(
                    ".product-page-card"
                );


            if (!article) {
                return;
            }


            const productId =
                article
                    .querySelector(
                        "[data-product-id]"
                    )
                    ?.dataset.productId;


            if (!productId) {
                return;
            }


            const product =
                DRW_PRODUCTS.find(
                    function (item) {

                        return String(
                            item.id
                        ) === String(
                            productId
                        );

                    }
                );


            if (!product) {
                return;
            }


            /*
               Kita tidak membuka modal
               jika link gambar memang ingin
               menuju halaman detail.
            */

            /*
               Untuk sekarang biarkan link
               menuju product-detail.html.
            */

        }
    );


    /* =====================================================
       MODAL QUANTITY
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


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


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

});