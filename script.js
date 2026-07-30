// ======================================
// DRW SKINCARE
// Premium JavaScript
// ======================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

//===============================
// Saat Website Dibuka
//===============================

window.onload = function () {

    updateCart();

}

//===============================
// Tambah Keranjang
//===============================

function tambahKeranjang(nama, harga){

    cart.push({
        nama:nama,
        harga:harga
    });

    localStorage.setItem("cart",JSON.stringify(cart));

    updateCart();

    showToast("Produk berhasil ditambahkan 🛒");

}

//===============================
// Update Keranjang
//===============================

function updateCart(){

    const count=document.getElementById("cart-count");

    const list=document.getElementById("cartList");

    if(count){

        count.innerHTML=cart.length;

    }

    if(!list) return;

    if(cart.length==0){

        list.innerHTML="Belum ada produk.";

        return;

    }

    let html="";

    let total=0;

    cart.forEach((item,index)=>{

        total+=item.harga;

        html+=`

        <div class="cart-item">

            <div>

                <h3>${item.nama}</h3>

                <p>Rp ${item.harga.toLocaleString("id-ID")}</p>

            </div>

            <button onclick="hapusProduk(${index})">

                ❌

            </button>

        </div>

        `;

    });

    html+=`

        <hr>

        <h2>

        Total

        </h2>

        <h3 style="color:#ff2d75">

        Rp ${total.toLocaleString("id-ID")}

        </h3>

    `;

    list.innerHTML=html;

}

//===============================
// Hapus Produk
//===============================

function hapusProduk(index){

    cart.splice(index,1);

    localStorage.setItem("cart",JSON.stringify(cart));

    updateCart();

}

//===============================
// Checkout WhatsApp
//===============================

const checkout=document.querySelector(".checkout-btn");

if(checkout){

checkout.addEventListener("click",function(){

    if(cart.length==0){

        alert("Keranjang masih kosong.");

        return;

    }

    let pesan="Halo Admin RARA DRW SKINCARE%0A%0A";

    pesan+="Saya ingin memesan:%0A";

    let total=0;

    cart.forEach(item=>{

        pesan+=`• ${item.nama} - Rp${item.harga.toLocaleString("id-ID")}%0A`;

        total+=item.harga;

    });

    pesan+=`%0ATotal : Rp${total.toLocaleString("id-ID")}`;

    // Ganti nomor berikut dengan nomor WhatsApp Anda
    window.open(

"https://wa.me/6282381432222?text="+pesan,

"_blank"

);

});

}

//===============================
// Header Glow Saat Scroll
//===============================

window.addEventListener("scroll",function(){

    const header=document.querySelector("header");

    if(window.scrollY>50){

        header.style.background="rgba(255,255,255,.95)";

        header.style.boxShadow="0 10px 30px rgba(0,0,0,.15)";

    }

    else{

        header.style.background="rgba(255,255,255,.75)";

        header.style.boxShadow="none";

    }

});

//===============================
// Animasi Scroll
//===============================

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".card,.box,.testi").forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});

//===============================
// Toast Notification
//===============================

function showToast(text){

let toast=document.createElement("div");

toast.className="toast";

toast.innerHTML=text;

document.body.appendChild(toast);

setTimeout(()=>{

toast.classList.add("showToast");

},100);

setTimeout(()=>{

toast.remove();

},3000);

}

//===============================
// Hero Floating Animation
//===============================

const hero=document.querySelector(".hero-image img");

if(hero){

setInterval(()=>{

hero.style.transform="translateY(-10px)";

setTimeout(()=>{

hero.style.transform="translateY(0px)";

},1500);

},3000);

}
