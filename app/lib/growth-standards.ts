
import { CDC_WEIGHT_DATA, CDC_HEIGHT_DATA, CDC_BMI_DATA, LMSDataPoint } from './cdc-data';
import {
    WHO_BOYS_WEIGHT_COMPLETE,
    WHO_GIRLS_WEIGHT_COMPLETE,
    WHO_BOYS_HEIGHT_COMPLETE,
    WHO_GIRLS_HEIGHT_COMPLETE,
    WHO_BOYS_BMI_COMPLETE,
    WHO_GIRLS_BMI_COMPLETE,
} from './who-data';

export interface LMS {
    age_months: number;
    L: number;
    M: number;
    S: number;
}

export interface WL_LMS {
    length_cm: number;
    L: number;
    M: number;
    S: number;
}

// Use complete WHO data for smooth curves
export const WHO_BOYS_WEIGHT: LMS[] = WHO_BOYS_WEIGHT_COMPLETE;
export const WHO_GIRLS_WEIGHT: LMS[] = WHO_GIRLS_WEIGHT_COMPLETE;
export const WHO_BOYS_HEIGHT: LMS[] = WHO_BOYS_HEIGHT_COMPLETE;
export const WHO_GIRLS_HEIGHT: LMS[] = WHO_GIRLS_HEIGHT_COMPLETE;
export const WHO_BOYS_BMI: LMS[] = WHO_BOYS_BMI_COMPLETE;
export const WHO_GIRLS_BMI: LMS[] = WHO_GIRLS_BMI_COMPLETE;

// --- WHO WEIGHT FOR LENGTH/HEIGHT ---
export const WHO_BOYS_WL: WL_LMS[] = [
    { length_cm: 50, L: 0.3, M: 3.4, S: 0.1 },
    { length_cm: 60, L: 0.1, M: 5.8, S: 0.09 },
    { length_cm: 70, L: 0, M: 8.5, S: 0.08 },
    { length_cm: 80, L: -0.1, M: 10.9, S: 0.08 },
    { length_cm: 90, L: -0.2, M: 13.2, S: 0.08 },
    { length_cm: 100, L: -0.3, M: 15.8, S: 0.08 },
    { length_cm: 110, L: -0.4, M: 18.7, S: 0.09 },
];

export const WHO_GIRLS_WL: WL_LMS[] = [
    { length_cm: 50, L: 0.3, M: 3.4, S: 0.1 },
    { length_cm: 60, L: 0.1, M: 5.5, S: 0.09 },
    { length_cm: 70, L: 0, M: 7.9, S: 0.08 },
    { length_cm: 80, L: -0.1, M: 10.4, S: 0.08 },
    { length_cm: 90, L: -0.2, M: 12.8, S: 0.08 },
    { length_cm: 100, L: -0.3, M: 15.4, S: 0.08 },
    { length_cm: 110, L: -0.4, M: 18.2, S: 0.09 },
];


function interpolateLMS(value: number, data: { val: number } & any, key: string): any {
    const sorted = [...data].sort((a: any, b: any) => a[key] - b[key]);

    if (value <= sorted[0][key]) return sorted[0];
    if (value >= sorted[sorted.length - 1][key]) return sorted[sorted.length - 1];

    let lower = sorted[0];
    let upper = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
        if (value >= sorted[i][key] && value <= sorted[i + 1][key]) {
            lower = sorted[i];
            upper = sorted[i + 1];
            break;
        }
    }

    if (upper[key] === lower[key]) return lower;

    const ratio = (value - lower[key]) / (upper[key] - lower[key]);

    return {
        [key]: value,
        L: lower.L + (upper.L - lower.L) * ratio,
        M: lower.M + (upper.M - lower.M) * ratio,
        S: lower.S + (upper.S - lower.S) * ratio,
    };
}


// Modified to switch based on Age
export function getStandardData(metric: 'weight' | 'height' | 'bmi', gender: 'male' | 'female', ageMonths: number = 0) {
    const isCDC = ageMonths > 60; // Over 5 years

    if (metric === 'weight') return !isCDC ? (gender === 'male' ? WHO_BOYS_WEIGHT : WHO_GIRLS_WEIGHT) : CDC_WEIGHT_DATA[gender] as LMS[];
    if (metric === 'height') return !isCDC ? (gender === 'male' ? WHO_BOYS_HEIGHT : WHO_GIRLS_HEIGHT) : CDC_HEIGHT_DATA[gender] as LMS[];
    if (metric === 'bmi') return !isCDC ? (gender === 'male' ? WHO_BOYS_BMI : WHO_GIRLS_BMI) : CDC_BMI_DATA[gender] as LMS[];

    return WHO_BOYS_WEIGHT; // Fallback
}

