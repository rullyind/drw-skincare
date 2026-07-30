/*==================================================
 RARA DRW SKINCARE
 script.js
 Bagian 1
==================================================*/

const produkContainer = document.getElementById("produk-container");
const searchInput = document.getElementById("searchInput");
const kategoriFilter = document.getElementById("kategoriFilter");

/*========================================
 DATA
========================================*/

let dataProduk = [...produk];

/*========================================
 RENDER PRODUK
========================================*/

function tampilProduk(data){

    produkContainer.innerHTML="";

    if(data.length===0){

        produkContainer.innerHTML=`

        <div class="kosong">

            <h2>

            😢 Produk tidak ditemukan

            </h2>

        </div>

        `;

        return;

    }

    data.forEach((item,index)=>{

        produkContainer.innerHTML +=`

<div class="card fadeUp"
style="animation-delay:${index*0.08}s">

<span class="badge">

${item.badge}

</span>

<div class="wishlist">

<i class="fa-regular fa-heart"></i>

</div>

<img
src="${item.gambar}"
alt="${item.nama}">

<h3>

${item.nama}

</h3>

<p>

${item.deskripsi}

</p>

<div class="rating">

⭐⭐⭐⭐⭐

</div>

<div class="harga">

Rp ${item.harga.toLocaleString("id-ID")}

</div>

<button
onclick="tambahKeranjang(${item.id})">

<i class="fa-solid fa-cart-shopping"></i>

Tambah Keranjang

</button>

</div>

`;

    });

}

/*========================================
 TAMPILKAN SEMUA PRODUK
========================================*/

tampilProduk(produk);

/*========================================
 SEARCH PRODUK
========================================*/

searchInput.addEventListener("keyup",function(){

    const keyword=this.value.toLowerCase();

    const hasil=produk.filter(item=>

        item.nama.toLowerCase().includes(keyword)

        ||

        item.deskripsi.toLowerCase().includes(keyword)

        ||

        item.kategori.toLowerCase().includes(keyword)

    );

    tampilProduk(hasil);

});

/*========================================
 FILTER KATEGORI
========================================*/

kategoriFilter.addEventListener("change",function(){

    const kategori=this.value;

    if(kategori==="Semua"){

        tampilProduk(produk);

        return;

    }

    const hasil=produk.filter(item=>

        item.kategori===kategori

    );

    tampilProduk(hasil);

});

/*========================================
 ANIMASI SAAT SCROLL
========================================*/

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".card").forEach(card=>{

observer.observe(card);

});

/*========================================
 LOADER
========================================*/

window.addEventListener("load",()=>{

const loader=document.getElementById("loader");

if(loader){

loader.style.opacity="0";

setTimeout(()=>{

loader.style.display="none";

},500);

}

});
