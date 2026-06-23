// Nellhaus Head Circumference-for-Age (0-120 months)
// Source: Gerhard Nellhaus, "Composite International & Interracial Graphs," Pediatrics (1968)
// Digitized milestones with linear interpolation for monthly LMS parameters

export interface LMSDataPoint {
    age_months: number;
    L: number;
    M: number;
    S: number;
}

interface Milestone {
    age: number;
    mean: number;
    sd: number;
}

// Boys head circumference milestones (birth to 10 years / 120 months)
const BOYS_MILESTONES: Milestone[] = [
    { age: 0, mean: 34.5, sd: 1.3 },
    { age: 1, mean: 37.3, sd: 1.3 },
    { age: 2, mean: 39.1, sd: 1.3 },
    { age: 3, mean: 40.5, sd: 1.3 },
    { age: 6, mean: 43.3, sd: 1.3 },
    { age: 9, mean: 45.0, sd: 1.3 },
    { age: 12, mean: 46.1, sd: 1.3 },
    { age: 18, mean: 47.4, sd: 1.3 },
    { age: 24, mean: 48.3, sd: 1.3 },
    { age: 36, mean: 49.5, sd: 1.4 },
    { age: 48, mean: 50.3, sd: 1.4 },
    { age: 60, mean: 50.8, sd: 1.4 },
    { age: 72, mean: 51.2, sd: 1.4 },
    { age: 84, mean: 51.6, sd: 1.4 },
    { age: 96, mean: 52.0, sd: 1.4 },
    { age: 108, mean: 52.4, sd: 1.4 },
    { age: 120, mean: 52.8, sd: 1.4 },
];

// Girls head circumference milestones (birth to 10 years / 120 months)
const GIRLS_MILESTONES: Milestone[] = [
    { age: 0, mean: 33.9, sd: 1.2 },
    { age: 1, mean: 36.5, sd: 1.2 },
    { age: 2, mean: 38.3, sd: 1.2 },
    { age: 3, mean: 39.5, sd: 1.2 },
    { age: 6, mean: 42.2, sd: 1.2 },
    { age: 9, mean: 43.8, sd: 1.2 },
    { age: 12, mean: 44.9, sd: 1.2 },
    { age: 18, mean: 46.2, sd: 1.3 },
    { age: 24, mean: 47.2, sd: 1.3 },
    { age: 36, mean: 48.6, sd: 1.3 },
    { age: 48, mean: 49.5, sd: 1.4 },
    { age: 60, mean: 50.2, sd: 1.4 },
    { age: 72, mean: 50.7, sd: 1.4 },
    { age: 84, mean: 51.1, sd: 1.4 },
    { age: 96, mean: 51.5, sd: 1.4 },
    { age: 108, mean: 51.9, sd: 1.4 },
    { age: 120, mean: 52.3, sd: 1.4 },
];

function interpolateMilestones(milestones: Milestone[]): LMSDataPoint[] {
    const result: LMSDataPoint[] = [];
    for (let month = 0; month <= 120; month++) {
        // Find lower and upper milestones
        let lower = milestones[0];
        let upper = milestones[milestones.length - 1];

        for (let i = 0; i < milestones.length - 1; i++) {
            if (month >= milestones[i].age && month <= milestones[i + 1].age) {
                lower = milestones[i];
                upper = milestones[i + 1];
                break;
            }
        }

        let mean = lower.mean;
        let sd = lower.sd;

        if (upper.age !== lower.age) {
            const ratio = (month - lower.age) / (upper.age - lower.age);
            mean = lower.mean + (upper.mean - lower.mean) * ratio;
            sd = lower.sd + (upper.sd - lower.sd) * ratio;
        }

        result.push({
            age_months: month,
            L: 1.0,
            M: mean,
            S: sd / mean,
        });
    }
    return result;
}

export const NELLHAUS_BOYS_HEAD_CIRCUMFERENCE = interpolateMilestones(BOYS_MILESTONES);
export const NELLHAUS_GIRLS_HEAD_CIRCUMFERENCE = interpolateMilestones(GIRLS_MILESTONES);
