# Panduan Penggunaan Kurva Pertumbuhan SEHA+

Dokter fokus ke pasien. Sisanya biar SEHA yang urus.

Dokumen ini disusun khusus bagi Dokter untuk memahami cara paling efisien menggunakan modul Kurva Pertumbuhan Anak di SEHA+. Sistem ini dirancang untuk mengurangi beban kognitif Dokter, mengotomasi hal yang repetitif, dan memberikan visibilitas langsung terhadap status tumbuh kembang anak.

---

## 1. Standar Pertumbuhan Otomatis (Smart Auto-Switch)

Dokter tidak perlu lagi mempertimbangkan kurva standar apa yang harus dipakai; sistem akan mendeteksinya dari usia pasien:

- **Usia 0 – 5 tahun (< 60 bulan): Otomatis Kurva WHO**
  Menggunakan perhitungan standar LMS (Z-Score) sesuai panduan keselamatan tumbuh kembang bayi hingga anak prasekolah.
- **Usia di atas 5 tahun (> 60 bulan): Otomatis Kurva CDC**
  Kurva akan langsung menyesuaikan dengan persentil standar CDC yang berlaku hingga usia 20 tahun.

*Fleksibilitas*: Jika Dokter karena alasan medis tertentu ingin merubah kurva secara manual, klik pilihan tombol standar di atas kanan grafik: **[ WHO ]**, **[ CDC ]**, atau biarkan di mode **[ AUTO ]**.

---

## 2. Fungsi & Fitur Utama

Sistem ini didesain interaktif namun tetap *calm*. Semua informasi siap diakses tanpa harus terlalu banyak klik.

### A. Metrik Pertumbuhan (Weight, Height, BMI)

Terdapat tiga tombol tab di bagian atas grafik. Klik salah satu untuk berpindah sudut pandang evaluasi secara instan:

- **Weight**: Evaluasi berat badan anak (kg).
- **Height**: Evaluasi tinggi/panjang badan anak (cm).
- **BMI**: Indeks Massa Tubuh untuk mengevaluasi komposisi (kg/m²).
- **Lingkar Kepala (LK)**: Evaluasi pertumbuhan lingkar kepala anak (cm) berdasarkan kurva standar.

### B. Evaluasi Akurat (Hover Insight)

Dokter tidak perlu lagi menarik garis imajiner memakai penggaris.
Cukup arahkan kursor (hover) atau sentuh titik kunjungan pada grafik. Sistem akan otomatis menampilkan:

- Angka presisi dari ukuran anak di usia tersebut.
- Parameter persentil.
- **Nilai Z-Score pasti** (contoh: *+1.2 SD*).

### C. Indikator "Status Terkini"

SEHA+ membantu mensortir pasien yang butuh pengawasan ekstra.
Di bagian bawah kurva terdapat status kesimpulan cepat:

- **Optimal (Hijau)**: Pertumbuhan di jalur normal (Z-Score di rentang antara -2 hingga +2).
- **Perlu Perhatian (Merah)**: Pasien masuk ke "Danger Zone", secara empiris berada < -2 SD (indikasi *stunting/wasting*) atau > +2 SD (indikasi obesitas/overweight).

### D. Riwayat Tiga Kunjungan Terakhir

Daripada harus membuka tab riwayat secara terpisah, riwayat 3 pemeriksaan terakhir pasien ditampilkan rapi di panel bawah. Ini sangat menguntungkan untuk membandingkan lonjakan atau stagnansi pada masa pertumbuhan secara cepat.

### E. Fitur Cetak Kurva (Print Preview CDC)

Khusus untuk kurva standar CDC (sesuai standar arsip / komunikasi yang lebih sering diekspor), tersedia tombol **🖨️ Cetak**. Fungsi ini dapat Dokter gunakan untuk mengekspor status pertumbuhan visual ke format cetak / PDF untuk dijelaskan kepada orangtua dengan lebih mudah.

---

## 3. Khusus: Pemantauan Lingkar Kepala (Kurva Nellhaus)

Aplikasi SEHA+ kini mendukung pemantauan **Lingkar Kepala (LK)** menggunakan standar **Kurva Nellhaus (1968)** dari lahir hingga **usia 10 tahun (120 bulan)**.

*   **Pentingnya Kurva Nellhaus**: Standard WHO hanya mendukung pemantauan LK hingga usia 5 tahun, sedangkan CDC membatasi hingga 3 tahun. Kurva Nellhaus diintegrasikan untuk memberikan kesinambungan pemantauan hingga usia 10 tahun sesuai rekomendasi IDAI.
*   **Interpretasi Klinis**:
    *   **Normal**: Z-score di rentang $-2$ hingga $+2$ SD.
    *   **Mikrosefali (Microcephaly)**: Z-score $< -2$ SD. Menandakan ukuran lingkar kepala yang lebih kecil dari rata-rata seusianya, yang dapat mendeteksi adanya keterlambatan perkembangan volume otak.
    *   **Makrosefali (Macrocephaly)**: Z-score $> +2$ SD. Menandakan ukuran kepala yang lebih besar dari normal (risiko hidrosefalus atau variasi genetik).
*   **Kasus Khusus (misal: Cerebral Palsy)**: Pemantauan lingkar kepala pada anak dengan *Cerebral Palsy* (CP) tetap dirujuk ke kurva Nellhaus standar ini untuk memantau deviasi tumbuh kembang (seperti mikrosefali akibat keterbatasan perkembangan volume otak, atau makrosefali akibat hidrosefalus) secara dini.

---

*Dengan SEHA+, mari habiskan lebih banyak waktu berdampingan dengan anak dan orangtua, dan lebih sedikit waktu bernegosiasi dengan sistem.*
