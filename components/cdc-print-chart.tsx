"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import {
    CDC_WEIGHT_PERCENTILES,
    CDC_HEIGHT_PERCENTILES,
    CDC_BMI_PERCENTILES,
    type CDCPercentilePoint,
} from "@/lib/cdc-percentile-data";

interface PatientInfo {
    name: string;
    dob: string;
    mrn?: string;
}

interface MeasurementPoint {
    ageMonths: number;
    value: number;
    date?: string;
}

interface CDCPrintChartProps {
    gender: "male" | "female";
    chartType: "weight" | "height" | "bmi";
    measurements: MeasurementPoint[];
    patient?: PatientInfo;
    onClose: () => void;
}

// Chart layout constants (in canvas pixels at 2x DPI)
const CANVAS_W = 1600;
const CANVAS_H = 1100;
const MARGIN = { top: 120, right: 60, bottom: 80, left: 80 };
const PLOT_W = CANVAS_W - MARGIN.left - MARGIN.right;
const PLOT_H = CANVAS_H - MARGIN.top - MARGIN.bottom;

// CDC age range: 2-20 years = 24-240 months
const AGE_MIN = 24;
const AGE_MAX = 240;

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

function getYRange(chartType: string, gender: string): [number, number] {
    if (chartType === "weight") return gender === "male" ? [8, 110] : [8, 100];
    if (chartType === "height") return gender === "male" ? [75, 200] : [75, 190];
    return [12, 38]; // BMI
}

function ageToX(ageMonths: number): number {
    return MARGIN.left + ((ageMonths - AGE_MIN) / (AGE_MAX - AGE_MIN)) * PLOT_W;
}

function valToY(val: number, yMin: number, yMax: number): number {
    return MARGIN.top + PLOT_H - ((val - yMin) / (yMax - yMin)) * PLOT_H;
}

function getChartTitle(chartType: string, gender: string): string {
    const genderLabel = gender === "male" ? "Anak Laki-laki" : "Anak Perempuan";
    if (chartType === "weight") return `Berat Badan menurut Umur — ${genderLabel} (2-20 tahun)`;
    if (chartType === "height") return `Tinggi Badan menurut Umur — ${genderLabel} (2-20 tahun)`;
    return `Indeks Massa Tubuh menurut Umur — ${genderLabel} (2-20 tahun)`;
}

function getYLabel(chartType: string): string {
    if (chartType === "weight") return "Berat (kg)";
    if (chartType === "height") return "Tinggi (cm)";
    return "IMT (kg/m²)";
}

