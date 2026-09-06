/* =========================================================
   RARA DRW SKINCARE
   PRODUCT-INFO.JS — AUTO PRODUCT INFORMATION ENGINE
   =========================================================
   Otomatis menyesuaikan:
   - Definisi produk
   - Manfaat produk
   - Cara pakai
   berdasarkan nama + kategori produk yang sedang dibuka.

   Tidak perlu menulis manfaat/cara pakai satu per satu di HTML.
   Jika suatu produk nanti memiliki field:
   definition / definisi
   benefits / manfaat
   howToUse / caraPakai / cara_pakai
   maka data tersebut akan diprioritaskan.
   ========================================================= */

(function () {
    "use strict";

    function text(value) {
        return String(value || "").trim();
    }

    function norm(value) {
        return text(value).toLowerCase();
    }

    function esc(value) {
        return text(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function asArray(value) {
        if (Array.isArray(value)) {
            return value.map(text).filter(Boolean);
        }
        if (typeof value === "string" && value.trim()) {
            return value
                .split(/\n|•|\||;/)
                .map(text)
                .filter(Boolean);
        }
        return [];
    }

    function makeSlug(value) {
        return norm(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, " dan ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function collectProducts() {
        const all = [];

        [
            window.PRODUCT_DATA,
            window.DRW_PRODUCTS,
            window.PRODUCTS,
            window.products,
            window.PRODUCT_LIST,
            window.DRW_PRODUCT_DATA
        ].forEach(function (source) {
            if (Array.isArray(source)) {
                all.push.apply(all, source);
            } else if (source && typeof source === "object") {
                Object.keys(source).forEach(function (key) {
                    if (source[key] && typeof source[key] === "object") {
                        all.push(source[key]);
                    }
                });
            }
        });

        const unique = new Map();

        all.forEach(function (item) {
            if (!item || typeof item !== "object") return;

            const name = text(
                item.name || item.title || item.productName || item.nama
            );

            const id = text(
                item.id || item.slug || item.productId || makeSlug(name)
            );

            if (id) {
                unique.set(makeSlug(id), item);
            }
        });

        return Array.from(unique.values());
    }

    function findProduct() {
        const params = new URLSearchParams(window.location.search);
        const requested = norm(params.get("id"));
        const products = collectProducts();

        if (requested) {
            let found = products.find(function (item) {
                return norm(item.id) === requested;
            });
            if (found) return found;

            found = products.find(function (item) {
                return makeSlug(item.name) === makeSlug(requested);
            });
            if (found) return found;

            found = products.find(function (item) {
                const slug = makeSlug(item.name);
                return slug.includes(makeSlug(requested)) || makeSlug(requested).includes(slug);
            });
            if (found) return found;
        }

        try {
            const saved = JSON.parse(localStorage.getItem("drwProduct") || "null");
            if (saved && saved.id) {
                return products.find(function (item) {
                    return norm(item.id) === norm(saved.id);
                }) || saved;
            }
        } catch (error) {
            console.warn("PRODUCT INFO: localStorage tidak dapat dibaca.");
        }

        return null;
    }

    function has(value, keywords) {
        const valueText = norm(value);
        return keywords.some(function (keyword) {
            return valueText.includes(keyword);
        });
    }

    function buildInfo(product) {
        const name = text(product.name || product.title || "Produk DRW Skincare");
        const category = text(product.category || product.kategori || "");
        const key = norm(name + " " + category);

        /* -------------------------------------------------
           DATA KHUSUS DARI DATABASE — PRIORITAS UTAMA
        ------------------------------------------------- */
        const customDefinition = text(
            product.definition ||
            product.definisi ||
            product.productDefinition ||
            product.definisiProduk
        );

        const customBenefits = asArray(
            product.benefits ||
            product.manfaat ||
            product.productBenefits
        );

        const customHowToUse = asArray(
            product.howToUse ||
            product.caraPakai ||
            product.cara_pakai ||
            product.usage ||
            product.penggunaan
        );

        let definition = customDefinition;
        let benefits = customBenefits;
        let howToUse = customHowToUse;

        /* -------------------------------------------------
           FACIAL WASH / CLEANSER / CLEANSING
        ------------------------------------------------- */
        if (!definition && has(key, [
            "facial wash", "face wash", "cleanser", "cleansing milk",
            "milk cleanser", "pembersih wajah"
        ])) {
            definition = name + " adalah produk pembersih yang digunakan untuk membantu membersihkan wajah dari kotoran, minyak berlebih, dan sisa produk sehari-hari.";
            benefits = [
                "Membantu membersihkan kulit wajah secara menyeluruh.",
                "Membantu mengangkat kotoran dan minyak berlebih.",
                "Membantu mempersiapkan kulit sebelum rangkaian skincare berikutnya."
            ];
            howToUse = [
                "Basahi wajah dengan air.",
                "Tuangkan produk secukupnya ke telapak tangan lalu busakan bila diperlukan.",
                "Pijat lembut pada wajah dengan gerakan melingkar.",
                "Bilas hingga bersih dan keringkan dengan lembut."
            ];
        }

        /* -------------------------------------------------
           SERUM / ESSENCE
        ------------------------------------------------- */
        if (!definition && has(key, ["serum", "essence", "ampoule"])) {
            definition = name + " adalah produk perawatan dengan tekstur yang dirancang untuk melengkapi kebutuhan perawatan kulit setelah tahap pembersihan.";
            benefits = [
                "Membantu melengkapi rutinitas perawatan kulit.",
                "Membantu menjaga kulit tetap terasa lembap dan terawat.",
                "Membantu memberikan perawatan yang lebih terarah sesuai karakter produk."
            ];
            howToUse = [
                "Gunakan setelah membersihkan wajah dan menggunakan toner bila ada.",
                "Aplikasikan secukupnya pada wajah dan leher.",
                "Ratakan dengan lembut hingga meresap.",
                "Lanjutkan dengan moisturizer dan sunscreen pada pagi/siang hari."
            ];
        }

        /* -------------------------------------------------
           TONER
        ------------------------------------------------- */
        if (!definition && has(key, ["toner", "toner wajah"])) {
            definition = name + " adalah produk cair yang digunakan setelah membersihkan wajah untuk melengkapi tahapan awal perawatan kulit.";
            benefits = [
                "Membantu menyegarkan kulit setelah proses pembersihan.",
                "Membantu mempersiapkan kulit untuk produk skincare berikutnya.",
                "Membantu memberikan rasa nyaman dan lembap sesuai karakter produk."
            ];
            howToUse = [
                "Gunakan setelah mencuci wajah.",
                "Tuangkan secukupnya pada telapak tangan atau kapas sesuai petunjuk produk.",
                "Aplikasikan secara lembut pada wajah dan leher.",
                "Lanjutkan dengan serum atau moisturizer."
            ];
        }

        /* -------------------------------------------------
           MOISTURIZER / HYDRA GEL / CREAM
        ------------------------------------------------- */
        if (!definition && has(key, [
            "moisturizer", "hydra gel", "moist", "moisturizing",
            "cream", "krim", "day cream", "night cream"
        ])) {
            definition = name + " adalah produk perawatan berbentuk krim atau gel yang digunakan untuk membantu menjaga kelembapan dan kenyamanan kulit.";
            benefits = [
                "Membantu menjaga kelembapan kulit.",
                "Membantu membuat kulit terasa lebih lembut dan nyaman.",
                "Membantu melengkapi perawatan kulit sesuai waktu pemakaian produk."
            ];
            howToUse = [
                "Gunakan setelah membersihkan wajah dan memakai serum bila ada.",
                "Ambil produk secukupnya.",
                "Aplikasikan merata pada wajah dan leher dengan gerakan lembut.",
                "Untuk produk siang, lanjutkan dengan sunscreen sesuai kebutuhan."
            ];
        }

        /* -------------------------------------------------
           SUNSCREEN
        ------------------------------------------------- */
        if (has(key, ["sunscreen", "sunblock", "spf"])) {
            definition = definition || name + " adalah produk pelindung kulit yang digunakan sebagai bagian dari perawatan pada pagi atau siang hari.";
            benefits = customBenefits.length ? benefits : [
                "Membantu melindungi kulit dari paparan sinar UV sesuai klaim SPF/PA pada kemasan.",
                "Membantu menjaga kulit tetap terlindungi selama aktivitas di siang hari.",
                "Membantu melengkapi rutinitas skincare pagi."
            ];
            howToUse = customHowToUse.length ? howToUse : [
                "Gunakan sebagai tahap terakhir skincare pada pagi/siang hari.",
                "Aplikasikan secara merata pada wajah, leher, dan area yang terpapar.",
                "Gunakan dalam jumlah yang cukup sesuai petunjuk pada kemasan.",
                "Ulangi pemakaian sesuai petunjuk produk, terutama setelah berkeringat atau beraktivitas di luar ruangan."
            ];
        }

        /* -------------------------------------------------
           MASKER
        ------------------------------------------------- */
        if (!definition && has(key, ["mask", "masker", "peel off"])) {
            definition = name + " adalah produk perawatan tambahan yang digunakan secara berkala untuk melengkapi rutinitas skincare.";
            benefits = [
                "Membantu memberikan perawatan tambahan pada kulit.",
                "Membantu membuat kulit terasa lebih segar dan terawat.",
                "Membantu melengkapi rutinitas perawatan sesuai karakter produk."
            ];
            howToUse = [
                "Bersihkan wajah terlebih dahulu.",
                "Aplikasikan masker secara merata sesuai petunjuk produk.",
                "Diamkan selama waktu yang dianjurkan pada kemasan.",
                "Bilas atau lepaskan masker sesuai jenis produknya, lalu lanjutkan skincare."
            ];
        }

        /* -------------------------------------------------
           EXFOLIATING / PEELING
        ------------------------------------------------- */
        if (has(key, ["exfoliating", "peeling", "peel gel", "scrub"])) {
            definition = definition || name + " adalah produk eksfoliasi yang digunakan sebagai perawatan berkala untuk membantu mengangkat sel kulit mati di permukaan kulit.";
            benefits = customBenefits.length ? benefits : [
                "Membantu mengangkat sel kulit mati di permukaan kulit.",
                "Membantu membuat kulit terasa lebih halus.",
                "Membantu mempersiapkan kulit untuk rangkaian skincare berikutnya."
            ];
            howToUse = customHowToUse.length ? howToUse : [
                "Gunakan pada kulit sesuai petunjuk produk.",
                "Aplikasikan secukupnya dan hindari area mata serta kulit yang sedang iritasi.",
                "Gunakan secara lembut tanpa menggosok berlebihan.",
                "Bilas bila produk mensyaratkan pembilasan, kemudian lanjutkan skincare."
            ];
        }

        /* -------------------------------------------------
           FACE MIST / SPRAY
        ------------------------------------------------- */
        if (!definition && has(key, ["face mist", "mist", "spray"])) {
            definition = name + " adalah produk semprot yang digunakan untuk memberikan sensasi menyegarkan dan melengkapi perawatan kulit.";
            benefits = [
                "Membantu menyegarkan kulit.",
                "Membantu memberikan rasa nyaman pada kulit saat diperlukan.",
                "Praktis digunakan dalam rutinitas perawatan sehari-hari."
            ];
            howToUse = [
                "Tutup mata dan arahkan spray ke wajah dari jarak yang dianjurkan pada kemasan.",
                "Semprotkan secara merata secukupnya.",
                "Biarkan menyerap atau tepuk perlahan sesuai petunjuk produk."
            ];
        }

        /* -------------------------------------------------
           BODY CARE / LOTION / BODY CREAM / SOAP
        ------------------------------------------------- */
        if (!definition && has(key, [
            "body care", "body lotion", "body cream", "body foundation",
            "handbody", "body", "soap", "sabun", "breast cream"
        ])) {
            definition = name + " adalah produk perawatan tubuh yang digunakan sesuai area dan petunjuk penggunaan pada kemasan.";
            benefits = [
                "Membantu menjaga kulit tubuh tetap bersih atau terawat sesuai jenis produk.",
                "Membantu menjaga kelembapan dan kenyamanan kulit.",
                "Membantu melengkapi rutinitas perawatan tubuh sehari-hari."
            ];
            howToUse = [
                "Gunakan pada area tubuh yang sesuai dengan petunjuk produk.",
                "Aplikasikan secukupnya dan ratakan secara lembut.",
                "Untuk sabun, gunakan saat mandi lalu bilas hingga bersih.",
                "Untuk lotion atau cream, gunakan pada kulit yang bersih sesuai kebutuhan."
            ];
        }

        /* -------------------------------------------------
           HAIR CARE
        ------------------------------------------------- */
        if (!definition && has(key, ["hair serum", "hair tonic", "hair care", "rambut"])) {
            definition = name + " adalah produk perawatan rambut yang digunakan untuk membantu menjaga rambut tetap terawat sesuai karakter produk.";
            benefits = [
                "Membantu menjaga rambut agar terasa lebih terawat.",
                "Membantu memberikan perawatan pada rambut sesuai fungsi produk.",
                "Membantu melengkapi rutinitas perawatan rambut."
            ];
            howToUse = [
                "Gunakan pada rambut atau kulit kepala sesuai petunjuk produk.",
                "Aplikasikan secukupnya pada area yang dituju.",
                "Ratakan atau pijat lembut bila produk mengharuskannya.",
                "Tidak perlu dibilas untuk produk leave-on, kecuali petunjuk kemasan menyatakan sebaliknya."
            ];
        }

        /* -------------------------------------------------
           MAKEUP
        ------------------------------------------------- */
        if (!definition && has(key, [
            "make up", "makeup", "powder", "cushion", "bb cream",
            "foundation", "compact", "face powder", "rias"
        ])) {
            definition = name + " adalah produk makeup yang digunakan untuk membantu merapikan dan menyempurnakan tampilan wajah.";
            benefits = [
                "Membantu memberikan tampilan wajah yang lebih rapi.",
                "Membantu meratakan tampilan warna kulit sesuai karakter produk.",
                "Membantu melengkapi hasil makeup sehari-hari."
            ];
            howToUse = [
                "Gunakan setelah skincare dan sunscreen meresap.",
                "Ambil produk secukupnya menggunakan puff, sponge, atau alat yang sesuai.",
                "Aplikasikan tipis dan merata pada area wajah yang diinginkan.",
                "Tambahkan lapisan seperlunya untuk hasil yang diinginkan."
            ];
        }

        /* -------------------------------------------------
           PAKET PERAWATAN
        ------------------------------------------------- */
        if (!definition && has(key, ["paket", "set", "bundle"])) {
            definition = name + " adalah rangkaian beberapa produk yang disusun untuk digunakan sebagai rutinitas perawatan sesuai isi paket.";
            benefits = [
                "Membantu memudahkan penggunaan beberapa produk dalam satu rangkaian.",
                "Membantu menyusun rutinitas perawatan secara lebih praktis.",
                "Manfaat setiap produk mengikuti fungsi masing-masing produk di dalam paket."
            ];
            howToUse = [
                "Periksa semua produk yang terdapat di dalam paket.",
                "Gunakan dari produk dengan tekstur paling ringan ke lebih berat, kecuali petunjuk paket menentukan urutan berbeda.",
                "Ikuti cara pakai masing-masing produk pada kemasan.",
                "Jika terdapat sunscreen, gunakan pada tahap pagi/siang hari sebagai langkah perlindungan terakhir."
            ];
        }

        /* -------------------------------------------------
           SUPPLEMENT — HINDARI KLAIM MEDIS OTOMATIS
        ------------------------------------------------- */
        if (!definition && has(key, ["supplement", "kapsul", "capsule", "vitamin"])) {
            definition = name + " adalah produk konsumsi yang penggunaannya harus mengikuti informasi, aturan pakai, dan peringatan yang tercantum pada kemasan.";
            benefits = [
                "Fungsi dan manfaat mengikuti informasi resmi yang tercantum pada label produk.",
                "Gunakan sesuai aturan konsumsi pada kemasan.",
                "Jangan menggandakan dosis di luar petunjuk produk."
            ];
            howToUse = [
                "Baca label, aturan pakai, komposisi, dan peringatan sebelum digunakan.",
                "Konsumsi sesuai dosis dan waktu yang tercantum pada kemasan.",
                "Jangan melebihi dosis yang dianjurkan.",
                "Jika memiliki kondisi khusus atau sedang menggunakan obat, konsultasikan dengan tenaga kesehatan."
            ];
        }

        /* -------------------------------------------------
           FALLBACK UNTUK PRODUK BARU
        ------------------------------------------------- */
        if (!definition) {
            definition = name + " adalah produk dari RARA DRW SKINCARE yang digunakan untuk melengkapi kebutuhan perawatan sesuai kategori dan petunjuk penggunaan produk.";
        }

        if (!benefits.length) {
            benefits = [
                "Membantu melengkapi rutinitas perawatan sehari-hari.",
                "Membantu menjaga kulit atau area penggunaan tetap terawat.",
                "Gunakan sesuai karakter produk dan petunjuk pada kemasan."
            ];
        }

        if (!howToUse.length) {
            howToUse = [
                "Gunakan sesuai petunjuk penggunaan pada kemasan.",
                "Aplikasikan atau gunakan secukupnya sesuai kebutuhan.",
                "Hentikan penggunaan bila muncul ketidaknyamanan atau iritasi."
            ];
        }

        return {
            definition: definition,
            benefits: benefits,
            howToUse: howToUse
        };
    }

    function injectStyle() {
        if (document.getElementById("drwProductInfoStyle")) return;

        const style = document.createElement("style");
        style.id = "drwProductInfoStyle";
        style.textContent = `
            .drw-product-info-section {
                margin: 38px 0 10px;
            }
            .drw-product-info-heading {
                margin-bottom: 20px;
            }
            .drw-product-info-heading .eyebrow {
                display:inline-block;
                margin-bottom:7px;
                font-size:11px;
                font-weight:800;
                letter-spacing:1.7px;
                color:#d83d8b;
            }
            .drw-product-info-heading h2 {
                margin:0 0 7px;
                color:#4a2c3c;
                font-size:28px;
                line-height:1.2;
                font-family:"Playfair Display",serif;
            }
            .drw-product-info-heading p {
                margin:0;
                color:#8d7080;
                font-size:13px;
                line-height:1.7;
            }
            .drw-product-info-grid {
                display:grid;
                grid-template-columns:repeat(3,minmax(0,1fr));
                gap:17px;
            }
            .drw-product-info-card {
                position:relative;
                overflow:hidden;
                padding:23px;
                border-radius:20px;
                background:rgba(255,255,255,.92);
                border:1px solid rgba(232,67,145,.13);
                box-shadow:0 12px 35px rgba(219,55,132,.07);
            }
            .drw-product-info-card::after {
                content:"";
                position:absolute;
                width:100px;
                height:100px;
                right:-45px;
                top:-45px;
                border-radius:50%;
                background:rgba(237,67,150,.06);
            }
            .drw-product-info-icon {
                width:42px;
                height:42px;
                display:grid;
                place-items:center;
                margin-bottom:14px;
                border-radius:13px;
                color:#d93689;
                background:#fff1f8;
            }
            .drw-product-info-label {
                display:block;
                margin-bottom:5px;
                font-size:10px;
                font-weight:800;
                letter-spacing:1.5px;
                color:#c58ca7;
            }
            .drw-product-info-card h3 {
                margin:0 0 12px;
                color:#513142;
                font-size:18px;
            }
            .drw-product-info-card p {
                margin:0;
                color:#705666;
                font-size:13px;
                line-height:1.75;
            }
            .drw-product-info-card ul,
            .drw-product-info-card ol {
                margin:0;
                padding-left:20px;
                color:#705666;
                font-size:13px;
                line-height:1.75;
            }
            .drw-product-info-card li + li {
                margin-top:7px;
            }
            @media(max-width:900px){
                .drw-product-info-grid{grid-template-columns:1fr;}
            }
            @media(max-width:550px){
                .drw-product-info-section{margin-top:28px;}
                .drw-product-info-card{padding:19px;}
                .drw-product-info-heading h2{font-size:24px;}
            }
        `;
        document.head.appendChild(style);
    }

    function createCard(icon, label, title, content) {
        const card = document.createElement("article");
        card.className = "drw-product-info-card";

        const iconBox = document.createElement("div");
        iconBox.className = "drw-product-info-icon";
        iconBox.innerHTML = '<i class="fa-solid ' + icon + '"></i>';

        const labelEl = document.createElement("span");
        labelEl.className = "drw-product-info-label";
        labelEl.textContent = label;

        const titleEl = document.createElement("h3");
        titleEl.textContent = title;

        card.appendChild(iconBox);
        card.appendChild(labelEl);
        card.appendChild(titleEl);

        if (Array.isArray(content)) {
            const list = document.createElement(title === "Cara Pakai" ? "ol" : "ul");
            content.forEach(function (item) {
                const li = document.createElement("li");
                li.textContent = item;
                list.appendChild(li);
            });
            card.appendChild(list);
        } else {
            const p = document.createElement("p");
            p.textContent = content;
            card.appendChild(p);
        }

        return card;
    }

    function render() {
        if (!document.body) return;

        if (document.getElementById("drwProductInfoSection")) return;

        const product = findProduct();
        if (!product) return;

        const info = buildInfo(product);
        injectStyle();

        const section = document.createElement("section");
        section.id = "drwProductInfoSection";
        section.className = "drw-product-info-section";

        const heading = document.createElement("div");
        heading.className = "drw-product-info-heading";
        heading.innerHTML =
            '<span class="eyebrow">INFO PRODUK</span>' +
            '<h2>Kenali Produk Ini</h2>' +
            '<p>Informasi otomatis disesuaikan dengan nama dan kategori produk yang sedang Anda lihat.</p>';

        const grid = document.createElement("div");
        grid.className = "drw-product-info-grid";

        grid.appendChild(createCard(
            "fa-circle-info",
            "DEFINISI",
            "Definisi Produk",
            info.definition
        ));

        grid.appendChild(createCard(
            "fa-sparkles",
            "MANFAAT",
            "Manfaat Produk",
            info.benefits
        ));

        grid.appendChild(createCard(
            "fa-list-check",
            "PENGGUNAAN",
            "Cara Pakai",
            info.howToUse
        ));

        section.appendChild(heading);
        section.appendChild(grid);

        const main = document.querySelector("main.page") || document.querySelector("main");
        if (!main) return;

        const notFound = document.getElementById("notFound");
        if (notFound && notFound.parentNode === main) {
            main.insertBefore(section, notFound);
        } else {
            main.appendChild(section);
        }

        console.log("✅ PRODUCT INFO OTOMATIS AKTIF:", product.name);
    }

    function start() {
        render();
        setTimeout(render, 250);
        setTimeout(render, 800);
        setTimeout(render, 1500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
