// WHO Head Circumference Velocity Standards
// Source: WHO Child Growth Standards: growth velocity based on weight, length and head circumference (2009)
// Data represents percentile values for head circumference increments (cm) at different age intervals

export interface VelocityDataPoint {
    age_interval_start: number;
    age_interval_end: number;
    interval_months: number;
    p3: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97: number;
}

// Boys Head Circumference Velocity (cm gained over interval)
export const WHO_BOYS_HC_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 1.4, p10: 1.7, p25: 2.0, p50: 2.4, p75: 2.8, p90: 3.2, p97: 3.6 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 0.9, p10: 1.1, p25: 1.4, p50: 1.7, p75: 2.0, p90: 2.3, p97: 2.6 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 0.6, p10: 0.8, p25: 1.0, p50: 1.3, p75: 1.6, p90: 1.8, p97: 2.1 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 0.4, p10: 0.6, p25: 0.8, p50: 1.1, p75: 1.3, p90: 1.5, p97: 1.8 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 0.3, p10: 0.5, p25: 0.7, p50: 0.9, p75: 1.1, p90: 1.3, p97: 1.5 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 0.2, p10: 0.4, p25: 0.6, p50: 0.8, p75: 1.0, p90: 1.2, p97: 1.4 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 0.2, p10: 0.3, p25: 0.5, p50: 0.7, p75: 0.9, p90: 1.1, p97: 1.3 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 0.1, p10: 0.3, p25: 0.5, p50: 0.6, p75: 0.8, p90: 1.0, p97: 1.2 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 0.1, p10: 0.3, p25: 0.4, p50: 0.6, p75: 0.8, p90: 0.9, p97: 1.1 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 0.1, p10: 0.2, p25: 0.4, p50: 0.5, p75: 0.7, p90: 0.9, p97: 1.0 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 0.1, p10: 0.2, p25: 0.3, p50: 0.5, p75: 0.7, p90: 0.8, p97: 1.0 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 0.0, p10: 0.2, p25: 0.3, p50: 0.5, p75: 0.6, p90: 0.8, p97: 1.0 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 2.7, p10: 3.1, p25: 3.5, p50: 4.0, p75: 4.5, p90: 5.0, p97: 5.6 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 1.3, p10: 1.6, p25: 2.0, p50: 2.4, p75: 2.8, p90: 3.2, p97: 3.6 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 0.7, p10: 1.0, p25: 1.3, p50: 1.7, p75: 2.1, p90: 2.4, p97: 2.8 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 0.5, p10: 0.7, p25: 1.0, p50: 1.3, p75: 1.7, p90: 2.0, p97: 2.4 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 0.3, p10: 0.5, p25: 0.8, p50: 1.1, p75: 1.4, p90: 1.8, p97: 2.1 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 0.2, p10: 0.4, p25: 0.7, p50: 1.0, p75: 1.3, p90: 1.6, p97: 1.9 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 5.7, p10: 6.3, p25: 7.0, p50: 7.8, p75: 8.6, p90: 9.4, p97: 10.3 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 1.3, p10: 1.8, p25: 2.3, p50: 3.0, p75: 3.7, p90: 4.4, p97: 5.2 },
];

// Girls Head Circumference Velocity (cm gained over interval)
export const WHO_GIRLS_HC_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 1.1, p10: 1.4, p25: 1.7, p50: 2.1, p75: 2.5, p90: 2.9, p97: 3.3 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 0.8, p10: 1.1, p25: 1.3, p50: 1.6, p75: 1.9, p90: 2.2, p97: 2.5 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 0.6, p10: 0.8, p25: 1.0, p50: 1.2, p75: 1.5, p90: 1.7, p97: 2.0 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 0.4, p10: 0.6, p25: 0.8, p50: 1.0, p75: 1.3, p90: 1.5, p97: 1.7 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 0.3, p10: 0.5, p25: 0.7, p50: 0.9, p75: 1.1, p90: 1.3, p97: 1.5 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 0.2, p10: 0.4, p25: 0.6, p50: 0.8, p75: 1.0, p90: 1.2, p97: 1.4 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 0.2, p10: 0.3, p25: 0.5, p50: 0.7, p75: 0.9, p90: 1.1, p97: 1.2 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 0.1, p10: 0.3, p25: 0.4, p50: 0.6, p75: 0.8, p90: 1.0, p97: 1.2 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 0.1, p10: 0.2, p25: 0.4, p50: 0.6, p75: 0.7, p90: 0.9, p97: 1.1 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 0.1, p10: 0.2, p25: 0.4, p50: 0.5, p75: 0.7, p90: 0.9, p97: 1.0 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 0.0, p10: 0.2, p25: 0.3, p50: 0.5, p75: 0.6, p90: 0.8, p97: 1.0 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 0.0, p10: 0.1, p25: 0.3, p50: 0.4, p75: 0.6, p90: 0.8, p97: 0.9 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 2.3, p10: 2.8, p25: 3.2, p50: 3.7, p75: 4.2, p90: 4.8, p97: 5.3 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 1.2, p10: 1.5, p25: 1.9, p50: 2.3, p75: 2.7, p90: 3.1, p97: 3.5 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 0.7, p10: 1.0, p25: 1.3, p50: 1.7, p75: 2.0, p90: 2.4, p97: 2.8 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 0.4, p10: 0.7, p25: 1.0, p50: 1.3, p75: 1.7, p90: 2.0, p97: 2.4 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 0.3, p10: 0.5, p25: 0.8, p50: 1.1, p75: 1.4, p90: 1.7, p97: 2.1 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 0.1, p10: 0.4, p25: 0.6, p50: 0.9, p75: 1.3, p90: 1.6, p97: 1.9 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 5.2, p10: 5.8, p25: 6.5, p50: 7.3, p75: 8.2, p90: 9.0, p97: 9.9 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 1.1, p10: 1.5, p25: 2.1, p50: 2.7, p75: 3.4, p90: 4.1, p97: 4.9 },
];
