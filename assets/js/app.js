/* =========================================================
   RARA DRW SKINCARE
   APP.JS — FINAL CART SYSTEM
   Compatible:
   - cart.html
   - cart.js
   - product.html
   - product-detail.html
   - drwCart
   - drwProduct
   - qty
   - quantity
========================================================= */

(function () {

    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        /* =================================================
           GET CART
        ================================================= */

        function getCart() {

            try {

                const data =
                    JSON.parse(
                        localStorage.getItem("drwCart") || "[]"
                    );

                return Array.isArray(data)
                    ? data
                    : [];

            } catch (error) {

                console.error(
                    "DRW Cart Error:",
                    error
                );

                return [];

            }

        }


        /* =================================================
           SAVE CART
        ================================================= */

        function saveCart(cart) {

            localStorage.setItem(
                "drwCart",
                JSON.stringify(cart)
            );


            /* Legacy support */

            if (cart.length > 0) {

                localStorage.setItem(
                    "drwProduct",
                    JSON.stringify(cart[0])
                );

            } else {

                localStorage.removeItem(
                    "drwProduct"
                );

            }

        }


        /* =================================================
           QUANTITY
        ================================================= */

        function getQuantity(product) {

            const quantity =
                Number(
                    product.quantity
                );

            if (
                Number.isFinite(quantity) &&
                quantity > 0
            ) {

                return quantity;

            }


            const qty =
                Number(
                    product.qty
                );

            if (
                Number.isFinite(qty) &&
                qty > 0
            ) {

                return qty;

            }


            return 1;

        }


        /* =================================================
           NORMALIZE
        ================================================= */

        function normalizeProduct(product) {

            const quantity =
                getQuantity(product);


            return {

                ...product,

                id:
                    String(
                        product.id ||
                        product.slug ||
                        product.name ||
                        Date.now()
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
                    product.image ||
                    "",

                qty:
                    quantity,

                quantity:
                    quantity

            };

        }


        /* =================================================
           UPDATE CART BADGE
        ================================================= */

        function updateCartCount() {

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


            /* Support both IDs */

            const countElements =
                document.querySelectorAll(
                    "#cartCount, .cart-count"
                );


            countElements.forEach(
                function (element) {

                    element.textContent =
                        total;

                    element.style.display =
                        total > 0
                            ? ""
                            : "none";

                }
            );

        }


        /* =================================================
           ADD TO CART
        ================================================= */

        function addToCart(product) {

            if (
                !product ||
                typeof product !== "object"
            ) {

                console.error(
                    "Produk tidak valid."
                );

                return;

            }


            const newProduct =
                normalizeProduct(product);


            let cart =
                getCart();


            const existingIndex =
                cart.findIndex(
                    function (item) {

                        return String(
                            item.id
                        ) === String(
                            newProduct.id
                        );

                    }
                );


            /* =============================================
               PRODUCT SUDAH ADA
            ============================================= */

            if (existingIndex !== -1) {

                const oldQuantity =
                    getQuantity(
                        cart[existingIndex]
                    );


                const addQuantity =
                    getQuantity(
                        newProduct
                    );


                const newQuantity =
                    oldQuantity +
                    addQuantity;


                cart[existingIndex] = {

                    ...cart[existingIndex],

                    ...newProduct,

                    qty:
                        newQuantity,

                    quantity:
                        newQuantity

                };

            }


            /* =============================================
               PRODUCT BARU
            ============================================= */

            else {

                cart.push(
                    newProduct
                );

            }


            /* =============================================
               SAVE
            ============================================= */

            saveCart(cart);


            updateCartCount();


            console.log(
                "✅ PRODUK MASUK KERANJANG:",
                newProduct.name
            );


            console.log(
                "🛒 DRW CART:",
                cart
            );


            /* =============================================
               NOTIFICATION
            ============================================= */

            showCartNotification(
                newProduct.name
            );

        }


        /* =================================================
           CART NOTIFICATION
        ================================================= */

        function showCartNotification(productName) {

            const old =
                document.querySelector(
                    ".drw-cart-notification"
                );


            if (old) {

                old.remove();

            }


            const notification =
                document.createElement(
                    "div"
                );


            notification.className =
                "drw-cart-notification";


            notification.innerHTML =

                "<strong>✓ Berhasil ditambahkan</strong>" +
                "<span>" +
                productName +
                "</span>" +
                '<a href="cart.html">Lihat Keranjang →</a>';


            notification.style.cssText = `
                position: fixed;
                right: 25px;
                bottom: 25px;
                z-index: 99999;
                width: 300px;
                padding: 18px;
                border-radius: 18px;
                background: rgba(255,255,255,.98);
                border: 1px solid #f3bfd5;
                box-shadow: 0 20px 50px rgba(190,45,105,.20);
                font-family: Arial,sans-serif;
                animation: drwCartIn .35s ease;
            `;


            notification.querySelector(
                "strong"
            ).style.cssText = `
                display:block;
                color:#e83d88;
                font-size:14px;
                margin-bottom:6px;
            `;


            notification.querySelector(
                "span"
            ).style.cssText = `
                display:block;
                color:#55434c;
                font-size:12px;
                margin-bottom:12px;
            `;


            notification.querySelector(
                "a"
            ).style.cssText = `
                color:#e83d88;
                font-weight:700;
                font-size:12px;
                text-decoration:none;
            `;


            document.body.appendChild(
                notification
            );


            setTimeout(
                function () {

                    notification.remove();

                },
                3500
            );

        }


        /* =================================================
           CSS NOTIFICATION
        ================================================= */

        if (
            !document.getElementById(
                "drw-cart-animation"
            )
        ) {

            const style =
                document.createElement(
                    "style"
                );


            style.id =
                "drw-cart-animation";


            style.textContent = `
                @keyframes drwCartIn {
                    from {
                        opacity:0;
                        transform:translateY(20px);
                    }
                    to {
                        opacity:1;
                        transform:translateY(0);
                    }
                }
            `;


            document.head.appendChild(
                style
            );

        }


        /* =================================================
           ADD BUTTON
           
           Mendukung beberapa class:
           
           .add-to-cart
           .btn-add-cart
           .add-cart
           .product-add-cart
           ================================================= */

        document.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".add-to-cart, " +
                        ".btn-add-cart, " +
                        ".add-cart, " +
                        ".product-add-cart"
                    );


                if (!button) {

                    return;

                }


                event.preventDefault();


                /* =========================================
                   DATA DARI BUTTON
                ========================================= */

                let product = null;


                /* data-product */

                if (
                    button.dataset.product
                ) {

                    try {

                        product =
                            JSON.parse(
                                button.dataset.product
                            );

                    } catch (error) {

                        console.error(
                            "data-product tidak valid:",
                            error
                        );

                    }

                }


                /* =========================================
                   DATA DARI DATASET
                ========================================= */

                if (!product) {

                    product = {

                        id:
                            button.dataset.id ||
                            button.dataset.productId,

                        name:
                            button.dataset.name ||
                            button.dataset.productName,

                        category:
                            button.dataset.category ||
                            "SKINCARE",

                        price:
                            Number(
                                button.dataset.price
                            ) || 0,

                        image:
                            button.dataset.image ||
                            "",

                        qty:
                            Number(
                                button.dataset.qty
                            ) || 1,

                        quantity:
                            Number(
                                button.dataset.quantity
                            ) || 1

                    };

                }


                /* =========================================
                   DATA DARI WINDOW.DRW_PRODUCTS
                ========================================= */

                if (
                    !product.id &&
                    window.DRW_PRODUCTS
                ) {

                    const id =
                        button.dataset.productId ||
                        button.dataset.id;


                    if (id) {

                        const found =
                            window.DRW_PRODUCTS.find(
                                function (item) {

                                    return String(
                                        item.id
                                    ) === String(id);

                                }
                            );


                        if (found) {

                            product =
                                found;

                        }

                    }

                }


                /* =========================================
                   VALIDASI
                ========================================= */

                if (
                    !product ||
                    !product.name
                ) {

                    console.error(
                        "❌ Data produk tidak ditemukan.",
                        button
                    );

                    alert(
                        "Data produk tidak ditemukan."
                    );

                    return;

                }


                /* =========================================
                   ADD
                ========================================= */

                addToCart(
                    product
                );

            }
        );


        /* =================================================
           INITIALIZE
        ================================================= */

        updateCartCount();


        console.log(
            "✅ DRW APP.JS FINAL LOADED"
        );


        console.log(
            "🛒 Current Cart:",
            getCart()
        );

    });

})();
