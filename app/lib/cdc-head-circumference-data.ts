// CDC Head Circumference-for-Age (0-36 months)
// Source: CDC Growth Charts (2000)
// LMS parameters from hcageinf.csv

export interface CDCDataPoint {
    age_months: number;
    L: number;
    M: number;
    S: number;
}

// Boys Head Circumference-for-Age (0-36 months)
export const CDC_BOYS_HEAD_CIRCUMFERENCE: CDCDataPoint[] = [
    { age_months: 0, L: 4.4278, M: 35.8137, S: 0.05217 },
    { age_months: 0.5, L: 4.3109, M: 37.1936, S: 0.04726 },
    { age_months: 1.5, L: 3.8696, M: 39.2074, S: 0.04095 },
    { age_months: 2.5, L: 3.3056, M: 40.6523, S: 0.03703 },
    { age_months: 3.5, L: 2.7206, M: 41.7652, S: 0.03436 },
    { age_months: 4.5, L: 2.1680, M: 42.6612, S: 0.03246 },
    { age_months: 5.5, L: 1.6755, M: 43.4049, S: 0.03106 },
    { age_months: 6.5, L: 1.2552, M: 44.0361, S: 0.03002 },
    { age_months: 7.5, L: 0.9105, M: 44.5810, S: 0.02924 },
    { age_months: 8.5, L: 0.6395, M: 45.0576, S: 0.02866 },
    { age_months: 9.5, L: 0.4370, M: 45.4791, S: 0.02823 },
    { age_months: 10.5, L: 0.2963, M: 45.8551, S: 0.02793 },
    { age_months: 11.5, L: 0.2101, M: 46.1930, S: 0.02773 },
    { age_months: 12.5, L: 0.1711, M: 46.4985, S: 0.02760 },
    { age_months: 13.5, L: 0.1724, M: 46.7764, S: 0.02755 },
    { age_months: 14.5, L: 0.2074, M: 47.0302, S: 0.02754 },
    { age_months: 15.5, L: 0.2702, M: 47.2630, S: 0.02759 },
    { age_months: 16.5, L: 0.3558, M: 47.4772, S: 0.02768 },
    { age_months: 17.5, L: 0.4594, M: 47.6750, S: 0.02780 },
    { age_months: 18.5, L: 0.5772, M: 47.8582, S: 0.02794 },
    { age_months: 19.5, L: 0.7058, M: 48.0282, S: 0.02812 },
    { age_months: 20.5, L: 0.8423, M: 48.1864, S: 0.02831 },
    { age_months: 21.5, L: 0.9843, M: 48.3338, S: 0.02852 },
    { age_months: 22.5, L: 1.1296, M: 48.4714, S: 0.02875 },
    { age_months: 23.5, L: 1.2767, M: 48.6001, S: 0.02899 },
    { age_months: 24.5, L: 1.4241, M: 48.7206, S: 0.02924 },
    { age_months: 25.5, L: 1.5706, M: 48.8337, S: 0.02951 },
    { age_months: 26.5, L: 1.7154, M: 48.9398, S: 0.02978 },
    { age_months: 27.5, L: 1.8577, M: 49.0395, S: 0.03006 },
    { age_months: 28.5, L: 1.9968, M: 49.1332, S: 0.03035 },
    { age_months: 29.5, L: 2.1324, M: 49.2215, S: 0.03064 },
    { age_months: 30.5, L: 2.2641, M: 49.3046, S: 0.03094 },
    { age_months: 31.5, L: 2.3917, M: 49.3829, S: 0.03124 },
    { age_months: 32.5, L: 2.5149, M: 49.4568, S: 0.03155 },
    { age_months: 33.5, L: 2.6337, M: 49.5264, S: 0.03186 },
    { age_months: 34.5, L: 2.7479, M: 49.5922, S: 0.03218 },
    { age_months: 35.5, L: 2.8577, M: 49.6542, S: 0.03249 },
    { age_months: 36, L: 2.9109, M: 49.6839, S: 0.03265 },
];

// Girls Head Circumference-for-Age (0-36 months)
export const CDC_GIRLS_HEAD_CIRCUMFERENCE: CDCDataPoint[] = [
    { age_months: 0, L: -1.2987, M: 34.7116, S: 0.04691 },
    { age_months: 0.5, L: -1.4403, M: 36.0345, S: 0.04300 },
    { age_months: 1.5, L: -1.5810, M: 37.9767, S: 0.03807 },
    { age_months: 2.5, L: -1.5931, M: 39.3801, S: 0.03508 },
    { age_months: 3.5, L: -1.5215, M: 40.4677, S: 0.03310 },
    { age_months: 4.5, L: -1.3946, M: 41.3484, S: 0.03171 },
    { age_months: 5.5, L: -1.2317, M: 42.0834, S: 0.03071 },
    { age_months: 6.5, L: -1.0466, M: 42.7103, S: 0.02997 },
    { age_months: 7.5, L: -0.8489, M: 43.2543, S: 0.02943 },
    { age_months: 8.5, L: -0.6458, M: 43.7325, S: 0.02903 },
    { age_months: 9.5, L: -0.4422, M: 44.1574, S: 0.02874 },
    { age_months: 10.5, L: -0.2416, M: 44.5384, S: 0.02853 },
    { age_months: 11.5, L: -0.0467, M: 44.8824, S: 0.02840 },
    { age_months: 12.5, L: 0.1410, M: 45.1951, S: 0.02831 },
    { age_months: 13.5, L: 0.3204, M: 45.4808, S: 0.02828 },
    { age_months: 14.5, L: 0.4908, M: 45.7431, S: 0.02828 },
    { age_months: 15.5, L: 0.6519, M: 45.9849, S: 0.02831 },
    { age_months: 16.5, L: 0.8037, M: 46.2086, S: 0.02838 },
    { age_months: 17.5, L: 0.9463, M: 46.4162, S: 0.02846 },
    { age_months: 18.5, L: 1.0798, M: 46.6095, S: 0.02856 },
    { age_months: 19.5, L: 1.2043, M: 46.7901, S: 0.02868 },
    { age_months: 20.5, L: 1.3199, M: 46.9599, S: 0.02882 },
    { age_months: 21.5, L: 1.4269, M: 47.1198, S: 0.02896 },
    { age_months: 22.5, L: 1.5256, M: 47.2709, S: 0.02912 },
    { age_months: 23.5, L: 1.6162, M: 47.4144, S: 0.02929 },
    { age_months: 24.5, L: 1.6992, M: 47.5510, S: 0.02946 },
    { age_months: 25.5, L: 1.7748, M: 47.6814, S: 0.02964 },
    { age_months: 26.5, L: 1.8435, M: 47.8062, S: 0.02983 },
    { age_months: 27.5, L: 1.9057, M: 47.9256, S: 0.03002 },
    { age_months: 28.5, L: 1.9618, M: 48.0406, S: 0.03022 },
    { age_months: 29.5, L: 2.0122, M: 48.1513, S: 0.03042 },
    { age_months: 30.5, L: 2.0571, M: 48.2583, S: 0.03062 },
    { age_months: 31.5, L: 2.0971, M: 48.3619, S: 0.03083 },
    { age_months: 32.5, L: 2.1323, M: 48.4626, S: 0.03103 },
    { age_months: 33.5, L: 2.1633, M: 48.5604, S: 0.03124 },
    { age_months: 34.5, L: 2.1902, M: 48.6556, S: 0.03145 },
    { age_months: 35.5, L: 2.2136, M: 48.7485, S: 0.03166 },
    { age_months: 36, L: 2.2238, M: 48.7940, S: 0.03177 },
];
