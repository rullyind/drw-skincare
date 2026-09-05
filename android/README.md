# Mbicuki Catur — Android

Project Android ini disiapkan untuk membungkus `chess.html` menggunakan Capacitor.

## Target
- App ID: `site.mbicuki.catur`
- App name: `Mbicuki Catur`
- Web source: root repository (`chess.html`)
- Online game: Firebase Realtime Database

## Build lokal

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Setelah Android Studio terbuka:
1. Tunggu Gradle selesai.
2. Jalankan di emulator/perangkat Android untuk pengujian.
3. Untuk Google Play gunakan **Build > Generate Signed Bundle / APK > Android App Bundle**.
4. Upload file `.aab` ke Google Play Console.

Jangan memasukkan ke repository: keystore, password signing, `google-services.json` yang berisi konfigurasi khusus jika tidak diperlukan, atau secret lain.
