"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import {
    CDC_WEIGHT_PERCENTILES,
    CDC_HEIGHT_PERCENTILES,
    CDC_BMI_PERCENTILES,
} from "@/lib/cdc-percentile-data";
import { getStandardData, calculateZScore, type MetricType } from "@/lib/growth-standards";
import {
    WHO_BOYS_WEIGHT_VELOCITY,
    WHO_GIRLS_WEIGHT_VELOCITY,
} from "@/lib/who-weight-velocity-data";
import {
    WHO_BOYS_LENGTH_VELOCITY,
    WHO_GIRLS_LENGTH_VELOCITY,
} from "@/lib/who-length-velocity-data";
import {
    WHO_BOYS_HC_VELOCITY,
    WHO_GIRLS_HC_VELOCITY,
} from "@/lib/who-head-circumference-velocity-data";

export type ChartType =
    | "weight"
    | "height"
    | "bmi"
    | "weightForHeight"
    | "headCircumference"
    | "armCircumference"
    | "subscapularSkinfold"
    | "tricepsSkinfold"
    | "weightVelocity"
    | "lengthVelocity"
    | "hcVelocity";

export interface PatientInfo {
    name: string;
    dob: string;
    mrn?: string;
}

export interface MeasurementPoint {
    ageMonths: number;
    value: number;
    date?: string;
    height?: number;
    headCircumference?: number;
}

export interface CDCPrintChartProps {
    gender: "male" | "female";
    chartType: ChartType;
    isCDC?: boolean;
    measurements: MeasurementPoint[];
    patient?: PatientInfo;
    onClose: () => void;
    lang?: "id" | "en";
}

// Canvas dimensions (2x DPI for crisp printing)
const CANVAS_W = 1600;
const CANVAS_H = 1100;
const MARGIN = { top: 125, right: 65, bottom: 85, left: 85 };
const PLOT_W = CANVAS_W - MARGIN.left - MARGIN.right;
const PLOT_H = CANVAS_H - MARGIN.top - MARGIN.bottom;

const PERCENTILE_KEYS = ["P3", "P5", "P10", "P25", "P50", "P75", "P90", "P95", "P97"] as const;
const BMI_PERCENTILE_KEYS = ["P3", "P5", "P10", "P25", "P50", "P75", "P85", "P90", "P95", "P97"] as const;

const PERCENTILE_COLORS: Record<string, string> = {
    P3: "#dc2626",
    P5: "#ef4444",
    P10: "#f59e0b",
    P25: "#84cc16",
    P50: "#0ea5e9",
    P75: "#84cc16",
    P85: "#d97706",
    P90: "#f59e0b",
    P95: "#ef4444",
    P97: "#dc2626",
};

const PERCENTILE_STYLES: Record<string, { dash: number[]; width: number; opacity: number }> = {
    P3: { dash: [6, 4], width: 1.5, opacity: 0.7 },
    P5: { dash: [8, 4], width: 1.5, opacity: 0.7 },
    P10: { dash: [10, 5], width: 1.8, opacity: 0.8 },
    P25: { dash: [6, 8], width: 1.2, opacity: 0.5 },
    P50: { dash: [], width: 3, opacity: 1 },
    P75: { dash: [6, 8], width: 1.2, opacity: 0.5 },
    P85: { dash: [8, 4], width: 1.5, opacity: 0.7 },
    P90: { dash: [10, 5], width: 1.8, opacity: 0.8 },
    P95: { dash: [8, 4], width: 1.5, opacity: 0.7 },
    P97: { dash: [6, 4], width: 1.5, opacity: 0.7 },
};

function safeGetP(L: number, M: number, S: number, z: number): number {
    if (Math.abs(L) < 0.01) return M * Math.exp(S * z);
    const base = 1 + L * S * z;
    if (base <= 0) return M * Math.exp(S * z);
    const result = M * Math.pow(base, 1 / L);
    if (result <= 0 || result > M * 10) return M * Math.exp(S * z);
    return result;
}

