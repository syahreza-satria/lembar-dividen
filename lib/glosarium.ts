export type Istilah = {
  slug: string;
  istilah: string;
  /** kata/frasa yang ditautkan otomatis di teks penjelasan */
  alias: string[];
  /** satu kalimat, dipakai untuk tooltip */
  ringkas: string;
  penjelasan: string[];
  rumus?: string;
  contoh?: string;
  terkait: string[];
};

export const GLOSARIUM: Istilah[] = [
  {
    slug: "saham",
    istilah: "Saham",
    alias: ["saham"],
    ringkas: "Bukti kepemilikan sebagian kecil dari sebuah perusahaan.",
    penjelasan: [
      "Saat membeli saham, kamu menjadi pemilik sebagian perusahaan tersebut, sekecil apa pun porsinya. Pemilik saham berhak atas bagian dari keuntungan (dalam bentuk dividen) dan harga sahamnya bisa naik atau turun mengikuti penilaian pasar.",
      "Di Bursa Efek Indonesia (BEI), saham diperdagangkan dengan kode empat huruf, misalnya BBCA untuk Bank Central Asia.",
    ],
    terkait: ["lot", "dividen", "ihsg"],
  },
  {
    slug: "lot",
    istilah: "Lot",
    alias: ["lot"],
    ringkas: "Satuan jual-beli saham di BEI: 1 lot = 100 lembar saham.",
    penjelasan: [
      "Di BEI saham diperdagangkan per lot, bukan per lembar. Satu lot berisi 100 lembar saham.",
      "Jadi jika harga satu lembar Rp 5.000, satu lot membutuhkan dana Rp 500.000 (belum termasuk fee transaksi).",
    ],
    rumus: "Nilai transaksi = harga per lembar × 100 × jumlah lot",
    contoh: "10 lot saham seharga Rp 2.000 = 2.000 × 100 × 10 = Rp 2.000.000.",
    terkait: ["saham", "fee-transaksi"],
  },
  {
    slug: "dividen",
    istilah: "Dividen",
    alias: ["dividen"],
    ringkas: "Bagian keuntungan perusahaan yang dibagikan kepada pemegang saham.",
    penjelasan: [
      "Tidak semua perusahaan membagikan dividen, dan jumlahnya ditentukan lewat Rapat Umum Pemegang Saham (RUPS). Perusahaan yang sedang butuh dana untuk berkembang kadang memilih menahan keuntungannya.",
      "Dividen dibayar per lembar saham. Total yang kamu terima adalah dividen per lembar dikalikan jumlah lembar yang dimiliki pada tanggal tertentu (cum date).",
    ],
    rumus: "Total dividen = dividen per lembar × jumlah lembar (lot × 100)",
    contoh: "Dividen Rp 100 per lembar, punya 10 lot (1.000 lembar) → Rp 100.000 sebelum pajak.",
    terkait: ["dividend-yield", "cum-date", "ex-date", "tanggal-bayar"],
  },
  {
    slug: "dividend-yield",
    istilah: "Dividend Yield",
    alias: ["dividend yield", "yield dividen", "DY"],
    ringkas: "Dividen setahun dibandingkan harga saham, dalam persen.",
    penjelasan: [
      "Dividend yield menunjukkan seberapa besar dividen yang dibagikan dibanding harga sahamnya. Semakin tinggi angkanya, semakin besar dividen relatif terhadap harga saat ini.",
      "Angka ini bergerak mengikuti harga: ketika harga turun, yield terlihat naik meski dividennya sama. Dividen masa lalu juga tidak menjamin dividen di masa depan.",
    ],
    rumus: "Dividend yield = dividen per lembar setahun ÷ harga saham × 100%",
    contoh: "Dividen Rp 200 per lembar setahun, harga Rp 4.000 → yield 5%.",
    terkait: ["dividen", "per"],
  },
  {
    slug: "cum-date",
    istilah: "Cum Date",
    alias: ["cum date", "cum-date"],
    ringkas: "Hari bursa terakhir saat membeli saham masih membuatmu berhak atas dividen.",
    penjelasan: [
      "Untuk berhak menerima dividen, saham harus tercatat atas namamu pada akhir cum date. Karena penyelesaian transaksi memakan waktu, pembelian pada cum date masih dihitung.",
      "Di Lembar Dividen, cum date ditampilkan sebagai perkiraan, yaitu satu hari bursa sebelum ex date. Hari libur bursa belum diperhitungkan.",
    ],
    terkait: ["ex-date", "tanggal-bayar", "dividen"],
  },
  {
    slug: "ex-date",
    istilah: "Ex Date",
    alias: ["ex date", "ex-date"],
    ringkas: "Hari pertama saham diperdagangkan tanpa hak atas dividen yang akan dibagikan.",
    penjelasan: [
      "Jika kamu membeli saham pada atau setelah ex date, kamu tidak berhak atas dividen periode tersebut. Biasanya harga saham disesuaikan turun sebesar kira-kira nilai dividen pada hari ini.",
    ],
    terkait: ["cum-date", "tanggal-bayar", "dividen"],
  },
  {
    slug: "tanggal-bayar",
    istilah: "Tanggal Bayar",
    alias: ["tanggal bayar"],
    ringkas: "Tanggal dividen masuk ke rekening dana investor.",
    penjelasan: [
      "Setelah cum date dan ex date, dividen dibayarkan pada tanggal bayar yang diumumkan perusahaan, biasanya beberapa minggu sesudahnya. Tanggal ini belum tersedia di semua sumber data, sehingga bisa tampil kosong.",
    ],
    terkait: ["cum-date", "ex-date", "dividen"],
  },
  {
    slug: "per",
    istilah: "PER (Price to Earnings Ratio)",
    alias: ["PER", "price to earnings"],
    ringkas: "Harga saham dibagi laba per lembar: berapa kali laba tahunan yang tercermin di harga.",
    penjelasan: [
      "PER menunjukkan berapa kali laba setahun yang dihargai pasar. PER 10x artinya harga saham setara dengan 10 kali laba per lembar tahunan.",
      "PER yang lebih tinggi dari rata-rata sektor biasanya berarti pasar menghargai saham itu lebih mahal relatif terhadap labanya, bisa karena ekspektasi pertumbuhan. PER yang rendah belum tentu lebih baik; bandingkan dengan perusahaan sejenis.",
      "Jika perusahaan merugi, PER tidak bisa dihitung dan ditampilkan sebagai n/a.",
    ],
    rumus: "PER = harga saham ÷ laba per lembar (EPS)",
    contoh: "Harga Rp 5.000, EPS Rp 500 → PER 10x.",
    terkait: ["eps", "pbv", "roe"],
  },
  {
    slug: "pbv",
    istilah: "PBV (Price to Book Value)",
    alias: ["PBV", "price to book"],
    ringkas: "Harga saham dibanding nilai buku (modal bersih) per lembar.",
    penjelasan: [
      "PBV membandingkan harga pasar dengan nilai buku perusahaan, yaitu aset dikurangi utang, dibagi jumlah lembar saham. PBV di bawah 1x artinya harga pasar lebih rendah dari nilai bukunya.",
      "PBV paling sering dipakai untuk membandingkan bank dan perusahaan padat aset. Nilai buku tidak selalu mencerminkan nilai wajar aset, jadi angka ini hanyalah salah satu sudut pandang.",
    ],
    rumus: "PBV = harga saham ÷ nilai buku per lembar",
    terkait: ["per", "roe"],
  },
  {
    slug: "roe",
    istilah: "ROE (Return on Equity)",
    alias: ["ROE"],
    ringkas: "Laba bersih dibanding modal pemegang saham, dalam persen.",
    penjelasan: [
      "ROE menunjukkan seberapa efisien perusahaan menghasilkan laba dari modal pemegang sahamnya. ROE 15% artinya setiap Rp 100 modal menghasilkan sekitar Rp 15 laba dalam setahun.",
      "ROE yang tinggi karena utang yang sangat besar bisa menyesatkan, jadi lihat bersama DER.",
    ],
    rumus: "ROE = laba bersih ÷ ekuitas × 100%",
    terkait: ["der", "per", "margin-laba"],
  },
  {
    slug: "der",
    istilah: "DER (Debt to Equity Ratio)",
    alias: ["DER", "debt to equity"],
    ringkas: "Total utang dibanding modal sendiri.",
    penjelasan: [
      "DER 0,5x artinya utang perusahaan setengah dari modal sendirinya. Semakin tinggi DER, semakin besar porsi pendanaan dari utang, dan semakin besar pula beban bunga yang harus ditanggung.",
      "Untuk bank, DER tidak terlalu bermakna karena utang (dana nasabah) memang bahan baku bisnisnya, sehingga angkanya tidak ditampilkan untuk sektor Keuangan di Mode Pemula.",
    ],
    rumus: "DER = total utang ÷ total ekuitas",
    terkait: ["roe", "pbv"],
  },
  {
    slug: "eps",
    istilah: "EPS (Earnings per Share)",
    alias: ["EPS", "laba per lembar"],
    ringkas: "Laba bersih yang dihasilkan untuk setiap lembar saham.",
    penjelasan: [
      "EPS adalah laba bersih dibagi jumlah saham beredar. Angka ini menjadi dasar perhitungan PER.",
    ],
    rumus: "EPS = laba bersih ÷ jumlah saham beredar",
    terkait: ["per"],
  },
  {
    slug: "margin-laba",
    istilah: "Margin Laba",
    alias: ["margin laba", "margin"],
    ringkas: "Persentase pendapatan yang tersisa sebagai laba bersih.",
    penjelasan: [
      "Margin laba 20% berarti dari setiap Rp 100 pendapatan, sekitar Rp 20 menjadi laba bersih. Margin berbeda jauh antar sektor: bank cenderung tinggi, peritel cenderung tipis, jadi bandingkan dengan sektor yang sama.",
    ],
    rumus: "Margin laba = laba bersih ÷ pendapatan × 100%",
    terkait: ["roe", "eps"],
  },
  {
    slug: "rsi",
    istilah: "RSI (Relative Strength Index)",
    alias: ["RSI"],
    ringkas: "Indikator 0–100 yang mengukur seberapa cepat harga naik atau turun belakangan ini.",
    penjelasan: [
      "RSI membandingkan besar kenaikan dan penurunan harga dalam 14 hari terakhir. Nilai di atas 70 sering dibaca sebagai harga naik cepat; di bawah 30 sebagai harga turun cepat.",
      "RSI hanya menggambarkan kecepatan pergerakan yang sudah terjadi. Harga bisa terus bergerak ke arah yang sama meski RSI sudah berada di wilayah ekstrem. Ini bukan sinyal beli atau jual.",
    ],
    terkait: ["macd", "moving-average"],
  },
  {
    slug: "macd",
    istilah: "MACD",
    alias: ["MACD"],
    ringkas: "Selisih dua rata-rata harga (12 dan 26 hari) untuk melihat perubahan momentum.",
    penjelasan: [
      "MACD dihitung dari selisih rata-rata eksponensial 12 hari dan 26 hari. Garis ini dibandingkan dengan garis sinyal (rata-rata 9 hari dari MACD itu sendiri). Selisih keduanya digambarkan sebagai histogram.",
      "Saat garis MACD memotong ke atas garis sinyal, momentum naik sedang menguat; sebaliknya jika memotong ke bawah. Seperti indikator lain, ini hanya gambaran data masa lalu.",
    ],
    terkait: ["rsi", "moving-average"],
  },
  {
    slug: "moving-average",
    istilah: "Moving Average (MA)",
    alias: ["moving average", "rata-rata 50 hari", "rata-rata 200 hari", "rata-rata 20 hari", "MA20", "MA50", "MA200"],
    ringkas: "Rata-rata harga penutupan beberapa hari terakhir, untuk melihat arah tren.",
    penjelasan: [
      "MA20, MA50, dan MA200 adalah rata-rata harga penutupan 20, 50, dan 200 hari bursa terakhir. Semakin panjang periodenya, semakin lambat bereaksi terhadap perubahan harga.",
      "Harga di atas MA50 berarti harga hari ini lebih tinggi dari rata-rata sekitar 2,5 bulan terakhir, yang sering dipakai sebagai gambaran tren menengah sedang naik.",
    ],
    terkait: ["golden-cross", "death-cross", "rsi"],
  },
  {
    slug: "golden-cross",
    istilah: "Golden Cross",
    alias: ["golden cross"],
    ringkas: "Kejadian rata-rata jangka pendek (MA20) memotong ke atas rata-rata yang lebih panjang (MA50).",
    penjelasan: [
      "Golden cross menandakan bahwa rata-rata harga jangka pendek baru saja melewati rata-rata jangka menengah dari bawah. Sebagian orang menganggapnya tanda awal perubahan tren menjadi naik.",
      "Kejadian ini baru terlihat setelah harga bergerak, sehingga sering terlambat dan bisa terjadi lalu berbalik. Lembar Dividen hanya mencatat kejadiannya, bukan menyarankan tindakan.",
    ],
    terkait: ["death-cross", "moving-average"],
  },
  {
    slug: "death-cross",
    istilah: "Death Cross",
    alias: ["death cross"],
    ringkas: "Kejadian MA20 memotong ke bawah MA50, kebalikan dari golden cross.",
    penjelasan: [
      "Death cross terjadi ketika rata-rata jangka pendek jatuh melewati rata-rata jangka menengah dari atas. Sebagian orang menganggapnya tanda tren melemah. Sama seperti golden cross, ini hanya deskripsi data.",
    ],
    terkait: ["golden-cross", "moving-average"],
  },
  {
    slug: "candlestick",
    istilah: "Candlestick",
    alias: ["candlestick", "candle"],
    ringkas: "Grafik yang menampilkan harga buka, tertinggi, terendah, dan tutup dalam satu batang.",
    penjelasan: [
      "Setiap batang (candle) mewakili satu hari: badan batang menunjukkan harga buka hingga tutup, sumbu tipisnya menunjukkan harga tertinggi dan terendah hari itu.",
      "Di Lembar Dividen, batang hijau berarti harga tutup lebih tinggi dari harga buka, dan batang merah berarti sebaliknya.",
    ],
    terkait: ["volume", "moving-average"],
  },
  {
    slug: "volume",
    istilah: "Volume",
    alias: ["volume"],
    ringkas: "Jumlah lembar saham yang diperdagangkan dalam satu hari.",
    penjelasan: [
      "Volume menunjukkan seberapa ramai suatu saham diperdagangkan. Volume jauh di atas rata-rata biasanya menandakan ada perhatian besar pada saham tersebut hari itu.",
    ],
    terkait: ["candlestick", "likuiditas"],
  },
  {
    slug: "likuiditas",
    istilah: "Likuiditas",
    alias: ["likuiditas", "likuid"],
    ringkas: "Seberapa mudah saham dibeli atau dijual tanpa mengubah harga banyak.",
    penjelasan: [
      "Saham yang likuid diperdagangkan dalam volume besar sehingga pembeli dan penjual mudah ditemukan. Saham yang tidak likuid bisa sulit dijual pada harga yang diharapkan.",
    ],
    terkait: ["volume"],
  },
  {
    slug: "ihsg",
    istilah: "IHSG",
    alias: ["IHSG"],
    ringkas: "Indeks Harga Saham Gabungan: pergerakan harga seluruh saham di BEI.",
    penjelasan: [
      "IHSG adalah indeks yang merangkum pergerakan harga seluruh saham tercatat di BEI. Naik-turunnya sering dipakai sebagai gambaran kondisi pasar saham Indonesia secara umum.",
    ],
    terkait: ["saham", "lq45"],
  },
  {
    slug: "lq45",
    istilah: "LQ45",
    alias: ["LQ45"],
    ringkas: "Indeks 45 saham dengan likuiditas dan kapitalisasi pasar terbesar di BEI.",
    penjelasan: [
      "LQ45 berisi 45 saham yang paling aktif diperdagangkan dan bernilai besar. Daftarnya ditinjau secara berkala oleh BEI. Lembar Dividen memulai dengan saham-saham sejenis.",
    ],
    terkait: ["ihsg", "likuiditas"],
  },
  {
    slug: "sektor",
    istilah: "Sektor",
    alias: ["sektor"],
    ringkas: "Pengelompokan emiten berdasarkan jenis usahanya, misalnya perbankan atau energi.",
    penjelasan: [
      "Membandingkan angka antar perusahaan sebaiknya dilakukan dalam sektor yang sama. PER bank dan PER perusahaan teknologi, misalnya, memang berbeda karena karakter bisnisnya berbeda.",
    ],
    terkait: ["per", "pbv"],
  },
  {
    slug: "fee-transaksi",
    istilah: "Fee Transaksi",
    alias: ["fee transaksi", "fee"],
    ringkas: "Biaya yang dipotong sekuritas dan bursa saat membeli atau menjual saham.",
    penjelasan: [
      "Setiap transaksi dikenai fee, besarnya berbeda antar sekuritas. Saat menjual, ada tambahan pajak final. Karena fee mengurangi hasil, hitung dulu di kalkulator sebelum menghitung untung-rugi.",
    ],
    terkait: ["lot", "average-down"],
  },
  {
    slug: "average-down",
    istilah: "Average Down",
    alias: ["average down"],
    ringkas: "Membeli lagi saham yang sama di harga lebih rendah sehingga harga rata-rata beli turun.",
    penjelasan: [
      "Harga rata-rata dihitung dari total uang yang dikeluarkan dibagi total lembar yang dimiliki. Membeli di harga lebih rendah menurunkan rata-rata itu, tetapi menambah jumlah dana yang berisiko. Gunakan kalkulator untuk melihat angkanya.",
    ],
    rumus: "Harga rata-rata = total biaya beli ÷ total lembar",
    terkait: ["lot", "fee-transaksi"],
  },
  {
    slug: "ara-arb",
    istilah: "ARA dan ARB",
    alias: ["ARA", "ARB", "auto reject"],
    ringkas: "Batas kenaikan (ARA) dan penurunan (ARB) harga maksimum dalam satu hari.",
    penjelasan: [
      "BEI membatasi pergerakan harga harian agar tidak terlalu ekstrem. Batas atas disebut Auto Reject Atas (ARA) dan batas bawah Auto Reject Bawah (ARB). Besar batasnya bergantung pada rentang harga saham.",
    ],
    terkait: ["saham", "volume"],
  },
  {
    slug: "eod",
    istilah: "Data EOD",
    alias: ["EOD", "end of day"],
    ringkas: "Data harga akhir hari (end of day), bukan harga real-time.",
    penjelasan: [
      "Lembar Dividen memakai harga penutupan hari bursa terakhir, diperbarui sekali sehari setelah bursa tutup. Karena itu harga yang tampil bukan harga real-time dan bisa berbeda dari yang kamu lihat di aplikasi sekuritas.",
    ],
    terkait: ["ihsg"],
  },
];

export const GLOSARIUM_MAP = new Map(GLOSARIUM.map((g) => [g.slug, g]));

export function cariIstilah(slug: string) {
  return GLOSARIUM_MAP.get(slug);
}
