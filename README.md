# RUANG AMAN — Website Anti Bullying

Website edukasi anti-perundungan milik **Kelompok 3 — XI PPLG 1**, menggunakan HTML, CSS, dan JavaScript tanpa framework. Setiap fitur berada pada halaman sendiri.

## Isi project

- `index.html` — halaman beranda dan daftar fitur.
- `edukasi.html` — pengenalan bullying.
- `angket.html` — angket manual dan digital.
- `laporan.html` — pembuatan draf laporan.
- `tindakan.html` — langkah penanganan.
- `punishment.html` — pembinaan dan konsekuensi.
- `hukum.html` — pembaca pasal langsung dalam website.
- `kelompok.html` — daftar Kelompok 3 XI PPLG 1 (11 orang).
- `styles.css` — desain, animasi, dan tampilan responsif.
- `app.js` — fungsi angket digital, formulir laporan, dan interaksi.
- `members.js` — daftar 11 nama anggota kelompok.

## Cara menggunakan

1. Ekstrak semua isi ZIP ke satu folder.
2. Buka `index.html` di browser, lalu pindah halaman melalui menu navigasi. Tidak perlu instalasi tambahan.
3. Website bisa dipakai secara lokal. Koneksi internet diperlukan untuk memuat font Google; tanpa internet akan memakai font bawaan.

## Mengganti 11 nama anggota

Buka file `members.js` dengan editor teks. Ganti sebelas tulisan `Nama Anggota 01` sampai `Nama Anggota 11` dengan nama Kelompok 3 yang benar, misalnya:

```js
{ name: "Nama Siswa" },
```

Simpan file, lalu refresh browser. Jangan menghapus koma pemisah antar anggota.

## Penting tentang formulir

- Angket digital berisi 8 pertanyaan. Ringkasannya bisa disalin atau diunduh sebagai TXT.
- Formulir laporan menghasilkan draf TXT yang bisa diberikan langsung kepada guru BK atau pihak sekolah.
- Website ini **tidak** mengirim data ke server dan **belum** memiliki dashboard guru/admin. Jangan mengira tombol unduh sama dengan mengirim laporan.
- Untuk pemakaian resmi di sekolah, sediakan prosedur pelaporan, kontrol akses, dan pengelolaan privasi sebelum menambah penyimpanan data atau fitur pengiriman.

## Informasi hukum

Halaman `hukum.html` menampilkan bunyi Pasal 46 UU ITE (ketentuan historis), Pasal 332 KUHP yang telah disesuaikan pada 2026, dan ringkasan Permendikdasmen No. 6/2026. Teks hukum dapat dibaca langsung di website. Ini bukan panduan untuk menentukan hukuman otomatis.

**Source code tidak ditampilkan sebagai menu atau tombol unduhan di website.** File ZIP hanya dibagikan secara terpisah kepada pemilik proyek.

Sumber resmi:

- KUHP (UU 1/2023): https://peraturan.bpk.go.id/Details/234935/uu-no-1-tahun-2023
- Penyesuaian Pidana (UU 1/2026): https://peraturan.bpk.go.id/Download/400929/UU%20Nomor%201%20Tahun%202026.pdf
- Permendikdasmen 6/2026: https://peraturan.bpk.go.id/Details/345185/permendikdasmen-no-6-tahun-2026
- UU ITE (perubahan 2024): https://jdih.komdigi.go.id/produk_hukum/view/id/884/t/undangundang%20nomor%201%20tahun%202024

---

Ruang Aman — © 2026. Untuk kegiatan edukasi anti-bullying.
