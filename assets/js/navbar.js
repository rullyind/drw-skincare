document.addEventListener("DOMContentLoaded", function () {

    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    const mobileButton = navbar.querySelector(".mobile-menu-toggle");
    const navLeft = navbar.querySelector(".nav-left");
    const navRight = navbar.querySelector(".nav-right");

    if (!mobileButton) return;

    mobileButton.addEventListener("click", function () {

        navLeft?.classList.toggle("mobile-active");
        navRight?.classList.toggle("mobile-active");

        const isOpen =
            navLeft?.classList.contains("mobile-active") ||
            navRight?.classList.contains("mobile-active");

        mobileButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        mobileButton.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    // Tutup menu setelah tombol navigasi diklik
    navbar.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            navLeft?.classList.remove("mobile-active");
            navRight?.classList.remove("mobile-active");

            mobileButton.setAttribute("aria-expanded", "false");

            mobileButton.innerHTML =
                '<i class="fa-solid fa-bars"></i>';
        });

    });

});