/* =========================================================
   RARA DRW SKINCARE
   AUTH SYSTEM - FINAL
   LOGIN + REGISTER
   ROLE / PRICE LEVEL
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STORAGE KEY
    ===================================================== */

    const USERS_KEY = "raraDrwUsers";

    const CURRENT_USER_KEY = "raraDrwCurrentUser";


    /* =====================================================
       DEFAULT USER
       UNTUK TESTING
    ===================================================== */

    const DEFAULT_USERS = [

        {
            id: "director-demo",

            name: "Director",

            email: "director@raradrwskincare.site",

            phone: "080000000001",

            password: "director123",

            role: "Director"

        },

        {
            id: "manager-demo",

            name: "Manager",

            email: "manager@raradrwskincare.site",

            phone: "080000000002",

            password: "manager123",

            role: "Manager"

        },

        {
            id: "supervisor-demo",

            name: "Supervisor",

            email: "supervisor@raradrwskincare.site",

            phone: "080000000003",

            password: "supervisor123",

            role: "Supervisor"

        },

        {
            id: "reseller-demo",

            name: "Reseller",

            email: "reseller@raradrwskincare.site",

            phone: "080000000004",

            password: "reseller123",

            role: "Reseller"

        },

        {
            id: "umum-demo",

            name: "Customer Umum",

            email: "umum@raradrwskincare.site",

            phone: "080000000005",

            password: "umum123",

            role: "Umum"

        }

    ];


    /* =====================================================
       GET USERS
    ===================================================== */

    function getUsers() {

        try {

            const saved = localStorage.getItem(USERS_KEY);

            if (!saved) {

                localStorage.setItem(
                    USERS_KEY,
                    JSON.stringify(DEFAULT_USERS)
                );

                return DEFAULT_USERS;

            }

            const users = JSON.parse(saved);

            if (!Array.isArray(users)) {

                localStorage.setItem(
                    USERS_KEY,
                    JSON.stringify(DEFAULT_USERS)
                );

                return DEFAULT_USERS;

            }

            return users;

        } catch (error) {

            console.error(
                "Gagal membaca users:",
                error
            );

            return DEFAULT_USERS;

        }

    }


    /* =====================================================
       SAVE USERS
    ===================================================== */

    function saveUsers(users) {

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );

    }


    /* =====================================================
       GET CURRENT USER
    ===================================================== */

    function getCurrentUser() {

        try {

            const saved =
                localStorage.getItem(
                    CURRENT_USER_KEY
                );

            if (!saved) {
                return null;
            }

            return JSON.parse(saved);

        } catch {

            return null;

        }

    }


    /* =====================================================
       SET CURRENT USER
    ===================================================== */

    function setCurrentUser(user) {

        localStorage.setItem(

            CURRENT_USER_KEY,

            JSON.stringify({

                id: user.id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            })

        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        window.location.href = "index.html";

    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type = "error"
    ) {

        const box =
            document.getElementById(
                "authMessage"
            );

        if (!box) {
            return;
        }

        box.textContent = message;

        box.className =
            "auth-message " + type;

    }


    /* =====================================================
       REGISTER
    ===================================================== */

    const registerForm =
        document.getElementById(
            "registerForm"
        );


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "registerName"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "registerEmail"
                        )
                        .value
                        .trim()
                        .toLowerCase();


                const phone =
                    document
                        .getElementById(
                            "registerPhone"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "registerPassword"
                        )
                        .value;


                const confirmPassword =
                    document
                        .getElementById(
                            "registerPasswordConfirm"
                        )
                        .value;


                /* VALIDASI */

                if (
                    !name ||
                    !email ||
                    !phone ||
                    !password
                ) {

                    showMessage(
                        "Semua data wajib diisi."
                    );

                    return;

                }


                if (password.length < 6) {

                    showMessage(
                        "Password minimal 6 karakter."
                    );

                    return;

                }


                if (
                    password !==
                    confirmPassword
                ) {

                    showMessage(
                        "Konfirmasi password tidak sama."
                    );

                    return;

                }


                const users = getUsers();


                const existingUser =
                    users.find(
                        user =>
                            user.email === email
                    );


                if (existingUser) {

                    showMessage(
                        "Email sudah terdaftar. Silakan login."
                    );

                    return;

                }


                /* =========================================
                   AKUN BARU
                   DEFAULT = UMUM
                ========================================= */

                const newUser = {

                    id:
                        "user-" +
                        Date.now(),

                    name,

                    email,

                    phone,

                    password,

                    role: "Umum"

                };


                users.push(newUser);


                saveUsers(users);


                showMessage(
                    "Pendaftaran berhasil. Mengarahkan ke halaman login...",
                    "success"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?registered=1";

                    },
                    1200
                );

            }
        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const email =
                    document
                        .getElementById(
                            "loginEmail"
                        )
                        .value
                        .trim()
                        .toLowerCase();


                const password =
                    document
                        .getElementById(
                            "loginPassword"
                        )
                        .value;


                const users = getUsers();


                const user =
                    users.find(
                        item =>
                            item.email === email &&
                            item.password === password
                    );


                if (!user) {

                    showMessage(
                        "Email atau password salah."
                    );

                    return;

                }


                /* SIMPAN LOGIN */

                setCurrentUser(user);


                showMessage(
                    "Login berhasil. Selamat datang " +
                    user.name +
                    "!",
                    "success"
                );


                /* =========================================
                   MASUK KE HALAMAN SEBELUMNYA
                ========================================= */

                const params =
                    new URLSearchParams(
                        window.location.search
                    );


                const redirect =
                    params.get("redirect");


                setTimeout(
                    function () {

                        if (
                            redirect &&
                            redirect.startsWith(
                                "/"
                            ) === false
                        ) {

                            window.location.href =
                                redirect;

                        } else {

                            window.location.href =
                                "index.html";

                        }

                    },
                    700
                );

            }
        );

    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    const togglePassword =
        document.getElementById(
            "toggleLoginPassword"
        );


    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                const input =
                    document.getElementById(
                        "loginPassword"
                    );


                if (
                    input.type ===
                    "password"
                ) {

                    input.type = "text";

                    this.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                } else {

                    input.type = "password";

                    this.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';

                }

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.DRW_AUTH = {

        getUsers,

        getCurrentUser,

        setCurrentUser,

        logout

    };


})();