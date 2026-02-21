#!/usr/bin/env node
/**
 * Generates cdc-percentile-data.ts from official CDC CSV files.
 * Run: node scripts/generate_cdc_percentiles.js
 */
const fs = require('fs');
const path = require('path');

const REF_DIR = path.join(__dirname, '..', 'references', 'cdc');
const OUT_FILE = path.join(__dirname, '..', 'app', 'lib', 'cdc-percentile-data.ts');

function parseCSV(filename) {
    const raw = fs.readFileSync(path.join(REF_DIR, filename), 'utf-8');
    const lines = raw.trim().split(/\r?\n/);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const vals = line.split(',');
        const row = {};
        headers.forEach((h, i) => { row[h.trim()] = vals[i].trim(); });
        return row;
    });
}

function splitBySex(rows) {
    const result = { male: [], female: [] };
    for (const row of rows) {
        const sex = row.Sex === '1' ? 'male' : 'female';
        const agemos = parseFloat(row.Agemos);
        result[sex].push({ agemos, row });
    }
    return result;
}

function round(v) {
    return Math.round(v * 100) / 100;
}

function buildWeightHeight(rows) {
    const data = splitBySex(rows);
    const format = (entries) => entries.map(({ agemos, row }) => ({
        age_months: agemos,
        L: parseFloat(row.L),
        M: parseFloat(row.M),
        S: parseFloat(row.S),
        P3: round(parseFloat(row.P3)),
        P5: round(parseFloat(row.P5)),
        P10: round(parseFloat(row.P10)),
        P25: round(parseFloat(row.P25)),
        P50: round(parseFloat(row.P50)),
        P75: round(parseFloat(row.P75)),
        P90: round(parseFloat(row.P90)),
        P95: round(parseFloat(row.P95)),
        P97: round(parseFloat(row.P97)),
    }));
    return { male: format(data.male), female: format(data.female) };
}

function buildBMI(rows) {
    const data = splitBySex(rows);
    const format = (entries) => entries.map(({ agemos, row }) => ({
        age_months: agemos,
        L: parseFloat(row.L),
        M: parseFloat(row.M),
        S: parseFloat(row.S),
        P3: round(parseFloat(row.P3)),
        P5: round(parseFloat(row.P5)),
        P10: round(parseFloat(row.P10)),
        P25: round(parseFloat(row.P25)),
        P50: round(parseFloat(row.P50)),
        P75: round(parseFloat(row.P75)),
        P85: round(parseFloat(row.P85)),
        P90: round(parseFloat(row.P90)),
        P95: round(parseFloat(row.P95)),
        P97: round(parseFloat(row.P97)),
    }));
    return { male: format(data.male), female: format(data.female) };
}

// Parse all CSVs
const weight = buildWeightHeight(parseCSV('wtage.csv'));
const height = buildWeightHeight(parseCSV('statage.csv'));
const bmi = buildBMI(parseCSV('bmiagerev.csv'));

const output = `// Auto-generated from CDC CSV files. Do not edit manually.
// Source: references/cdc/wtage.csv, statage.csv, bmiagerev.csv

export interface CDCPercentilePoint {
  age_months: number;
  L: number;
  M: number;
  S: number;
  P3: number;
  P5: number;
  P10: number;
  P25: number;
  P50: number;
  P75: number;
  P90: number;
  P95: number;
  P97: number;
}

export interface CDCBMIPercentilePoint extends CDCPercentilePoint {
  P85: number;
}

export const CDC_WEIGHT_PERCENTILES = ${JSON.stringify(weight, null, 2)} as const;

export const CDC_HEIGHT_PERCENTILES = ${JSON.stringify(height, null, 2)} as const;

export const CDC_BMI_PERCENTILES = ${JSON.stringify(bmi, null, 2)} as const;
`;

fs.writeFileSync(OUT_FILE, output, 'utf-8');
console.log('Generated:', OUT_FILE);
console.log('Weight:', weight.male.length, 'male,', weight.female.length, 'female');
console.log('Height:', height.male.length, 'male,', height.female.length, 'female');
console.log('BMI:', bmi.male.length, 'male,', bmi.female.length, 'female');
