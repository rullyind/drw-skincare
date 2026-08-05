/* =========================================================
   DRW SKINCARE
   APP.JS — FINAL V8
   CART COMPATIBILITY SYSTEM

   Compatible with:
   - DRW_PRODUCTS
   - product.js
   - cart.js FINAL V7
   - drwCart
   - drwProduct
   - qty
   - quantity
   - Multi Product Cart
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(number) {

        return "Rp " +
            Number(number || 0)
                .toLocaleString("id-ID");

    }


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        try {

            const saved =
                localStorage.getItem("drwCart");

            if (!saved) {
                return [];
            }

            const cart =
                JSON.parse(saved);

            return Array.isArray(cart)
                ? cart
                : [];

        } catch (error) {

            console.error(
                "DRW Cart Error:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       GET QUANTITY
    ===================================================== */

    function getQuantity(product) {

        const quantity =
            parseInt(
                product.quantity,
                10
            );

        if (
            Number.isFinite(quantity) &&
            quantity > 0
        ) {

            return quantity;

        }


        const qty =
            parseInt(
                product.qty,
                10
            );

        if (
            Number.isFinite(qty) &&
            qty > 0
        ) {

            return qty;

        }


        return 1;

    }


    /* =====================================================
       NORMALIZE PRODUCT
    ===================================================== */

    function normalizeProduct(
        product,
        quantity
    ) {

        const safeQuantity =
            Math.max(
                1,
                parseInt(
                    quantity,
                    10
                ) || 1
            );


        return {

            id:
                String(
                    product.id ?? ""
                ),

            name:
                product.name ||
                "DRW Skincare Product",

            category:
                product.category ||
                "SKINCARE",

            price:
                Number(
                    product.price
                ) || 0,

            image:
                product.image || "",

            description:
                product.description || "",

            productCount:
                parseInt(
                    product.productCount,
                    10
                ) || 1,

            qty:
                safeQuantity,

            quantity:
                safeQuantity

        };

    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart(cart) {

        const cleanCart =
            cart
                .map(function (product) {

                    return normalizeProduct(
                        product,
                        getQuantity(product)
                    );

                })
                .filter(function (product) {

                    return product.id !== "";

                });


        localStorage.setItem(
            "drwCart",
            JSON.stringify(
                cleanCart
            )
        );


        if (cleanCart.length > 0) {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(
                    cleanCart[0]
                )
            );

        } else {

            localStorage.removeItem(
                "drwProduct"
            );

        }


        updateCartBadge();

        return cleanCart;

    }


    /* =====================================================
       UPDATE CART BADGE
    ===================================================== */

    function updateCartBadge() {

        const cart =
            getCart();


        const total =
            cart.reduce(
                function (sum, product) {

                    return sum +
                        getQuantity(product);

                },
                0
            );


        document
            .querySelectorAll(
                ".cart-count"
            )
            .forEach(function (badge) {

                badge.textContent =
                    total;


                badge.style.display =
                    total > 0
                        ? ""
                        : "none";

            });

    }


    /* =====================================================
       ADD PRODUCT
    ===================================================== */

    function addToCart(
        product,
        quantity
    ) {

        if (
            !product ||
            product.id === undefined
        ) {

            console.error(
                "Produk tidak valid:",
                product
            );

            return false;

        }


        const cart =
            getCart();


        const productId =
            String(
                product.id
            );


        const addQuantity =
            Math.max(
                1,
                parseInt(
                    quantity,
                    10
                ) || 1
            );


        const existingIndex =
            cart.findIndex(
                function (item) {

                    return String(
                        item.id
                    ) === productId;

                }
            );


        /* ================================================
           PRODUCT SUDAH ADA
        ================================================= */

        if (existingIndex !== -1) {

            const currentQuantity =
                getQuantity(
                    cart[existingIndex]
                );


            const newQuantity =
                currentQuantity +
                addQuantity;


            cart[existingIndex] =
                normalizeProduct(
                    {
                        ...cart[existingIndex],
                        ...product
                    },
                    newQuantity
                );

        }


        /* ================================================
           PRODUCT BARU
        ================================================= */

        else {

            cart.push(
                normalizeProduct(
                    product,
                    addQuantity
                )
            );

        }


        saveCart(cart);


        /*
           Beritahu sistem lain bahwa cart berubah.
        */

        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );


        console.log(
            "DRW ADD TO CART:",
            product.name,
            "Qty:",
            addQuantity
        );


        return true;

    }


    /* =====================================================
       REMOVE PRODUCT
    ===================================================== */

    function removeFromCart(productId) {

        const cart =
            getCart();


        const newCart =
            cart.filter(
                function (product) {

                    return String(
                        product.id
                    ) !== String(
                        productId
                    );

                }
            );


        saveCart(newCart);


        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );


        return newCart;

    }


    /* =====================================================
       UPDATE QUANTITY
    ===================================================== */

    function updateCartQuantity(
        productId,
        quantity
    ) {

        const cart =
            getCart();


        const index =
            cart.findIndex(
                function (product) {

                    return String(
                        product.id
                    ) === String(
                        productId
                    );

                }
            );


        if (index === -1) {

            return cart;

        }


        const newQuantity =
            Math.max(
                1,
                parseInt(
                    quantity,
                    10
                ) || 1
            );


        cart[index].qty =
            newQuantity;


        cart[index].quantity =
            newQuantity;


        saveCart(cart);


        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );


        return cart;

    }


    /* =====================================================
       CLEAR CART
    ===================================================== */

    function clearCart() {

        localStorage.removeItem(
            "drwCart"
        );


        localStorage.removeItem(
            "drwProduct"
        );


        updateCartBadge();


        window.dispatchEvent(
            new CustomEvent(
                "drwCartUpdated"
            )
        );

    }


    /* =====================================================
       IMPORTANT
       ADD TO CART EVENT DELEGATION
       
       Tidak peduli tombol dibuat kapan.
       Produk dinamis tetap akan berfungsi.
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-add-to-cart], " +
                    ".add-to-cart, " +
                    ".btn-add-cart, " +
                    ".add-cart"
                );


            if (!button) {

                return;

            }


            event.preventDefault();


            /* =============================================
               AMBIL ID PRODUK DARI BUTTON
            ============================================= */

            let productId =
                button.dataset.productId ||
                button.dataset.id;


            /*
               Coba cari dari parent product card
            */

            if (!productId) {

                const card =
                    button.closest(
                        ".product-card, " +
                        ".product-item, " +
                        "[data-product-id]"
                    );


                if (card) {

                    productId =
                        card.dataset.productId ||
                        card.dataset.id;

                }

            }


            /* =============================================
               CARI PRODUK DARI DRW_PRODUCTS
            ============================================= */

            let product = null;


            if (
                typeof DRW_PRODUCTS !==
                "undefined" &&
                Array.isArray(
                    DRW_PRODUCTS
                )
            ) {

                product =
                    DRW_PRODUCTS.find(
                        function (item) {

                            return String(
                                item.id
                            ) === String(
                                productId
                            );

                        }
                    );

            }


            /* =============================================
               FALLBACK DATASET
            ============================================= */

            if (!product) {

                const data =
                    button.dataset;


                if (
                    data.id ||
                    data.productId
                ) {

                    product = {

                        id:
                            data.id ||
                            data.productId,

                        name:
                            data.name ||
                            "DRW Skincare Product",

                        category:
                            data.category ||
                            "SKINCARE",

                        price:
                            Number(
                                data.price
                            ) || 0,

                        image:
                            data.image ||
                            "",

                        productCount:
                            Number(
                                data.productCount
                            ) || 1

                    };

                }

            }


            /* =============================================
               PRODUK TIDAK DITEMUKAN
            ============================================= */

            if (!product) {

                console.error(
                    "DRW: Produk tidak ditemukan.",
                    {
                        productId,
                        button
                    }
                );


                alert(
                    "Produk belum dapat ditambahkan. " +
                    "ID produk tidak ditemukan."
                );


                return;

            }


            /* =============================================
               QUANTITY
            ============================================= */

            const quantityInput =
                button
                    .closest(
                        ".product-card, " +
                        ".product-item, " +
                        ".product-detail"
                    )
                    ?.querySelector(
                        "input[type='number'], " +
                        ".quantity-input, " +
                        "[data-quantity]"
                    );


            const quantity =
                quantityInput
                    ? Math.max(
                        1,
                        parseInt(
                            quantityInput.value,
                            10
                        ) || 1
                    )
                    : (
                        Number(
                            button.dataset.quantity
                        ) || 1
                    );


            /* =============================================
               ADD TO CART
            ============================================= */

            const success =
                addToCart(
                    product,
                    quantity
                );


            if (!success) {

                return;

            }


            /* =============================================
               BUTTON FEEDBACK
            ============================================= */

            const originalText =
                button.dataset.originalText ||
                button.textContent;


            button.dataset.originalText =
                originalText;


            button.classList.add(
                "added"
            );


            button.textContent =
                "Added ✓";


            setTimeout(
                function () {

                    button.classList.remove(
                        "added"
                    );


                    button.textContent =
                        originalText;

                },
                1200
            );

        }
    );


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.DRWCart = {

        get:
            getCart,

        add:
            addToCart,

        remove:
            removeFromCart,

        updateQuantity:
            updateCartQuantity,

        clear:
            clearCart,

        badge:
            updateCartBadge,

        formatRupiah:
            formatRupiah

    };


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );


    const nav =
        document.querySelector(
            ".main-nav"
        );


    if (
        menuToggle &&
        nav
    ) {

        menuToggle.addEventListener(
            "click",
            function () {

                nav.classList.toggle(
                    "active"
                );


                menuToggle.classList.toggle(
                    "active"
                );

            }
        );


        nav
            .querySelectorAll("a")
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            nav.classList.remove(
                                "active"
                            );


                            menuToggle.classList.remove(
                                "active"
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchInput =
        document.querySelector(
            ".search-input, #searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const keyword =
                    this.value
                        .toLowerCase()
                        .trim();


                document
                    .querySelectorAll(
                        ".product-card"
                    )
                    .forEach(
                        function (card) {

                            const text =
                                card.textContent
                                    .toLowerCase();


                            card.style.display =
                                !keyword ||
                                text.includes(
                                    keyword
                                )
                                    ? ""
                                    : "none";

                        }
                    );

            }
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    document
        .querySelectorAll(
            "[data-category-filter]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const category =
                            (
                                button.dataset
                                    .categoryFilter ||
                                ""
                            )
                            .toLowerCase()
                            .trim();


                        document
                            .querySelectorAll(
                                ".product-card"
                            )
                            .forEach(
                                function (card) {

                                    const cardCategory =
                                        (
                                            card.dataset
                                                .category ||
                                            card.textContent
                                        )
                                        .toLowerCase();


                                    card.style.display =
                                        !category ||
                                        cardCategory.includes(
                                            category
                                        )
                                            ? ""
                                            : "none";

                                }
                            );

                    }
                );

            }
        );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartBadge();


    window.dispatchEvent(
        new CustomEvent(
            "drwCartReady"
        )
    );


    console.log(
        "DRW Skincare App FINAL V8 Loaded"
    );

});