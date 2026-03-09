// WHO Weight Velocity Standards
// Source: WHO Child Growth Standards: growth velocity based on weight, length and head circumference (2009)
// Velocity = change in measurement over a specified time interval
// Data represents percentile values for weight increments (g) at different age intervals

export interface VelocityDataPoint {
    age_interval_start: number; // start age in months
    age_interval_end: number;   // end age in months
    interval_months: number;    // duration of interval
    p3: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97: number;
}

// Boys Weight Velocity (grams gained over interval)
export const WHO_BOYS_WEIGHT_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 610, p10: 780, p25: 960, p50: 1160, p75: 1380, p90: 1600, p97: 1810 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 560, p10: 740, p25: 930, p50: 1150, p75: 1380, p90: 1610, p97: 1850 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 400, p10: 540, p25: 700, p50: 880, p75: 1070, p90: 1260, p97: 1460 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 280, p10: 400, p25: 530, p50: 680, p75: 840, p90: 1000, p97: 1160 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 200, p10: 310, p25: 430, p50: 560, p75: 700, p90: 840, p97: 980 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 150, p10: 250, p25: 360, p50: 480, p75: 610, p90: 740, p97: 870 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 120, p10: 210, p25: 310, p50: 420, p75: 550, p90: 670, p97: 800 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 90, p10: 180, p25: 270, p50: 380, p75: 500, p90: 620, p97: 750 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 70, p10: 160, p25: 250, p50: 350, p75: 470, p90: 580, p97: 710 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 60, p10: 140, p25: 230, p50: 330, p75: 440, p90: 560, p97: 680 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 50, p10: 130, p25: 210, p50: 310, p75: 420, p90: 540, p97: 660 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 30, p10: 110, p25: 200, p50: 300, p75: 410, p90: 520, p97: 640 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 1360, p10: 1640, p25: 1940, p50: 2300, p75: 2700, p90: 3100, p97: 3500 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 830, p10: 1050, p25: 1290, p50: 1560, p75: 1870, p90: 2170, p97: 2500 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 440, p10: 630, p25: 840, p50: 1070, p75: 1330, p90: 1580, p97: 1850 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 260, p10: 430, p25: 620, p50: 830, p75: 1060, p90: 1290, p97: 1530 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 160, p10: 330, p25: 510, p50: 710, p75: 930, p90: 1150, p97: 1380 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 100, p10: 270, p25: 440, p50: 640, p75: 850, p90: 1070, p97: 1290 },
    // 3-month intervals
    { age_interval_start: 0, age_interval_end: 3, interval_months: 3, p3: 1900, p10: 2230, p25: 2600, p50: 3040, p75: 3530, p90: 4010, p97: 4510 },
    { age_interval_start: 3, age_interval_end: 6, interval_months: 3, p3: 710, p10: 940, p25: 1190, p50: 1480, p75: 1810, p90: 2130, p97: 2470 },
    { age_interval_start: 6, age_interval_end: 9, interval_months: 3, p3: 380, p10: 590, p25: 810, p50: 1070, p75: 1360, p90: 1650, p97: 1960 },
    { age_interval_start: 9, age_interval_end: 12, interval_months: 3, p3: 230, p10: 430, p25: 650, p50: 900, p75: 1170, p90: 1450, p97: 1740 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 3020, p10: 3490, p25: 4000, p50: 4600, p75: 5270, p90: 5940, p97: 6630 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 800, p10: 1120, p25: 1480, p50: 1900, p75: 2370, p90: 2840, p97: 3340 },
];

// Girls Weight Velocity (grams gained over interval)
export const WHO_GIRLS_WEIGHT_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 470, p10: 630, p25: 800, p50: 1000, p75: 1200, p90: 1400, p97: 1600 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 460, p10: 620, p25: 790, p50: 990, p75: 1200, p90: 1420, p97: 1640 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 340, p10: 470, p25: 620, p50: 790, p75: 980, p90: 1170, p97: 1360 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 240, p10: 350, p25: 480, p50: 630, p75: 790, p90: 950, p97: 1120 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 170, p10: 280, p25: 390, p50: 530, p75: 670, p90: 820, p97: 970 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 130, p10: 230, p25: 330, p50: 460, p75: 590, p90: 730, p97: 870 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 100, p10: 190, p25: 290, p50: 410, p75: 540, p90: 670, p97: 810 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 80, p10: 170, p25: 260, p50: 370, p75: 500, p90: 630, p97: 760 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 60, p10: 140, p25: 240, p50: 350, p75: 470, p90: 600, p97: 730 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 50, p10: 130, p25: 220, p50: 330, p75: 450, p90: 580, p97: 710 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 30, p10: 120, p25: 210, p50: 310, p75: 430, p90: 560, p97: 690 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 20, p10: 100, p25: 200, p50: 300, p75: 420, p90: 550, p97: 680 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 1090, p10: 1360, p25: 1660, p50: 2000, p75: 2380, p90: 2770, p97: 3160 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 700, p10: 920, p25: 1150, p50: 1420, p75: 1730, p90: 2040, p97: 2370 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 370, p10: 560, p25: 770, p50: 1010, p75: 1270, p90: 1540, p97: 1820 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 210, p10: 390, p25: 590, p50: 810, p75: 1060, p90: 1310, p97: 1570 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 130, p10: 300, p25: 490, p50: 710, p75: 950, p90: 1190, p97: 1440 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 70, p10: 240, p25: 430, p50: 650, p75: 890, p90: 1120, p97: 1370 },
    // 3-month intervals
    { age_interval_start: 0, age_interval_end: 3, interval_months: 3, p3: 1580, p10: 1910, p25: 2280, p50: 2710, p75: 3190, p90: 3680, p97: 4180 },
    { age_interval_start: 3, age_interval_end: 6, interval_months: 3, p3: 610, p10: 840, p25: 1090, p50: 1380, p75: 1710, p90: 2040, p97: 2390 },
    { age_interval_start: 6, age_interval_end: 9, interval_months: 3, p3: 310, p10: 530, p25: 760, p50: 1030, p75: 1330, p90: 1640, p97: 1970 },
    { age_interval_start: 9, age_interval_end: 12, interval_months: 3, p3: 170, p10: 380, p25: 610, p50: 880, p75: 1170, p90: 1460, p97: 1780 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 2530, p10: 3000, p25: 3520, p50: 4120, p75: 4790, p90: 5460, p97: 6160 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 650, p10: 990, p25: 1370, p50: 1810, p75: 2310, p90: 2810, p97: 3340 },
];
