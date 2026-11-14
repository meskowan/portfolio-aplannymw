# Portfolio publik + Admin Firebase

Website portofolio React + Vite. Pengunjung dapat melihat project tanpa login. Admin masuk dengan Firebase Authentication, lalu menambah/menghapus project; data disimpan di Firestore dan gambar cover di Firebase Storage.

## 1. Jalankan di komputer
1. Install Node.js versi LTS.
2. Ekstrak folder ini, buka terminal di folder `portfolio-firebase`.
3. Jalankan `npm install` lalu `npm run dev`.
4. Salin `.env.example` menjadi `.env` dan isi konfigurasi Firebase (lihat langkah Firebase di bawah).

## 2. Buat Firebase
1. Buka https://console.firebase.google.com/ lalu **Add project**.
2. Di Project Overview klik ikon Web `</>` untuk mendaftarkan aplikasi web. Salin konfigurasi Firebase ke file `.env` dengan awalan `VITE_` seperti contoh.
3. Buka **Authentication → Get started → Sign-in method**, aktifkan **Email/Password**.
4. Buka **Authentication → Users → Add user**. Buat satu akun admin dengan email dan password kuat. Jangan membuat fitur pendaftaran publik.
5. Buka **Firestore Database → Create database**. Setelah dibuat, buka tab **Rules**, tempel isi `firestore.rules`, ganti `GANTI_DENGAN_EMAIL_ADMIN_ANDA` dengan email admin, lalu **Publish**.
6. Buka **Storage → Get started**. Buka tab **Rules**, tempel isi `storage.rules`, ganti email admin yang sama, lalu **Publish**.
7. Isi `VITE_ADMIN_EMAIL` di `.env` dengan email admin yang sama. Jangan masukkan password ke `.env` atau GitHub.

## 3. Upload ke GitHub
1. Buat repository baru di https://github.com/new (misalnya `portfolio-saya`).
2. Pastikan file `.env` tidak diunggah. File `.env.example` aman sebagai template; jangan pernah commit API secret server atau password.
3. Dari terminal folder project jalankan:

```bash
git init
git add .
git commit -m "Buat website portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/portfolio-saya.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

## 4. Deploy gratis dengan Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Di folder project jalankan `firebase init hosting` dan pilih project Firebase yang sama.
4. Pilih `dist` sebagai public directory, pilih **Configure as a single-page app: Yes**, jangan overwrite `index.html`.
5. Build: `npm run build`
6. Deploy: `firebase deploy --only hosting`

Jika diminta konfigurasi hosting, pastikan `firebase.json` berisi:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## 5. Catatan penting
- Website publik hanya membaca daftar project. Operasi tulis/hapus hanya diizinkan untuk email admin yang ditetapkan pada kedua Rules.
- `VITE_*` adalah konfigurasi frontend, bukan tempat menyimpan password. Keamanan data ditentukan oleh Firebase Security Rules.
- Profil sudah dipersonalisasi untuk Aplannymw (Web Developer, IT) dengan tautan GitHub https://github.com/Aplannymw. Jika username GitHub Anda berbeda, ubah tautan tersebut di `src/main.jsx`.
- Jika mengganti email admin, ubah juga `.env` dan kedua file Rules, lalu deploy ulang.
