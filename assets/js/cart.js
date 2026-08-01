/* =========================================
   DRW SKINCARE - SHOPPING CART
   DYNAMIC CART SYSTEM
   PACKAGE SUPPORT 1 / 2 / 3 PRODUCTS
========================================= */

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
            Number(number).toLocaleString("id-ID");

    }


    /* =========================================
       GET CART
    ========================================== */

    function getCart() {

        const savedCart =
            localStorage.getItem("drwCart");


        if (!savedCart) {

            return [];

        }


        try {

            const cart =
                JSON.parse(savedCart);


            return Array.isArray(cart)
                ? cart
                : [];

        } catch (error) {

            console.error(
                "Cart data rusak:",
                error
            );

            return [];

        }

    }


    /* =========================================
       SAVE CART
    ========================================== */

    function saveCart(cart) {

        localStorage.setItem(
            "drwCart",
            JSON.stringify(cart)
        );

    }


    /* =========================================
       GET PACKAGE NAME
    ========================================== */

    function getPackageLabel(product) {

        const productCount =
            parseInt(
                product.productCount
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
       GET TOTAL PRODUCT UNITS
    ========================================== */

    function getTotalUnits(product) {

        const productCount =
            parseInt(
                product.productCount
            ) || 1;


        const quantity =
            parseInt(
                product.quantity
            ) || 1;


        return productCount *
            quantity;

    }


    /* =========================================
       RENDER CART
    ========================================== */

    function renderCart() {

        if (!cartContainer) {

            return;

        }


        const cart =
            getCart();


        /* =====================================
           REMOVE OLD ITEMS
        ===================================== */

        const oldItems =
            cartContainer.querySelectorAll(
                ".cart-item"
            );


        oldItems.forEach(
            function (item) {

                item.remove();

            }
        );


        /* =====================================
           EMPTY CART
        ===================================== */

        if (cart.length === 0) {

            const emptyMessage =
                document.createElement("div");


            emptyMessage.className =
                "cart-empty-page";


            emptyMessage.innerHTML = `

                <div class="cart-empty-icon">
                    ♡
                </div>

                <h3>
                    Your bag is empty
                </h3>

                <p>
                    Belum ada produk di shopping bag.
                </p>

                <a
                    href="products.html"
                    class="continue-shopping"
                >
                    ← Continue Shopping
                </a>

            `;


            cartContainer.appendChild(
                emptyMessage
            );


            updateSummary([]);

            return;

        }


        /* =====================================
           CREATE CART ITEMS
        ===================================== */

        cart.forEach(
            function (product, index) {

                const item =
                    document.createElement("article");


                item.className =
                    "cart-item";


                item.dataset.index =
                    index;


                const packageLabel =
                    getPackageLabel(product);


                const totalUnits =
                    getTotalUnits(product);


                const productPrice =
                    parseInt(
                        product.price
                    ) || 0;


                const productQuantity =
                    parseInt(
                        product.quantity
                    ) || 1;


                const itemTotal =
                    productPrice *
                    productQuantity;


                item.innerHTML = `

                    <div class="cart-product-image">

                        <div class="cart-product-placeholder">

                            DRW

                            <small>
                                SKINCARE
                            </small>

                        </div>

                    </div>


                    <div class="cart-product-info">

                        <span>
                            ${product.category || "SKINCARE"}
                        </span>


                        <h3>
                            ${product.name || "DRW Skincare Product"}
                        </h3>


                        <p>
                            ${packageLabel}
                            •
                            ${totalUnits} unit
                        </p>


                        <button
                            type="button"
                            class="cart-remove"
                        >
                            Remove
                        </button>

                    </div>


                    <div class="cart-item-price">

                        <strong>
                            ${formatRupiah(itemTotal)}
                        </strong>


                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="cart-minus"
                            >
                                −
                            </button>


                            <span>
                                ${productQuantity}
                            </span>


                            <button
                                type="button"
                                class="cart-plus"
                            >
                                +
                            </button>

                        </div>

                    </div>

                `;


                cartContainer.appendChild(
                    item
                );

            }
        );


        updateSummary(cart);

    }


    /* =========================================
       UPDATE SUMMARY
    ========================================== */

    function updateSummary(cart) {

        let subtotal = 0;

        let totalUnits = 0;


        cart.forEach(
            function (product) {

                const quantity =
                    parseInt(
                        product.quantity
                    ) || 1;


                const price =
                    parseInt(
                        product.price
                    ) || 0;


                subtotal +=
                    price * quantity;


                totalUnits +=
                    getTotalUnits(product);

            }
        );


        /* =====================================
           SUBTOTAL
        ===================================== */

        if (subtotalElement) {

            subtotalElement.textContent =
                formatRupiah(subtotal);

        }


        if (subtotalRowElement) {

            subtotalRowElement.textContent =
                formatRupiah(subtotal);

        }


        /* =====================================
           ITEM COUNT
        ===================================== */

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


        /* =====================================
           OLD CHECKOUT COMPATIBILITY
        ===================================== */

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
                        item.dataset.index
                    );


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

                    cart[index].quantity =
                        (
                            parseInt(
                                cart[index].quantity
                            ) || 1
                        ) + 1;


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
                        parseInt(
                            cart[index].quantity
                        ) || 1;


                    if (
                        currentQuantity > 1
                    ) {

                        cart[index].quantity =
                            currentQuantity - 1;

                    }


                    saveCart(cart);

                    renderCart();

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


                window.location.href =
                    "checkout.html";

            }
        );

    }


    /* =========================================
       INITIAL RENDER
    ========================================== */

    renderCart();

});