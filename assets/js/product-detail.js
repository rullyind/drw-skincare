/* =========================================
   DRW SKINCARE
   PRODUCT DETAIL SYSTEM
   DYNAMIC PRODUCT + BUNDLE + CART
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       CHECK PRODUCT DATABASE
    ========================================== */

    if (
        typeof DRW_PRODUCTS === "undefined" ||
        !Array.isArray(DRW_PRODUCTS)
    ) {

        console.error(
            "DRW_PRODUCTS tidak ditemukan."
        );

        return;

    }


    /* =========================================
       GET PRODUCT ID FROM URL
    ========================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        urlParams.get("id");


    /* =========================================
       FIND CURRENT PRODUCT
    ========================================== */

    const currentProduct =
        DRW_PRODUCTS.find(function (product) {

            return product.id === productId;

        });


    /* =========================================
       PRODUCT NOT FOUND
    ========================================== */

    if (!currentProduct) {

        console.error(
            "Produk tidak ditemukan:",
            productId
        );


        /*
           Jika URL tidak memiliki ID,
           kembali ke halaman products.
        */

        window.location.href =
            "products.html";

        return;

    }


    /* =========================================
       ELEMENTS
    ========================================== */

    const productDetail =
        document.querySelector(
            ".product-detail"
        );


    const productNameElement =
        document.querySelector(
            ".product-detail-info h1"
        );


    const productCategoryElement =
        document.querySelector(
            ".detail-category"
        );


    const productPriceElement =
        document.querySelector(
            ".detail-price"
        );


    const productDescriptionElement =
        document.querySelector(
            ".detail-description"
        );


    const productMainImage =
        document.querySelector(
            ".product-main-image"
        );


    const detailOptions =
        document.querySelectorAll(
            ".detail-option-btn"
        );


    const quantityNumber =
        document.querySelector(
            ".quantity-control span"
        );


    const minusButton =
        document.querySelector(
            ".quantity-control button:first-child"
        );


    const plusButton =
        document.querySelector(
            ".quantity-control button:last-child"
        );


    const addToCartButton =
        document.querySelector(
            ".detail-cart-btn"
        );


    const buyNowButton =
        document.querySelector(
            ".detail-buy-btn"
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
       PRODUCT IMAGE
    ========================================== */

    function renderProductImage() {

        if (!productMainImage) {
            return;
        }


        /*
           Cari gambar yang sudah ada.
        */

        let image =
            productMainImage.querySelector(
                ".product-detail-image"
            );


        /*
           Kalau belum ada,
           buat gambar baru.
        */

        if (!image) {

            image =
                document.createElement("img");

            image.className =
                "product-detail-image";


            /*
               Hapus placeholder lama.
            */

            const placeholder =
                productMainImage.querySelector(
                    ".product-placeholder"
                );


            if (placeholder) {

                placeholder.remove();

            }


            productMainImage.appendChild(
                image
            );

        }


        image.src =
            currentProduct.image || "";


        image.alt =
            currentProduct.name;


        /*
           Jika gambar gagal ditemukan,
           tampilkan fallback.
        */

        image.onerror =
            function () {

                image.style.display =
                    "none";


                let fallback =
                    productMainImage.querySelector(
                        ".product-image-fallback"
                    );


                if (!fallback) {

                    fallback =
                        document.createElement("div");

                    fallback.className =
                        "product-image-fallback";


                    fallback.innerHTML = `

                        <strong>
                            DRW
                        </strong>

                        <small>
                            SKINCARE
                        </small>

                    `;


                    productMainImage.appendChild(
                        fallback
                    );

                }

            };

    }


    /* =========================================
       RENDER CURRENT PRODUCT
    ========================================== */

    function renderCurrentProduct() {

        if (productNameElement) {

            productNameElement.textContent =
                currentProduct.name;

        }


        if (productCategoryElement) {

            productCategoryElement.textContent =
                currentProduct.category ||
                "DRW SKINCARE";

        }


        if (productPriceElement) {

            productPriceElement.textContent =
                formatRupiah(
                    currentProduct.price
                );

        }


        if (productDescriptionElement) {

            productDescriptionElement.textContent =
                currentProduct.description ||
                "Produk skincare DRW untuk melengkapi rutinitas perawatan kulit Anda.";

        }


        /*
           Update title browser.
        */

        document.title =
            currentProduct.name +
            " | DRW Skincare";


        /*
           Update gambar.
        */

        renderProductImage();

    }


    renderCurrentProduct();


    /* =========================================
       QUANTITY
    ========================================== */

    let quantity = 1;


    function updateQuantityDisplay() {

        if (quantityNumber) {

            quantityNumber.textContent =
                quantity;

        }

    }


    if (plusButton) {

        plusButton.addEventListener(
            "click",
            function () {

                quantity++;

                updateQuantityDisplay();

                updateSelectedBundle();

            }
        );

    }


    if (minusButton) {

        minusButton.addEventListener(
            "click",
            function () {

                if (quantity > 1) {

                    quantity--;

                }

                updateQuantityDisplay();

                updateSelectedBundle();

            }
        );

    }


    /* =========================================
       BUNDLE SYSTEM
    ========================================== */

    /*
       1 Product
       = produk sekarang

       2 Products
       = produk sekarang + produk berikutnya

       3 Products
       = produk sekarang + 2 produk berikutnya
    */


    let selectedBundleSize = 1;


    /*
       Posisi produk sekarang
       di database.
    */

    const currentProductIndex =
        DRW_PRODUCTS.findIndex(
            function (product) {

                return product.id ===
                    currentProduct.id;

            }
        );


    /* =========================================
       GET BUNDLE PRODUCTS
    ========================================== */

    function getBundleProducts(
        bundleSize
    ) {

        const products = [];


        for (
            let i = 0;
            i < bundleSize;
            i++
        ) {

            const product =
                DRW_PRODUCTS[
                    currentProductIndex + i
                ];


            /*
               Jangan memasukkan produk
               jika sudah melewati database.
            */

            if (product) {

                products.push(product);

            }

        }


        return products;

    }


    /* =========================================
       BUNDLE PRICE
    ========================================== */

    function getBundlePrice(
        bundleProducts
    ) {

        let price = 0;


        bundleProducts.forEach(
            function (product) {

                price +=
                    Number(product.price) || 0;

            }
        );


        return price;

    }


    /* =========================================
       SELECTED PRODUCTS PREVIEW
    ========================================== */

    function renderSelectedProducts() {

        const lists =
            document.querySelectorAll(
                ".selected-products-list"
            );


        if (!lists.length) {

            return;

        }


        const bundleProducts =
            getBundleProducts(
                selectedBundleSize
            );


        lists.forEach(
            function (list) {

                list.innerHTML = "";


                bundleProducts.forEach(
                    function (product) {

                        const item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "selected-product-item";


                        item.innerHTML = `

                            <span class="selected-product-name">
                                ${product.name}
                            </span>

                            <span class="selected-product-price">
                                ${formatRupiah(
                                    product.price
                                )}
                            </span>

                        `;


                        list.appendChild(
                            item
                        );

                    }
                );

            }
        );

    }


    /* =========================================
       UPDATE BUNDLE
    ========================================== */

    function updateSelectedBundle() {

        const bundleProducts =
            getBundleProducts(
                selectedBundleSize
            );


        /*
           Update harga utama.
        */

        if (productPriceElement) {

            productPriceElement.textContent =
                formatRupiah(
                    getBundlePrice(
                        bundleProducts
                    )
                );

        }


        /*
           Update preview.
        */

        renderSelectedProducts();


        /*
           Update tombol.
        */

        detailOptions.forEach(
            function (button, index) {

                if (
                    index + 1 ===
                    selectedBundleSize
                ) {

                    button.classList.add(
                        "active"
                    );

                } else {

                    button.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    /* =========================================
       OPTION BUTTON
    ========================================== */

    detailOptions.forEach(
        function (button, index) {

            button.addEventListener(
                "click",
                function () {

                    const requestedSize =
                        index + 1;


                    const availableProducts =
                        getBundleProducts(
                            requestedSize
                        );


                    /*
                       Kalau database belum
                       memiliki produk sebanyak
                       pilihan yang dipilih.
                    */

                    if (
                        availableProducts.length <
                        requestedSize
                    ) {

                        alert(
                            "Paket ini belum tersedia karena produk tambahan belum tersedia."
                        );

                        return;

                    }


                    selectedBundleSize =
                        requestedSize;


                    updateSelectedBundle();

                }
            );

        }
    );


    /* =========================================
       INITIAL BUNDLE
    ========================================== */

    updateSelectedBundle();


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

            const cart =
                JSON.parse(
                    savedCart
                );


            return Array.isArray(cart)
                ? cart
                : [];

        } catch (error) {

            console.error(
                "Data cart rusak:",
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
       ADD PRODUCTS TO CART
    ========================================== */

    function addProductsToCart(
        products,
        productQuantity
    ) {

        const cart =
            getCart();


        products.forEach(
            function (product) {

                const existingProduct =
                    cart.find(
                        function (item) {

                            return item.id ===
                                product.id;

                        }
                    );


                if (existingProduct) {

                    existingProduct.quantity +=
                        productQuantity;

                } else {

                    cart.push({

                        id:
                            product.id,

                        name:
                            product.name,

                        category:
                            product.category,

                        description:
                            product.description,

                        price:
                            Number(
                                product.price
                            ) || 0,

                        image:
                            product.image || "",

                        quantity:
                            productQuantity

                    });

                }

            }
        );


        saveCart(cart);


        /*
           Kompatibilitas checkout lama.
           drwProduct tetap menggunakan
           produk pertama.
        */

        if (cart.length > 0) {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(
                    cart[0]
                )
            );

        }


        /*
           Update cart count
           jika tersedia.
        */

        updateCartCount();

    }


    /* =========================================
       CART COUNT
    ========================================== */

    function updateCartCount() {

        const cart =
            getCart();


        let totalQuantity = 0;


        cart.forEach(
            function (product) {

                totalQuantity +=
                    Number(
                        product.quantity
                    ) || 0;

            }
        );


        const counters =
            document.querySelectorAll(
                ".cart-count"
            );


        counters.forEach(
            function (counter) {

                counter.textContent =
                    totalQuantity;

            }
        );

    }


    updateCartCount();


    /* =========================================
       ADD TO CART BUTTON
    ========================================== */

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            function () {

                const bundleProducts =
                    getBundleProducts(
                        selectedBundleSize
                    );


                if (!bundleProducts.length) {

                    alert(
                        "Produk tidak ditemukan."
                    );

                    return;

                }


                addProductsToCart(
                    bundleProducts,
                    quantity
                );


                const originalText =
                    addToCartButton.textContent;


                addToCartButton.textContent =
                    "✓ ADDED TO CART";


                addToCartButton.classList.add(
                    "added"
                );


                setTimeout(
                    function () {

                        addToCartButton.textContent =
                            originalText;

                        addToCartButton.classList.remove(
                            "added"
                        );

                    },
                    1500
                );

            }
        );

    }


    /* =========================================
       BUY NOW
    ========================================== */

    if (buyNowButton) {

        buyNowButton.addEventListener(
            "click",
            function () {

                const bundleProducts =
                    getBundleProducts(
                        selectedBundleSize
                    );


                if (!bundleProducts.length) {

                    alert(
                        "Produk tidak ditemukan."
                    );

                    return;

                }


                /*
                   BUY NOW mengganti cart
                   dengan bundle yang dipilih.
                */

                const buyNowCart =
                    bundleProducts.map(
                        function (product) {

                            return {

                                id:
                                    product.id,

                                name:
                                    product.name,

                                category:
                                    product.category,

                                description:
                                    product.description,

                                price:
                                    Number(
                                        product.price
                                    ) || 0,

                                image:
                                    product.image || "",

                                quantity:
                                    quantity

                            };

                        }
                    );


                saveCart(
                    buyNowCart
                );


                /*
                   Kompatibilitas checkout.
                */

                if (
                    buyNowCart.length > 0
                ) {

                    localStorage.setItem(
                        "drwProduct",
                        JSON.stringify(
                            buyNowCart[0]
                        )
                    );

                }


                /*
                   Langsung ke cart.
                */

                window.location.href =
                    "cart.html";

            }
        );

    }


    /* =========================================
       OPTIONAL:
       UPDATE SELECTED PRODUCT LABELS
    ========================================== */

    function updateOptionLabels() {

        if (!detailOptions.length) {

            return;

        }


        const availableCount =
            DRW_PRODUCTS.length -
            currentProductIndex;


        detailOptions.forEach(
            function (button, index) {

                const size =
                    index + 1;


                const productsAvailable =
                    size <= availableCount;


                if (!productsAvailable) {

                    button.disabled =
                        true;


                    button.style.opacity =
                        "0.4";


                    button.style.cursor =
                        "not-allowed";

                } else {

                    button.disabled =
                        false;


                    button.style.opacity =
                        "";


                    button.style.cursor =
                        "";

                }

            }
        );

    }


    updateOptionLabels();


    /* =========================================
       DEBUG
    ========================================== */

    console.log(
        "DRW Product Detail Loaded:",
        currentProduct.name
    );


    console.log(
        "Product ID:",
        currentProduct.id
    );


    console.log(
        "Current Product Index:",
        currentProductIndex
    );

});