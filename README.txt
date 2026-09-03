# RARA CHESS ONLINE — Firebase

## Isi folder
- chess.html
- chess.css
- chess.js
- firebase-config.js
- firebase-rules.json

## 1. Firebase
Firebase Console → Project Anda → Add app / Web app.
Salin konfigurasi Web App ke `firebase-config.js`.

Realtime Database harus dibuat. Firebase menyatakan Realtime Database menyinkronkan JSON secara realtime ke klien yang terhubung.

## 2. Rules
Untuk uji coba, import isi `firebase-rules.json` ke Realtime Database → Rules → Publish.

PERINGATAN: Rules demo ini membuka room untuk pengujian. Sebelum dipakai publik, wajib diperketat dengan Firebase Authentication + validasi server/rules.

## 3. Jalankan
Jangan membuka `chess.html` dengan double-click file://.
Gunakan VS Code Live Server atau hosting HTTPS.

## 4. Main
1. Buka chess.html.
2. Isi nama.
3. Klik Buat Room.
4. Salin undangan.
5. Buka link di perangkat/browser lain.
6. Isi nama pemain kedua.
7. Klik Gabung.

## Catatan
Versi ini memakai chess.js 1.4.0 untuk validasi gerakan dan status permainan, dan Firebase Realtime Database untuk sinkronisasi real-time.

Untuk produksi, tambahkan Firebase Authentication, rules per-user, transaksi/anti-cheat server-side, reconnect handling yang lebih ketat, matchmaking, rematch, dan timer berbasis server.
