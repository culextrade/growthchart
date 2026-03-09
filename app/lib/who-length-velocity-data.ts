// WHO Length/Height Velocity Standards
// Source: WHO Child Growth Standards: growth velocity based on weight, length and head circumference (2009)
// Data represents percentile values for length/height increments (cm) at different age intervals

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

// Boys Length Velocity (cm gained over interval)
export const WHO_BOYS_LENGTH_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 2.6, p10: 3.0, p25: 3.4, p50: 3.8, p75: 4.3, p90: 4.7, p97: 5.2 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 2.3, p10: 2.7, p25: 3.1, p50: 3.5, p75: 3.9, p90: 4.4, p97: 4.8 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 1.9, p10: 2.2, p25: 2.6, p50: 3.0, p75: 3.4, p90: 3.8, p97: 4.2 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 1.6, p10: 1.9, p25: 2.2, p50: 2.6, p75: 3.0, p90: 3.3, p97: 3.7 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 1.3, p10: 1.6, p25: 1.9, p50: 2.3, p75: 2.6, p90: 3.0, p97: 3.3 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 1.1, p10: 1.4, p25: 1.7, p50: 2.0, p75: 2.3, p90: 2.7, p97: 3.0 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 1.0, p10: 1.2, p25: 1.5, p50: 1.8, p75: 2.1, p90: 2.4, p97: 2.8 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 0.9, p10: 1.1, p25: 1.4, p50: 1.7, p75: 2.0, p90: 2.3, p97: 2.6 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 0.8, p10: 1.1, p25: 1.3, p50: 1.6, p75: 1.9, p90: 2.2, p97: 2.5 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 0.7, p10: 1.0, p25: 1.2, p50: 1.5, p75: 1.8, p90: 2.0, p97: 2.3 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 0.7, p10: 0.9, p25: 1.2, p50: 1.4, p75: 1.7, p90: 1.9, p97: 2.2 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 0.6, p10: 0.9, p25: 1.1, p50: 1.3, p75: 1.6, p90: 1.9, p97: 2.1 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 5.4, p10: 5.9, p25: 6.5, p50: 7.1, p75: 7.8, p90: 8.4, p97: 9.1 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 3.8, p10: 4.3, p25: 4.8, p50: 5.4, p75: 6.0, p90: 6.5, p97: 7.1 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 2.7, p10: 3.1, p25: 3.6, p50: 4.1, p75: 4.6, p90: 5.1, p97: 5.6 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 2.1, p10: 2.5, p25: 2.9, p50: 3.4, p75: 3.9, p90: 4.3, p97: 4.8 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 1.7, p10: 2.1, p25: 2.5, p50: 2.9, p75: 3.4, p90: 3.8, p97: 4.3 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 1.5, p10: 1.9, p25: 2.3, p50: 2.7, p75: 3.1, p90: 3.5, p97: 3.9 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 12.6, p10: 13.5, p25: 14.5, p50: 15.7, p75: 16.9, p90: 18.0, p97: 19.2 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 5.7, p10: 6.5, p25: 7.5, p50: 8.5, p75: 9.6, p90: 10.6, p97: 11.7 },
];

