// WHO Motor Development Milestones
// Source: WHO Multicentre Growth Reference Study (2006)
// Windows of achievement for 6 gross motor milestones
// Each milestone has age windows (in months) for percentiles

export interface MotorMilestone {
    id: string;
    name_en: string;
    name_id: string;
    description_en: string;
    description_id: string;
    p1: number;   // 1st percentile (earliest achievers)
    p5: number;   // 5th percentile
    p25: number;  // 25th percentile
    p50: number;  // 50th percentile (median)
    p75: number;  // 75th percentile
    p95: number;  // 95th percentile
    p99: number;  // 99th percentile (latest within normal)
}

export const WHO_MOTOR_MILESTONES: MotorMilestone[] = [
    {
        id: 'sitting',
        name_en: 'Sitting without support',
        name_id: 'Duduk tanpa bantuan',
        description_en: 'Child sits up straight with head erect for at least 10 seconds without any support.',
        description_id: 'Anak duduk tegak dengan kepala tegak selama minimal 10 detik tanpa bantuan apapun.',
        p1: 3.8,
        p5: 4.3,
        p25: 5.2,
        p50: 5.9,
        p75: 6.8,
        p95: 8.5,
        p99: 9.2,
    },
    {
        id: 'standing_with_assistance',
        name_en: 'Standing with assistance',
        name_id: 'Berdiri dengan bantuan',
        description_en: 'Child stands in upright position on both feet, holding on to a stable object with both hands.',
        description_id: 'Anak berdiri tegak pada kedua kaki, berpegangan pada benda stabil dengan kedua tangan.',
        p1: 4.8,
        p5: 5.4,
        p25: 6.6,
        p50: 7.6,
        p75: 8.8,
        p95: 10.8,
        p99: 11.4,
    },
    {
        id: 'hands_and_knees_crawling',
        name_en: 'Hands-and-knees crawling',
        name_id: 'Merangkak dengan tangan dan lutut',
        description_en: 'Child moves forward on hands and knees in a continuous movement at least 3 times.',
        description_id: 'Anak bergerak maju dengan tangan dan lutut dalam gerakan kontinu minimal 3 kali.',
        p1: 5.2,
        p5: 5.9,
        p25: 7.0,
        p50: 8.3,
        p75: 9.7,
        p95: 11.5,
        p99: 13.5,
    },
    {
        id: 'walking_with_assistance',
        name_en: 'Walking with assistance',
        name_id: 'Berjalan dengan bantuan',
        description_en: 'Child walks forward several steps, holding on to a stable object with one or both hands.',
        description_id: 'Anak berjalan maju beberapa langkah, berpegangan pada benda stabil dengan satu atau kedua tangan.',
        p1: 5.9,
        p5: 6.6,
        p25: 7.8,
        p50: 9.2,
        p75: 10.4,
        p95: 12.5,
        p99: 13.7,
    },
    {
        id: 'standing_alone',
        name_en: 'Standing alone',
        name_id: 'Berdiri sendiri',
        description_en: 'Child stands in upright position on both feet without holding on to anything for at least 10 seconds.',
        description_id: 'Anak berdiri tegak pada kedua kaki tanpa berpegangan apapun selama minimal 10 detik.',
        p1: 6.9,
        p5: 7.8,
        p25: 9.4,
        p50: 10.8,
        p75: 12.3,
        p95: 14.0,
        p99: 16.9,
    },
    {
        id: 'walking_alone',
        name_en: 'Walking alone',
        name_id: 'Berjalan sendiri',
        description_en: 'Child walks forward at least 5 steps with no contact with any person or object.',
        description_id: 'Anak berjalan maju minimal 5 langkah tanpa kontak dengan orang atau benda apapun.',
        p1: 8.2,
        p5: 8.8,
        p25: 10.5,
        p50: 12.1,
        p75: 13.5,
        p95: 15.2,
        p99: 17.6,
    },
];