export function calculateZScore(measurement: number, ageMonths: number, gender: 'male' | 'female', metric: 'weight' | 'height' | 'bmi'): number {
    // Pass ageMonths so we know which standard to use
    const data = getStandardData(metric, gender, ageMonths);

    const mapped = data.map(d => ({ ...d, val: d.age_months }));
    const lms = interpolateLMS(ageMonths, mapped as any, 'age_months');

    const { L, M, S } = lms;

    if (Math.abs(L) < 0.01) {
        return Math.log(measurement / M) / S;
    }

    return (Math.pow(measurement / M, L) - 1) / (L * S);
}

export function getMeasurementForZScore(z: number, ageMonths: number, gender: 'male' | 'female', metric: 'weight' | 'height' | 'bmi' = 'weight'): number {
    const data = getStandardData(metric, gender, ageMonths);
    const mapped = data.map(d => ({ ...d, val: d.age_months }));
    const lms = interpolateLMS(ageMonths, mapped as any, 'age_months');

    const { L, M, S } = lms;

    if (Math.abs(L) < 0.01) {
        return M * Math.exp(S * z);
    }
    return M * Math.pow(1 + L * S * z, 1 / L);
}

// --- INTERPRETATION UTILS ---

export function calculateHeightAge(height: number, gender: 'male' | 'female'): number {
    // We'll search WHO first, if out of range, search CDC
    const whoData = gender === 'male' ? WHO_BOYS_HEIGHT : WHO_GIRLS_HEIGHT;
    const sortedWho = [...whoData].sort((a, b) => a.M - b.M);

    if (height <= sortedWho[sortedWho.length - 1].M) {
        return findAgeForValue(height, whoData);
    }

    const cdcData = CDC_HEIGHT_DATA[gender] as LMS[];
    return findAgeForValue(height, cdcData);
}

function findAgeForValue(val: number, data: LMS[]): number {
    const sorted = [...data].sort((a, b) => a.M - b.M);
    if (val <= sorted[0].M) return sorted[0].age_months;
    if (val >= sorted[sorted.length - 1].M) return sorted[sorted.length - 1].age_months;

    for (let i = 0; i < sorted.length - 1; i++) {
        if (val >= sorted[i].M && val <= sorted[i + 1].M) {
            const fraction = (val - sorted[i].M) / (sorted[i + 1].M - sorted[i].M);
            return sorted[i].age_months + fraction * (sorted[i + 1].age_months - sorted[i].age_months);
        }
    }
    return 0;
}

export function calculateIdealBodyWeight(heightCm: number, gender: 'male' | 'female'): number {
    // Waterlow usually < 5, but for older kids we can use 50th percentile BMI?
    // Start with WHO WL
    const data = gender === 'male' ? WHO_BOYS_WL : WHO_GIRLS_WL;

    if (heightCm <= 110) { // WHO range roughly
        const mapped = data.map(d => ({ ...d, val: d.length_cm }));
        const lms = interpolateLMS(heightCm, mapped as any, 'length_cm');
        return lms.M;
    }

    // For older / taller: Use CDC Stature -> Age -> Weight Median? Or BMI Median?
    // Standard is: find Age for this Height (Height Age), then find Weight for that Age.
    const hAge = calculateHeightAge(heightCm, gender);
    const weightData = getStandardData('weight', gender, hAge);
    // This finds weight for Height Age.
    const mappedW = weightData.map(d => ({ ...d, val: d.age_months }));
    const lmsW = interpolateLMS(hAge, mappedW as any, 'age_months');
    return lmsW.M;
}

export interface InterpretationResult {
    // Z-Score based interpretations (WHO)
    heightForAge: string;        // TB/U
    heightForAgeZScore: number;
    heightForAgeReason: string;

    weightForAge: string;        // BB/U
    weightForAgeZScore: number;
    weightForAgeReason: string;

    weightForHeight: string;     // BB/TB (Wasting)
    weightForHeightZScore: number;
    weightForHeightReason: string;

    bmiForAge: string;           // IMT/U
    bmiForAgeZScore: number;
    bmiForAgeReason: string;

    // Waterlow classification (percentage based)
    waterlowStatus: string;
    waterlowPercent: number;
    waterlowReason: string;

    // Additional info
    ibw: number;
    heightAge: number;
}

// Z-Score interpretation helpers
function interpretHeightForAge(z: number): string {
    if (z > 3) return "Very Tall (Perawakan Sangat Tinggi)";
    if (z >= -2) return "Normal";
    if (z >= -3) return "Stunted (Perawakan Pendek)";
    return "Severely Stunted (Perawakan Sangat Pendek)";
}

