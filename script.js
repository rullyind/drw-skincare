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

            ðŸ˜¢ Produk tidak ditemukan

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

â­â­â­â­â­

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
/*==================================================
    BAGIAN 2
    KERANJANG BELANJA
==================================================*/

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/*========================================
 UPDATE CART
========================================*/

function updateCart(){

    const cartCount = document.getElementById("cart-count");
    const cartList = document.getElementById("cartList");

    if(cartCount){
        cartCount.innerText = cart.reduce((a,b)=>a+b.qty,0);
    }

    if(!cartList) return;

    if(cart.length==0){

        cartList.innerHTML=`

        <div class="empty-cart">

            <h3>ðŸ›’ Keranjang masih kosong</h3>

            <p>Silakan pilih produk terlebih dahulu.</p>

        </div>

        `;

        return;

    }

    let html="";

    let total=0;

    cart.forEach(item=>{

        total += item.harga * item.qty;

        html +=`

<div class="cart-item">

<div>

<h4>${item.nama}</h4>

<p>

Rp ${item.harga.toLocaleString("id-ID")}

</p>

</div>

<div class="qty-box">

<button onclick="kurangQty(${item.id})">

âˆ’

</button>

<span>

${item.qty}

</span>

<button onclick="tambahQty(${item.id})">

+

</button>

</div>

<div>

<strong>

Rp ${(item.harga*item.qty).toLocaleString("id-ID")}

</strong>

</div>

<button class="hapus"

onclick="hapusProduk(${item.id})">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

    });

    html +=`

<hr>

<div class="cart-total">

<h2>

Total :

Rp ${total.toLocaleString("id-ID")}

</h2>

</div>

`;

    cartList.innerHTML=html;

    localStorage.setItem("cart",JSON.stringify(cart));

}

/*========================================
 TAMBAH KERANJANG
========================================*/

function tambahKeranjang(id){

    const item = produk.find(p=>p.id===id);

    if(!item) return;

    const ada = cart.find(p=>p.id===id);

    if(ada){

        ada.qty++;

    }else{

        cart.push({

            ...item,

            qty:1

        });

    }

    updateCart();

    showToast(item.nama + " ditambahkan");

}

/*========================================
 TAMBAH JUMLAH
========================================*/

function tambahQty(id){

    const item = cart.find(p=>p.id===id);

    if(item){

        item.qty++;

    }

    updateCart();

}

/*========================================
 KURANG JUMLAH
========================================*/

function kurangQty(id){

    const item = cart.find(p=>p.id===id);

    if(!item) return;

    item.qty--;

    if(item.qty<=0){

        cart = cart.filter(p=>p.id!==id);

    }

    updateCart();

}

/*========================================
 HAPUS PRODUK
========================================*/

function hapusProduk(id){

    cart = cart.filter(item=>item.id!==id);

    updateCart();

}

/*========================================
 TOAST
========================================*/

function showToast(text){

    let toast=document.getElementById("toast");

    if(!toast){

        toast=document.createElement("div");

        toast.id="toast";

        document.body.appendChild(toast);

    }

    toast.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

${text}

`;

    toast.classList.add("show-toast");

    setTimeout(()=>{

        toast.classList.remove("show-toast");

    },2500);

}

/*========================================
 LOAD CART
========================================*/

updateCart();
/*==================================================
    BAGIAN 3
    WISHLIST
==================================================*/

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

function updateWishlist(){

    const count = document.getElementById("wishlist-count");

    if(count){

        count.innerText = wishlist.length;

    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

}

function toggleWishlist(id){

    const item = produk.find(p => p.id === id);

    if(!item) return;

    const index = wishlist.findIndex(p => p.id === id);

    if(index > -1){

        wishlist.splice(index,1);

        showToast("Produk dihapus dari Wishlist");

    }else{

        wishlist.push(item);

        showToast("Produk ditambahkan ke Wishlist â¤ï¸");

    }

    updateWishlist();

}

updateWishlist();

/*==================================================
    CHECKOUT WHATSAPP
==================================================*/

const checkoutBtn = document.getElementById("checkoutWA");

if(checkoutBtn){

checkoutBtn.addEventListener("click",()=>{

if(cart.length===0){

alert("Keranjang masih kosong.");

return;

}

let pesan="Halo Admin RARA DRW SKINCARE%0A";
pesan+="Saya ingin memesan:%0A%0A";

let total=0;

cart.forEach(item=>{

pesan+=`${item.qty} x ${item.nama} - Rp ${item.harga.toLocaleString("id-ID")}%0A`;

total+=item.qty*item.harga;

});

pesan+=`%0ATotal : Rp ${total.toLocaleString("id-ID")}`;

const nomor="6281234567890"; // GANTI NOMOR ANDA

window.open(

`https://wa.me/${nomor}?text=${pesan}`,

"_blank"

);

});

}

/*==================================================
    SCROLL TO TOP
==================================================*/

const scrollBtn=document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

scrollBtn.style.display="block";

}else{

scrollBtn.style.display="none";

}

});

if(scrollBtn){

scrollBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}

/*==================================================
    ANIMASI SAAT SCROLL
==================================================*/

const reveal=document.querySelectorAll("section");

const revealObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

reveal.forEach(item=>{

revealObserver.observe(item);

});

/*==================================================
    PAGINATION
==================================================*/

const produkPerHalaman=12;

let halamanAktif=1;

function tampilHalaman(){

const mulai=(halamanAktif-1)*produkPerHalaman;

const akhir=mulai+produkPerHalaman;

const data=produk.slice(mulai,akhir);

tampilProduk(data);

buatPagination();

}

function buatPagination(){

let page=document.getElementById("pagination");

if(!page) return;

page.innerHTML="";

const jumlahHalaman=Math.ceil(produk.length/produkPerHalaman);

for(let i=1;i<=jumlahHalaman;i++){

page.innerHTML+=`

<button onclick="gantiHalaman(${i})">

${i}

</button>

`;

}

}

function gantiHalaman(no){

halamanAktif=no;

tampilHalaman();

window.scrollTo({

top:650,

behavior:"smooth"

});

}

if(document.getElementById("pagination")){

tampilHalaman();

}

/*==================================================
    SELESAI
==================================================*/
