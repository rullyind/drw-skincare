/* =========================================================
   DRW SKINCARE
   PRODUCT DETAIL JS — FINAL
   Compatible with:
   product.js
   cart.js
   app.js
   product.html
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("DRW Product Detail Loaded");


    /* =====================================================
       ELEMENT HELPER
    ===================================================== */

    const $ = (selector) =>
        document.querySelector(selector);


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const detailImage =
        $("#detailProductImage");

    const detailPlaceholder =
        $("#productPlaceholder");

    const detailBadge =
        $("#detailBadge");

    const detailCategory =
        $("#detailCategory");

    const detailName =
        $("#detailProductName");

    const detailPrice =
        $("#detailPrice");

    const detailPriceLevel =
        $("#detailPriceLevel");

    const detailDescription =
        $("#detailDescription");

    const breadcrumbProduct =
        $("#breadcrumbProduct");

    const infoDescription =
        $("#infoDescription");

    const selectedProductName =
        $("#selectedProductName");

    const selectedProductsList =
        $("#selectedProductsList");

    const quantityDisplay =
        $("#detailQuantity");

    const qtyMinus =
        $("#detailQtyMinus");

    const qtyPlus =
        $("#detailQtyPlus");

    const addCartButton =
        $("#detailAddCart");

    const buyNowButton =
        $("#detailBuyNow");


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    let products = [];


    /*
       product.js Anda sebelumnya menggunakan:
       DRW_PRODUCTS

       Kita juga support:
       PRODUCT_DATA
       produk
       products
    */

    if (
        typeof window.DRW_PRODUCTS !== "undefined" &&
        Array.isArray(window.DRW_PRODUCTS)
    ) {

        products = window.DRW_PRODUCTS;

    } else if (
        typeof window.PRODUCTS !== "undefined" &&
        Array.isArray(window.PRODUCTS)
    ) {

        products = window.PRODUCTS;

    } else if (
        typeof window.produk !== "undefined" &&
        Array.isArray(window.produk)
    ) {

        products = window.produk;

    }


    console.log("Jumlah produk:", products.length);


    /* =====================================================
       GET PRODUCT ID FROM URL
    ===================================================== */

    const params =
        new URLSearchParams(window.location.search);

    const productId =
        params.get("id");


    console.log("Product ID:", productId);


    /* =====================================================
       FIND PRODUCT
    ===================================================== */

    function findProduct(id) {

        if (!id || !products.length) {
            return null;
        }


        return products.find(function (product) {

            return String(product.id) === String(id);

        }) || null;

    }


    let currentProduct =
        findProduct(productId);


    /* =====================================================
       FALLBACK FROM localStorage
    ===================================================== */

    if (!currentProduct) {

        try {

            const savedProduct =
                localStorage.getItem("drwProduct");

            if (savedProduct) {

                const parsed =
                    JSON.parse(savedProduct);

                if (parsed) {

                    currentProduct = parsed;

                }

            }

        } catch (error) {

            console.warn(
                "Gagal membaca drwProduct:",
                error
            );

        }

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function formatRupiah(value) {

        const number =
            Number(value) || 0;

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
       NORMALIZE PRODUCT
    ===================================================== */

    function normalizeProduct(product) {

        if (!product) {
            return null;
        }


        return {

            id:
                product.id ??
                product.slug ??
                product.name ??
                product.nama,

            name:
                product.name ??
                product.nama ??
                "DRW Skincare Product",

            category:
                product.category ??
                product.kategori ??
                "DRW SKINCARE",

            price:
                Number(
                    product.price ??
                    product.harga ??
                    0
                ),

            image:
                product.image ??
                product.gambar ??
                "",

            description:
                product.description ??
                product.deskripsi ??
                "Produk DRW Skincare untuk melengkapi rutinitas perawatan dan kecantikan sehari-hari."

        };

    }


    currentProduct =
        normalizeProduct(currentProduct);


    /* =====================================================
       QUANTITY
    ===================================================== */

    let quantity = 1;


    function updateQuantity() {

        quantity =
            Math.max(
                1,
                Number(quantity) || 1
            );


        if (quantityDisplay) {

            quantityDisplay.textContent =
                quantity;

        }

    }


    /* =====================================================
       DISPLAY PRODUCT
    ===================================================== */

    function displayProduct(product) {

        if (!product) {

            console.warn(
                "Produk tidak ditemukan."
            );

            if (detailName) {

                detailName.textContent =
                    "Produk Tidak Ditemukan";

            }

            if (detailPrice) {

                detailPrice.textContent =
                    "Harga belum tersedia";

            }

            if (detailDescription) {

                detailDescription.textContent =
                    "Produk yang Anda cari tidak tersedia.";

            }

            if (addCartButton) {

                addCartButton.disabled = true;

            }

            if (buyNowButton) {

                buyNowButton.disabled = true;

            }

            return;

        }


        /* NAME */

        if (detailName) {

            detailName.textContent =
                product.name;

        }


        /* BREADCRUMB */

        if (breadcrumbProduct) {

            breadcrumbProduct.textContent =
                product.name;

        }


        /* CATEGORY */

        if (detailCategory) {

            detailCategory.textContent =
                product.category;

        }


        /* PRICE */

        if (detailPrice) {

            detailPrice.textContent =
                formatRupiah(product.price);

        }


        /* PRICE LEVEL */

        if (detailPriceLevel) {

            detailPriceLevel.innerHTML =
                `
                <i class="fa-solid fa-tag"></i>
                Harga Umum
                `;

        }


        /* DESCRIPTION */

        if (detailDescription) {

            detailDescription.textContent =
                product.description;

        }


        if (infoDescription) {

            infoDescription.textContent =
                product.description;

        }


        /* IMAGE */

        if (
            detailImage &&
            product.image
        ) {

            detailImage.src =
                product.image;

            detailImage.alt =
                product.name;

            detailImage.style.display =
                "block";


            detailImage.onerror =
                function () {

                    detailImage.style.display =
                        "none";

                    if (detailPlaceholder) {

                        detailPlaceholder.style.display =
                            "grid";

                    }

                };

        } else {

            if (detailImage) {

                detailImage.style.display =
                    "none";

            }

            if (detailPlaceholder) {

                detailPlaceholder.style.display =
                    "grid";

            }

        }


        /* BADGE */

        if (detailBadge) {

            detailBadge.textContent =
                "DRW SKINCARE";

        }


        /* SELECTED PRODUCT */

        updateSelectedProducts();


        /* PAGE TITLE */

        document.title =
            product.name +
            " | DRW Skincare";

    }


    /* =====================================================
       PACKAGE SYSTEM
    ===================================================== */

    let selectedPackage = 1;


    const packageButtons =
        document.querySelectorAll(
            ".detail-option-btn"
        );


    function updateSelectedProducts() {

        if (!selectedProductsList) {
            return;
        }


        selectedProductsList.innerHTML =
            "";


        const amount =
            selectedPackage;


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const item =
                document.createElement("div");

            item.className =
                "selected-product-item";


            const icon =
                document.createElement("i");

            icon.className =
                "fa-solid fa-check";


            const text =
                document.createElement("span");


            if (i === 0) {

                text.textContent =
                    currentProduct
                        ? currentProduct.name
                        : "Produk utama";

            } else {

                text.textContent =
                    "Produk pilihan " +
                    (i + 1);

            }


            item.appendChild(icon);

            item.appendChild(text);

            selectedProductsList.appendChild(
                item
            );

        }


        if (selectedProductName) {

            selectedProductName.textContent =
                currentProduct
                    ? currentProduct.name
                    : "Produk utama";

        }

    }


    packageButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    packageButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedPackage =
                        Number(
                            button.dataset.package
                        ) || 1;


                    updateSelectedProducts();

                }
            );

        }
    );


    /* =====================================================
       QUANTITY MINUS
    ===================================================== */

    if (qtyMinus) {

        qtyMinus.addEventListener(
            "click",
            function () {

                if (quantity > 1) {

                    quantity--;

                }

                updateQuantity();

            }
        );

    }


    /* =====================================================
       QUANTITY PLUS
    ===================================================== */

    if (qtyPlus) {

        qtyPlus.addEventListener(
            "click",
            function () {

                quantity++;

                updateQuantity();

            }
        );

    }


    /* =====================================================
       BUILD CART PRODUCT
    ===================================================== */

    function buildCartProduct() {

        if (!currentProduct) {

            return null;

        }


        const product = {

            id:
                currentProduct.id,

            name:
                currentProduct.name,

            nama:
                currentProduct.name,

            category:
                currentProduct.category,

            kategori:
                currentProduct.category,

            price:
                Number(
                    currentProduct.price
                ) || 0,

            harga:
                Number(
                    currentProduct.price
                ) || 0,

            image:
                currentProduct.image,

            gambar:
                currentProduct.image,

            description:
                currentProduct.description,

            deskripsi:
                currentProduct.description,

            qty:
                quantity,

            quantity:
                quantity,

            package:
                selectedPackage

        };


        return product;

    }


    /* =====================================================
       SAVE CURRENT PRODUCT
    ===================================================== */

    function saveCurrentProduct() {

        try {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(
                    currentProduct
                )
            );

        } catch (error) {

            console.warn(
                "Gagal menyimpan drwProduct:",
                error
            );

        }

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    function addToCart() {

        const product =
            buildCartProduct();


        if (!product) {

            alert(
                "Produk tidak ditemukan."
            );

            return;

        }


        saveCurrentProduct();


        /*
          Jika cart.js menyediakan fungsi global,
          gunakan fungsi tersebut.
        */

        if (
            typeof window.addToCart ===
            "function"
        ) {

            window.addToCart(product);

        } else if (
            typeof window.DRW_addToCart ===
            "function"
        ) {

            window.DRW_addToCart(product);

        } else {

            /*
              FALLBACK LOCALSTORAGE
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


            const existing =
                cart.find(function (item) {

                    return String(item.id) ===
                        String(product.id);

                });


            if (existing) {

                existing.qty =
                    Number(
                        existing.qty ||
                        existing.quantity ||
                        0
                    ) + quantity;

                existing.quantity =
                    existing.qty;

            } else {

                cart.push(product);

            }


            localStorage.setItem(
                "drwCart",
                JSON.stringify(cart)
            );

        }


        showNotification(
            product.name,
            quantity
        );


        updateCartCount();


        console.log(
            "Added to cart:",
            product
        );

    }


    /* =====================================================
       BUY NOW
    ===================================================== */

    function buyNow() {

        const product =
            buildCartProduct();


        if (!product) {

            alert(
                "Produk tidak ditemukan."
            );

            return;

        }


        saveCurrentProduct();


        /*
          Simpan sementara produk
          untuk checkout.
        */

        try {

            localStorage.setItem(
                "drwBuyNow",
                JSON.stringify(product)
            );

        } catch (error) {

            console.warn(
                "Gagal menyimpan drwBuyNow",
                error
            );

        }


        /*
          Masukkan ke cart agar
          checkout dapat membaca data.
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


        const existing =
            cart.find(function (item) {

                return String(item.id) ===
                    String(product.id);

            });


        if (existing) {

            existing.qty =
                Number(
                    product.qty
                );

            existing.quantity =
                existing.qty;

        } else {

            cart.push(product);

        }


        localStorage.setItem(
            "drwCart",
            JSON.stringify(cart)
        );


        updateCartCount();


        /*
          Pergi ke checkout.
        */

        window.location.href =
            "checkout.html";

    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    if (addCartButton) {

        addCartButton.addEventListener(
            "click",
            addToCart
        );

    }


    if (buyNowButton) {

        buyNowButton.addEventListener(
            "click",
            buyNow
        );

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const cartCount =
            $("#cartCount");


        if (!cartCount) {
            return;
        }


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


        const total =
            cart.reduce(
                function (sum, item) {

                    return sum +
                        Number(
                            item.qty ??
                            item.quantity ??
                            1
                        );

                },
                0
            );


        cartCount.textContent =
            total;

    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(
        productName,
        qty
    ) {

        let notification =
            document.querySelector(
                ".drw-cart-notification"
            );


        if (!notification) {

            notification =
                document.createElement(
                    "div"
                );


            notification.className =
                "drw-cart-notification";


            notification.innerHTML =
                `
                <div class="drw-cart-notification-icon">
                    <i class="fa-solid fa-check"></i>
                </div>

                <div class="drw-cart-notification-text">
                    <strong>Produk ditambahkan</strong>
                    <span></span>
                </div>

                <a href="cart.html">
                    Lihat Cart
                </a>
                `;


            document.body.appendChild(
                notification
            );

        }


        const text =
            notification.querySelector(
                ".drw-cart-notification-text span"
            );


        if (text) {

            text.textContent =
                `${productName} × ${qty}`;

        }


        requestAnimationFrame(
            function () {

                notification.classList.add(
                    "show"
                );

            }
        );


        clearTimeout(
            notification._timer
        );


        notification._timer =
            setTimeout(
                function () {

                    notification.classList.remove(
                        "show"
                    );

                },
                3000
            );

    }


    /* =====================================================
       MODAL
    ===================================================== */

    const modal =
        $("#productModal");

    const modalOverlay =
        $("#productModalOverlay");

    const modalClose =
        $("#productModalClose");

    const modalImage =
        $("#modalProductImage");

    const modalCategory =
        $("#modalProductCategory");

    const modalName =
        $("#modalProductName");

    const modalPrice =
        $("#modalProductPrice");

    const modalDescription =
        $("#modalProductDescription");

    const modalQuantity =
        $("#modalQuantity");

    const modalQtyMinus =
        $("#qtyMinus");

    const modalQtyPlus =
        $("#qtyPlus");

    const modalAddCart =
        $("#modalAddCart");


    let modalQty = 1;


    function openModal(product) {

        if (!modal || !product) {
            return;
        }


        if (modalImage) {

            modalImage.src =
                product.image || "";

            modalImage.alt =
                product.name;

        }


        if (modalCategory) {

            modalCategory.textContent =
                product.category;

        }


        if (modalName) {

            modalName.textContent =
                product.name;

        }


        if (modalPrice) {

            modalPrice.textContent =
                formatRupiah(
                    product.price
                );

        }


        if (modalDescription) {

            modalDescription.textContent =
                product.description;

        }


        modalQty = 1;


        if (modalQuantity) {

            modalQuantity.textContent =
                modalQty;

        }


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeModal() {

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

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalQtyMinus) {

        modalQtyMinus.addEventListener(
            "click",
            function () {

                modalQty =
                    Math.max(
                        1,
                        modalQty - 1
                    );


                if (modalQuantity) {

                    modalQuantity.textContent =
                        modalQty;

                }

            }
        );

    }


    if (modalQtyPlus) {

        modalQtyPlus.addEventListener(
            "click",
            function () {

                modalQty++;


                if (modalQuantity) {

                    modalQuantity.textContent =
                        modalQty;

                }

            }
        );

    }


    if (modalAddCart) {

        modalAddCart.addEventListener(
            "click",
            function () {

                if (!currentProduct) {
                    return;
                }


                quantity =
                    modalQty;


                addToCart();


                closeModal();

            }
        );

    }


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    displayProduct(
        currentProduct
    );


    updateQuantity();

    updateCartCount();


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "Current Product:",
        currentProduct
    );

    console.log(
        "Package:",
        selectedPackage
    );

    console.log(
        "Quantity:",
        quantity
    );

});