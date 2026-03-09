// Bilingual Translations (Indonesian & English)
// Managed by Translator Agent
// All UI text, chart labels, clinical interpretations

export type Language = 'id' | 'en';

export interface Translations {
    [key: string]: { id: string; en: string };
}

export const t: Translations = {
    // General
    growthChart: { id: 'Kurva Pertumbuhan', en: 'Growth Chart' },
    standard: { id: 'Standar', en: 'Standard' },
    language: { id: 'Bahasa', en: 'Language' },
    male: { id: 'Laki-laki', en: 'Male' },
    female: { id: 'Perempuan', en: 'Female' },
    age: { id: 'Umur', en: 'Age' },
    ageMonths: { id: 'Umur (bulan)', en: 'Age (months)' },
    months: { id: 'bulan', en: 'months' },
    years: { id: 'tahun', en: 'years' },
    boy: { id: 'Anak Laki-laki', en: 'Boy' },
    girl: { id: 'Anak Perempuan', en: 'Girl' },

    // Chart categories
    coreAnthropometry: { id: 'Antropometri Dasar', en: 'Core Anthropometry' },
    bodyComposition: { id: 'Komposisi Tubuh', en: 'Body Composition' },
    growthVelocity: { id: 'Kecepatan Pertumbuhan', en: 'Growth Velocity' },
    motorDevelopment: { id: 'Perkembangan Motorik', en: 'Motor Development' },

    // Chart types — Core
    weightForAge: { id: 'BB/U', en: 'Weight-for-age' },
    weightForAgeFull: { id: 'Berat Badan menurut Umur', en: 'Weight-for-age' },
    heightForAge: { id: 'TB/U', en: 'Height-for-age' },
    heightForAgeFull: { id: 'Panjang/Tinggi Badan menurut Umur', en: 'Length/Height-for-age' },
    weightForHeight: { id: 'BB/TB', en: 'Weight-for-height' },
    weightForHeightFull: { id: 'Berat Badan menurut Tinggi Badan', en: 'Weight-for-length/height' },
    bmiForAge: { id: 'IMT/U', en: 'BMI-for-age' },
    bmiForAgeFull: { id: 'Indeks Massa Tubuh menurut Umur', en: 'BMI-for-age' },
    headCircForAge: { id: 'LK/U', en: 'HC-for-age' },
    headCircForAgeFull: { id: 'Lingkar Kepala menurut Umur', en: 'Head circumference-for-age' },
    armCircForAge: { id: 'LiLA/U', en: 'MUAC-for-age' },
    armCircForAgeFull: { id: 'Lingkar Lengan Atas menurut Umur', en: 'Arm circumference-for-age' },

    // Chart types — Body Composition
    subscapularSkinfold: { id: 'Lipatan Subskapula', en: 'Subscapular skinfold' },
    subscapularSkinfoldFull: { id: 'Lipatan Kulit Subskapula menurut Umur', en: 'Subscapular skinfold-for-age' },
    tricepsSkinfold: { id: 'Lipatan Triseps', en: 'Triceps skinfold' },
    tricepsSkinfoldFull: { id: 'Lipatan Kulit Triseps menurut Umur', en: 'Triceps skinfold-for-age' },

    // Chart types — Velocity
    weightVelocity: { id: 'Kecepatan BB', en: 'Weight velocity' },
    weightVelocityFull: { id: 'Kecepatan Pertambahan Berat Badan', en: 'Weight velocity' },
    lengthVelocity: { id: 'Kecepatan TB', en: 'Length velocity' },
    lengthVelocityFull: { id: 'Kecepatan Pertambahan Panjang/Tinggi Badan', en: 'Length/Height velocity' },
    hcVelocity: { id: 'Kecepatan LK', en: 'HC velocity' },
    hcVelocityFull: { id: 'Kecepatan Pertambahan Lingkar Kepala', en: 'Head circumference velocity' },

    // Chart types — Motor
    motorMilestones: { id: 'Milestone Motorik', en: 'Motor milestones' },
    motorMilestonesFull: { id: 'Perkembangan Motorik Kasar', en: 'Motor development milestones' },

    // Axis labels
    weight_kg: { id: 'Berat (kg)', en: 'Weight (kg)' },
    height_cm: { id: 'Tinggi (cm)', en: 'Height (cm)' },
    length_cm: { id: 'Panjang (cm)', en: 'Length (cm)' },
    bmi: { id: 'IMT (kg/m²)', en: 'BMI (kg/m²)' },
    headCirc_cm: { id: 'Lingkar Kepala (cm)', en: 'Head Circumference (cm)' },
    armCirc_cm: { id: 'LiLA (cm)', en: 'MUAC (cm)' },
    skinfold_mm: { id: 'Lipatan Kulit (mm)', en: 'Skinfold (mm)' },
    velocity_g: { id: 'Pertambahan BB (g)', en: 'Weight gain (g)' },
    velocity_cm: { id: 'Pertambahan TB (cm)', en: 'Height gain (cm)' },
    velocity_hc_cm: { id: 'Pertambahan LK (cm)', en: 'HC gain (cm)' },

    // Standards
    whoStandard: { id: 'WHO (0-5 tahun)', en: 'WHO (0-5 years)' },
    cdcStandard: { id: 'CDC (2-20 tahun)', en: 'CDC (2-20 years)' },

    // Z-Score labels
    zScore: { id: 'Skor-Z', en: 'Z-Score' },
    percentile: { id: 'Persentil', en: 'Percentile' },
    median: { id: 'Median', en: 'Median' },

    // Interpretation
    normal: { id: 'Normal', en: 'Normal' },
    stunted: { id: 'Stunting (Pendek)', en: 'Stunted' },
    severelyStunted: { id: 'Stunting Berat (Sangat Pendek)', en: 'Severely Stunted' },
    underweight: { id: 'Berat Badan Kurang', en: 'Underweight' },
    severelyUnderweight: { id: 'Berat Badan Sangat Kurang', en: 'Severely Underweight' },
    overweight: { id: 'Berat Badan Lebih', en: 'Overweight' },
    obese: { id: 'Obesitas', en: 'Obese' },
    wasted: { id: 'Wasting (Kurus)', en: 'Wasted' },
    severelyWasted: { id: 'Wasting Berat (Sangat Kurus)', en: 'Severely Wasted' },
    possibleRisk: { id: 'Risiko Gizi Lebih', en: 'Possible risk of overweight' },
    tall: { id: 'Tinggi', en: 'Tall' },
    macrocephaly: { id: 'Makrosefali', en: 'Macrocephaly' },
    microcephaly: { id: 'Mikrosefali', en: 'Microcephaly' },
    severeAcuteMalnutrition: { id: 'Gizi Buruk Akut (SAM)', en: 'Severe Acute Malnutrition' },
    moderateAcuteMalnutrition: { id: 'Gizi Kurang Akut (MAM)', en: 'Moderate Acute Malnutrition' },
    adequateNutrition: { id: 'Gizi Baik', en: 'Adequate Nutrition' },

    // Velocity interpretation
    slowGrowth: { id: 'Pertumbuhan Lambat', en: 'Slow Growth' },
    normalGrowth: { id: 'Pertumbuhan Normal', en: 'Normal Growth' },
    acceleratedGrowth: { id: 'Pertumbuhan Cepat', en: 'Accelerated Growth' },

    // Motor milestones
    achieved: { id: 'Tercapai', en: 'Achieved' },
    notYet: { id: 'Belum', en: 'Not yet' },
    expectedRange: { id: 'Rentang Normal', en: 'Expected Range' },
    earlyAchiever: { id: 'Pencapaian Awal', en: 'Early Achiever' },
    onTrack: { id: 'Sesuai Usia', en: 'On Track' },
    delayed: { id: 'Butuh Evaluasi', en: 'Needs Evaluation' },

    // Velocity chart labels
    interval: { id: 'Interval', en: 'Interval' },
    monthInterval: { id: 'bulan', en: 'month' },
    selectInterval: { id: 'Pilih Interval', en: 'Select Interval' },
    noVelocityData: { id: 'Minimal 2 pengukuran untuk menghitung kecepatan pertumbuhan', en: 'At least 2 measurements needed to calculate growth velocity' },

    // UI
    printChart: { id: 'Cetak Grafik', en: 'Print Chart' },
    selectChart: { id: 'Pilih Grafik', en: 'Select Chart' },
    interpretation: { id: 'Interpretasi', en: 'Interpretation' },
    measurement: { id: 'Pengukuran', en: 'Measurement' },
    trend: { id: 'Tren', en: 'Trend' },
    improving: { id: 'Membaik', en: 'Improving' },
    stable: { id: 'Stabil', en: 'Stable' },
    faltering: { id: 'Menurun', en: 'Faltering' },
    concerning: { id: 'Perlu Perhatian', en: 'Concerning' },

    // WHO specific
    whoAgeRange: { id: '0-60 bulan', en: '0-60 months' },
    cdcAgeRange: { id: '2-20 tahun', en: '2-20 years' },
    onlyWho: { id: 'Hanya WHO', en: 'WHO Only' },
    notAvailableCdc: { id: 'Tidak tersedia di standar CDC', en: 'Not available in CDC standards' },
};

// Helper function to get translation
export function getText(key: string, lang: Language): string {
    const entry = t[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
}