function interpretWeightForAge(z: number): string {
    if (z > 1) return "Risiko BB Lebih";
    if (z >= -2) return "Normal";
    if (z >= -3) return "Underweight (BB Kurang)";
    return "Severely Underweight (BB Sangat Kurang)";
}

function interpretWeightForHeight(z: number): string {
    if (z > 3) return "Obese (Obesitas)";
    if (z > 2) return "Overweight (Gizi Lebih)";
    if (z > 1) return "Possible Risk of Overweight";
    if (z >= -2) return "Normal (Gizi Baik)";
    if (z >= -3) return "Wasted (Gizi Kurang)";
    return "Severely Wasted (Gizi Buruk)";
}

function interpretBMIForAge(z: number): string {
    if (z > 3) return "Obese (Obesitas)";
    if (z > 2) return "Overweight (Gizi Lebih)";
    if (z > 1) return "Possible Risk of Overweight";
    if (z >= -2) return "Normal (Gizi Baik)";
    if (z >= -3) return "Wasted (Gizi Kurang)";
    return "Severely Wasted (Gizi Buruk)";
}

function interpretWaterlow(percent: number): string {
    if (percent > 120) return "Obesitas";
    if (percent > 110) return "Overweight";
    if (percent >= 90) return "Gizi Baik";
    if (percent >= 70) return "Gizi Kurang";
    return "Gizi Buruk";
}

function getZScoreThreshold(z: number): string {
    if (z > 3) return "> 3 SD";
    if (z > 2) return "2-3 SD";
    if (z > 1) return "1-2 SD";
    if (z >= -1) return "-1 to 1 SD";
    if (z >= -2) return "-2 to -1 SD";
    if (z >= -3) return "-3 to -2 SD";
    return "< -3 SD";
}

export function getInterpretation(
    actualWeight: number,
    actualHeight: number,
    ageMonths: number,
    gender: 'male' | 'female'
): InterpretationResult {
    // Calculate Z-Scores
    const heightZScore = calculateZScore(actualHeight, ageMonths, gender, 'height');
    const weightZScore = calculateZScore(actualWeight, ageMonths, gender, 'weight');

    // Calculate BMI
    const heightM = actualHeight / 100;
    const bmi = actualWeight / (heightM * heightM);
    const bmiZScore = calculateZScore(bmi, ageMonths, gender, 'bmi');

    // For Weight-for-Height, we need to find Z-Score based on height
    // Using the IBW approach for now
    const idealWeight = calculateIdealBodyWeight(actualHeight, gender);
    const percentWeightForHeight = (actualWeight / idealWeight) * 100;

    // Approximate Z-Score for weight-for-height
    // (This is simplified; true WFH Z-score would need weight-for-length tables)
    let wfhZScore = 0;
    if (percentWeightForHeight > 120) wfhZScore = 3.5;
    else if (percentWeightForHeight > 110) wfhZScore = 2.5;
    else if (percentWeightForHeight > 100) wfhZScore = 0.5;
    else if (percentWeightForHeight >= 90) wfhZScore = -0.5;
    else if (percentWeightForHeight >= 80) wfhZScore = -1.5;
    else if (percentWeightForHeight >= 70) wfhZScore = -2.5;
    else wfhZScore = -3.5;

    // Get ideal height for age
    const hData = getStandardData('height', gender, ageMonths);
    const mappedH = hData.map(d => ({ ...d, val: d.age_months }));
    const lmsH = interpolateLMS(ageMonths, mappedH as any, 'age_months');
    const idealHeightForAge = lmsH.M;

    // Get ideal weight for age  
    const wData = getStandardData('weight', gender, ageMonths);
    const mappedW = wData.map(d => ({ ...d, val: d.age_months }));
    const lmsW = interpolateLMS(ageMonths, mappedW as any, 'age_months');
    const idealWeightForAge = lmsW.M;

    const heightAge = calculateHeightAge(actualHeight, gender);

    return {
        // Height-for-Age (TB/U)
        heightForAge: interpretHeightForAge(heightZScore),
        heightForAgeZScore: parseFloat(heightZScore.toFixed(2)),
        heightForAgeReason: `TB: ${actualHeight.toFixed(1)} cm, TB median: ${idealHeightForAge.toFixed(1)} cm, Z-Score: ${heightZScore.toFixed(2)} (${getZScoreThreshold(heightZScore)})`,

        // Weight-for-Age (BB/U)
        weightForAge: interpretWeightForAge(weightZScore),
        weightForAgeZScore: parseFloat(weightZScore.toFixed(2)),
        weightForAgeReason: `BB: ${actualWeight.toFixed(1)} kg, BB median: ${idealWeightForAge.toFixed(1)} kg, Z-Score: ${weightZScore.toFixed(2)} (${getZScoreThreshold(weightZScore)})`,

        // Weight-for-Height (BB/TB)
        weightForHeight: interpretWeightForHeight(wfhZScore),
        weightForHeightZScore: parseFloat(wfhZScore.toFixed(2)),
        weightForHeightReason: `BB: ${actualWeight.toFixed(1)} kg / IBW: ${idealWeight.toFixed(1)} kg = ${percentWeightForHeight.toFixed(1)}%`,

        // BMI-for-Age (IMT/U)
        bmiForAge: interpretBMIForAge(bmiZScore),
        bmiForAgeZScore: parseFloat(bmiZScore.toFixed(2)),
        bmiForAgeReason: `IMT: ${bmi.toFixed(1)} kg/m², Z-Score: ${bmiZScore.toFixed(2)} (${getZScoreThreshold(bmiZScore)})`,

        // Waterlow (percentage based)
        waterlowStatus: interpretWaterlow(percentWeightForHeight),
        waterlowPercent: parseFloat(percentWeightForHeight.toFixed(1)),
        waterlowReason: `BB Aktual: ${actualWeight.toFixed(1)} kg / BB Ideal (Height Age): ${idealWeight.toFixed(1)} kg × 100 = ${percentWeightForHeight.toFixed(1)}%`,

        // Additional info
        ibw: parseFloat(idealWeight.toFixed(2)),
        heightAge: parseFloat(heightAge.toFixed(1))
    };
}

