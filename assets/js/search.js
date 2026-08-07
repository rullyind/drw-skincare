/* =========================================================
   RARA DRW SKINCARE - SEARCH PRODUK PREMIUM
   File: assets/js/search.js
========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        const searchButton = document.getElementById("searchButton");

        if (!searchButton) {
            console.warn("Search: tombol #searchButton tidak ditemukan.");
            return;
        }

        /* =====================================================
           SEARCH OVERLAY
        ===================================================== */

        document.body.insertAdjacentHTML("beforeend", `
            <div class="rara-search-overlay" id="raraSearchOverlay">

                <div
                    class="rara-search-backdrop"
                    id="raraSearchBackdrop">
                </div>

                <div class="rara-search-panel">

                    <!-- CLOSE -->
                    <button
                        class="rara-search-close"
                        id="raraSearchClose"
                        type="button"
                        aria-label="Tutup pencarian">
                        &times;
                    </button>

                    <!-- TITLE -->
                    <div class="rara-search-title">

                        <span>RARA DRW SKINCARE</span>

                        <h2>
                            Cari Produk <b>Favoritmu</b>
                        </h2>

                        <p>
                            Temukan produk skincare yang kamu cari.
                        </p>

                    </div>


                    <!-- SEARCH BOX -->
                    <div class="rara-search-box">

                        <i class="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="search"
                            id="raraSearchInput"
                            placeholder="Cari produk, kategori..."
                            autocomplete="off"
                        >

                        <button
                            id="raraSearchClear"
                            type="button"
                            aria-label="Hapus pencarian">
                            &times;
                        </button>

                    </div>


                    <!-- STATUS -->
                    <div
                        id="raraSearchStatus"
                        class="rara-search-status">
                        Ketik nama produk untuk mencari.
                    </div>


                    <!-- RESULTS -->
                    <div id="raraSearchResults"></div>

                </div>

            </div>
        `);


        /* =====================================================
           CSS SEARCH
        ===================================================== */

        const style = document.createElement("style");

        style.textContent = `

            /* OVERLAY */
            .rara-search-overlay {
                position: fixed;
                inset: 0;
                z-index: 999999;

                display: none;

                align-items: flex-start;
                justify-content: center;

                padding: 70px 20px 30px;
            }


            .rara-search-overlay.active {
                display: flex;
            }


            /* BACKDROP */
            .rara-search-backdrop {
                position: absolute;
                inset: 0;

                background: rgba(20, 10, 16, .65);

                backdrop-filter: blur(10px);
            }


            /* PANEL */
            .rara-search-panel {
                position: relative;
                z-index: 2;

                width: min(760px, 100%);
                max-height: 85vh;

                overflow-y: auto;

                padding: 40px;

                border-radius: 30px;

                background: #ffffff;

                border: 1px solid rgba(236, 83, 151, .25);

                box-shadow:
                    0 30px 80px rgba(0,0,0,.35),
                    0 0 40px rgba(236,83,151,.20);
            }


            /* CLOSE BUTTON */
            .rara-search-close {
                position: absolute;

                top: 18px;
                right: 20px;

                width: 40px;
                height: 40px;

                border: 0;
                border-radius: 50%;

                background: #fff0f6;

                color: #ec5397;

                font-size: 26px;

                cursor: pointer;

                transition: .25s ease;
            }


            .rara-search-close:hover {
                background: #ec5397;
                color: #ffffff;

                transform: rotate(90deg);
            }


            /* TITLE */
            .rara-search-title span {
                color: #ec5397;

                font-size: 11px;

                font-weight: 800;

                letter-spacing: .22em;
            }


            .rara-search-title h2 {
                margin: 8px 0;

                color: #21171d;

                font-family:
                    Georgia,
                    "Times New Roman",
                    serif;

                font-size: 42px;

                line-height: 1.15;
            }


            .rara-search-title h2 b {
                color: #ec5397;
            }


            .rara-search-title p {
                margin-bottom: 25px;

                color: #81737b;

                font-size: 14px;
            }


            /* SEARCH BOX */
            .rara-search-box {
                display: flex;

                align-items: center;

                gap: 12px;

                height: 60px;

                padding: 0 18px;

                border:
                    1px solid
                    rgba(236,83,151,.30);

                border-radius: 18px;

                background: #ffffff;

                box-shadow:
                    0 10px 30px
                    rgba(236,83,151,.10);

                transition: .25s ease;
            }


            .rara-search-box:focus-within {
                border-color: #ec5397;

                box-shadow:
                    0 10px 35px
                    rgba(236,83,151,.20);
            }


            .rara-search-box i {
                color: #ec5397;

                font-size: 18px;
            }


            .rara-search-box input {
                flex: 1;

                width: 100%;

                border: 0;

                outline: 0;

                background: transparent;

                color: #222222;

                font-size: 15px;
            }


            .rara-search-box input::placeholder {
                color: #aaa0a6;
            }


            /* CLEAR */
            #raraSearchClear {
                border: 0;

                background: transparent;

                color: #ec5397;

                font-size: 22px;

                cursor: pointer;
            }


            /* STATUS */
            .rara-search-status {
                padding:
                    18px
                    2px
                    12px;

                color: #8a7d84;

                font-size: 13px;
            }


            /* PRODUCT RESULT */
            .rara-search-result {

                display: flex;

                align-items: center;

                gap: 15px;

                margin-bottom: 10px;

                padding: 12px;

                border-radius: 18px;

                border:
                    1px solid
                    rgba(236,83,151,.12);

                background:
                    linear-gradient(
                        135deg,
                        #ffffff,
                        #fff7fb
                    );

                text-decoration: none;

                transition: .25s ease;
            }


            .rara-search-result:hover {

                transform:
                    translateY(-2px);

                border-color: #ec5397;

                box-shadow:
                    0 10px 25px
                    rgba(0,0,0,.10);
            }


            /* PRODUCT IMAGE */
            .rara-search-image {

                width: 75px;
                height: 75px;

                flex:
                    0 0 75px;

                overflow: hidden;

                border-radius: 14px;

                background: #fff0f6;
            }


            .rara-search-image img {

                width: 100%;
                height: 100%;

                object-fit: contain;

                display: block;
            }


            /* PRODUCT INFO */
            .rara-search-info {
                flex: 1;
            }


            .rara-search-category {

                display: block;

                margin-bottom: 4px;

                color: #ec5397;

                font-size: 10px;

                font-weight: bold;

                letter-spacing: .12em;

                text-transform: uppercase;
            }


            .rara-search-name {

                display: block;

                color: #21171d;

                font-family:
                    Georgia,
                    "Times New Roman",
                    serif;

                font-size: 18px;

                font-weight: bold;
            }


            .rara-search-price {

                display: block;

                margin-top: 5px;

                color: #222222;

                font-weight: bold;
            }


            /* ARROW */
            .rara-search-arrow {

                width: 38px;
                height: 38px;

                flex: 0 0 38px;

                display: grid;

                place-items: center;

                border-radius: 50%;

                background: #ec5397;

                color: #ffffff;

                transition: .25s ease;
            }


            .rara-search-result:hover
            .rara-search-arrow {

                background: #d83e82;

                transform:
                    translateX(4px);
            }


            /* EMPTY */
            .rara-search-empty {

                padding: 35px;

                text-align: center;

                color: #887a82;

                border:
                    1px dashed
                    rgba(236,83,151,.30);

                border-radius: 18px;

                background: #fffafd;
            }


            /* BODY */
            body.rara-search-open {
                overflow: hidden;
            }


            /* MOBILE */
            @media (max-width: 600px) {

                .rara-search-overlay {
                    padding:
                        30px
                        12px;
                }


                .rara-search-panel {

                    padding: 30px 18px;

                    border-radius: 22px;
                }


                .rara-search-title h2 {

                    font-size: 32px;
                }


                .rara-search-image {

                    width: 60px;
                    height: 60px;

                    flex-basis: 60px;
                }


                .rara-search-name {

                    font-size: 15px;
                }


                .rara-search-arrow {

                    width: 34px;
                    height: 34px;

                    flex-basis: 34px;
                }

            }

        `;

        document.head.appendChild(style);


        /* =====================================================
           ELEMENT
        ===================================================== */

        const overlay =
            document.getElementById(
                "raraSearchOverlay"
            );

        const input =
            document.getElementById(
                "raraSearchInput"
            );

        const close =
            document.getElementById(
                "raraSearchClose"
            );

        const backdrop =
            document.getElementById(
                "raraSearchBackdrop"
            );

        const clear =
            document.getElementById(
                "raraSearchClear"
            );

        const results =
            document.getElementById(
                "raraSearchResults"
            );

        const status =
            document.getElementById(
                "raraSearchStatus"
            );


        /* =====================================================
           FORMAT RUPIAH
        ===================================================== */

        function rupiah(value) {

            return "Rp " +
                Number(value || 0)
                    .toLocaleString("id-ID");

        }


        /* =====================================================
           OPEN SEARCH
        ===================================================== */

        function openSearch() {

            overlay.classList.add("active");

            document.body.classList.add(
                "rara-search-open"
            );

            setTimeout(function () {

                input.focus();

            }, 100);

        }


        /* =====================================================
           CLOSE SEARCH
        ===================================================== */

        function closeSearch() {

            overlay.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "rara-search-open"
            );

        }


        /* =====================================================
           GET PRODUCTS
        ===================================================== */

        function getProducts() {

            if (
                window.DRW_PRODUCTS &&
                Array.isArray(
                    window.DRW_PRODUCTS
                )
            ) {

                return window.DRW_PRODUCTS;

            }

            return [];

        }


        /* =====================================================
           SEARCH PRODUCT
        ===================================================== */

        function searchProducts(keyword) {

            const products =
                getProducts();

            const q =
                keyword
                    .toLowerCase()
                    .trim();


            if (!q) {

                status.textContent =
                    "Ketik nama produk, kategori, atau kebutuhan kulit.";

                results.innerHTML = "";

                return;

            }


            const found =
                products
                    .filter(function (product) {

                        const name =
                            String(
                                product.name || ""
                            ).toLowerCase();


                        const category =
                            String(
                                product.category || ""
                            ).toLowerCase();


                        const description =
                            String(
                                product.description || ""
                            ).toLowerCase();


                        return (
                            name.includes(q) ||
                            category.includes(q) ||
                            description.includes(q)
                        );

                    })
                    .slice(0, 12);


            status.textContent =
                found.length +
                " produk ditemukan";


            /* TIDAK ADA PRODUK */
            if (!found.length) {

                results.innerHTML = `

                    <div class="rara-search-empty">

                        <strong>
                            Produk tidak ditemukan
                        </strong>

                        <br>

                        Coba kata kunci lain.

                    </div>

                `;

                return;

            }


            /* TAMPILKAN PRODUK */
            results.innerHTML =
                found
                    .map(function (product) {

                        return `

                            <a
                                class="rara-search-result"
                                href="
                                    product-detail.html?id=${encodeURIComponent(
                                        product.id
                                    )}
                                "
                            >

                                <span
                                    class="rara-search-image"
                                >

                                    <img
                                        src="${product.image || ""}"
                                        alt="${
                                            product.name ||
                                            "Produk DRW Skincare"
                                        }"
                                    >

                                </span>


                                <span
                                    class="rara-search-info"
                                >

                                    <span
                                        class="rara-search-category"
                                    >
                                        ${
                                            product.category ||
                                            "DRW Skincare"
                                        }
                                    </span>


                                    <span
                                        class="rara-search-name"
                                    >
                                        ${
                                            product.name ||
                                            "Produk DRW Skincare"
                                        }
                                    </span>


                                    <span
                                        class="rara-search-price"
                                    >
                                        ${rupiah(
                                            product.price
                                        )}
                                    </span>

                                </span>


                                <span
                                    class="rara-search-arrow"
                                >

                                    <i
                                        class="fa-solid fa-arrow-right"
                                    ></i>

                                </span>

                            </a>

                        `;

                    })
                    .join("");

        }


        /* =====================================================
           EVENTS
        ===================================================== */

        searchButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                openSearch();

            }
        );


        close.addEventListener(
            "click",
            closeSearch
        );


        backdrop.addEventListener(
            "click",
            closeSearch
        );


        clear.addEventListener(
            "click",
            function () {

                input.value = "";

                results.innerHTML = "";

                status.textContent =
                    "Ketik nama produk, kategori, atau kebutuhan kulit.";

                input.focus();

            }
        );


        input.addEventListener(
            "input",
            function () {

                searchProducts(
                    this.value
                );

            }
        );


        /* ESC untuk tutup */
        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape" &&
                    overlay.classList.contains(
                        "active"
                    )
                ) {

                    closeSearch();

                }

            }
        );

    });

})();