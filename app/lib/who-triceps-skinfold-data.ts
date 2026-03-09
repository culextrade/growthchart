// WHO Triceps Skinfold-for-Age (3-60 months)
// Source: WHO Child Growth Standards (2006)
// LMS parameters for boys and girls

export interface WHODataPoint {
    age_months: number;
    L: number;
    M: number;
    S: number;
}

// Boys Triceps Skinfold-for-Age (3-60 months)
export const WHO_BOYS_TRICEPS_SKINFOLD: WHODataPoint[] = [
    { age_months: 3, L: -0.1728, M: 10.30, S: 0.17090 },
    { age_months: 4, L: -0.1808, M: 10.27, S: 0.16850 },
    { age_months: 5, L: -0.1888, M: 10.16, S: 0.16650 },
    { age_months: 6, L: -0.1968, M: 10.01, S: 0.16480 },
    { age_months: 7, L: -0.2048, M: 9.86, S: 0.16340 },
    { age_months: 8, L: -0.2128, M: 9.72, S: 0.16230 },
    { age_months: 9, L: -0.2208, M: 9.59, S: 0.16140 },
    { age_months: 10, L: -0.2288, M: 9.48, S: 0.16070 },
    { age_months: 11, L: -0.2368, M: 9.38, S: 0.16010 },
    { age_months: 12, L: -0.2448, M: 9.29, S: 0.15970 },
    { age_months: 13, L: -0.2528, M: 9.21, S: 0.15940 },
    { age_months: 14, L: -0.2608, M: 9.14, S: 0.15920 },
    { age_months: 15, L: -0.2668, M: 9.08, S: 0.15910 },
    { age_months: 16, L: -0.2718, M: 9.02, S: 0.15910 },
    { age_months: 17, L: -0.2758, M: 8.97, S: 0.15910 },
    { age_months: 18, L: -0.2788, M: 8.92, S: 0.15920 },
    { age_months: 19, L: -0.2808, M: 8.88, S: 0.15930 },
    { age_months: 20, L: -0.2828, M: 8.84, S: 0.15950 },
    { age_months: 21, L: -0.2838, M: 8.81, S: 0.15970 },
    { age_months: 22, L: -0.2838, M: 8.78, S: 0.16000 },
    { age_months: 23, L: -0.2838, M: 8.75, S: 0.16030 },
    { age_months: 24, L: -0.2828, M: 8.73, S: 0.16060 },
    { age_months: 30, L: -0.2728, M: 8.62, S: 0.16230 },
    { age_months: 36, L: -0.2598, M: 8.55, S: 0.16450 },
    { age_months: 42, L: -0.2448, M: 8.50, S: 0.16710 },
    { age_months: 48, L: -0.2278, M: 8.48, S: 0.17010 },
    { age_months: 54, L: -0.2088, M: 8.48, S: 0.17340 },
    { age_months: 60, L: -0.1888, M: 8.50, S: 0.17700 },
];

// Girls Triceps Skinfold-for-Age (3-60 months)
export const WHO_GIRLS_TRICEPS_SKINFOLD: WHODataPoint[] = [
    { age_months: 3, L: 0.0274, M: 10.07, S: 0.18250 },
    { age_months: 4, L: 0.0174, M: 10.15, S: 0.17990 },
    { age_months: 5, L: 0.0074, M: 10.13, S: 0.17760 },
    { age_months: 6, L: -0.0026, M: 10.06, S: 0.17570 },
    { age_months: 7, L: -0.0126, M: 9.96, S: 0.17410 },
    { age_months: 8, L: -0.0226, M: 9.85, S: 0.17280 },
    { age_months: 9, L: -0.0326, M: 9.75, S: 0.17170 },
    { age_months: 10, L: -0.0426, M: 9.65, S: 0.17090 },
    { age_months: 11, L: -0.0526, M: 9.56, S: 0.17020 },
    { age_months: 12, L: -0.0626, M: 9.48, S: 0.16970 },
    { age_months: 13, L: -0.0726, M: 9.41, S: 0.16930 },
    { age_months: 14, L: -0.0826, M: 9.35, S: 0.16910 },
    { age_months: 15, L: -0.0906, M: 9.29, S: 0.16900 },
    { age_months: 16, L: -0.0976, M: 9.24, S: 0.16900 },
    { age_months: 17, L: -0.1036, M: 9.20, S: 0.16910 },
    { age_months: 18, L: -0.1086, M: 9.16, S: 0.16920 },
    { age_months: 19, L: -0.1126, M: 9.12, S: 0.16940 },
    { age_months: 20, L: -0.1166, M: 9.09, S: 0.16970 },
    { age_months: 21, L: -0.1196, M: 9.07, S: 0.17000 },
    { age_months: 22, L: -0.1216, M: 9.04, S: 0.17040 },
    { age_months: 23, L: -0.1236, M: 9.02, S: 0.17080 },
    { age_months: 24, L: -0.1246, M: 9.00, S: 0.17120 },
    { age_months: 30, L: -0.1266, M: 8.93, S: 0.17340 },
    { age_months: 36, L: -0.1236, M: 8.89, S: 0.17600 },
    { age_months: 42, L: -0.1166, M: 8.88, S: 0.17900 },
    { age_months: 48, L: -0.1066, M: 8.89, S: 0.18240 },
    { age_months: 54, L: -0.0936, M: 8.92, S: 0.18610 },
    { age_months: 60, L: -0.0786, M: 8.97, S: 0.19010 },
];
