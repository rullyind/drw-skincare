document.addEventListener("DOMContentLoaded", function () {

    const navbarContainer = document.getElementById("navbar-container");

    if (!navbarContainer) return;

    navbarContainer.innerHTML = `

        <header class="navbar">

            <!-- LOGO -->
            <a href="index.html" class="logo">
                <img
                    src="assets/images/logo/logo.png"
                    alt="RARA DRW Skincare"
                >
            </a>


            <!-- NAVIGATION -->
            <nav class="nav-left">

                <a href="index.html">
                    Home
                </a>

                <a href="products.html">
                    Produk
                </a>

                <a href="index.html#best-seller">
                    Best Seller
                </a>

                <a href="index.html#treatment">
                    Treatment
                </a>

                <a href="index.html#skin-concern">
                    Skin Concern
                </a>

                <a href="index.html#about">
                    About Us
                </a>

                <a href="index.html#beauty-tips">
                    Beauty Tips
                </a>

                <a href="index.html#contact">
                    Konsultasi
                </a>

            </nav>


            <!-- RIGHT NAV -->
            <nav class="nav-right">

                <a href="products.html">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </a>

                <a href="cart.html">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span class="cart-count">0</span>
                </a>

            </nav>


            <!-- MOBILE BUTTON -->
            <button
                class="mobile-menu-toggle"
                type="button"
                aria-label="Buka menu"
            >
                <i class="fa-solid fa-bars"></i>
            </button>

        </header>


        <!-- MOBILE MENU -->
        <div class="mobile-menu">

            <a href="index.html">
                Home
            </a>

            <a href="products.html">
                Produk
            </a>

            <a href="index.html#best-seller">
                Best Seller
            </a>

            <a href="index.html#treatment">
                Treatment
            </a>

            <a href="index.html#skin-concern">
                Skin Concern
            </a>

            <a href="index.html#about">
                About Us
            </a>

            <a href="index.html#beauty-tips">
                Beauty Tips
            </a>

            <a href="index.html#contact">
                Konsultasi
            </a>

            <a href="cart.html">
                Keranjang
            </a>

        </div>

    `;


    /* ================================
       MOBILE MENU
    ================================= */

    const menuButton =
        document.querySelector(".mobile-menu-toggle");

    const mobileMenu =
        document.querySelector(".mobile-menu");


    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", function () {

            mobileMenu.classList.toggle("active");

            const icon =
                menuButton.querySelector("i");

            if (mobileMenu.classList.contains("active")) {

                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");

            } else {

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

            }

        });


        /* Tutup menu setelah klik link */

        mobileMenu
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener("click", function () {

                    mobileMenu.classList.remove("active");

                    const icon =
                        menuButton.querySelector("i");

                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");

                });

            });

    }

});