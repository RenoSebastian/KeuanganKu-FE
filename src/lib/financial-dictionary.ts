import { HelpContent } from "./types";

export const FINANCIAL_HELP_DATA: Record<string, HelpContent> = {
  // ==========================================
  // 1. DATA PRIBADI & PROFIL
  // ==========================================
  
  "userProfile.childrenCount": {
    title: "Jumlah Anak (Tanggungan)",
    definition: "Jumlah anak yang biaya hidup & pendidikannya masih Anda tanggung sepenuhnya.",
    excludes: ["Anak yang sudah bekerja", "Anak yang sudah menikah"],
    example: "Jika punya 3 anak, tapi anak pertama sudah kerja, isi 2."
  },
  "userProfile.dependentParents": {
    title: "Tanggungan Orang Tua",
    definition: "Jumlah orang tua/mertua yang rutin Anda biayai hidupnya setiap bulan.",
    includes: ["Orang tua kandung", "Mertua"],
    example: "Jika Anda rutin kirim uang bulanan untuk Ibu di kampung, hitung 1."
  },
  "spouseProfile.childrenCount": { // Fallback jika diperlukan
    title: "Jumlah Anak",
    definition: "Sama dengan data anak di profil kepala keluarga."
  },

  // ==========================================
  // 2. ASET (HARTA) - STOCK
  // ==========================================
  
  // --- A. Aset Likuid ---
  assetCash: {
    title: "Kas & Setara Kas",
    definition: "Uang tunai atau saldo di bank yang bisa diambil kapan saja (likuid) untuk kebutuhan mendesak.",
    includes: ["Uang tunai di dompet/brankas", "Saldo Tabungan / ATM", "Saldo E-Wallet (GoPay, OVO, ShopeePay)", "Deposito cair sewaktu-waktu (tanpa penalti)"],
    excludes: ["Deposito berjangka yang terkunci", "Uang yang dipinjam teman"],
    example: "Jika butuh uang jam 12 malam ini karena darurat, berapa total uang yang bisa Anda akses?"
  },

  // --- B. Aset Personal (Guna Pakai) ---
  assetHome: {
    title: "Rumah Tinggal",
    definition: "Nilai pasar (market value) rumah dan tanah yang saat ini Anda tempati sebagai tempat tinggal utama.",
    includes: ["Rumah Tapak", "Apartemen unit tinggal"],
    excludes: ["Rumah kedua yang disewakan (masuk Aset Investasi)", "Kos-kosan (masuk Aset Investasi)"],
    example: "Jika rumah Anda dijual hari ini, kira-kira laku di harga berapa?"
  },
  assetVehicle: {
    title: "Kendaraan Pribadi",
    definition: "Nilai jual kendaraan yang dipakai sehari-hari untuk mobilitas, bukan untuk bisnis.",
    includes: ["Mobil pribadi", "Motor pribadi", "Sepeda mahal"],
    excludes: ["Mobil box operasional kantor", "Truk angkutan bisnis"],
    example: "Cek harga pasaran mobil/motor bekas Anda di marketplace saat ini."
  },
  assetJewelry: {
    title: "Perhiasan & Aksesoris",
    definition: "Barang berharga yang dipakai menempel di badan atau disimpan sebagai koleksi pribadi.",
    includes: ["Cincin/Kalung emas perhiasan", "Jam tangan mewah (Rolex, Patek, dll)", "Tas branded dengan nilai jual kembali tinggi"],
    excludes: ["Logam Mulia batangan (masuk Aset Investasi)", "Perhiasan imitasi"],
  },
  assetAntique: {
    title: "Barang Antik & Koleksi",
    definition: "Barang hobi yang memiliki nilai jual tinggi di pasar kolektor.",
    includes: ["Lukisan maestro", "Koleksi uang kuno", "Action figure limited edition", "Mobil klasik"],
    excludes: ["Perabot rumah tangga biasa"],
  },
  assetPersonalOther: {
    title: "Aset Personal Lainnya",
    definition: "Harta benda pribadi lainnya yang bernilai namun tidak masuk kategori di atas.",
    includes: ["Gadget (Laptop/HP) high-end", "Alat musik profesional", "Peralatan kamera/fotografi"],
  },

  // --- C. Aset Investasi (Menghasilkan Uang) ---
  assetInvHome: {
    title: "Properti Investasi",
    definition: "Tanah atau bangunan yang tidak ditempati sendiri, melainkan disewakan atau didiamkan untuk kenaikan harga.",
    includes: ["Rumah kontrakan", "Ruko/Kios sewaan", "Tanah kavling kosong", "Apartemen sewaan"],
    excludes: ["Rumah tinggal utama"],
  },
  assetInvVehicle: {
    title: "Kendaraan Bisnis",
    definition: "Kendaraan yang dibeli khusus untuk disewakan atau operasional usaha.",
    includes: ["Armada rental mobil", "Truk ekspedisi", "Motor untuk kurir toko"],
  },
  assetGold: {
    title: "Logam Mulia (Emas)",
    definition: "Emas murni (24K) dalam bentuk batangan atau koin yang tujuannya murni investasi.",
    includes: ["Emas batangan Antam/UBS", "Dinar/Dirham", "Tabungan Emas Digital (Pegadaian/Tokopedia)"],
    excludes: ["Perhiasan emas (karena ada ongkos pembuatan & susut nilai)"],
    example: "Total gram emas dikali harga jual (buyback) hari ini."
  },
  assetInvAntique: {
    title: "Barang Seni Investasi",
    definition: "Sama seperti barang antik personal, namun dibeli spesifik untuk dijual kembali saat harga naik.",
  },
  assetStocks: {
    title: "Saham (Stocks)",
    definition: "Kepemilikan modal di perusahaan terbuka (Tbk) yang tercatat di bursa efek.",
    includes: ["Saham bluechip (BBCA, TLKM)", "Saham second liner", "Saham luar negeri (Apple, Tesla)"],
    excludes: ["Saham tertutup (bisnis keluarga)"],
    example: "Total nilai portofolio saham Anda di aplikasi sekuritas saat ini."
  },
  assetMutualFund: {
    title: "Reksadana",
    definition: "Wadah investasi kolektif yang dikelola Manajer Investasi.",
    includes: ["Reksadana Pasar Uang", "Reksadana Pendapatan Tetap", "Reksadana Saham/Campuran"],
  },
  assetBonds: {
    title: "Obligasi / Surat Utang",
    definition: "Surat berharga bukti pemberian utang kepada negara atau perusahaan.",
    includes: ["SBN Ritel (ORI, SR, SBR)", "Obligasi Korporasi", "Surat Utang Negara (SUN)"],
  },
  assetDeposit: {
    title: "Deposito Berjangka",
    definition: "Simpanan bank dengan jangka waktu tertentu dan bunga lebih tinggi dari tabungan biasa.",
    includes: ["Deposito Bank BUKU 4", "Deposito BPR"],
    excludes: ["Deposito yang sudah jatuh tempo dan cair ke tabungan"],
  },
  assetInvOther: {
    title: "Investasi Lainnya",
    definition: "Instrumen investasi alternatif.",
    includes: ["P2P Lending Funding", "Crypto Assets (Bitcoin, ETH)", "Equity Crowdfunding", "Modal ventura di bisnis teman"],
  },

  // ==========================================
  // 3. UTANG (KEWAJIBAN) - STOCK
  // ==========================================
  // PENTING: Tekankan "Sisa Pokok" (Outstanding Balance)

  debtKPR: {
    title: "Sisa Pokok KPR",
    definition: "Total sisa utang pokok rumah yang BELUM lunas ke bank. BUKAN nominal cicilan bulanan.",
    includes: ["Sisa plafon KPR Bank", "Sisa KPR in-house developer"],
    example: "Jika Anda ingin melunasi KPR hari ini, berapa uang yang harus disetor ke bank? (Lihat di aplikasi bank/rekening koran)."
  },
  debtKPM: {
    title: "Sisa Pokok KPM (Kendaraan)",
    definition: "Total sisa utang pokok kendaraan (Leasing/Bank) yang belum lunas.",
    includes: ["Leasing Mobil/Motor"],
    example: "Bukan angsuran bulanan, tapi total sisa utang pelunasan dipercepat."
  },
  debtCC: {
    title: "Total Tagihan Kartu Kredit",
    definition: "Total penggunaan limit kartu kredit yang belum dibayar lunas (outstanding balance).",
    includes: ["Tagihan bulan berjalan", "Sisa cicilan 0% di kartu kredit"],
    excludes: ["Limit kartu kredit yang tidak terpakai"],
  },
  debtCoop: {
    title: "Utang Koperasi/Kantor",
    definition: "Sisa pinjaman karyawan atau pinjaman koperasi kantor.",
  },
  debtConsumptiveOther: {
    title: "Utang Konsumtif Lain",
    definition: "Sisa utang untuk kebutuhan gaya hidup atau barang yang nilainya turun.",
    includes: ["Paylater (GopayLater, SpayLater)", "Pinjaman Online (Pinjol)", "Utang ke teman/keluarga"],
  },
  debtBusiness: {
    title: "Utang Usaha / Produktif",
    definition: "Utang yang digunakan untuk memutar modal bisnis atau membeli aset yang menghasilkan uang.",
    includes: ["Kredit Modal Kerja (KMK)", "Kredit Investasi", "Utang dagang ke supplier"],
    excludes: ["Utang untuk beli gadget pribadi (masuk Konsumtif)"],
  },

  // ==========================================
  // 4. ARUS KAS (CASHFLOW) - FLOW
  // ==========================================
  
  // --- A. PEMASUKAN (INCOME) ---
  incomeFixed: {
    title: "Pemasukan Tetap",
    definition: "Penghasilan rutin yang pasti diterima setiap bulan dengan nominal yang cenderung stabil.",
    includes: ["Gaji Bulanan (Take Home Pay)", "Tunjangan Tetap", "Uang Pensiun Bulanan"],
    excludes: ["Bonus tahunan", "THR"],
  },
  incomeVariable: {
    title: "Pemasukan Tidak Tetap",
    definition: "Penghasilan tambahan yang nominal atau waktunya tidak menentu (Rata-rata per bulan).",
    includes: ["Komisi penjualan", "Bonus performance", "Hasil sewa properti", "Dividen saham", "Side job / Freelance"],
    example: "Jika setahun dapat THR & Bonus total 24 juta, masukkan 2 juta per bulan di sini."
  },

  // --- B. PENGELUARAN - CICILAN UTANG ---
  installmentKPR: {
    title: "Cicilan KPR",
    definition: "Angsuran yang Anda bayarkan ke bank setiap bulan untuk rumah.",
  },
  installmentKPM: {
    title: "Cicilan Kendaraan",
    definition: "Angsuran leasing mobil/motor per bulan.",
  },
  installmentCC: {
    title: "Pembayaran Min. Kartu Kredit",
    definition: "Rata-rata pembayaran tagihan kartu kredit per bulan (jika tidak full payment) atau cicilan tetap di dalam kartu kredit.",
  },
  installmentCoop: {
    title: "Cicilan Koperasi/Kantor",
    definition: "Potongan gaji bulanan untuk bayar pinjaman kantor/koperasi.",
  },
  installmentConsumptiveOther: {
    title: "Cicilan Konsumtif Lain",
    definition: "Angsuran untuk Paylater, Pinjol, atau utang barang konsumtif lainnya.",
  },
  installmentBusiness: {
    title: "Cicilan Utang Usaha",
    definition: "Angsuran bulanan untuk utang yang bersifat produktif/bisnis.",
  },

  // --- C. PENGELUARAN - PREMI ASURANSI ---
  insuranceLife: {
    title: "Premi Asuransi Jiwa",
    definition: "Biaya yang dibayar untuk perlindungan risiko kematian (Uang Pertanggungan).",
    includes: ["Asuransi Jiwa Murni (Term Life)", "Porsi asuransi di Unitlink"],
  },
  insuranceHealth: {
    title: "Premi Asuransi Kesehatan",
    definition: "Biaya untuk perlindungan rawat inap/jalan rumah sakit (Swasta).",
    excludes: ["BPJS Kesehatan (ada field sendiri)"],
  },
  insuranceHome: {
    title: "Asuransi Properti",
    definition: "Premi asuransi kebakaran atau kebanjiran untuk rumah/ruko.",
  },
  insuranceVehicle: {
    title: "Asuransi Kendaraan",
    definition: "Premi asuransi TLO atau All Risk untuk mobil/motor.",
  },
  insuranceBPJS: {
    title: "Iuran BPJS",
    definition: "Total iuran BPJS Kesehatan + BPJS Ketenagakerjaan yang dipotong dari gaji atau bayar mandiri.",
  },
  insuranceOther: {
    title: "Asuransi Lainnya",
    definition: "Premi asuransi penyakit kritis, kecelakaan diri, atau perjalanan.",
  },
  
  // --- D. PENGELUARAN - TABUNGAN & INVESTASI (SAVING) ---
  savingEmergency: {
    title: "Tabungan Dana Darurat",
    definition: "Alokasi rutin untuk menambah pos dana darurat.",
    example: "Uang yang disisihkan 'di awal' gajian, bukan sisa belanja."
  },
  savingRetirement: {
    title: "Investasi Hari Tua",
    definition: "Alokasi rutin untuk persiapan pensiun.",
    includes: ["DPLK (Dana Pensiun Lembaga Keuangan)", "Topup Reksadana rutin", "Beli emas rutin"],
  },
  savingEducation: {
    title: "Tabungan Pendidikan",
    definition: "Alokasi khusus untuk uang pangkal sekolah/kuliah anak di masa depan.",
  },
  savingPilgrimage: {
    title: "Tabungan Ibadah",
    definition: "Alokasi untuk Umroh, Haji, atau perjalanan religi lainnya.",
  },
  savingHoliday: {
    title: "Tabungan Liburan",
    definition: "Sinking fund (dana singgahan) untuk traveling atau staycation.",
  },
  savingOther: {
    title: "Tabungan Lainnya",
    definition: "Alokasi untuk tujuan lain (beli gadget, renovasi rumah, pajak tahunan).",
  },

  // --- E. PENGELUARAN - BIAYA HIDUP (LIVING COST) ---
  expenseFood: {
    title: "Makan & Minum",
    definition: "Biaya makan sehari-hari untuk seluruh keluarga.",
    includes: ["Belanja pasar/supermarket", "GoFood/GrabFood", "Jajan kopi/snack", "Makan di luar weekend"],
  },
  expenseSchool: {
    title: "Pendidikan Anak (Rutin)",
    definition: "Biaya rutin bulanan terkait sekolah.",
    includes: ["SPP Bulanan", "Uang Les/Kursus", "Uang saku anak", "Antar jemput sekolah"],
    excludes: ["Uang Pangkal (karena bukan pengeluaran rutin bulanan, biasanya diambil dari tabungan)"],
  },
  expenseTransport: {
    title: "Transportasi",
    definition: "Biaya mobilitas sehari-hari.",
    includes: ["Bensin (BBM)", "Tol & Parkir", "Ojol/Taxi Online", "Tiket KRL/Busway", "Service rutin kendaraan"],
  },
  expenseCommunication: {
    title: "Komunikasi & Data",
    definition: "Biaya agar tetap terhubung.",
    includes: ["Pulsa & Paket Data Seluler", "Tagihan Wi-Fi Rumah", "Langganan TV Kabel"],
  },
  expenseHelpers: {
    title: "Gaji ART/Pekerja",
    definition: "Upah untuk orang yang membantu di rumah.",
    includes: ["Gaji Asisten Rumah Tangga", "Gaji Supir", "Tukang Kebun", "Satpam Komplek"],
  },
  expenseLifestyle: {
    title: "Gaya Hidup & Hiburan",
    definition: "Biaya untuk kesenangan, hobi, dan perawatan diri.",
    includes: ["Langganan Netflix/Spotify", "Gym membership", "Skincare & Salon", "Hobi", "Nonton bioskop", "Staycation rutin"],
  },
  expenseTax: {
    title: "Pajak & Retribusi",
    definition: "Biaya wajib negara/lingkungan.",
    includes: ["PBB Rumah (dibagi 12)", "Pajak Kendaraan/STNK (dibagi 12)", "Iuran lingkungan (IPL/Sampah/Keamanan)"],
  }
};