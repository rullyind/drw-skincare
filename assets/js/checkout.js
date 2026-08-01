/* =========================================
   DRW SKINCARE - CHECKOUT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET CART
    ========================================== */

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem("drwCart")
            ) || [];

    } catch (error) {

        console.error(
            "Data cart rusak:",
            error
        );

        cart = [];

    }


    /* =========================================
       FALLBACK
       Jika drwCart belum tersedia
    ========================================== */

    if (!cart.length) {

        const oldProduct =
            localStorage.getItem("drwProduct");

        if (oldProduct) {

            try {

                const product =
                    JSON.parse(oldProduct);

                cart = [product];

            } catch (error) {

                console.error(
                    "Data produk rusak:",
                    error
                );

            }

        }

    }


    if (!cart.length) {

        console.log(
            "Tidak ada produk di cart."
        );

        return;

    }


    /* =========================================
       FORMAT RUPIAH
    ========================================== */

    function formatRupiah(number) {

        return "Rp " +
            Number(number)
                .toLocaleString("id-ID");

    }


    /* =========================================
       CALCULATE CART
    ========================================== */

    let subtotal = 0;

    let totalQuantity = 0;


    cart.forEach(function (product) {

        const price =
            parseInt(product.price) || 0;

        const quantity =
            parseInt(product.quantity) || 1;


        subtotal +=
            price * quantity;

        totalQuantity +=
            quantity;

    });


    /* =========================================
       SHIPPING
    ========================================== */

    const shippingCost = 15000;

    const total =
        subtotal + shippingCost;


    /* =========================================
       ELEMENTS
    ========================================== */

    const productName =
        document.querySelector(
            ".checkout-product-info h3"
        );


    const productQuantity =
        document.querySelector(
            ".checkout-product-info p"
        );


    const productPrice =
        document.querySelector(
            ".checkout-product > strong"
        );


    const summaryRows =
        document.querySelectorAll(
            ".checkout-summary-row"
        );


    const totalElement =
        document.querySelector(
            ".checkout-total strong"
        );


    /* =========================================
       PRODUCT DISPLAY
    ========================================== */

    /*
       Karena desain checkout saat ini
       menampilkan satu produk utama,
       kita tampilkan produk pertama.
    */

    const firstProduct =
        cart[0];


    if (productName) {

        productName.textContent =
            firstProduct.name ||
            "DRW Skincare Product";

    }


    if (productQuantity) {

        if (cart.length === 1) {

            productQuantity.textContent =
                "Qty: " +
                (parseInt(
                    firstProduct.quantity
                ) || 1);

        } else {

            productQuantity.textContent =
                "Qty: " +
                (parseInt(
                    firstProduct.quantity
                ) || 1) +
                " • " +
                cart.length +
                " produk";

        }

    }


    /*
       Harga produk yang ditampilkan
       adalah harga total item pertama.
    */

    if (productPrice) {

        const firstPrice =
            parseInt(
                firstProduct.price
            ) || 0;

        const firstQuantity =
            parseInt(
                firstProduct.quantity
            ) || 1;


        productPrice.textContent =
            formatRupiah(
                firstPrice *
                firstQuantity
            );

    }


    /* =========================================
       SUBTOTAL
    ========================================== */

    if (summaryRows.length >= 1) {

        const subtotalElement =
            summaryRows[0]
                .querySelector("strong");


        if (subtotalElement) {

            subtotalElement.textContent =
                formatRupiah(
                    subtotal
                );

        }

    }


    /* =========================================
       SHIPPING
    ========================================== */

    if (summaryRows.length >= 2) {

        const shippingElement =
            summaryRows[1]
                .querySelector("strong");


        if (shippingElement) {

            shippingElement.textContent =
                formatRupiah(
                    shippingCost
                );

        }

    }


    /* =========================================
       TOTAL
    ========================================== */

    if (totalElement) {

        totalElement.textContent =
            formatRupiah(
                total
            );

    }


   /* =========================================
   PLACE ORDER
========================================= */

const placeOrderButton =
    document.querySelector(".place-order-btn");

if (placeOrderButton) {

    placeOrderButton.addEventListener("click", function () {

        /* =========================================
           GET CUSTOMER DATA
        ========================================== */

        const nameElement =
            document.querySelector("#customer-name");

        const emailElement =
            document.querySelector("#customer-email");

        const phoneElement =
            document.querySelector("#customer-phone");

        const addressElement =
            document.querySelector("#address");

        const cityElement =
            document.querySelector("#city");

        const postalElement =
            document.querySelector("#postal");


        const name =
            nameElement
                ? nameElement.value.trim()
                : "";

        const email =
            emailElement
                ? emailElement.value.trim()
                : "";

        const phone =
            phoneElement
                ? phoneElement.value.trim()
                : "";

        const address =
            addressElement
                ? addressElement.value.trim()
                : "";

        const city =
            cityElement
                ? cityElement.value.trim()
                : "";

        const postal =
            postalElement
                ? postalElement.value.trim()
                : "";


        /* =========================================
           VALIDATION
        ========================================== */

        if (
            !name ||
            !email ||
            !phone ||
            !address ||
            !city ||
            !postal
        ) {

            alert(
                "Mohon lengkapi informasi pengiriman terlebih dahulu."
            );

            return;

        }


        /* =========================================
           CREATE ORDER NUMBER
        ========================================== */

        const orderNumber =
            "DRW-" +
            Date.now().toString().slice(-6);


        /* =========================================
           SAVE ORDER DATA
        ========================================== */

        const orderData = {

            orderNumber: orderNumber,

            customer: {

                name: name,
                email: email,
                phone: phone,
                address: address,
                city: city,
                postal: postal

            },

            products: cart,

            subtotal: subtotal,

            shipping: shippingCost,

            total: total,

            createdAt:
                new Date().toISOString()

        };


        localStorage.setItem(
            "drwOrder",
            JSON.stringify(orderData)
        );


        localStorage.setItem(
            "drwOrderNumber",
            orderNumber
        );


        /* =========================================
           CLEAR CART
        ========================================== */

        localStorage.removeItem(
            "drwCart"
        );

        localStorage.removeItem(
            "drwProduct"
        );


        /* =========================================
           SUCCESS MESSAGE
        ========================================== */

        alert(
            "Pesanan berhasil dibuat!\n\n" +
            "Nomor Pesanan: " +
            orderNumber +
            "\n\n" +
            "Terima kasih telah berbelanja di DRW Skincare."
        );

          /* =========================================
           GO TO SUCCESS PAGE
        ========================================== */

        window.location.href =
            "order-success.html";

    });

} // tutup if (placeOrderButton)

}); // tutup DOMContentLoaded