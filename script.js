document.addEventListener('DOMContentLoaded', () => {
    // Definisi ID input untuk setiap mata pelajaran dan semester
    const mapelSemesters = {
        indo: ['indo-s1', 'indo-s2', 'indo-s3', 'indo-s4', 'indo-s5'],
        mtk: ['mtk-s1', 'mtk-s2', 'mtk-s3', 'mtk-s4', 'mtk-s5'],
        inggris: ['inggris-s1', 'inggris-s2', 'inggris-s3', 'inggris-s4', 'inggris-s5'],
        ipa: ['ipa-s1', 'ipa-s2', 'ipa-s3', 'ipa-s4', 'ipa-s5'],
    };
    const asesmenIds = ['membaca', 'sains', 'numerik'];

    // Gabungkan semua ID input untuk keperluan localStorage
    let allInputIds = [];
    for (const mapel in mapelSemesters) {
        allInputIds = allInputIds.concat(mapelSemesters[mapel]);
    }
    allInputIds = allInputIds.concat(asesmenIds);

    const hitungButton = document.getElementById('hitungButton');
    const hasilDiv = document.getElementById('hasil');
    const detailPerhitunganDiv = document.getElementById('detailPerhitungan');
    const prosesStepsDiv = document.getElementById('prosesSteps');

    // Fungsi untuk menyimpan data ke localStorage
    const saveData = () => {
        const data = {};
        allInputIds.forEach(id => {
            data[id] = document.getElementById(id).value;
        });
        localStorage.setItem('nilaiGabunganData', JSON.stringify(data));
    };

    // Fungsi untuk memuat data dari localStorage
    const loadData = () => {
        const storedData = localStorage.getItem('nilaiGabunganData');
        if (storedData) {
            const data = JSON.parse(storedData);
            allInputIds.forEach(id => {
                const inputElement = document.getElementById(id);
                if (data[id]) {
                    inputElement.value = data[id];
                }
            });
            // Setelah memuat data, langsung hitung untuk menampilkan hasil sebelumnya
            hitungNilai();
        }
    };

    // Panggil loadData saat halaman pertama kali dimuat
    loadData();

    // Tambahkan event listener untuk setiap input agar data tersimpan otomatis
    allInputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        inputElement.addEventListener('input', saveData);
    });

    // Event listener untuk tombol hitung
    hitungButton.addEventListener('click', hitungNilai);

    function hitungNilai() {
        let rataRataMapel = {};
        let totalRapor = 0; // Ini akan menjadi jumlah rata-rata per mapel

        let detailRaporHtml = ''; // Untuk detail langkah-langkah rapor

        // 1. Hitung rata-rata setiap mata pelajaran dari 5 semester
        for (const mapel in mapelSemesters) {
            let sumMapel = 0;
            let countSemesters = 0;
            let semesterValues = [];

            mapelSemesters[mapel].forEach(id => {
                const nilai = parseFloat(document.getElementById(id).value);
                if (!isNaN(nilai)) {
                    sumMapel += nilai;
                    countSemesters++;
                    semesterValues.push(nilai.toFixed(2));
                } else {
                    semesterValues.push('0.00'); // Tampilkan 0 jika kosong/invalid
                }
            });

            // Pastikan tidak ada pembagian dengan nol
            rataRataMapel[mapel] = countSemesters > 0 ? sumMapel / countSemesters : 0;
            totalRapor += rataRataMapel[mapel]; // Tambahkan rata-rata mapel ke totalRapor

            detailRaporHtml += `
                <li>Rata-rata ${mapel.charAt(0).toUpperCase() + mapel.slice(1)} (Smstr 1-5) = (${semesterValues.join(' + ')}) / ${countSemesters > 0 ? countSemesters : 5} = <span class="font-semibold">${rataRataMapel[mapel].toFixed(2)}</span></li>
            `;
        }

        // 2. Perhitungan Nilai Rapor (Bobot 40%) - Total Rapor adalah jumlah rata-rata mapel
        const nilaiRaporBobot = totalRapor * 0.4;

        // Ambil nilai asesmen
        const membaca = parseFloat(document.getElementById('membaca').value) || 0;
        const sains = parseFloat(document.getElementById('sains').value) || 0;
        const numerik = parseFloat(document.getElementById('numerik').value) || 0;

        // Koefisien sesuai contoh
        const koefMembaca = 1.72;
        const koefSains = 1.14;
        const koefNumerik = 1.14;

        // Perhitungan Nilai ASPD (sesuai contoh):
        // ((Literasi Membaca * koef) + (Literasi Sains * koef) + (Literasi Numerik * koef))
        const nilaiMembacaKoef = membaca * koefMembaca;
        const nilaiSainsKoef = sains * koefSains;
        const nilaiNumerikKoef = numerik * koefNumerik;

        const totalAsesmenTerbobot = nilaiMembacaKoef + nilaiSainsKoef + nilaiNumerikKoef;

        // Nilai ASPD (Bobot 60%) = (totalAsesmenTerbobot) * 0.6
        const nilaiAsesmenBobot = totalAsesmenTerbobot * 0.6;

        // Nilai Gabungan Akhir
        const nilaiGabungan = nilaiRaporBobot + nilaiAsesmenBobot;

        // --- Tampilkan Hasil dan Detail Perhitungan ---
        hasilDiv.innerText = `Nilai Gabungan Akhir: ${nilaiGabungan.toFixed(2)}`;

        // Siapkan detail langkah-langkah
        let detailHtml = `
            <p class="font-bold text-blue-300 mb-2">1. Perhitungan Nilai Rapor (Bobot 40%):</p>
            <ul class="list-disc pl-5 space-y-1">
                ${detailRaporHtml}
                <li>Jumlah Rata-rata Mata Pelajaran = ${Object.values(rataRataMapel).map(n => n.toFixed(2)).join(' + ')} = <span class="font-semibold">${totalRapor.toFixed(2)}</span></li>
                <li>Nilai Rapor (Bobot 40%) = ${totalRapor.toFixed(2)} * 0.4 = <span class="font-semibold">${nilaiRaporBobot.toFixed(2)}</span></li>
            </ul>

            <p class="font-bold text-blue-300 mt-4 mb-2">2. Perhitungan Nilai Asesmen Standardisasi (Bobot 60%):</p>
            <ul class="list-disc pl-5 space-y-1">
                <li>Literasi Membaca (${membaca.toFixed(2)}) * Koefisien (1.72) = <span class="font-semibold">${nilaiMembacaKoef.toFixed(2)}</span></li>
                <li>Literasi Sains (${sains.toFixed(2)}) * Koefisien (1.14) = <span class="font-semibold">${nilaiSainsKoef.toFixed(2)}</span></li>
                <li>Literasi Numerik (${numerik.toFixed(2)}) * Koefisien (1.14) = <span class="font-semibold">${nilaiNumerikKoef.toFixed(2)}</span></li>
                <li>Total Nilai Asesmen Terbobot (sebelum dikalikan 60%) = ${nilaiMembacaKoef.toFixed(2)} + ${nilaiSainsKoef.toFixed(2)} + ${nilaiNumerikKoef.toFixed(2)} = <span class="font-semibold">${totalAsesmenTerbobot.toFixed(2)}</span></li>
                <li>Nilai Asesmen (Bobot 60%) = ${totalAsesmenTerbobot.toFixed(2)} * 0.6 = <span class="font-semibold">${nilaiAsesmenBobot.toFixed(2)}</span></li>
            </ul>

            <p class="font-bold text-blue-300 mt-4 mb-2">3. Nilai Gabungan Akhir:</p>
            <ul class="list-disc pl-5 space-y-1">
                <li>Nilai Gabungan = Nilai Rapor (Bobot 40%) + Nilai Asesmen (Bobot 60%)</li>
                <li>Nilai Gabungan = ${nilaiRaporBobot.toFixed(2)} + ${nilaiAsesmenBobot.toFixed(2)} = <span class="font-extrabold text-yellow-300">${nilaiGabungan.toFixed(2)}</span></li>
            </ul>
        `;

        prosesStepsDiv.innerHTML = detailHtml;
        detailPerhitunganDiv.classList.remove('hidden'); // Tampilkan detail setelah dihitung
    }
});