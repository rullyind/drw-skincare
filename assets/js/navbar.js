/* =========================================================
   RARA DRW SKINCARE
   NAVBAR.JS — FINAL V2
   ---------------------------------------------------------
   FUNGSI:
   1. Update jumlah keranjang
   2. Active navigation
   3. Navbar scroll effect
   4. Mobile menu
   5. Tutup mobile menu setelah klik
   6. ESC untuk tutup mobile menu

   PENTING:
   SEARCH TIDAK DIATUR DI SINI.

   Search sepenuhnya ditangani oleh:
   assets/js/search.js

   Jangan arahkan searchButton ke product.html.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const header =
        document.querySelector(".site-header");

    const navbar =
        document.querySelector(".main-navbar");

    const searchButton =
        document.getElementById("searchButton");

    const cartCount =
        document.getElementById("cartCount");

    const navItems =
        document.querySelectorAll(
            ".nav-menu .nav-item"
        );

    const mobileToggle =
        document.querySelector(
            ".mobile-menu-toggle"
        );


    /* =====================================================
       1. CART COUNT
    ===================================================== */

    function updateCartCount() {

        if (!cartCount) return;

        let cart = [];

        try {

            const savedCart =
                localStorage.getItem("drwCart");

            if (savedCart) {
                cart = JSON.parse(savedCart);
            }

        } catch (error) {

            console.warn(
                "RARA DRW Navbar: gagal membaca drwCart",
                error
            );

            cart = [];
        }


        let totalItems = 0;


        if (Array.isArray(cart)) {

            cart.forEach(function (item) {

                const quantity =
                    Number(
                        item.qty ??
                        item.quantity ??
                        1
                    );

                if (
                    Number.isFinite(quantity) &&
                    quantity > 0
                ) {

                    totalItems += quantity;

                }

            });

        }


        cartCount.textContent =
            totalItems;


        if (totalItems > 0) {

            cartCount.classList.add(
                "has-items"
            );

        } else {

            cartCount.classList.remove(
                "has-items"
            );

        }

    }


    /* Jalankan pertama kali */
    updateCartCount();


    /* =====================================================
       2. CART UPDATE LISTENER
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key === "drwCart"
            ) {

                updateCartCount();

            }

        }
    );


    window.addEventListener(
        "cartUpdated",
        function () {

            updateCartCount();

        }
    );


    /* =====================================================
       3. SEARCH
       -----------------------------------------------------
       TIDAK ADA REDIRECT KE product.html DI SINI.

       Search ditangani oleh:
       search.js

       Jangan tambahkan:
       window.location.href = "product.html";
    ===================================================== */

    if (searchButton) {

        console.log(
            "RARA DRW: tombol search siap digunakan."
        );

    }


    /* =====================================================
       4. ACTIVE NAVIGATION
    ===================================================== */

    function setActiveNavigation() {

        const currentPath =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        const currentHash =
            window.location.hash
                .toLowerCase();


        navItems.forEach(function (item) {

            item.classList.remove(
                "active"
            );


            const href =
                item.getAttribute("href");


            if (!href) return;


            const parts =
                href.split("#");


            const linkPage =
                (
                    parts[0] ||
                    "index.html"
                )
                    .split("/")
                    .pop()
                    .toLowerCase();


            const linkHash =
                parts[1]
                    ? "#" +
                      parts[1].toLowerCase()
                    : "";


            /* HOME */

            if (

                (
                    currentPath === "" ||
                    currentPath === "index.html"
                )

                &&

                linkPage === "index.html"

                &&

                !linkHash

            ) {

                item.classList.add(
                    "active"
                );

            }


            /* PRODUCT / PRODUCTS */

            else if (

                (
                    currentPath === "product.html" ||
                    currentPath === "products.html"
                )

                &&

                (
                    linkPage === "product.html" ||
                    linkPage === "products.html"
                )

                &&

                (
                    !linkHash ||
                    linkHash === currentHash
                )

            ) {

                if (
                    !currentHash &&
                    !linkHash
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }


            /* HALAMAN LAIN */

            else if (

                linkPage === currentPath

                &&

                !linkHash

            ) {

                item.classList.add(
                    "active"
                );

            }

        });

    }


    setActiveNavigation();


    /* =====================================================
       5. HASH CHANGE
    ===================================================== */

    window.addEventListener(
        "hashchange",
        function () {

            setActiveNavigation();

        }
    );


    /* =====================================================
       6. NAVBAR SCROLL
    ===================================================== */

    function handleNavbarScroll() {

        if (!header) return;


        if (
            window.scrollY > 30
        ) {

            header.classList.add(
                "navbar-scrolled"
            );

        } else {

            header.classList.remove(
                "navbar-scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        handleNavbarScroll,
        {
            passive: true
        }
    );


    handleNavbarScroll();


    /* =====================================================
       7. MOBILE MENU
    ===================================================== */

    if (mobileToggle) {

        mobileToggle.addEventListener(
            "click",
            function () {

                if (!navbar) return;


                navbar.classList.toggle(
                    "mobile-menu-open"
                );


                const isOpen =
                    navbar.classList.contains(
                        "mobile-menu-open"
                    );


                mobileToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }
        );

    }


    /* =====================================================
       8. CLOSE MOBILE MENU
    ===================================================== */

    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                if (!navbar) return;


                navbar.classList.remove(
                    "mobile-menu-open"
                );


                if (mobileToggle) {

                    mobileToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    });


    /* =====================================================
       9. ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (!navbar) return;


            navbar.classList.remove(
                "mobile-menu-open"
            );


            if (mobileToggle) {

                mobileToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       10. CART SAFETY REFRESH
    ===================================================== */

    setInterval(
        updateCartCount,
        1000
    );


    /* =====================================================
       DEBUG
    ===================================================== */

    console.log(
        "RARA DRW SKINCARE — Navbar JS FINAL V2 ✓"
    );

});