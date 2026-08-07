/* =========================================================
   RARA DRW SKINCARE
   LOGIN SYSTEM — FINAL
   =========================================================

   LEVEL:
   Director
   Manager
   Supervisor
   Reseller
   Umum

   TERHUBUNG DENGAN:
   price-level.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CEK PRICE LEVEL SYSTEM
    ===================================================== */

    if (
        typeof setPriceLevel !== "function" ||
        typeof getPriceLevel !== "function"
    ) {

        console.error(
            "price-level.js belum dimuat!"
        );

        return;

    }


    /* =====================================================
       AKUN MEMBER
       
       CATATAN:
       Ini hanya demo/client-side.
       Untuk keamanan produksi gunakan backend/database.
    ===================================================== */

    const DRW_USERS = {

        director: {

            username: "director",

            password: "drw2026",

            level: "director",

            name: "Director"

        },


        manager: {

            username: "manager",

            password: "drw2026",

            level: "manager",

            name: "Manager"

        },


        supervisor: {

            username: "supervisor",

            password: "drw2026",

            level: "supervisor",

            name: "Supervisor"

        },


        reseller: {

            username: "reseller",

            password: "drw2026",

            level: "reseller",

            name: "Reseller"

        },


        umum: {

            username: "umum",

            password: "drw2026",

            level: "umum",

            name: "Umum"

        }

    };


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    const usernameInput =
        document.getElementById(
            "username"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const rememberInput =
        document.getElementById(
            "rememberMe"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    const togglePassword =
        document.getElementById(
            "togglePassword"
        );


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type = "error"
    ) {

        if (!loginMessage) {

            return;

        }


        loginMessage.textContent =
            message;


        loginMessage.className =
            "login-message " + type;


        loginMessage.hidden =
            false;

    }


    /* =====================================================
       HIDE MESSAGE
    ===================================================== */

    function hideMessage() {

        if (!loginMessage) {

            return;

        }


        loginMessage.hidden =
            true;

    }


    /* =====================================================
       SAVE LOGIN
    ===================================================== */

    function saveLogin(
        user
    ) {

        const loginData = {

            username:
                user.username,

            name:
                user.name,

            level:
                user.level,

            loggedIn:
                true,

            loginTime:
                Date.now()

        };


        localStorage.setItem(

            "drwUser",

            JSON.stringify(
                loginData
            )

        );


        /*
           INI YANG MENGUBAH LEVEL HARGA
        */

        setPriceLevel(
            user.level
        );

    }


    /* =====================================================
       FIND USER
    ===================================================== */

    function findUser(
        username,
        password
    ) {

        const users =
            Object.values(
                DRW_USERS
            );


        return users.find(

            function (user) {

                return (

                    user.username
                        .toLowerCase() ===
                    username
                        .toLowerCase()

                    &&

                    user.password ===
                    password

                );

            }

        );

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    function login(
        username,
        password
    ) {

        const user =
            findUser(
                username,
                password
            );


        if (!user) {

            showMessage(

                "Username atau password tidak benar."

            );

            return false;

        }


        saveLogin(
            user
        );


        showMessage(

            "Login berhasil sebagai " +
            user.name +
            ". Mengalihkan...",

            "success"

        );


        if (loginButton) {

            loginButton.classList.add(
                "loading"
            );

            loginButton.querySelector(
                "span"
            ).textContent =
                "Berhasil...";

        }


        setTimeout(

            function () {

                window.location.href =
                    "products.html";

            },

            700

        );


        return true;

    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(

            "submit",

            function (event) {

                event.preventDefault();


                hideMessage();


                const username =
                    usernameInput
                        ? usernameInput.value.trim()
                        : "";


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (!username) {

                    showMessage(
                        "Silakan masukkan username."
                    );

                    usernameInput?.focus();

                    return;

                }


                if (!password) {

                    showMessage(
                        "Silakan masukkan password."
                    );

                    passwordInput?.focus();

                    return;

                }


                login(
                    username,
                    password
                );

            }

        );

    }


    /* =====================================================
       SHOW / HIDE PASSWORD
    ===================================================== */

    if (togglePassword) {

        togglePassword.addEventListener(

            "click",

            function () {

                const isPassword =
                    passwordInput.type ===
                    "password";


                passwordInput.type =
                    isPassword
                        ? "text"
                        : "password";


                const icon =
                    togglePassword.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        isPassword
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye";

                }

            }

        );

    }


    /* =====================================================
       AUTO LOGIN CHECK
    ===================================================== */

    function checkExistingLogin() {

        const userData =
            localStorage.getItem(
                "drwUser"
            );


        if (!userData) {

            return;

        }


        try {

            const user =
                JSON.parse(
                    userData
                );


            if (
                user &&
                user.loggedIn &&
                user.level
            ) {

                setPriceLevel(
                    user.level
                );

            }

        } catch (error) {

            localStorage.removeItem(
                "drwUser"
            );

        }

    }


    checkExistingLogin();


    /* =====================================================
       GLOBAL LOGOUT
    ===================================================== */

    window.drwLogout =
        function () {

            localStorage.removeItem(
                "drwUser"
            );


            setPriceLevel(
                "umum"
            );


            window.location.href =
                "index.html";

        };


    /* =====================================================
       GLOBAL USER
    ===================================================== */

    window.getDRWUser =
        function () {

            const data =
                localStorage.getItem(
                    "drwUser"
                );


            if (!data) {

                return null;

            }


            try {

                return JSON.parse(
                    data
                );

            } catch {

                return null;

            }

        };


    console.log(
        "RARA DRW SKINCARE — LOGIN SYSTEM ✓"
    );

})();