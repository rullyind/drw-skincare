/* =========================================
   DRW SKINCARE - PRODUCT DETAIL
   MULTI PRODUCT / BUNDLE SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =========================================
       ELEMENTS
    ========================================== */

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

    const optionButtons =
        document.querySelectorAll(
            ".detail-option-btn"
        );
const selectedProductsList =
    document.querySelector(
        "#selectedProductsList"
    );

    /* =========================================
       PRODUCT DATA
    ========================================== */

    const products = [

        {
            id: "drw-premium-facial-care",

            name: "DRW Premium Facial Care",

            category: "FACIAL CARE",

            description:
                "Premium skincare collection",

            price: 149000
        },


        {
            id: "drw-brightening-serum",

            name: "DRW Brightening Serum",

            category: "SERUM",

            description:
                "Brightening skincare serum",

            price: 129000
        },


        {
            id: "drw-moisturizer",

            name: "DRW Moisturizer",

            category: "MOISTURIZER",

            description:
                "Daily hydrating moisturizer",

            price: 119000
        }

    ];


    /* =========================================
       SELECTED PRODUCT OPTION
    ========================================== */

    let selectedOption = 1;


    /*
       1 = 1 Product
       2 = 2 Products
       3 = 3 Products
    */


    /* =========================================
       QUANTITY
    ========================================== */

    let quantity = 1;


   function updateQuantityDisplay() {

    if (quantityNumber) {

        quantityNumber.textContent =
            quantity;

    }

    updateBundlePrice();

    renderSelectedProducts();

}


    /* =========================================
       QUANTITY PLUS
    ========================================== */

    if (plusButton) {

        plusButton.addEventListener(
            "click",
            function () {

                quantity++;

                updateQuantityDisplay();

            }
        );

    }


    /* =========================================
       QUANTITY MINUS
    ========================================== */

    if (minusButton) {

        minusButton.addEventListener(
            "click",
            function () {

                if (quantity > 1) {

                    quantity--;

                }

                updateQuantityDisplay();

            }
        );

    }


    /* =========================================
       PRODUCT OPTION
    ========================================== */

    optionButtons.forEach(
        function (button, index) {

            button.addEventListener(
                "click",
                function () {

                    /*
                       index 0 = 1 Product
                       index 1 = 2 Products
                       index 2 = 3 Products
                    */

                    selectedOption =
                        index + 1;


                    /* REMOVE ACTIVE */

                    optionButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    /* ADD ACTIVE */

                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


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
       GET SELECTED PRODUCTS
    ========================================== */

    function getSelectedProducts() {

        /*
           selectedOption menentukan
           berapa produk berbeda yang
           dimasukkan.
        */

        return products.slice(
            0,
            selectedOption
        );

    }
/* =========================================
   RENDER SELECTED PRODUCTS
========================================= */

function renderSelectedProducts() {

    if (!selectedProductsList) {
        return;
    }


    const selectedProducts =
        getSelectedProducts();


    let html = "";


    selectedProducts.forEach(
        function (product) {

            html += `

                <div class="selected-product-item">

                    <div class="selected-product-name">

                        <span class="selected-product-check">
                            ✓
                        </span>

                        <span>
                            ${product.name}
                        </span>

                    </div>

                    <span class="selected-product-price">
                        Rp ${product.price.toLocaleString("id-ID")}
                    </span>

                </div>

            `;

        }
    );


    const bundlePrice =
        selectedProducts.reduce(
            function (total, product) {

                return total + product.price;

            },
            0
        );


    const totalPrice =
        bundlePrice * quantity;


    html += `

        <div class="selected-products-total">

            <span>
                Total Paket
            </span>

            <strong>
                Rp ${totalPrice.toLocaleString("id-ID")}
            </strong>

        </div>

    `;


    selectedProductsList.innerHTML =
        html;

}

    /* =========================================
       ADD PRODUCTS TO CART
    ========================================== */

    function addProductsToCart() {

        const cart =
            getCart();


        const selectedProducts =
            getSelectedProducts();


        selectedProducts.forEach(
            function (product) {

                const existingProduct =
                    cart.find(
                        function (item) {

                            return (
                                item.id ===
                                product.id
                            );

                        }
                    );


                if (existingProduct) {

                    existingProduct.quantity +=
                        quantity;

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
                            product.price,

                        quantity:
                            quantity

                    });

                }

            }
        );


        saveCart(cart);


        /*
           Simpan produk pertama untuk
           kompatibilitas sistem lama.
        */

        if (cart.length > 0) {

            localStorage.setItem(
                "drwProduct",
                JSON.stringify(
                    cart[0]
                )
            );

        }

    }


    /* =========================================
       ADD TO CART
    ========================================== */

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            function () {

                addProductsToCart();


                const originalText =
                    addToCartButton.textContent;


                addToCartButton.textContent =
                    "✓ Added To Cart";


                setTimeout(
                    function () {

                        addToCartButton.textContent =
                            originalText;

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

                /*
                   BUY NOW hanya membeli
                   pilihan saat ini.
                */

                const selectedProducts =
                    getSelectedProducts();


                const buyNowCart =
                    selectedProducts.map(
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
                                    product.price,

                                quantity:
                                    quantity

                            };

                        }
                    );


                /*
                   Ganti cart dengan
                   paket Buy Now.
                */

                saveCart(
                    buyNowCart
                );


                /*
                   Kompatibilitas sistem lama
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


                window.location.href =
                    "cart.html";

            }
        );

    }


    /* =========================================
       INITIAL DISPLAY
    ========================================== */

    updateQuantityDisplay();

});