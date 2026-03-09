// WHO Subscapular Skinfold-for-Age (3-60 months)
// Source: WHO Child Growth Standards (2006)
// LMS parameters for boys and girls

export interface WHODataPoint {
    age_months: number;
    L: number;
    M: number;
    S: number;
}

// Boys Subscapular Skinfold-for-Age (3-60 months)
export const WHO_BOYS_SUBSCAPULAR_SKINFOLD: WHODataPoint[] = [
    { age_months: 3, L: -0.7361, M: 7.75, S: 0.17940 },
    { age_months: 4, L: -0.7101, M: 7.62, S: 0.17710 },
    { age_months: 5, L: -0.6841, M: 7.43, S: 0.17510 },
    { age_months: 6, L: -0.6581, M: 7.24, S: 0.17340 },
    { age_months: 7, L: -0.6321, M: 7.07, S: 0.17200 },
    { age_months: 8, L: -0.6061, M: 6.92, S: 0.17090 },
    { age_months: 9, L: -0.5801, M: 6.79, S: 0.17000 },
    { age_months: 10, L: -0.5541, M: 6.67, S: 0.16930 },
    { age_months: 11, L: -0.5281, M: 6.58, S: 0.16880 },
    { age_months: 12, L: -0.5021, M: 6.49, S: 0.16840 },
    { age_months: 13, L: -0.4761, M: 6.42, S: 0.16820 },
    { age_months: 14, L: -0.4501, M: 6.36, S: 0.16810 },
    { age_months: 15, L: -0.4291, M: 6.31, S: 0.16810 },
    { age_months: 16, L: -0.4101, M: 6.27, S: 0.16820 },
    { age_months: 17, L: -0.3931, M: 6.23, S: 0.16830 },
    { age_months: 18, L: -0.3781, M: 6.20, S: 0.16850 },
    { age_months: 19, L: -0.3651, M: 6.17, S: 0.16870 },
    { age_months: 20, L: -0.3541, M: 6.15, S: 0.16900 },
    { age_months: 21, L: -0.3441, M: 6.13, S: 0.16930 },
    { age_months: 22, L: -0.3361, M: 6.12, S: 0.16960 },
    { age_months: 23, L: -0.3291, M: 6.10, S: 0.17000 },
    { age_months: 24, L: -0.3231, M: 6.09, S: 0.17040 },
    { age_months: 30, L: -0.3001, M: 6.04, S: 0.17210 },
    { age_months: 36, L: -0.2851, M: 6.01, S: 0.17430 },
    { age_months: 42, L: -0.2771, M: 5.99, S: 0.17690 },
    { age_months: 48, L: -0.2741, M: 5.99, S: 0.17990 },
    { age_months: 54, L: -0.2751, M: 6.00, S: 0.18320 },
    { age_months: 60, L: -0.2791, M: 6.03, S: 0.18680 },
];

// Girls Subscapular Skinfold-for-Age (3-60 months)
export const WHO_GIRLS_SUBSCAPULAR_SKINFOLD: WHODataPoint[] = [
    { age_months: 3, L: -0.4685, M: 7.53, S: 0.19220 },
    { age_months: 4, L: -0.4545, M: 7.37, S: 0.18940 },
    { age_months: 5, L: -0.4405, M: 7.17, S: 0.18700 },
    { age_months: 6, L: -0.4265, M: 6.97, S: 0.18500 },
    { age_months: 7, L: -0.4125, M: 6.79, S: 0.18330 },
    { age_months: 8, L: -0.3985, M: 6.64, S: 0.18200 },
    { age_months: 9, L: -0.3845, M: 6.51, S: 0.18090 },
    { age_months: 10, L: -0.3705, M: 6.40, S: 0.18000 },
    { age_months: 11, L: -0.3565, M: 6.31, S: 0.17940 },
    { age_months: 12, L: -0.3425, M: 6.24, S: 0.17890 },
    { age_months: 13, L: -0.3285, M: 6.17, S: 0.17860 },
    { age_months: 14, L: -0.3145, M: 6.12, S: 0.17840 },
    { age_months: 15, L: -0.3025, M: 6.08, S: 0.17840 },
    { age_months: 16, L: -0.2925, M: 6.05, S: 0.17840 },
    { age_months: 17, L: -0.2835, M: 6.02, S: 0.17860 },
    { age_months: 18, L: -0.2755, M: 6.00, S: 0.17880 },
    { age_months: 19, L: -0.2685, M: 5.98, S: 0.17910 },
    { age_months: 20, L: -0.2625, M: 5.96, S: 0.17940 },
    { age_months: 21, L: -0.2575, M: 5.95, S: 0.17980 },
    { age_months: 22, L: -0.2535, M: 5.94, S: 0.18020 },
    { age_months: 23, L: -0.2495, M: 5.94, S: 0.18070 },
    { age_months: 24, L: -0.2465, M: 5.93, S: 0.18120 },
    { age_months: 30, L: -0.2345, M: 5.92, S: 0.18380 },
    { age_months: 36, L: -0.2285, M: 5.93, S: 0.18690 },
    { age_months: 42, L: -0.2275, M: 5.96, S: 0.19040 },
    { age_months: 48, L: -0.2305, M: 6.00, S: 0.19430 },
    { age_months: 54, L: -0.2365, M: 6.06, S: 0.19850 },
    { age_months: 60, L: -0.2455, M: 6.14, S: 0.20300 },
];