// Girls Length Velocity (cm gained over interval)
export const WHO_GIRLS_LENGTH_VELOCITY: VelocityDataPoint[] = [
    // 1-month intervals
    { age_interval_start: 0, age_interval_end: 1, interval_months: 1, p3: 2.3, p10: 2.7, p25: 3.1, p50: 3.6, p75: 4.0, p90: 4.5, p97: 4.9 },
    { age_interval_start: 1, age_interval_end: 2, interval_months: 1, p3: 2.1, p10: 2.5, p25: 2.9, p50: 3.3, p75: 3.7, p90: 4.1, p97: 4.5 },
    { age_interval_start: 2, age_interval_end: 3, interval_months: 1, p3: 1.7, p10: 2.1, p25: 2.4, p50: 2.8, p75: 3.2, p90: 3.6, p97: 4.0 },
    { age_interval_start: 3, age_interval_end: 4, interval_months: 1, p3: 1.4, p10: 1.8, p25: 2.1, p50: 2.5, p75: 2.8, p90: 3.2, p97: 3.6 },
    { age_interval_start: 4, age_interval_end: 5, interval_months: 1, p3: 1.2, p10: 1.5, p25: 1.8, p50: 2.2, p75: 2.5, p90: 2.9, p97: 3.2 },
    { age_interval_start: 5, age_interval_end: 6, interval_months: 1, p3: 1.1, p10: 1.3, p25: 1.6, p50: 1.9, p75: 2.3, p90: 2.6, p97: 3.0 },
    { age_interval_start: 6, age_interval_end: 7, interval_months: 1, p3: 0.9, p10: 1.2, p25: 1.5, p50: 1.8, p75: 2.1, p90: 2.4, p97: 2.7 },
    { age_interval_start: 7, age_interval_end: 8, interval_months: 1, p3: 0.8, p10: 1.1, p25: 1.3, p50: 1.6, p75: 1.9, p90: 2.2, p97: 2.5 },
    { age_interval_start: 8, age_interval_end: 9, interval_months: 1, p3: 0.8, p10: 1.0, p25: 1.3, p50: 1.5, p75: 1.8, p90: 2.1, p97: 2.4 },
    { age_interval_start: 9, age_interval_end: 10, interval_months: 1, p3: 0.7, p10: 0.9, p25: 1.2, p50: 1.4, p75: 1.7, p90: 2.0, p97: 2.3 },
    { age_interval_start: 10, age_interval_end: 11, interval_months: 1, p3: 0.6, p10: 0.9, p25: 1.1, p50: 1.4, p75: 1.6, p90: 1.9, p97: 2.2 },
    { age_interval_start: 11, age_interval_end: 12, interval_months: 1, p3: 0.6, p10: 0.8, p25: 1.1, p50: 1.3, p75: 1.6, p90: 1.8, p97: 2.1 },
    // 2-month intervals
    { age_interval_start: 0, age_interval_end: 2, interval_months: 2, p3: 4.9, p10: 5.5, p25: 6.1, p50: 6.7, p75: 7.4, p90: 8.0, p97: 8.7 },
    { age_interval_start: 2, age_interval_end: 4, interval_months: 2, p3: 3.5, p10: 4.0, p25: 4.5, p50: 5.1, p75: 5.7, p90: 6.2, p97: 6.8 },
    { age_interval_start: 4, age_interval_end: 6, interval_months: 2, p3: 2.5, p10: 2.9, p25: 3.4, p50: 3.9, p75: 4.5, p90: 5.0, p97: 5.6 },
    { age_interval_start: 6, age_interval_end: 8, interval_months: 2, p3: 2.0, p10: 2.4, p25: 2.8, p50: 3.3, p75: 3.8, p90: 4.3, p97: 4.8 },
    { age_interval_start: 8, age_interval_end: 10, interval_months: 2, p3: 1.6, p10: 2.0, p25: 2.5, p50: 2.9, p75: 3.4, p90: 3.9, p97: 4.4 },
    { age_interval_start: 10, age_interval_end: 12, interval_months: 2, p3: 1.4, p10: 1.8, p25: 2.2, p50: 2.6, p75: 3.1, p90: 3.5, p97: 4.0 },
    // 6-month intervals
    { age_interval_start: 0, age_interval_end: 6, interval_months: 6, p3: 11.8, p10: 12.8, p25: 13.8, p50: 14.9, p75: 16.1, p90: 17.2, p97: 18.4 },
    { age_interval_start: 6, age_interval_end: 12, interval_months: 6, p3: 5.3, p10: 6.1, p25: 7.1, p50: 8.1, p75: 9.2, p90: 10.2, p97: 11.3 },
];