// Keep old function for backward compatibility
export interface WaterlowResult {
    wasting: string;
    wastingReason: string;
    stunting: string;
    stuntingReason: string;
    ibw: number;
    heightAge: number;
}

export function getWaterlowClassification(
    actualWeight: number,
    actualHeight: number,
    ageMonths: number,
    gender: 'male' | 'female'
): WaterlowResult {
    const result = getInterpretation(actualWeight, actualHeight, ageMonths, gender);

    return {
        wasting: result.waterlowStatus,
        wastingReason: result.waterlowReason,
        stunting: result.heightForAge,
        stuntingReason: result.heightForAgeReason,
        ibw: result.ibw,
        heightAge: result.heightAge
    };
}

// --- TREND ANALYSIS ---

export interface TrendResult {
    status: 'improving' | 'stable' | 'faltering' | 'concerning' | 'neutral';
    message: string;
    description: string;
    velocity?: number; // per month
}

export function getGrowthTrend(
    measurements: { weight: number; ageMonths: number }[],
    gender: 'male' | 'female'
): TrendResult {
    if (measurements.length < 2) {
        return { status: 'neutral', message: 'Data Berkelanjutan Belum Cukup', description: 'Butuh minimal 2 data untuk menganalisis tren pertumbuhan.' };
    }

    // Sort by age
    const sorted = [...measurements].sort((a, b) => a.ageMonths - b.ageMonths);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    const zLatest = calculateZScore(latest.weight, latest.ageMonths, gender, 'weight');
    const zPrevious = calculateZScore(previous.weight, previous.ageMonths, gender, 'weight');

    const zDiff = zLatest - zPrevious;
    const ageDiff = latest.ageMonths - previous.ageMonths;

    if (ageDiff <= 0) return { status: 'neutral', message: 'Data Invalid', description: 'Selisih umur tidak valid.' };

    const velocity = (latest.weight - previous.weight) / ageDiff; // kg/month

    // Growth Faltering: Z-Score drop > 0.67 is often clinically significant
    if (zDiff < -0.67) {
        return {
            status: 'faltering',
            message: 'Waspada: Tren Melambat',
            description: `Terjadi penurunan Z-Score sebesar ${Math.abs(zDiff).toFixed(2)} SD sejak kunjungan terakhir. Risiko growth faltering.`,
            velocity
        };
    }

    if (zDiff > 1.0) {
        return {
            status: 'concerning',
            message: 'Waspada: Kenaikan Terlalu Cepat',
            description: `Z-Score naik ${zDiff.toFixed(2)} SD. Perlu evaluasi diet untuk mencegah obesitas.`,
            velocity
        };
    }

    if (Math.abs(zDiff) < 0.2) {
        return {
            status: 'stable',
            message: 'Pertumbuhan Stabil',
            description: 'Mengikuti kurva dengan baik.',
            velocity
        };
    }

    if (zDiff > 0 && zPrevious < -2) {
        return {
            status: 'improving',
            message: 'Kabar Baik: Ada Perbaikan',
            description: 'Anak mulai mengejar (catch-up growth). Teruskan intervensi nutrisi.',
            velocity
        };
    }

    return {
        status: 'neutral',
        message: 'Tren Normal',
        description: 'Anak tumbuh sesuai jalur pertumbuhannya.',
        velocity
    };
}
