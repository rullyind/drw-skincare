/* =========================================================
   DRW SKINCARE
   SHOPPING CART — FINAL V7
   PACKAGE SUPPORT 1 / 2 / 3 PRODUCTS

   Compatible with:
   - app.js              -> qty
   - product-detail.js  -> quantity
   - checkout.js        -> quantity
   - localStorage       -> drwCart / drwProduct

   IMPORTANT:
   qty and quantity are ALWAYS synchronized.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
    ========================================== */

    const cartContainer =
        document.querySelector(
            ".cart-page .cart-items"
        );

    const subtotalElement =
        document.querySelector(
            ".cart-page .cart-summary-total strong"
        );

    const subtotalRowElement =
        document.querySelector(
            ".cart-page .cart-summary-row strong"
        );

    const itemsCountElement =
        document.querySelector(
            ".cart-page .cart-items-header > span"
        );

    const checkoutButton =
        document.querySelector(
            ".cart-page .cart-checkout-btn"
        );


    /* =========================================
       FORMAT RUPIAH
    ========================================== */

    function formatRupiah(number) {

        return "Rp " +
            Number(number || 0)
                .toLocaleString("id-ID");

    }


    /* =========================================
       GET QUANTITY
       Support BOTH qty and quantity
    ========================================== */

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


    /* =========================================
       NORMALIZE PRODUCT
       Keeps qty + quantity identical
    ========================================== */

    function normalizeProduct(product) {

        if (
            !product ||
            typeof product !== "object"
        ) {

            return null;

        }


        const quantity =
            getQuantity(product);


        return {

            ...product,

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
                Number(product.price) || 0,

            image:
                product.image || "",

            qty:
                quantity,

            quantity:
                quantity

        };

    }


    /* =========================================
       GET CART
    ========================================== */

    function getCart() {

        const savedCart =
            localStorage.getItem(
                "drwCart"
            );


        if (!savedCart) {

            return [];

        }


        try {

            const parsed =
                JSON.parse(savedCart);


            if (!Array.isArray(parsed)) {

                return [];

            }


            return parsed
                .map(normalizeProduct)
                .filter(Boolean);

        } catch (error) {

            console.error(
                "DRW Cart data rusak:",
                error
            );

            return [];

        }

    }


    /* =========================================
       SAVE CART
    ========================================== */

    function saveCart(cart) {

        const cleanCart =
            cart
                .map(normalizeProduct)
                .filter(Boolean);


        localStorage.setItem(
            "drwCart",
            JSON.stringify(
                cleanCart
            )
        );


        /*
           Legacy compatibility:
           checkout.js lama dapat memakai
           drwProduct.
        */

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

    }


    /* =========================================
       CART BADGE
    ========================================== */

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
            .forEach(
                function (badge) {

                    badge.textContent =
                        total;

                    badge.style.display =
                        total > 0
                            ? ""
                            : "none";

                }
            );

    }


    /* =========================================
       PACKAGE NAME
    ========================================== */

    function getPackageLabel(product) {

        const productCount =
            parseInt(
                product.productCount,
                10
            ) || 1;


        if (productCount === 1) {

            return "1 Product";

        }


        if (productCount === 2) {

            return "2 Products";

        }


        if (productCount === 3) {

            return "3 Products";

        }


        return productCount +
            " Products";

    }


    /* =========================================
       TOTAL PRODUCT UNITS
    ========================================== */

    function getTotalUnits(product) {

        const productCount =
            parseInt(
                product.productCount,
                10
            ) || 1;


        const quantity =
            getQuantity(product);


        return productCount *
            quantity;

    }


    /* =========================================
       SUBTOTAL
    ========================================== */

    function getSubtotal(cart) {

        return cart.reduce(
            function (sum, product) {

                const price =
                    Number(
                        product.price
                    ) || 0;


                const quantity =
                    getQuantity(product);


                return sum +
                    price * quantity;

            },
            0
        );

    }


    /* =========================================
       EMPTY CART
    ========================================== */

    function renderEmptyCart() {

        if (!cartContainer) {

            return;

        }


        const emptyMessage =
            document.createElement(
                "div"
            );


        emptyMessage.className =
            "cart-empty-page";


        emptyMessage.innerHTML =
            '<div class="cart-empty-icon">♡</div>' +
            '<h3>Your bag is empty</h3>' +
            '<p>Belum ada produk di shopping bag.</p>' +
            '<a href="products.html" ' +
            'class="continue-shopping">' +
            '← Continue Shopping' +
            '</a>';


        cartContainer.appendChild(
            emptyMessage
        );

    }


    /* =========================================
       UPDATE SUMMARY
    ========================================== */

    function updateSummary(cart) {

        const subtotal =
            getSubtotal(cart);


        const totalUnits =
            cart.reduce(
                function (sum, product) {

                    return sum +
                        getTotalUnits(product);

                },
                0
            );


        if (subtotalElement) {

            subtotalElement.textContent =
                formatRupiah(
                    subtotal
                );

        }


        if (subtotalRowElement) {

            subtotalRowElement.textContent =
                formatRupiah(
                    subtotal
                );

        }


        if (itemsCountElement) {

            if (cart.length === 0) {

                itemsCountElement.textContent =
                    "0 Items";

            } else {

                itemsCountElement.textContent =
                    cart.length +
                    (
                        cart.length === 1
                            ? " Item"
                            : " Items"
                    ) +
                    " • " +
                    totalUnits +
                    (
                        totalUnits === 1
                            ? " Product"
                            : " Products"
                    );

            }

        }


        /*
           Keep legacy drwProduct synchronized.
        */

        if (cart.length > 0) {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(
                    cart[0]
                )
            );

        } else {

            localStorage.removeItem(
                "drwProduct"
            );

        }

    }


    /* =========================================
       RENDER CART
    ========================================== */

    function renderCart() {

        if (!cartContainer) {

            updateCartBadge();

            return;

        }


        const cart =
            getCart();


        /*
           Remove only generated cart items.
        */

        cartContainer
            .querySelectorAll(
                ".cart-item, .cart-empty-page"
            )
            .forEach(
                function (item) {

                    item.remove();

                }
            );


        /* EMPTY */

        if (cart.length === 0) {

            renderEmptyCart();

            updateSummary([]);

            return;

        }


        /* =====================================
           CREATE EVERY PRODUCT
        ===================================== */

        cart.forEach(
            function (product, index) {

                const item =
                    document.createElement(
                        "article"
                    );


                item.className =
                    "cart-item";


                item.dataset.index =
                    index;


                const packageLabel =
                    getPackageLabel(
                        product
                    );


                const totalUnits =
                    getTotalUnits(
                        product
                    );


                const productPrice =
                    Number(
                        product.price
                    ) || 0;


                const productQuantity =
                    getQuantity(
                        product
                    );


                const itemTotal =
                    productPrice *
                    productQuantity;


                /* =================================
                   PRODUCT IMAGE
                ================================= */

                const imageBox =
                    document.createElement(
                        "div"
                    );


                imageBox.className =
                    "cart-product-image";


                if (product.image) {

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        product.image;


                    image.alt =
                        product.name ||
                        "DRW Skincare Product";


                    image.loading =
                        "lazy";


                    image.onerror =
                        function () {

                            this.style.display =
                                "none";

                        };


                    imageBox.appendChild(
                        image
                    );

                } else {

                    const placeholder =
                        document.createElement(
                            "div"
                        );


                    placeholder.className =
                        "cart-product-placeholder";


                    placeholder.innerHTML =
                        "<strong>DRW</strong>" +
                        "<small>SKINCARE</small>";


                    imageBox.appendChild(
                        placeholder
                    );

                }


                /* =================================
                   PRODUCT INFO
                ================================= */

                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "cart-product-info";


                info.innerHTML =
                    "<span>" +
                    (
                        product.category ||
                        "SKINCARE"
                    ) +
                    "</span>" +

                    "<h3>" +
                    (
                        product.name ||
                        "DRW Skincare Product"
                    ) +
                    "</h3>" +

                    "<p>" +
                    packageLabel +
                    " • " +
                    totalUnits +
                    (
                        totalUnits === 1
                            ? " unit"
                            : " units"
                    ) +
                    "</p>" +

                    '<button type="button" ' +
                    'class="cart-remove">' +
                    "Remove" +
                    "</button>";


                /* =================================
                   PRICE + QUANTITY
                ================================= */

                const priceBox =
                    document.createElement(
                        "div"
                    );


                priceBox.className =
                    "cart-item-price";


                priceBox.innerHTML =
                    "<strong>" +
                    formatRupiah(
                        itemTotal
                    ) +
                    "</strong>" +

                    '<div class="cart-quantity">' +

                    '<button type="button" ' +
                    'class="cart-minus" ' +
                    'aria-label="Kurangi jumlah">' +
                    "−" +
                    "</button>" +

                    "<span>" +
                    productQuantity +
                    "</span>" +

                    '<button type="button" ' +
                    'class="cart-plus" ' +
                    'aria-label="Tambah jumlah">' +
                    "+" +
                    "</button>" +

                    "</div>";


                item.appendChild(
                    imageBox
                );


                item.appendChild(
                    info
                );


                item.appendChild(
                    priceBox
                );


                cartContainer.appendChild(
                    item
                );

            }
        );


        updateSummary(cart);

    }


    /* =========================================
       CART BUTTON ACTIONS
    ========================================== */

    if (cartContainer) {

        cartContainer.addEventListener(
            "click",
            function (event) {

                const item =
                    event.target.closest(
                        ".cart-item"
                    );


                if (!item) {

                    return;

                }


                const index =
                    parseInt(
                        item.dataset.index,
                        10
                    );


                if (
                    !Number.isInteger(index)
                ) {

                    return;

                }


                const cart =
                    getCart();


                if (!cart[index]) {

                    return;

                }


                /* =================================
                   PLUS
                ================================= */

                if (
                    event.target.closest(
                        ".cart-plus"
                    )
                ) {

                    const currentQuantity =
                        getQuantity(
                            cart[index]
                        );


                    const newQuantity =
                        currentQuantity + 1;


                    /*
                       Synchronize BOTH fields.
                    */

                    cart[index].quantity =
                        newQuantity;


                    cart[index].qty =
                        newQuantity;


                    saveCart(cart);

                    renderCart();

                    return;

                }


                /* =================================
                   MINUS
                ================================= */

                if (
                    event.target.closest(
                        ".cart-minus"
                    )
                ) {

                    const currentQuantity =
                        getQuantity(
                            cart[index]
                        );


                    if (
                        currentQuantity > 1
                    ) {

                        const newQuantity =
                            currentQuantity - 1;


                        cart[index].quantity =
                            newQuantity;


                        cart[index].qty =
                            newQuantity;


                        saveCart(cart);

                        renderCart();

                    }


                    return;

                }


                /* =================================
                   REMOVE
                ================================= */

                if (
                    event.target.closest(
                        ".cart-remove"
                    )
                ) {

                    cart.splice(
                        index,
                        1
                    );


                    saveCart(cart);

                    renderCart();

                    return;

                }

            }
        );

    }


    /* =========================================
       CHECKOUT
    ========================================== */

    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const cart =
                    getCart();


                if (cart.length === 0) {

                    alert(
                        "Shopping cart masih kosong."
                    );

                    return;

                }


                /*
                   Normalize before checkout.
                */

                saveCart(cart);


                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* =========================================
       INITIALIZE
    ========================================== */

    const initialCart =
        getCart();


    if (initialCart.length > 0) {

        saveCart(
            initialCart
        );

    }


    updateCartBadge();

    renderCart();


    console.log(
        "DRW Cart System V7 FINAL Loaded"
    );

});