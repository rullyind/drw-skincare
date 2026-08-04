document.addEventListener("DOMContentLoaded", function () {

    const navbarHTML = `
    <header class="navbar">

        <!-- MOBILE MENU -->
        <button
            class="mobile-menu-toggle"
            aria-label="Open menu"
            aria-expanded="false"
            type="button">
            <i class="fa-solid fa-bars"></i>
        </button>

        <!-- LEFT NAV -->
        <nav class="nav-left">

            <a href="index.html#home" class="btn btn-secondary">
                ADIT LEWE
            <a href="products.html" class="btn btn-secondary">
                Produk
            
                </a>

            <a href="product-detail.html#Paket-Radiant-Glow-Booster" class="btn btn-secondary">
                Treatment
            </a>

        </nav>

        <!-- LOGO -->
        <a href="index.html#home" class="logo">
            <img
                src="assets/images/logo/logo.png"
                width="220"
                height="50"
                alt="RARA DRW SKINCARE">
        </a>

        <!-- RIGHT NAV -->
        <nav class="nav-right">

            <a href="index.html#best-seller" class="btn btn-secondary">
                Best Seller
            </a>

            <a href=product-detail.html?id=3-in-1-exfoliating-gel-100-ml    
                Tentang Kami
            </a>

            <a href="index.html#contact" class="btn btn-secondary">
                Kontak
            </a>

        </nav>

    </header>
    `;

    /*
     * Masukkan navbar ke halaman
     */
    const navbarContainer = document.getElementById("navbar-container");

    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
    }

    /*
     * MOBILE MENU
     */
    const menuButton = document.querySelector(".mobile-menu-toggle");
    const navLeft = document.querySelector(".nav-left");
    const navRight = document.querySelector(".nav-right");

    if (menuButton) {

        menuButton.addEventListener("click", function () {

            const isOpen = menuButton.getAttribute("aria-expanded") === "true";

            menuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            navLeft?.classList.toggle("mobile-open");
            navRight?.classList.toggle("mobile-open");

        });

    }

});