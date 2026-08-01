/* =========================================================
   DRW SKINCARE — FINAL APP.JS
   Product Detail + Cart + Navigation + Mobile Menu
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const products = [
        {
            id: 1,
            name: "Glowing Skin Serum",
            category: "FACE SERUM",
            price: 189000,
            description:
                "Serum ringan dengan formula brightening dan hydrating untuk membantu kulit terlihat lebih radiant dan terasa lebih lembap."
        },
        {
            id: 2,
            name: "Radiant Hydrating Cream",
            category: "MOISTURIZER",
            price: 159000,
            description:
                "Pelembap lembut untuk membantu menjaga kelembapan dan kenyamanan kulit sepanjang hari."
        },
        {
            id: 3,
            name: "Daily Glow Toner",
            category: "TONER",
            price: 129000,
            description:
                "Toner ringan untuk menyegarkan kulit dan mempersiapkan kulit sebelum rangkaian skincare berikutnya."
        },
        {
            id: 4,
            name: "Gentle Facial Cleanser",
            category: "FACIAL WASH",
            price: 89000,
            description:
                "Pembersih wajah lembut untuk membantu membersihkan kulit tanpa membuatnya terasa kering."
        }
    ];


    /* =====================================================
       CART
    ===================================================== */

    let cart = JSON.parse(
        localStorage.getItem("drwCart") || "[]"
    );


    let selectedProduct = null;
    let modalQuantity = 1;


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(number) {

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(number);

    }


    /* =====================================================
       ELEMENT
    ===================================================== */

    const productModal =
        document.getElementById("productModal");

    const productModalClose =
        document.getElementById("productModalClose");

    const modalOverlay =
        productModal?.querySelector(
            ".product-modal-overlay"
        );

    const modalProductImage =
        document.getElementById(
            "modalProductImage"
        );

    const modalProductCategory =
        document.getElementById(
            "modalProductCategory"
        );

    const modalProductName =
        document.getElementById(
            "modalProductName"
        );

    const modalProductPrice =
        document.getElementById(
            "modalProductPrice"
        );

    const modalProductDescription =
        document.getElementById(
            "modalProductDescription"
        );

    const qtyMinus =
        document.getElementById("qtyMinus");

    const qtyPlus =
        document.getElementById("qtyPlus");

    const modalQuantity =
        document.getElementById("modalQuantity");

    const modalAddCart =
        document.getElementById("modalAddCart");


    /* =====================================================
       CART ELEMENT
    ===================================================== */

    const cartDrawer =
        document.getElementById("cartDrawer");

    const cartOverlay =
        document.getElementById("cartOverlay");

    const cartClose =
        document.getElementById("cartClose");

    const cartItems =
        document.getElementById("cartItems");

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const cartButtons =
        document.querySelectorAll(".cart-btn");


    /* =====================================================
       CART COUNT
    ===================================================== */

    function getCartCount() {

        return cart.reduce(
            function (total, item) {
                return total + item.qty;
            },
            0
        );

    }


    /* =====================================================
       UPDATE CART BADGE
    ===================================================== */

    function updateCartBadge() {

        cartButtons.forEach(function (button) {

            let badge =
                button.querySelector("span");

            if (!badge) {

                badge =
                    document.createElement("span");

                button.appendChild(badge);

            }

            badge.textContent =
                getCartCount();

            badge.style.display =
                getCartCount() > 0
                    ? ""
                    : "none";

        });

    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart() {

        localStorage.setItem(
            "drwCart",
            JSON.stringify(cart)
        );

        updateCartBadge();

        renderCart();

    }


    /* =====================================================
       OPEN CART
    ===================================================== */

    function openCart() {

        if (!cartDrawer) return;

        cartDrawer.classList.add("active");

        cartOverlay?.classList.add("active");

        document.body.classList.add(
            "cart-open"
        );

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    function closeCart() {

        cartDrawer?.classList.remove(
            "active"
        );

        cartOverlay?.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "cart-open"
        );

    }


    /* =====================================================
       CART BUTTON
    ===================================================== */

    cartButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeMobileMenu();

                openCart();

            }
        );

    });


    cartClose?.addEventListener(
        "click",
        closeCart
    );


    cartOverlay?.addEventListener(
        "click",
        closeCart
    );


    /* =====================================================
       ADD PRODUCT TO CART
    ===================================================== */

    function addToCart(
        product,
        quantity
    ) {

        const existingProduct =
            cart.find(function (item) {

                return item.id === product.id;

            });


        if (existingProduct) {

            existingProduct.qty += quantity;

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                category: product.category,

                price: product.price,

                qty: quantity

            });

        }


        saveCart();

        showToast(
            product.name +
            " ditambahkan ke bag"
        );

    }


    /* =====================================================
       RENDER CART
    ===================================================== */

    function renderCart() {

        if (!cartItems) return;


        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div class="cart-empty">

                    <div class="cart-empty-icon">
                        ♡
                    </div>

                    <h4>
                        Your bag is empty
                    </h4>

                    <p>
                        Temukan produk favoritmu
                        dan mulai your skincare journey.
                    </p>

                </div>

            `;

            if (cartSubtotal) {

                cartSubtotal.textContent =
                    "Rp0";

            }

            return;

        }


        cartItems.innerHTML =
            cart.map(function (item) {

                return `

                    <div
                        class="cart-item"
                        data-cart-id="${item.id}"
                    >

                        <div class="cart-item-visual">
                            <span>DRW</span>
                        </div>


                        <div class="cart-item-info">

                            <small>
                                ${item.category}
                            </small>

                            <h4>
                                ${item.name}
                            </h4>


                            <div class="cart-item-bottom">

                                <strong>
                                    ${formatRupiah(item.price)}
                                </strong>


                                <div class="cart-qty">

                                    <button
                                        class="cart-qty-minus"
                                        type="button"
                                    >
                                        −
                                    </button>

                                    <span>
                                        ${item.qty}
                                    </span>

                                    <button
                                        class="cart-qty-plus"
                                        type="button"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        </div>


                        <button
                            class="cart-remove"
                            type="button"
                        >
                            ×
                        </button>

                    </div>

                `;

            }).join("");


        const subtotal =
            cart.reduce(
                function (total, item) {

                    return total +
                        (
                            item.price *
                            item.qty
                        );

                },
                0
            );


        if (cartSubtotal) {

            cartSubtotal.textContent =
                formatRupiah(subtotal);

        }


        /* CART QUANTITY */

        cartItems
            .querySelectorAll(".cart-item")
            .forEach(function (row) {

                const id =
                    Number(
                        row.dataset.cartId
                    );


                row.querySelector(
                    ".cart-qty-minus"
                )?.addEventListener(
                    "click",
                    function () {

                        const item =
                            cart.find(
                                function (product) {
                                    return product.id === id;
                                }
                            );


                        if (!item) return;


                        item.qty--;


                        if (item.qty <= 0) {

                            cart =
                                cart.filter(
                                    function (product) {

                                        return product.id !== id;

                                    }
                                );

                        }


                        saveCart();

                    }
                );


                row.querySelector(
                    ".cart-qty-plus"
                )?.addEventListener(
                    "click",
                    function () {

                        const item =
                            cart.find(
                                function (product) {
                                    return product.id === id;
                                }
                            );


                        if (!item) return;


                        item.qty++;


                        saveCart();

                    }
                );


                row.querySelector(
                    ".cart-remove"
                )?.addEventListener(
                    "click",
                    function () {

                        cart =
                            cart.filter(
                                function (product) {

                                    return product.id !== id;

                                }
                            );


                        saveCart();

                    }
                );

            });

    }


    /* =====================================================
       FIND PRODUCT
    ===================================================== */

    function findProduct(name) {

        if (!name) return null;


        const cleanName =
            name
                .trim()
                .toLowerCase();


        return products.find(
            function (product) {

                return (
                    product.name
                        .toLowerCase()
                        .includes(cleanName)
                    ||
                    cleanName.includes(
                        product.name
                            .toLowerCase()
                    )
                );

            }
        );

    }


    /* =====================================================
       OPEN PRODUCT DETAIL
    ===================================================== */

    function openProduct(product) {

        if (!productModal || !product) {
            return;
        }


        selectedProduct =
            product;


        modalQuantity = 1;


        if (modalProductCategory) {

            modalProductCategory.textContent =
                product.category;

        }


        if (modalProductName) {

            modalProductName.textContent =
                product.name;

        }


        if (modalProductPrice) {

            modalProductPrice.textContent =
                formatRupiah(
                    product.price
                );

        }


        if (modalProductDescription) {

            modalProductDescription.textContent =
                product.description;

        }


        if (modalQuantity) {

            modalQuantity.textContent =
                "1";

        }


        if (modalProductImage) {

            modalProductImage.alt =
                product.name;

            modalProductImage.removeAttribute(
                "src"
            );

        }


        productModal.classList.add(
            "active"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE PRODUCT DETAIL
    ===================================================== */

    function closeProduct() {

        productModal?.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "modal-open"
        );

        selectedProduct = null;

    }


    productModalClose?.addEventListener(
        "click",
        closeProduct
    );


    modalOverlay?.addEventListener(
        "click",
        closeProduct
    );


    /* =====================================================
       PRODUCT QUANTITY
    ===================================================== */

    qtyMinus?.addEventListener(
        "click",
        function () {

            modalQuantity =
                Math.max(
                    1,
                    modalQuantity - 1
                );


            if (modalQuantity) {

                modalQuantity.textContent =
                    modalQuantity;

            }

        }
    );


    qtyPlus?.addEventListener(
        "click",
        function () {

            modalQuantity++;


            if (modalQuantity) {

                modalQuantity.textContent =
                    modalQuantity;

            }

        }
    );


    /* =====================================================
       MODAL ADD TO CART
    ===================================================== */

    modalAddCart?.addEventListener(
        "click",
        function () {

            if (!selectedProduct) {
                return;
            }


            addToCart(
                selectedProduct,
                modalQuantity
            );


            closeProduct();

            openCart();

        }
    );


    /* =====================================================
       FEATURED PRODUCTS
    ===================================================== */

    document
        .querySelectorAll(".featured-card")
        .forEach(function (card) {

            const title =
                card.querySelector("h3")
                    ?.textContent
                    .trim();


            const product =
                findProduct(title);


            if (!product) return;


            const viewButton =
                card.querySelector(
                    ".featured-link"
                );


            viewButton?.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openProduct(product);

                }
            );

        });


    /* =====================================================
       BEST SELLER
    ===================================================== */

    document
        .querySelectorAll(".best-product")
        .forEach(function (card) {

            const title =
                card.querySelector("h3")
                    ?.textContent
                    .trim();


            const product =
                findProduct(title);


            if (!product) return;


            const cartButton =
                card.querySelector(
                    ".best-cart"
                );


            cartButton?.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    addToCart(
                        product,
                        1
                    );

                }
            );


            const image =
                card.querySelector(
                    ".best-product-image"
                );


            image?.addEventListener(
                "click",
                function () {

                    openProduct(product);

                }
            );

        });


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuButton =
        document.querySelector(
            "button.mobile-menu"
        );


    const mobileMenu =
        document.querySelector(
            "nav.mobile-menu"
        );


    function openMobileMenu() {

        mobileMenu?.classList.add(
            "active"
        );

        mobileMenuButton?.classList.add(
            "active"
        );

        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMobileMenu() {

        mobileMenu?.classList.remove(
            "active"
        );

        mobileMenuButton?.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "menu-open"
        );

    }


    mobileMenuButton?.addEventListener(
        "click",
        function () {

            if (
                mobileMenu?.classList.contains(
                    "active"
                )
            ) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    mobileMenu
        ?.querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });


    /* =====================================================
       SMOOTH NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    closeMobileMenu();

                    closeCart();

                    closeProduct();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchButton =
        document.querySelector(
            '.icon-btn[aria-label="Search"]'
        );


    searchButton?.addEventListener(
        "click",
        function () {

            const query =
                window.prompt(
                    "Cari produk DRW:",
                    ""
                );


            if (!query) {
                return;
            }


            const product =
                findProduct(query);


            if (product) {

                openProduct(product);

            } else {

                showToast(
                    "Produk tidak ditemukan"
                );

            }

        }
    );


    /* =====================================================
       WISHLIST
    ===================================================== */

    const wishlistButton =
        document.querySelector(
            '.icon-btn[aria-label="Wishlist"]'
        );


    wishlistButton?.addEventListener(
        "click",
        function () {

            const icon =
                wishlistButton.querySelector(
                    "i"
                );


            wishlistButton.classList.toggle(
                "active"
            );


            if (
                wishlistButton.classList.contains(
                    "active"
                )
            ) {

                icon?.classList.remove(
                    "fa-regular"
                );

                icon?.classList.add(
                    "fa-solid"
                );

                showToast(
                    "Added to wishlist"
                );

            } else {

                icon?.classList.remove(
                    "fa-solid"
                );

                icon?.classList.add(
                    "fa-regular"
                );

                showToast(
                    "Removed from wishlist"
                );

            }

        }
    );


    /* =====================================================
       CHECKOUT
    ===================================================== */

    document
        .querySelector(".checkout-btn")
        ?.addEventListener(
            "click",
            function () {

                if (!cart.length) {

                    showToast(
                        "Bag kamu masih kosong"
                    );

                    return;

                }


                showToast(
                    "Checkout siap dihubungkan"
                );

            }
        );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(
                ".drw-toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.className =
                "drw-toast";

            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            window.drwToastTimer
        );


        window.drwToastTimer =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                2400
            );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();

                closeCart();

                closeProduct();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCartBadge();

    renderCart();


    console.log(
        "DRW Skincare Premium v3 Loaded"
    );

});