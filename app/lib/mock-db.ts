
export interface Patient {
    id: string;
    name: string;
    gender: 'male' | 'female';
    dob: string;
}

export const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'John Doe', gender: 'male', dob: '2024-01-01' },
    { id: '2', name: 'Jane Smith', gender: 'female', dob: '2023-06-15' },
];

export const MOCK_MEASUREMENTS = {
    '1': [
        { date: '2024-01-01', ageMonths: 0, weight: 3.5 },
        { date: '2024-04-01', ageMonths: 3, weight: 6.5 },
    ],
    '2': [
        { date: '2023-06-15', ageMonths: 0, weight: 3.2 },
        { date: '2024-06-15', ageMonths: 12, weight: 9.0 },
    ]
};
