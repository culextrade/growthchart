# Dokumentasi Pembaruan SEHA+: Integrasi Kurva Lingkar Kepala Nellhaus (Hingga Usia 10 Tahun)

Dokumen ini menjelaskan pembaruan fitur pemantauan **Lingkar Kepala (LK) / Head Circumference** pada aplikasi SEHA+, yang dirancang untuk mendukung klinisi dalam memantau pertumbuhan volume otak anak secara akurat hingga **usia 10 tahun (120 bulan)** menggunakan **Kurva Nellhaus (1968)**.

---

## 1. Latar Belakang Klinis

Pemantauan lingkar kepala sangat penting pada masa bayi dan kanak-kanak untuk mendeteksi gangguan neurologis dan pertumbuhan otak secara dini. 
*   **WHO Growth Charts** hanya menyediakan referensi lingkar kepala hingga usia **5 tahun (60 bulan)**.
*   **CDC Growth Charts** membatasi grafik lingkar kepala hingga usia **3 tahun (36 bulan)**.

Untuk memberikan kesinambungan klinis dalam pemantauan anak yang lebih besar (sesuai rekomendasi Ikatan Dokter Anak Indonesia / IDAI), SEHA+ kini mengintegrasikan **Kurva Nellhaus (1968)** (Composite International & Interracial Graphs) yang mendukung pemantauan secara mulus sejak lahir hingga **usia 10 tahun (120 bulan)**.

---

## 2. Rincian Pembaruan Fitur

### A. Perluasan Rentang Usia Pemantauan
*   **Sebelumnya**: Pemantauan lingkar kepala dibatasi hingga usia 5 tahun (60 bulan) menggunakan kurva WHO. Pengukuran di atas 60 bulan akan ditandai *"Tidak Terklasifikasi"*.
*   **Sekarang**: Aplikasi mendukung input data, kalkulasi Z-score, dan plotting grafik lingkar kepala anak laki-laki dan perempuan sejak lahir (0 bulan) hingga **10 tahun (120 bulan)** secara penuh.

### B. Otomasi Perhitungan Z-Score Nellhaus (LMS Engine)
Aplikasi mengonversi parameter Mean ($\mu$) dan Standar Deviasi ($\sigma$) resmi dari Nellhaus ke dalam mesin kalkulasi LMS:
*   $L = 1.0$ (Menunjukkan sebaran data normal/simetris).
*   $M = \text{Mean}$ (Nilai median/persentil ke-50 lingkar kepala menurut Nellhaus).
*   $S = \text{SD} / \text{Mean}$ (Koefisien variasi sebaran data).

Perhitungan Z-Score dilakukan secara presisi dengan formula:
$$Z = \frac{\text{Lingkar Kepala Riil} - \text{Mean Nellhaus}}{\text{SD Nellhaus}}$$

### C. Klasifikasi Status Lingkar Kepala
Hasil z-score Nellhaus dikelompokkan ke dalam tiga kategori klinis:
1.  **Normal**: Z-score berada di rentang $-2$ SD hingga $+2$ SD.
2.  **Mikrosefali (Microcephaly)**: Z-score $< -2$ SD. Menunjukkan volume kepala secara signifikan lebih kecil dari rata-rata seusianya, yang mengindikasikan adanya keterbatasan perkembangan otak.
3.  **Makrosefali (Macrocephaly)**: Z-score $> +2$ SD. Menunjukkan volume kepala secara signifikan lebih besar dari rata-rata seusianya (perlu dievaluasi untuk menyingkirkan risiko hidrosefalus).

---

## 3. Panduan untuk Kasus Khusus (Cerebral Palsy)

Anak dengan **Cerebral Palsy (CP)** sering kali memiliki pola pertumbuhan lingkar kepala yang berbeda dari anak normal karena adanya cedera otak bawaan atau acquired.
*   **Standar Pembanding**: Meskipun terdapat kurva berat badan/tinggi badan khusus untuk CP (seperti kurva *Brooks et al.*), **tidak ada kurva lingkar kepala khusus untuk Cerebral Palsy**. 
*   **Aplikasi Klinis**: Dokter spesialis anak tetap merujuk lingkar kepala anak CP ke kurva standar (Nellhaus) ini. Deviasi lingkar kepala di bawah $-2$ SD membantu mendokumentasikan mikrosefali sekunder, sementara deviasi di atas $+2$ SD membantu mendeteksi risiko komplikasi hidrosefalus secara dini untuk penanganan neurosurgikal segera.

---

## 4. Cara Penggunaan di Aplikasi

1.  **Perekaman Data**: Pada halaman profil pasien, masukkan nilai Lingkar Kepala dalam satuan centimeter (cm) pada form pemeriksaan (misal: `48.5`).
2.  **Melihat Status Rekam Medis**: Sistem akan langsung menampilkan status interpretasi Nellhaus di bagian ringkasan pemeriksaan (contoh: **Normal**, **Mikrosefali**, atau **Makrosefali**) lengkap dengan nilai Z-score presisi (contoh: `Z-Score: -1.05 SD (Standar Kurva Nellhaus)`).
3.  **Membaca Grafik Pertumbuhan**:
    *   Buka tab **Lingkar Kepala (LK)** pada bagian grafik pertumbuhan.
    *   Jika anak berusia di atas 5 tahun, sumbu X grafik akan otomatis memanjang hingga usia 10 tahun (120 bulan) dengan menampilkan kurva standar deviasi Nellhaus.
    *   Arahkan kursor (*hover*) pada titik pengukuran pasien untuk membaca Z-score dan persentil pasti pada kunjungan tersebut.