function getChartTitle(chartType: ChartType, gender: "male" | "female", isCDC: boolean): string {
    const genderLabel = gender === "male" ? "Anak Laki-laki" : "Anak Perempuan";
    switch (chartType) {
        case "weight":
            return isCDC
                ? `Berat Badan menurut Umur — ${genderLabel} (2-20 tahun)`
                : `Berat Badan menurut Umur — ${genderLabel} (0-5 tahun)`;
        case "height":
            return isCDC
                ? `Tinggi Badan menurut Umur — ${genderLabel} (2-20 tahun)`
                : `Panjang/Tinggi Badan menurut Umur — ${genderLabel} (0-5 tahun)`;
        case "weightForHeight":
            return `Berat Badan menurut Panjang/Tinggi Badan — ${genderLabel} (45-120 cm)`;
        case "bmi":
            return isCDC
                ? `Indeks Massa Tubuh menurut Umur — ${genderLabel} (2-20 tahun)`
                : `Indeks Massa Tubuh menurut Umur — ${genderLabel} (0-5 tahun)`;
        case "headCircumference":
            return `Lingkar Kepala menurut Umur — ${genderLabel} (0-10 tahun)`;
        case "armCircumference":
            return `Lingkar Lengan Atas (LiLA) menurut Umur — ${genderLabel} (3-60 bulan)`;
        case "subscapularSkinfold":
            return `Lipatan Kulit Subskapula menurut Umur — ${genderLabel} (3-60 bulan)`;
        case "tricepsSkinfold":
            return `Lipatan Kulit Trisep menurut Umur — ${genderLabel} (3-60 bulan)`;
        case "weightVelocity":
            return `Kecepatan Pertumbuhan Berat Badan — ${genderLabel} (0-24 bulan)`;
        case "lengthVelocity":
            return `Kecepatan Pertumbuhan Panjang Badan — ${genderLabel} (0-24 bulan)`;
        case "hcVelocity":
            return `Kecepatan Pertumbuhan Lingkar Kepala — ${genderLabel} (0-24 bulan)`;
        default:
            return `Kurva Pertumbuhan — ${genderLabel}`;
    }
}

function getYLabel(chartType: ChartType): string {
    switch (chartType) {
        case "weight":
        case "weightForHeight":
            return "Berat (kg)";
        case "height":
            return "Tinggi/Panjang (cm)";
        case "bmi":
            return "IMT (kg/m²)";
        case "headCircumference":
            return "Lingkar Kepala (cm)";
        case "armCircumference":
            return "LiLA (cm)";
        case "subscapularSkinfold":
        case "tricepsSkinfold":
            return "Lipatan Kulit (mm)";
        case "weightVelocity":
            return "Pertambahan Berat (g/bulan)";
        case "lengthVelocity":
            return "Pertambahan Panjang (cm/bulan)";
        case "hcVelocity":
            return "Pertambahan Lingkar Kepala (cm/bulan)";
        default:
            return "Nilai";
    }
}

function getUnit(chartType: ChartType): string {
    switch (chartType) {
        case "weight":
        case "weightForHeight":
            return "kg";
        case "height":
            return "cm";
        case "bmi":
            return "kg/m²";
        case "headCircumference":
            return "cm";
        case "armCircumference":
            return "cm";
        case "subscapularSkinfold":
        case "tricepsSkinfold":
            return "mm";
        case "weightVelocity":
            return "g";
        case "lengthVelocity":
        case "hcVelocity":
            return "cm";
        default:
            return "";
    }
}

