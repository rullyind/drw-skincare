/* =========================================================
   RARA DRW SKINCARE
   NAVBAR.JS — FINAL
   ---------------------------------------------------------
   FEATURES:
   1. Cart Count
   2. Search Button
   3. Active Navigation
   4. Navbar Scroll Effect
   5. Mobile Menu Support
   6. LocalStorage drwCart Support
   7. Compatible with app.js / cart.js
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const header = document.querySelector(".site-header");
    const navbar = document.querySelector(".main-navbar");

    const searchButton =
        document.getElementById("searchButton");

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       1. UPDATE CART COUNT
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
                "DRW Navbar: gagal membaca drwCart",
                error
            );

            cart = [];
        }


        /*
         * SUPPORT:
         * qty
         * quantity
         * fallback 1
         */

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


        cartCount.textContent = totalItems;


        /* -------------------------------------------------
           HIDE COUNT IF EMPTY
        ------------------------------------------------- */

        if (totalItems <= 0) {

            cartCount.classList.remove("has-items");

        } else {

            cartCount.classList.add("has-items");

        }

    }


    /* Jalankan pertama kali */
    updateCartCount();


    /* =====================================================
       2. LISTEN LOCAL STORAGE
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (event.key === "drwCart") {

                updateCartCount();

            }

        }
    );


    /* =====================================================
       3. CUSTOM CART EVENT
       -----------------------------------------------------
       Bisa dipanggil oleh cart.js / app.js:
       
       window.dispatchEvent(
           new Event("cartUpdated")
       );
    ===================================================== */

    window.addEventListener(
        "cartUpdated",
        function () {

            updateCartCount();

        }
    );


    /* =====================================================
       4. SEARCH BUTTON
    ===================================================== */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                /*
                 * Jika sudah ada halaman products.html,
                 * langsung arahkan ke sana.
                 */

                const currentPage =
                    window.location.pathname
                        .split("/")
                        .pop()
                        .toLowerCase();


                if (
                    currentPage === "product.html" ||
                    currentPage === "products.html"
                ) {

                    /*
                     * Cari input search yang sudah ada
                     */

                    const searchInput =
                        document.querySelector(
                            "#productSearch, " +
                            "#searchInput, " +
                            ".product-search input, " +
                            "input[type='search']"
                        );


                    if (searchInput) {

                        searchInput.focus();

                        searchInput.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                } else {

                    /*
                     * Jika bukan halaman produk,
                     * buka product.html
                     */

                    window.location.href =
                        "product.html";

                }

            }
        );

    }


    /* =====================================================
       5. ACTIVE NAVIGATION
    ===================================================== */

    const navItems =
        document.querySelectorAll(
            ".nav-menu .nav-item"
        );


    function setActiveNavigation() {

        const currentPath =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        const currentHash =
            window.location.hash.toLowerCase();


        navItems.forEach(function (item) {

            item.classList.remove("active");

            const href =
                item.getAttribute("href");

            if (!href) return;


            /*
             * Pisahkan halaman + hash
             */

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
                    ? "#" + parts[1].toLowerCase()
                    : "";


            /* ------------------------------------------------
               HOME
            ------------------------------------------------ */

            if (
                (currentPath === "" ||
                 currentPath === "index.html") &&
                linkPage === "index.html" &&
                !linkHash
            ) {

                item.classList.add("active");

            }


            /* ------------------------------------------------
               PRODUCT PAGE
            ------------------------------------------------ */

            else if (

                (
                    currentPath === "product.html" ||
                    currentPath === "products.html"
                ) &&

                (
                    linkPage === "product.html" ||
                    linkPage === "products.html"
                ) &&

                (
                    !linkHash ||
                    linkHash === currentHash
                )

            ) {

                /*
                 * Jangan otomatis membuat semua link
                 * product page aktif.
                 */

                if (
                    !currentHash &&
                    !linkHash
                ) {

                    item.classList.add("active");

                }

            }


            /* ------------------------------------------------
               OTHER PAGES
            ------------------------------------------------ */

            else if (

                linkPage &&
                linkPage === currentPath &&
                !linkHash

            ) {

                item.classList.add("active");

            }

        });

    }


    setActiveNavigation();


    /* =====================================================
       6. HASH NAVIGATION
    ===================================================== */

    window.addEventListener(
        "hashchange",
        function () {

            setActiveNavigation();

        }
    );


    /* =====================================================
       7. NAVBAR SCROLL EFFECT
    ===================================================== */

    let lastScroll = 0;


    function handleNavbarScroll() {

        if (!header) return;


        const scrollY =
            window.scrollY;


        if (scrollY > 30) {

            header.classList.add(
                "navbar-scrolled"
            );

        } else {

            header.classList.remove(
                "navbar-scrolled"
            );

        }


        lastScroll = scrollY;

    }


    window.addEventListener(
        "scroll",
        handleNavbarScroll,
        { passive: true }
    );


    handleNavbarScroll();


    /* =====================================================
       8. MOBILE MENU
       -----------------------------------------------------
       Mendukung HTML tambahan:
       
       <button class="mobile-menu-toggle">
       
       <div class="nav-menu">
    ===================================================== */

    const mobileToggle =
        document.querySelector(
            ".mobile-menu-toggle"
        );


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
       9. CLOSE MOBILE MENU AFTER CLICK
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
       10. ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") return;

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
       11. CART COUNT SAFETY REFRESH
       -----------------------------------------------------
       Berguna jika app.js/cart.js mengubah localStorage
       di halaman yang sama.
    ===================================================== */

    setInterval(
        updateCartCount,
        1000
    );


    /* =====================================================
       12. DEBUG
    ===================================================== */

    console.log(
        "RARA DRW SKINCARE — Navbar JS Loaded ✓"
    );

});