export function CDCPrintChart({ gender, chartType, measurements, patient, onClose }: CDCPrintChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isReady, setIsReady] = useState(false);

    const getData = useCallback(() => {
        const source =
            chartType === "weight"
                ? CDC_WEIGHT_PERCENTILES
                : chartType === "height"
                    ? CDC_HEIGHT_PERCENTILES
                    : CDC_BMI_PERCENTILES;
        return [...source[gender]] as any[];
    }, [chartType, gender]);

    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const data = getData();
        const [yMin, yMax] = getYRange(chartType, gender);
        const pKeys = chartType === "bmi" ? BMI_PERCENTILE_KEYS : PERCENTILE_KEYS;

        // Retina scaling
        const dpr = 2;
        canvas.width = CANVAS_W * dpr;
        canvas.height = CANVAS_H * dpr;
        canvas.style.width = `${CANVAS_W}px`;
        canvas.style.height = `${CANVAS_H}px`;
        ctx.scale(dpr, dpr);

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Header area
        const headerGradient = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
        headerGradient.addColorStop(0, gender === "male" ? "#dbeafe" : "#fce7f3");
        headerGradient.addColorStop(1, "#ffffff");
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, CANVAS_W, MARGIN.top - 10);

        // Title
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 22px 'Inter', 'Segoe UI', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(getChartTitle(chartType, gender), MARGIN.left, 35);

        // CDC Standard label
        ctx.font = "12px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Standar CDC 2000 — Persentil", MARGIN.left, 55);

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
        ctx.fillText(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, CANVAS_W - MARGIN.right, MARGIN.top - 18);
        ctx.textAlign = "left";

        // Plot area border
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.strokeRect(MARGIN.left, MARGIN.top, PLOT_W, PLOT_H);

        // Grid lines — vertical (age years)
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 0.5;
        for (let age = 2; age <= 20; age++) {
            const x = ageToX(age * 12);
            ctx.beginPath();
            ctx.moveTo(x, MARGIN.top);
            ctx.lineTo(x, MARGIN.top + PLOT_H);
            ctx.stroke();
        }

        // Grid lines — horizontal
        const yStep = chartType === "bmi" ? 2 : chartType === "weight" ? 10 : 10;
        ctx.strokeStyle = "#e2e8f0";
        for (let v = yMin; v <= yMax; v += yStep) {
            const y = valToY(v, yMin, yMax);
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, y);
            ctx.lineTo(MARGIN.left + PLOT_W, y);
            ctx.stroke();
        }

        // Sub-grid
        const ySubStep = chartType === "bmi" ? 1 : chartType === "weight" ? 5 : 5;
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 0.3;
        for (let v = yMin; v <= yMax; v += ySubStep) {
            if (v % yStep === 0) continue;
            const y = valToY(v, yMin, yMax);
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, y);
            ctx.lineTo(MARGIN.left + PLOT_W, y);
            ctx.stroke();
        }

        // X-axis labels (years)
        ctx.fillStyle = "#475569";
        ctx.font = "12px 'Inter', sans-serif";
        ctx.textAlign = "center";
        for (let age = 2; age <= 20; age++) {
            const x = ageToX(age * 12);
            ctx.fillText(`${age}`, x, MARGIN.top + PLOT_H + 20);
        }
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Umur (tahun)", CANVAS_W / 2, MARGIN.top + PLOT_H + 50);

        // Y-axis labels
        ctx.textAlign = "right";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.fillStyle = "#475569";
        for (let v = yMin; v <= yMax; v += yStep) {
            const y = valToY(v, yMin, yMax);
            ctx.fillText(`${v}`, MARGIN.left - 8, y + 4);
        }

        // Y-axis title (rotated)
        ctx.save();
        ctx.translate(20, CANVAS_H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.font = "13px 'Inter', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(getYLabel(chartType), 0, 0);
        ctx.restore();

        // Draw percentile curves
        for (const key of pKeys) {
            const style = PERCENTILE_STYLES[key];
            const color = PERCENTILE_COLORS[key];
            ctx.strokeStyle = color;
            ctx.lineWidth = style.width;
            ctx.globalAlpha = style.opacity;
            ctx.setLineDash(style.dash);

            ctx.beginPath();
            let started = false;
            for (const d of data) {
                const val = (d as any)[key];
                if (val === undefined || val === null) continue;
                const x = ageToX(d.age_months);
                const y = valToY(val, yMin, yMax);
                if (y < MARGIN.top || y > MARGIN.top + PLOT_H) continue;
                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Label at end of curve
            const lastPoint = data[data.length - 1];
            if (lastPoint) {
                const val = (lastPoint as any)[key];
                if (val !== undefined) {
                    const y = valToY(val, yMin, yMax);
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
        }

        ctx.globalAlpha = 1;
        ctx.setLineDash([]);

        // Shade normal zone (P10-P90) with subtle green
        ctx.fillStyle = "rgba(34, 197, 94, 0.04)";
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const x = ageToX(d.age_months);
            const y = valToY(d.P90, yMin, yMax);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (let i = data.length - 1; i >= 0; i--) {
            const d = data[i];
            const x = ageToX(d.age_months);
            const y = valToY(d.P10, yMin, yMax);
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw patient data points and connecting line
        if (measurements.length > 0) {
            const sortedMeasurements = [...measurements].sort((a, b) => a.ageMonths - b.ageMonths);

            // Connecting line
            if (sortedMeasurements.length > 1) {
                ctx.strokeStyle = "#6366f1";
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                ctx.beginPath();
                sortedMeasurements.forEach((m, i) => {
                    const x = ageToX(m.ageMonths);
                    const y = valToY(m.value, yMin, yMax);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
            }

            // Points
            sortedMeasurements.forEach((m) => {
                const x = ageToX(m.ageMonths);
                const y = valToY(m.value, yMin, yMax);

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

                // Value label
                ctx.fillStyle = "#1e293b";
                ctx.font = "bold 10px 'Inter', sans-serif";
                ctx.textAlign = "center";
                const label = `${m.value.toFixed(1)}`;
                ctx.fillText(label, x, y - 12);
            });
        }

        // Legend at bottom
        const legendY = CANVAS_H - 25;
        ctx.font = "10px 'Inter', sans-serif";
        ctx.textAlign = "left";
        let legendX = MARGIN.left;
        const legendItems = [
            { label: "P3/P97", color: "#dc2626", dash: [6, 4] },
            { label: "P5/P95", color: "#ef4444", dash: [8, 4] },
            { label: "P10/P90", color: "#f59e0b", dash: [10, 5] },
            { label: "P25/P75", color: "#84cc16", dash: [6, 8] },
            { label: "P50 (Median)", color: "#0ea5e9", dash: [] },
            { label: "Data Pasien", color: "#6366f1", dash: [] },
        ];
        if (chartType === "bmi") {
            legendItems.splice(3, 0, { label: "P85", color: "#d97706", dash: [8, 4] });
        }

        for (const item of legendItems) {
            // Line sample
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

        // Footer
        ctx.font = "9px 'Inter', sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "right";
        ctx.fillText("SEHA+ Growth Charts • Sumber data: CDC 2000", CANVAS_W - MARGIN.right, CANVAS_H - 8);

        setIsReady(true);
    }, [getData, chartType, gender, measurements, patient]);

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
                <title>Cetak Kurva Pertumbuhan CDC — ${patient?.name || "Pasien"}</title>
                <style>
                    @page { size: landscape; margin: 10mm; }
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    img { max-width: 100%; max-height: 100vh; }
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

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-[95vw] max-h-[95vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                    <div>
                        <h3 className="text-lg font-bold">Preview Cetak — Kurva Pertumbuhan CDC</h3>
                        <p className="text-xs text-muted-foreground">
                            {getChartTitle(chartType, gender)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            disabled={!isReady}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            🖨️ Cetak
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
                <div className="p-6 flex justify-center">
                    <canvas
                        ref={canvasRef}
                        className="border rounded-lg shadow-inner"
                        style={{ maxWidth: "100%", height: "auto" }}
                    />
                </div>

                {/* Data table */}
                {measurements.length > 0 && (
                    <div className="px-6 pb-6">
                        <h4 className="text-sm font-bold mb-2 text-muted-foreground">Data Pengukuran</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="px-3 py-2 text-left border font-semibold">Tanggal</th>
                                        <th className="px-3 py-2 text-left border font-semibold">Umur</th>
                                        <th className="px-3 py-2 text-left border font-semibold">
                                            {chartType === "weight" ? "Berat (kg)" : chartType === "height" ? "Tinggi (cm)" : "IMT (kg/m²)"}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...measurements]
                                        .sort((a, b) => a.ageMonths - b.ageMonths)
                                        .map((m, i) => {
                                            const years = Math.floor(m.ageMonths / 12);
                                            const months = Math.round(m.ageMonths % 12);
                                            return (
                                                <tr key={i} className="hover:bg-muted/20">
                                                    <td className="px-3 py-1.5 border">{m.date || "—"}</td>
                                                    <td className="px-3 py-1.5 border">{years} thn {months} bln</td>
                                                    <td className="px-3 py-1.5 border font-mono font-semibold">{m.value.toFixed(2)}</td>
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