export function CDCPrintChart({
    gender,
    chartType,
    isCDC = false,
    measurements,
    patient,
    onClose,
    lang = "id",
}: CDCPrintChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    const isVelocity = chartType === "weightVelocity" || chartType === "lengthVelocity" || chartType === "hcVelocity";

    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Retina scaling (2x)
        const dpr = 2;
        canvas.width = CANVAS_W * dpr;
        canvas.height = CANVAS_H * dpr;
        canvas.style.width = `${CANVAS_W}px`;
        canvas.style.height = `${CANVAS_H}px`;
        ctx.scale(dpr, dpr);

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Header background
        const headerGradient = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
        headerGradient.addColorStop(0, gender === "male" ? "#dbeafe" : "#fce7f3");
        headerGradient.addColorStop(1, "#ffffff");
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, CANVAS_W, MARGIN.top - 10);

        // Title & Subtitle
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 22px 'Inter', 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(getChartTitle(chartType, gender, isCDC), MARGIN.left, 38);

        ctx.font = "12px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        const standardLabel = isVelocity
            ? "Standar Kecepatan Pertumbuhan WHO (2009)"
            : chartType === "headCircumference"
                ? "Standar Kurva Nellhaus / WHO"
                : isCDC
                    ? "Standar CDC 2000 — Persentil"
                    : "Standar Pertumbuhan Anak WHO 2006 — Z-Score (SD)";
        ctx.fillText(standardLabel, MARGIN.left, 58);

        // Patient info (right side)
        if (patient) {
            ctx.textAlign = "right";
            ctx.font = "bold 14px 'Inter', sans-serif";
            ctx.fillStyle = "#1e293b";
            ctx.fillText(patient.name, CANVAS_W - MARGIN.right, 30);
            ctx.font = "12px 'Inter', sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText(`Tanggal Lahir: ${patient.dob}`, CANVAS_W - MARGIN.right, 48);
            if (patient.mrn) {
                ctx.fillText(`No. RM: ${patient.mrn}`, CANVAS_W - MARGIN.right, 64);
            }
            ctx.textAlign = "left";
        }

        // Date printed
        ctx.font = "10px 'Inter', sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "right";
        ctx.fillText(
            `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
            CANVAS_W - MARGIN.right,
            MARGIN.top - 18
        );
        ctx.textAlign = "left";

        // Border
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(MARGIN.left, MARGIN.top, PLOT_W, PLOT_H);

        // Calculate Domains & Coordinates
        let xMin = 0;
        let xMax = 60;
        let xLabelStr = "Umur (bulan)";

        if (chartType === "weightForHeight") {
            xMin = 45;
            xMax = 120;
            xLabelStr = "Panjang/Tinggi Badan (cm)";
        } else if (chartType === "headCircumference") {
            xMin = 0;
            xMax = 120;
            xLabelStr = "Umur (bulan)";
        } else if (isCDC) {
            xMin = 24;
            xMax = 240;
            xLabelStr = "Umur (tahun)";
        } else if (isVelocity) {
            xMin = 0;
            xMax = 24;
            xLabelStr = "Interval Umur (bulan)";
        }

        const ageToX = (val: number) => {
            return MARGIN.left + ((val - xMin) / (xMax - xMin)) * PLOT_W;
        };

        // Determine Y Range & Data Points
        let yMin = Infinity;
        let yMax = -Infinity;

        let whoDataPoints: any[] = [];
        let cdcDataPoints: any[] = [];
        let velocityDataPoints: any[] = [];

        if (isVelocity) {
            const rawVel =
                chartType === "weightVelocity"
                    ? gender === "male" ? WHO_BOYS_WEIGHT_VELOCITY : WHO_GIRLS_WEIGHT_VELOCITY
                    : chartType === "lengthVelocity"
                        ? gender === "male" ? WHO_BOYS_LENGTH_VELOCITY : WHO_GIRLS_LENGTH_VELOCITY
                        : gender === "male" ? WHO_BOYS_HC_VELOCITY : WHO_GIRLS_HC_VELOCITY;
            velocityDataPoints = rawVel.filter(d => d.interval_months === 1);
            velocityDataPoints.forEach(d => {
                yMin = Math.min(yMin, d.p3);
                yMax = Math.max(yMax, d.p97);
            });
        } else if (isCDC) {
            if (chartType === "weight") cdcDataPoints = [...CDC_WEIGHT_PERCENTILES[gender]];
            else if (chartType === "height") cdcDataPoints = [...CDC_HEIGHT_PERCENTILES[gender]];
            else if (chartType === "bmi") cdcDataPoints = [...CDC_BMI_PERCENTILES[gender]];
            else if (chartType === "headCircumference") {
                const raw = getStandardData("headCircumference", gender, 0);
                cdcDataPoints = raw.map((d: any) => ({
                    age_months: d.age_months,
                    P3: safeGetP(d.L, d.M, d.S, -1.881),
                    P5: safeGetP(d.L, d.M, d.S, -1.645),
                    P10: safeGetP(d.L, d.M, d.S, -1.282),
                    P25: safeGetP(d.L, d.M, d.S, -0.674),
                    P50: d.M,
                    P75: safeGetP(d.L, d.M, d.S, 0.674),
                    P90: safeGetP(d.L, d.M, d.S, 1.282),
                    P95: safeGetP(d.L, d.M, d.S, 1.645),
                    P97: safeGetP(d.L, d.M, d.S, 1.881),
                }));
            }
            cdcDataPoints.forEach((d: any) => {
                const vals = [d.P3, d.P5, d.P10, d.P25, d.P50, d.P75, d.P90, d.P95, d.P97].filter(v => typeof v === "number" && !isNaN(v));
                if (vals.length) {
                    yMin = Math.min(yMin, ...vals);
                    yMax = Math.max(yMax, ...vals);
                }
            });
        } else {
            const metricKey: MetricType = chartType === "weightForHeight" ? "weightForHeight" : (chartType as MetricType);
            const raw = getStandardData(metricKey, gender, 0);
            whoDataPoints = raw.map((d: any) => ({
                x: d.length_cm !== undefined ? d.length_cm : d.age_months,
                s3neg: safeGetP(d.L, d.M, d.S, -3),
                s2neg: safeGetP(d.L, d.M, d.S, -2),
                s1neg: safeGetP(d.L, d.M, d.S, -1),
                median: d.M,
                s1pos: safeGetP(d.L, d.M, d.S, 1),
                s2pos: safeGetP(d.L, d.M, d.S, 2),
                s3pos: safeGetP(d.L, d.M, d.S, 3),
            }));
            whoDataPoints.forEach((d: any) => {
                const vals = [d.s3neg, d.s2neg, d.s1neg, d.median, d.s1pos, d.s2pos, d.s3pos].filter(v => typeof v === "number" && !isNaN(v));
                if (vals.length) {
                    yMin = Math.min(yMin, ...vals);
                    yMax = Math.max(yMax, ...vals);
                }
            });
        }

        // Include patient points in Y domain calculation
        measurements.forEach(m => {
            if (typeof m.value === "number" && !isNaN(m.value) && m.value > 0) {
                yMin = Math.min(yMin, m.value);
                yMax = Math.max(yMax, m.value);
            }
        });

        if (!isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 100;
        }

        // Add padding (5%)
        const yRange = yMax - yMin;
        const buffer = Math.max(yRange * 0.06, 1);
        yMin = Math.max(0, yMin - buffer);
        yMax = yMax + buffer;

        const valToY = (val: number) => {
            return MARGIN.top + PLOT_H - ((val - yMin) / (yMax - yMin)) * PLOT_H;
        };

        // Grid lines — Vertical (X-axis ticks)
        let xTicks: number[] = [];
        if (chartType === "weightForHeight") {
            xTicks = [45, 55, 65, 75, 85, 95, 105, 115, 120];
        } else if (chartType === "headCircumference") {
            xTicks = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
        } else if (isCDC) {
            xTicks = Array.from({ length: 19 }, (_, i) => (i + 2) * 12); // 24 to 240 months
        } else if (isVelocity) {
            xTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
        } else {
            xTicks = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
        }

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 0.5;
        xTicks.forEach(tickVal => {
            const x = ageToX(tickVal);
            ctx.beginPath();
            ctx.moveTo(x, MARGIN.top);
            ctx.lineTo(x, MARGIN.top + PLOT_H);
            ctx.stroke();
        });

        // Grid lines — Horizontal (Y-axis ticks)
        const numYTicks = 8;
        const yStep = (yMax - yMin) / numYTicks;
        ctx.strokeStyle = "#e2e8f0";
        for (let i = 0; i <= numYTicks; i++) {
            const v = yMin + i * yStep;
            const y = valToY(v);
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, y);
            ctx.lineTo(MARGIN.left + PLOT_W, y);
            ctx.stroke();
        }

        // X-axis Labels
        ctx.fillStyle = "#475569";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        xTicks.forEach(tickVal => {
            const x = ageToX(tickVal);
            const labelStr = isCDC ? `${tickVal / 12}` : `${tickVal}`;
            ctx.fillText(labelStr, x, MARGIN.top + PLOT_H + 20);
        });

        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(xLabelStr, CANVAS_W / 2, MARGIN.top + PLOT_H + 50);

        // Y-axis Labels
        ctx.textAlign = "right";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.fillStyle = "#475569";
        for (let i = 0; i <= numYTicks; i++) {
            const v = yMin + i * yStep;
            const y = valToY(v);
            ctx.fillText(`${v.toFixed(1)}`, MARGIN.left - 8, y + 4);
        }

        // Y-axis title (rotated)
        ctx.save();
        ctx.translate(22, CANVAS_H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(getYLabel(chartType), 0, 0);
        ctx.restore();

        // DRAW REFERENCE CURVES
        if (isVelocity) {
            // Draw Velocity curves
            const keys = ["p3", "p10", "p25", "p50", "p75", "p90", "p97"] as const;
            const colors: Record<string, string> = {
                p3: "#ef4444",
                p10: "#f59e0b",
                p25: "#84cc16",
                p50: "#0ea5e9",
                p75: "#84cc16",
                p90: "#f59e0b",
                p97: "#ef4444",
            };

            for (const key of keys) {
                ctx.strokeStyle = colors[key];
                ctx.lineWidth = key === "p50" ? 2.5 : 1.2;
                ctx.setLineDash(key === "p50" ? [] : [6, 4]);
                ctx.globalAlpha = key === "p50" ? 1 : 0.6;

                ctx.beginPath();
                let started = false;
                velocityDataPoints.forEach(d => {
                    const x = ageToX(d.age_interval_start);
                    const y = valToY(d[key]);
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
        } else if (isCDC) {
            // Draw CDC Percentiles
            const pKeys = chartType === "bmi" ? BMI_PERCENTILE_KEYS : PERCENTILE_KEYS;

            // Shade Normal Zone (P10 to P90)
            ctx.fillStyle = "rgba(34, 197, 94, 0.04)";
            ctx.beginPath();
            cdcDataPoints.forEach((d, i) => {
                const x = ageToX(d.age_months);
                const y = valToY(d.P90);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            for (let i = cdcDataPoints.length - 1; i >= 0; i--) {
                const d = cdcDataPoints[i];
                const x = ageToX(d.age_months);
                const y = valToY(d.P10);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw Lines
            for (const key of pKeys) {
                const style = PERCENTILE_STYLES[key] || { dash: [4, 4], width: 1, opacity: 0.6 };
                const color = PERCENTILE_COLORS[key] || "#0ea5e9";
                ctx.strokeStyle = color;
                ctx.lineWidth = style.width;
                ctx.globalAlpha = style.opacity;
                ctx.setLineDash(style.dash);

                ctx.beginPath();
                let started = false;
                cdcDataPoints.forEach(d => {
                    const val = d[key];
                    if (val === undefined || val === null) return;
                    const x = ageToX(d.age_months);
                    const y = valToY(val);
                    if (y < MARGIN.top || y > MARGIN.top + PLOT_H) return;
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();

                // End Label
                const last = cdcDataPoints[cdcDataPoints.length - 1];
                if (last && last[key] !== undefined) {
                    const y = valToY(last[key]);
                    if (y >= MARGIN.top && y <= MARGIN.top + PLOT_H) {
                        ctx.globalAlpha = 1;
                        ctx.setLineDash([]);
                        ctx.fillStyle = color;
                        ctx.font = "bold 10px 'Inter', sans-serif";
                        ctx.textAlign = "left";
                        ctx.fillText(key.replace("P", ""), MARGIN.left + PLOT_W + 5, y + 3);
                    }
                }
            }
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
        } else {
            // Draw WHO SD Lines (-3SD, -2SD, -1SD, Median, +1SD, +2SD, +3SD)
            const sdConfigs = [
                { key: "s3pos", label: "+3 SD", color: "#ef4444", dash: [4, 4], width: 1, opacity: 0.5 },
                { key: "s2pos", label: "+2 SD", color: "#f59e0b", dash: [6, 4], width: 1.5, opacity: 0.7 },
                { key: "s1pos", label: "+1 SD", color: "#94a3b8", dash: [2, 4], width: 1, opacity: 0.4 },
                { key: "median", label: "Median (0 SD)", color: "#0ea5e9", dash: [], width: 2.8, opacity: 1 },
                { key: "s1neg", label: "-1 SD", color: "#94a3b8", dash: [2, 4], width: 1, opacity: 0.4 },
                { key: "s2neg", label: "-2 SD", color: "#f59e0b", dash: [6, 4], width: 1.5, opacity: 0.7 },
                { key: "s3neg", label: "-3 SD", color: "#ef4444", dash: [4, 4], width: 1, opacity: 0.5 },
            ];

            // Shade Normal Zone (-2SD to +2SD)
            ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
            ctx.beginPath();
            whoDataPoints.forEach((d, i) => {
                const x = ageToX(d.x);
                const y = valToY(d.s2pos);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            for (let i = whoDataPoints.length - 1; i >= 0; i--) {
                const d = whoDataPoints[i];
                const x = ageToX(d.x);
                const y = valToY(d.s2neg);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw Lines
            for (const cfg of sdConfigs) {
                ctx.strokeStyle = cfg.color;
                ctx.lineWidth = cfg.width;
                ctx.globalAlpha = cfg.opacity;
                ctx.setLineDash(cfg.dash);

                ctx.beginPath();
                let started = false;
                whoDataPoints.forEach(d => {
                    const val = d[cfg.key];
                    if (val === undefined || val === null) return;
                    const x = ageToX(d.x);
                    const y = valToY(val);
                    if (y < MARGIN.top || y > MARGIN.top + PLOT_H) return;
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();

                // End Label
                const last = whoDataPoints[whoDataPoints.length - 1];
                if (last && last[cfg.key] !== undefined) {
                    const y = valToY(last[cfg.key]);
                    if (y >= MARGIN.top && y <= MARGIN.top + PLOT_H) {
                        ctx.globalAlpha = 1;
                        ctx.setLineDash([]);
                        ctx.fillStyle = cfg.color;
                        ctx.font = "bold 10px 'Inter', sans-serif";
                        ctx.textAlign = "left";
                        ctx.fillText(cfg.label.replace(" SD", "").replace(" (0 SD)", ""), MARGIN.left + PLOT_W + 5, y + 3);
                    }
                }
            }
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
        }

        // DRAW PATIENT MEASUREMENT DATA POINTS
        if (measurements.length > 0) {
            const sorted = [...measurements].sort((a, b) => a.ageMonths - b.ageMonths);

            // Connecting line
            if (sorted.length > 1) {
                ctx.strokeStyle = "#6366f1";
                ctx.lineWidth = 2.8;
                ctx.setLineDash([]);
                ctx.beginPath();
                sorted.forEach((m, i) => {
                    const xVal = chartType === "weightForHeight" ? (m.height || 0) : m.ageMonths;
                    const x = ageToX(xVal);
                    const y = valToY(m.value);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }

            // Data Point circles & labels
            sorted.forEach(m => {
                const xVal = chartType === "weightForHeight" ? (m.height || 0) : m.ageMonths;
                const x = ageToX(xVal);
                const y = valToY(m.value);

                // Outer ring
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.strokeStyle = "#6366f1";
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Inner dot
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#6366f1";
                ctx.fill();

                // Value label above dot
                ctx.fillStyle = "#1e293b";
                ctx.font = "bold 10px 'Inter', sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(m.value.toFixed(1), x, y - 12);
            });
        }

        // LEGEND AT BOTTOM
        const legendY = CANVAS_H - 25;
        ctx.font = "10px 'Inter', sans-serif";
        ctx.textAlign = "left";
        let legendX = MARGIN.left;

        let legendItems: { label: string; color: string; dash: number[] }[] = [];

        if (isVelocity) {
            legendItems = [
                { label: "P3/P97", color: "#ef4444", dash: [6, 4] },
                { label: "P10/P90", color: "#f59e0b", dash: [6, 4] },
                { label: "P25/P75", color: "#84cc16", dash: [6, 4] },
                { label: "P50 (Median)", color: "#0ea5e9", dash: [] },
                { label: "Data Pasien", color: "#6366f1", dash: [] },
            ];
        } else if (isCDC) {
            legendItems = [
                { label: "P3/P97", color: "#dc2626", dash: [6, 4] },
                { label: "P5/P95", color: "#ef4444", dash: [8, 4] },
                { label: "P10/P90", color: "#f59e0b", dash: [10, 5] },
                { label: "P25/P75", color: "#84cc16", dash: [6, 8] },
                { label: "P50 (Median)", color: "#0ea5e9", dash: [] },
                { label: "Data Pasien", color: "#6366f1", dash: [] },
            ];
        } else {
            legendItems = [
                { label: "±3 SD", color: "#ef4444", dash: [4, 4] },
                { label: "±2 SD", color: "#f59e0b", dash: [6, 4] },
                { label: "±1 SD", color: "#94a3b8", dash: [2, 4] },
                { label: "Median (0 SD)", color: "#0ea5e9", dash: [] },
                { label: "Data Pasien", color: "#6366f1", dash: [] },
            ];
        }

        for (const item of legendItems) {
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.label === "Data Pasien" ? 2.5 : 1.5;
            ctx.setLineDash(item.dash);
            ctx.beginPath();
            ctx.moveTo(legendX, legendY);
            ctx.lineTo(legendX + 20, legendY);
            ctx.stroke();

            if (item.label === "Data Pasien") {
                ctx.beginPath();
                ctx.arc(legendX + 10, legendY, 3, 0, Math.PI * 2);
                ctx.fillStyle = item.color;
                ctx.fill();
            }

            ctx.setLineDash([]);
            ctx.fillStyle = "#475569";
            ctx.fillText(item.label, legendX + 25, legendY + 4);
            legendX += ctx.measureText(item.label).width + 45;
        }

        // Footer copyright / credits
        ctx.font = "9px 'Inter', sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "right";
        ctx.fillText(
            `SEHA+ Growth Charts • Sumber: ${isVelocity ? "WHO Growth Velocity 2009" : isCDC ? "CDC 2000" : "WHO Child Growth Standards"}`,
            CANVAS_W - MARGIN.right,
            CANVAS_H - 8
        );

        setIsReady(true);
    }, [gender, chartType, isCDC, isVelocity, measurements, patient]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    const handlePrint = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Kurva Pertumbuhan — ${patient?.name || "Pasien"}</title>
                <style>
                    @page { size: landscape; margin: 10mm; }
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
                    img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                    @media print {
                        body { margin: 0; }
                        img { width: 100%; height: auto; }
                    }
                </style>
            </head>
            <body>
                <img src="${dataUrl}" />
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 300);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, [patient]);

    const unit = getUnit(chartType);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-[95vw] max-h-[95vh] overflow-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Preview Cetak Laporan — {getChartTitle(chartType, gender, isCDC)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Format A4 Landscape • Dokumen Resmi Klinik / Rumah Sakit
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!isReady}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            🖨️ Cetak / Simpan PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all"
                        >
                            ✕ Tutup
                        </button>
                    </div>
                </div>

                {/* Canvas Preview */}
                <div className="p-6 flex justify-center bg-slate-50/50">
                    <canvas
                        ref={canvasRef}
                        className="border rounded-lg shadow-md bg-white"
                        style={{ maxWidth: "100%", height: "auto" }}
                    />
                </div>

                {/* Measurement Summary Table */}
                {measurements.length > 0 && (
                    <div className="px-6 pb-6">
                        <h4 className="text-sm font-bold mb-2 text-muted-foreground">Ringkasan Data Pengukuran</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="px-3 py-2 text-left border font-semibold">Tanggal</th>
                                        <th className="px-3 py-2 text-left border font-semibold">Umur</th>
                                        <th className="px-3 py-2 text-left border font-semibold">
                                            Nilai ({unit})
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...measurements]
                                        .sort((a, b) => a.ageMonths - b.ageMonths)
                                        .map((m, i) => {
                                            const years = Math.floor(m.ageMonths / 12);
                                            const months = Math.round(m.ageMonths % 12);
                                            const ageStr = years > 0 ? `${years} thn ${months} bln` : `${months} bln`;
                                            return (
                                                <tr key={i} className="hover:bg-muted/20">
                                                    <td className="px-3 py-1.5 border">{m.date || "—"}</td>
                                                    <td className="px-3 py-1.5 border">{ageStr}</td>
                                                    <td className="px-3 py-1.5 border font-mono font-semibold">
                                                        {m.value.toFixed(2)} {unit}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Alias for backward compatibility & clarity
export const PrintGrowthChart = CDCPrintChart;
