"use client";

import { useMemo, useState, useCallback } from "react";
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    Area,
    ComposedChart,
    Bar,
    Cell,
} from "recharts";
import {
    getStandardData,
    calculateZScore,
    type MetricType,
} from "@/lib/growth-standards";
import {
    CDC_WEIGHT_PERCENTILES,
    CDC_HEIGHT_PERCENTILES,
    CDC_BMI_PERCENTILES,
} from "@/lib/cdc-percentile-data";
import { CDCPrintChart } from "./cdc-print-chart";
import { getText, type Language } from "@/lib/translations";
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

interface Measurement {
    date: string;
    ageMonths: number;
    detailedAge?: string;
    weight: number;
    height: number;
    bmi?: number;
    headCircumference?: number;
    armCircumference?: number;
    subscapularSkinfold?: number;
    tricepsSkinfold?: number;
}

interface GrowthChartProps {
    gender: "male" | "female";
    measurements: Measurement[];
    patientName?: string;
    patientDob?: string;
    patientMrn?: string;
    showBmi?: boolean;
}

type ChartType =
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

type ChartCategory = "core" | "body" | "velocity";

interface ChartOption {
    type: ChartType;
    label: string;
    labelFull: string;
    category: ChartCategory;
    whoOnly?: boolean;
    metric?: MetricType;
}

const CHART_OPTIONS: ChartOption[] = [
    { type: "weight", label: "weightForAge", labelFull: "weightForAgeFull", category: "core", metric: "weight" },
    { type: "height", label: "heightForAge", labelFull: "heightForAgeFull", category: "core", metric: "height" },
    { type: "weightForHeight", label: "weightForHeight", labelFull: "weightForHeightFull", category: "core", metric: "weightForHeight" },
    { type: "bmi", label: "bmiForAge", labelFull: "bmiForAgeFull", category: "core", metric: "bmi" },
    { type: "headCircumference", label: "headCircForAge", labelFull: "headCircForAgeFull", category: "core", metric: "headCircumference" },
    { type: "armCircumference", label: "armCircForAge", labelFull: "armCircForAgeFull", category: "core", whoOnly: true, metric: "armCircumference" },
    { type: "subscapularSkinfold", label: "subscapularSkinfold", labelFull: "subscapularSkinfoldFull", category: "body", whoOnly: true, metric: "subscapularSkinfold" },
    { type: "tricepsSkinfold", label: "tricepsSkinfold", labelFull: "tricepsSkinfoldFull", category: "body", whoOnly: true, metric: "tricepsSkinfold" },
    { type: "weightVelocity", label: "weightVelocity", labelFull: "weightVelocityFull", category: "velocity", whoOnly: true },
    { type: "lengthVelocity", label: "lengthVelocity", labelFull: "lengthVelocityFull", category: "velocity", whoOnly: true },
    { type: "hcVelocity", label: "hcVelocity", labelFull: "hcVelocityFull", category: "velocity", whoOnly: true },
];

const CATEGORIES: { key: ChartCategory; label: string }[] = [
    { key: "core", label: "coreAnthropometry" },
    { key: "body", label: "bodyComposition" },
    { key: "velocity", label: "growthVelocity" },
];

function getYLabel(chartType: ChartType, lang: Language): string {
    switch (chartType) {
        case "weight":
        case "weightForHeight":
            return getText("weight_kg", lang);
        case "height":
            return getText("height_cm", lang);
        case "bmi":
            return getText("bmi", lang);
        case "headCircumference":
            return getText("headCirc_cm", lang);
        case "armCircumference":
            return getText("armCirc_cm", lang);
        case "subscapularSkinfold":
        case "tricepsSkinfold":
            return getText("skinfold_mm", lang);
        default:
            return "";
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
        default:
            return "";
    }
}

// Custom Tooltip
function CustomTooltip({ active, payload, label, isCDC, userPoints, chartType, lang }: {
    active?: boolean;
    payload?: any[];
    label?: number;
    isCDC: boolean;
    userPoints: { age: number; detailedAge?: string; val?: number; zScore?: number }[];
    chartType: ChartType;
    lang: Language;
}) {
    if (!active || !payload || label === undefined) return null;

    const patientPoint = userPoints.find(p => Math.abs(p.age - label) < (isCDC ? 1 : 0.5));
    const unit = getUnit(chartType);
    const ageLabel = chartType === "weightForHeight"
        ? `${getText("height_cm", lang)}: ${label}`
        : isCDC
            ? `${(label / 12).toFixed(1)} ${getText("years", lang)} (${label}m)`
            : `${label} ${getText("months", lang)}`;

    return (
        <div className="gc-tooltip">
            <p className="gc-tooltip-title">{ageLabel}</p>
            {patientPoint && patientPoint.val && (
                <div className="gc-tooltip-patient">
                    <div className="gc-tooltip-patient-dot" />
                    <span className="gc-tooltip-patient-value">
                        {patientPoint.val.toFixed(2)} {unit}
                    </span>
                    {patientPoint.zScore !== undefined && (
                        <span className="gc-tooltip-zscore">
                            Z: {patientPoint.zScore > 0 ? "+" : ""}{patientPoint.zScore.toFixed(2)}
                        </span>
                    )}
                </div>
            )}
            <div className="gc-tooltip-lines">
                {payload.filter(p => !p.name.includes("Zone")).map((entry: any, i: number) => (
                    <div key={i} className="gc-tooltip-line">
                        <span>{entry.name}:</span>
                        <span style={{ color: entry.stroke }}>
                            {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value} {unit}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Velocity Chart Component
function VelocityChartView({ chartType, gender, measurements, lang }: {
    chartType: "weightVelocity" | "lengthVelocity" | "hcVelocity";
    gender: "male" | "female";
    measurements: Measurement[];
    lang: Language;
}) {
    const [intervalFilter, setIntervalFilter] = useState(1);

    const velocityData = useMemo(() => {
        if (chartType === "weightVelocity") return gender === "male" ? WHO_BOYS_WEIGHT_VELOCITY : WHO_GIRLS_WEIGHT_VELOCITY;
        if (chartType === "lengthVelocity") return gender === "male" ? WHO_BOYS_LENGTH_VELOCITY : WHO_GIRLS_LENGTH_VELOCITY;
        return gender === "male" ? WHO_BOYS_HC_VELOCITY : WHO_GIRLS_HC_VELOCITY;
    }, [chartType, gender]);

    const filteredData = useMemo(() =>
        velocityData.filter(d => d.interval_months === intervalFilter),
        [velocityData, intervalFilter]
    );

    // Calculate patient velocity if enough measurements
    const patientVelocities = useMemo(() => {
        if (measurements.length < 2) return [];
        const sorted = [...measurements].sort((a, b) => a.ageMonths - b.ageMonths);
        const results: { age_start: number; age_end: number; value: number }[] = [];

        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = sorted[i + 1].ageMonths - sorted[i].ageMonths;
            if (Math.abs(gap - intervalFilter) <= 1) {
                let value: number;
                if (chartType === "weightVelocity") {
                    value = (sorted[i + 1].weight - sorted[i].weight) * 1000; // grams
                } else if (chartType === "lengthVelocity") {
                    value = sorted[i + 1].height - sorted[i].height;
                } else {
                    value = ((sorted[i + 1].headCircumference || 0) - (sorted[i].headCircumference || 0));
                }
                results.push({
                    age_start: sorted[i].ageMonths,
                    age_end: sorted[i + 1].ageMonths,
                    value,
                });
            }
        }
        return results;
    }, [measurements, intervalFilter, chartType]);

    const availableIntervals = useMemo(() => {
        const set = new Set(velocityData.map(d => d.interval_months));
        return Array.from(set).sort((a, b) => a - b);
    }, [velocityData]);

    const unit = chartType === "weightVelocity" ? "g" : "cm";
    const yAxisLabel = chartType === "weightVelocity" ? getText("velocity_g", lang) : chartType === "lengthVelocity" ? getText("velocity_cm", lang) : getText("velocity_hc_cm", lang);

    const chartDataForDisplay = useMemo(() => {
        return filteredData.map(d => ({
            name: `${d.age_interval_start}-${d.age_interval_end}m`,
            p3: d.p3,
            p10: d.p10,
            p25: d.p25,
            p50: d.p50,
            p75: d.p75,
            p90: d.p90,
            p97: d.p97,
            patient: patientVelocities.find(pv =>
                Math.abs(pv.age_start - d.age_interval_start) <= 1
            )?.value,
        }));
    }, [filteredData, patientVelocities]);

    if (measurements.length < 2) {
        return (
            <div className="gc-velocity-empty">
                <p>{getText("noVelocityData", lang)}</p>
            </div>
        );
    }

    return (
        <div className="gc-velocity">
            <div className="gc-velocity-controls">
                <span className="gc-velocity-label">{getText("selectInterval", lang)}:</span>
                <div className="gc-segment">
                    {availableIntervals.map(iv => (
                        <button
                            key={iv}
                            className={`gc-segment-btn ${intervalFilter === iv ? "active" : ""}`}
                            onClick={() => setIntervalFilter(iv)}
                        >
                            {iv} {getText("monthInterval", lang)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartDataForDisplay} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            label={{ value: yAxisLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                            width={60}
                        />
                        <Tooltip />
                        <Line type="monotone" dataKey="p97" stroke="#ef4444" strokeDasharray="3 3" dot={false} strokeWidth={1} opacity={0.4} name="P97" />
                        <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeDasharray="4 4" dot={false} strokeWidth={1} opacity={0.5} name="P90" />
                        <Line type="monotone" dataKey="p75" stroke="#84cc16" strokeDasharray="3 6" dot={false} strokeWidth={1} opacity={0.4} name="P75" />
                        <Line type="monotone" dataKey="p50" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name={getText("median", lang)} />
                        <Line type="monotone" dataKey="p25" stroke="#84cc16" strokeDasharray="3 6" dot={false} strokeWidth={1} opacity={0.4} name="P25" />
                        <Line type="monotone" dataKey="p10" stroke="#f59e0b" strokeDasharray="4 4" dot={false} strokeWidth={1} opacity={0.5} name="P10" />
                        <Line type="monotone" dataKey="p3" stroke="#ef4444" strokeDasharray="3 3" dot={false} strokeWidth={1} opacity={0.4} name="P3" />
                        <Bar dataKey="patient" fill="hsl(var(--primary))" barSize={20} name="Patient" radius={[4, 4, 0, 0]}>
                            {chartDataForDisplay.map((entry, i) => (
                                <Cell key={i} fill={entry.patient ? "hsl(var(--primary))" : "transparent"} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================
export function GrowthChart({
    gender,
    measurements,
    patientName,
    patientDob,
    patientMrn,
    showBmi = true,
}: GrowthChartProps) {
    const [chartType, setChartType] = useState<ChartType>("weight");
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [lang, setLang] = useState<Language>("id");
    const [activeCategory, setActiveCategory] = useState<ChartCategory>("core");

    const effectiveChartType = !showBmi && chartType === "bmi" ? "weight" : chartType;
    const maxAge = useMemo(() => Math.max(0, ...measurements.map(m => m.ageMonths)), [measurements]);
    const [viewMode, setViewMode] = useState<"auto" | "who" | "cdc">("auto");

    const currentOption = CHART_OPTIONS.find(o => o.type === effectiveChartType);
    const isSpecialView = effectiveChartType === "weightVelocity" || effectiveChartType === "lengthVelocity" || effectiveChartType === "hcVelocity";

    const isCDC = useMemo(() => {
        if (currentOption?.whoOnly) return false;
        if (effectiveChartType === "weightForHeight") return false;
        if (viewMode === "who") return false;
        if (viewMode === "cdc") return true;
        return maxAge > 60;
    }, [viewMode, maxAge, effectiveChartType, currentOption]);

    const chartMetric = currentOption?.metric;

    // WHO data
    const whoData = useMemo(() => {
        if (isCDC || !chartMetric) return [];
        return getStandardData(chartMetric, gender, 10);
    }, [chartMetric, gender, isCDC]);

    // CDC percentile data
    const cdcPercentileData = useMemo(() => {
        if (!isCDC) return [];
        if (effectiveChartType === "weight") return [...CDC_WEIGHT_PERCENTILES[gender]] as any[];
        if (effectiveChartType === "height") return [...CDC_HEIGHT_PERCENTILES[gender]] as any[];
        if (effectiveChartType === "bmi") return [...CDC_BMI_PERCENTILES[gender]] as any[];
        // For head circumference CDC, we compute from LMS
        if (effectiveChartType === "headCircumference" && chartMetric) {
            const data = getStandardData(chartMetric, gender, 0);
            return data.map((d: any) => {
                const safeGetP = (L: number, M: number, S: number, z: number) => {
                    if (Math.abs(L) < 0.01) return M * Math.exp(S * z);
                    const base = 1 + L * S * z;
                    if (base <= 0) return M * Math.exp(S * z);
                    return M * Math.pow(base, 1 / L);
                };
                return {
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
                };
            });
        }
        return [];
    }, [effectiveChartType, gender, isCDC, chartMetric]);

    const yLabel = useMemo(() => getYLabel(effectiveChartType, lang), [effectiveChartType, lang]);

    const safeGetP = useCallback((L: number, M: number, S: number, z: number) => {
        if (Math.abs(L) < 0.01) return M * Math.exp(S * z);
        const base = 1 + L * S * z;
        if (base <= 0) return M * Math.exp(S * z);
        const result = M * Math.pow(base, 1 / L);
        if (result <= 0 || result > M * 10) return M * Math.exp(S * z);
        return result;
    }, []);

    const chartData = useMemo(() => {
        if (isSpecialView) return [];
        if (isCDC) {
            return cdcPercentileData.map((d: any) => {
                const base: any = {
                    age: d.age_months,
                    P3: d.P3, P5: d.P5, P10: d.P10, P25: d.P25,
                    P50: d.P50,
                    P75: d.P75, P90: d.P90, P95: d.P95, P97: d.P97,
                };
                if (d.P85 !== undefined) base.P85 = d.P85;
                return base;
            });
        }
        return whoData.map((d: any) => ({
            age: d.length_cm !== undefined ? d.length_cm : d.age_months,
            s3pos: safeGetP(d.L, d.M, d.S, 3),
            s2pos: safeGetP(d.L, d.M, d.S, 2),
            s1pos: safeGetP(d.L, d.M, d.S, 1),
            median: d.M,
            s1neg: safeGetP(d.L, d.M, d.S, -1),
            s2neg: safeGetP(d.L, d.M, d.S, -2),
            s3neg: safeGetP(d.L, d.M, d.S, -3),
        }));
    }, [isCDC, cdcPercentileData, whoData, isSpecialView, safeGetP]);

    const userPoints = useMemo(() => {
        if (isSpecialView || !chartMetric) return [];
        return measurements
            .filter(m => {
                let val: number | undefined;
                if (effectiveChartType === "weight" || effectiveChartType === "weightForHeight") val = m.weight;
                else if (effectiveChartType === "height") val = m.height;
                else if (effectiveChartType === "bmi") val = m.bmi;
                else if (effectiveChartType === "headCircumference") val = m.headCircumference;
                else if (effectiveChartType === "armCircumference") val = m.armCircumference;
                else if (effectiveChartType === "subscapularSkinfold") val = m.subscapularSkinfold;
                else if (effectiveChartType === "tricepsSkinfold") val = m.tricepsSkinfold;
                else val = m.weight; // Fallback, though all types should be covered

                if (val === undefined || val <= 0) return false;
                if (effectiveChartType === "weightForHeight") {
                    if (!m.height || m.height <= 0) return false;
                    return true;
                }
                if (!isCDC && m.ageMonths > 60) return false;
                if (isCDC && m.ageMonths < 60) return false;
                return true;
            })
            .map(m => {
                let val: number;
                if (effectiveChartType === "weight" || effectiveChartType === "weightForHeight") val = m.weight;
                else if (effectiveChartType === "height") val = m.height;
                else if (effectiveChartType === "bmi") val = (m.bmi as number);
                else if (effectiveChartType === "headCircumference") val = m.headCircumference || 0;
                else if (effectiveChartType === "armCircumference") val = m.armCircumference || 0;
                else if (effectiveChartType === "subscapularSkinfold") val = m.subscapularSkinfold || 0;
                else if (effectiveChartType === "tricepsSkinfold") val = m.tricepsSkinfold || 0;
                else val = m.weight; // Fallback

                const xVal = effectiveChartType === "weightForHeight" ? m.height : m.ageMonths;
                return {
                    age: xVal,
                    detailedAge: m.detailedAge,
                    val,
                    zScore: calculateZScore(val, xVal, gender, chartMetric),
                };
            })
            .sort((a, b) => a.age - b.age);
    }, [measurements, effectiveChartType, gender, isCDC, isSpecialView, chartMetric]);

    if (!isSpecialView && chartData.length === 0) {
        return <div className="gc-empty">{lang === "id" ? "Data tidak tersedia" : "No data available"}</div>;
    }

    const xDomain = effectiveChartType === "weightForHeight" ? [45, 120] : isCDC ? [24, 240] : [0, 60];

    const categoryCharts = CHART_OPTIONS.filter(o => o.category === activeCategory).filter(o => o.type !== "bmi" || showBmi);

    return (
        <>
            <div className="gc-container">
                {/* Header */}
                <div className="gc-header">
                    <div className="gc-header-left">
                        <h3 className="gc-title">
                            {getText(currentOption?.labelFull || "growthChart", lang)}
                        </h3>
                        <p className="gc-subtitle">
                            {currentOption?.whoOnly
                                ? getText("onlyWho", lang)
                                : `${getText("standard", lang)}: ${isCDC ? getText("cdcStandard", lang) : getText("whoStandard", lang)}`}
                        </p>
                    </div>

                    <div className="gc-header-controls">
                        {/* Language toggle */}
                        <div className="gc-lang-toggle">
                            <button
                                className={`gc-lang-btn ${lang === "id" ? "active" : ""}`}
                                onClick={() => setLang("id")}
                            >
                                ID
                            </button>
                            <button
                                className={`gc-lang-btn ${lang === "en" ? "active" : ""}`}
                                onClick={() => setLang("en")}
                            >
                                EN
                            </button>
                        </div>

                        {/* WHO/CDC/Auto */}
                        {!currentOption?.whoOnly && (
                            <div className="gc-segment">
                                <button
                                    onClick={() => setViewMode("who")}
                                    className={`gc-segment-btn ${!isCDC && viewMode !== "auto" || (viewMode === "auto" && !isCDC) ? "active" : ""}`}
                                >
                                    WHO
                                </button>
                                <button
                                    onClick={() => setViewMode("cdc")}
                                    className={`gc-segment-btn ${isCDC ? "active" : ""}`}
                                >
                                    CDC
                                </button>
                                <button
                                    onClick={() => setViewMode("auto")}
                                    className={`gc-segment-btn ${viewMode === "auto" ? "active" : ""}`}
                                >
                                    Auto
                                </button>
                            </div>
                        )}

                        {/* Print */}
                        {isCDC && (
                            <button
                                onClick={() => setShowPrintPreview(true)}
                                className="gc-print-btn"
                            >
                                🖨️ {getText("printChart", lang)}
                            </button>
                        )}
                    </div>
                </div>

                {/* Category tabs */}
                <div className="gc-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => {
                                setActiveCategory(cat.key);
                                const firstChart = CHART_OPTIONS.find(o => o.category === cat.key);
                                if (firstChart) setChartType(firstChart.type);
                            }}
                            className={`gc-category-btn active:scale-95 transition-all ${activeCategory === cat.key ? "active" : ""}`}
                        >
                            {getText(cat.label, lang)}
                        </button>
                    ))}
                </div>

                {/* Chart type pills within category */}
                <div className="gc-chart-pills">
                    {categoryCharts.map(opt => (
                        <button
                            key={opt.type}
                            onClick={() => setChartType(opt.type)}
                            className={`gc-pill active:scale-95 transition-all ${effectiveChartType === opt.type ? "active" : ""}`}
                        >
                            {getText(opt.label, lang)}
                        </button>
                    ))}
                </div>

                {/* Chart area */}
                <div className="gc-chart-area">
                    {effectiveChartType === "weightVelocity" || effectiveChartType === "lengthVelocity" || effectiveChartType === "hcVelocity" ? (
                        <VelocityChartView
                            chartType={effectiveChartType}
                            gender={gender}
                            measurements={measurements}
                            lang={lang}
                        />
                    ) : (
                        <div className="gc-recharts-wrap">
                            <ResponsiveContainer width="100%" height={450}>
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="age"
                                        type="number"
                                        domain={xDomain}
                                        ticks={effectiveChartType === "weightForHeight" ? [45, 55, 65, 75, 85, 95, 105, 115] : isCDC ? [24, 48, 72, 96, 120, 144, 168, 192, 216, 240] : [0, 12, 24, 36, 48, 60]}
                                        tickFormatter={(m) => effectiveChartType === "weightForHeight" ? `${m}cm` : isCDC ? `${m / 12}y` : `${m}m`}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={{ stroke: "#cbd5e1" }}
                                        label={{ value: effectiveChartType === "weightForHeight" ? getText("height_cm", lang) : isCDC ? `${getText("age", lang)} (${getText("years", lang)})` : `${getText("age", lang)} (${getText("months", lang)})`, position: "insideBottom", offset: -10, fontSize: 12, fill: "#64748b" }}
                                    />
                                    <YAxis
                                        domain={["dataMin - 1", "dataMax + 1"]}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={{ stroke: "#cbd5e1" }}
                                        tickFormatter={(val: number) => Number.isFinite(val) ? val.toFixed(1) : ""}
                                        label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }}
                                        width={55}
                                    />

                                    <Tooltip content={<CustomTooltip isCDC={isCDC} userPoints={userPoints} chartType={effectiveChartType} lang={lang} />} />

                                    {isCDC ? (
                                        <>
                                            <Area type="monotone" dataKey="P90" stackId="bg" stroke="none" fill="#f59e0b" fillOpacity={0.04} name=">P90 Zone" isAnimationActive={false} />
                                            <Area type="monotone" dataKey="P10" stackId="bg2" stroke="none" fill="#ef4444" fillOpacity={0.04} name="<P10 Zone" isAnimationActive={false} />
                                            <Line type="monotone" dataKey="P97" stroke="#dc2626" strokeDasharray="3 3" dot={false} name="P97" isAnimationActive={false} strokeWidth={1} opacity={0.5} />
                                            <Line type="monotone" dataKey="P95" stroke="#ef4444" strokeDasharray="4 4" dot={false} name="P95" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                            <Line type="monotone" dataKey="P90" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="P90" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                            {effectiveChartType === "bmi" && <Line type="monotone" dataKey="P85" stroke="#d97706" strokeDasharray="4 3" dot={false} name="P85" isAnimationActive={false} strokeWidth={1} opacity={0.5} />}
                                            <Line type="monotone" dataKey="P75" stroke="#84cc16" strokeDasharray="3 6" dot={false} name="P75" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                            <Line type="monotone" dataKey="P50" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="P50 (Median)" isAnimationActive={false} />
                                            <Line type="monotone" dataKey="P25" stroke="#84cc16" strokeDasharray="3 6" dot={false} name="P25" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                            <Line type="monotone" dataKey="P10" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="P10" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                            <Line type="monotone" dataKey="P5" stroke="#ef4444" strokeDasharray="4 4" dot={false} name="P5" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                            <Line type="monotone" dataKey="P3" stroke="#dc2626" strokeDasharray="3 3" dot={false} name="P3" isAnimationActive={false} strokeWidth={1} opacity={0.5} />
                                        </>
                                    ) : (
                                        <>
                                            <Area type="monotone" dataKey="s2pos" stackId="bg" stroke="none" fill="#22c55e" fillOpacity={0.06} name="Normal Zone" isAnimationActive={false} />
                                            <Area type="monotone" dataKey="s3neg" stackId="bg2" stroke="none" fill="#ef4444" fillOpacity={0.06} name="Critical Zone" isAnimationActive={false} />
                                            <Line type="monotone" dataKey="s3pos" stroke="#ef4444" strokeDasharray="3 3" dot={false} name="+3 SD" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                            <Line type="monotone" dataKey="s2pos" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="+2 SD" isAnimationActive={false} strokeWidth={1.5} opacity={0.6} />
                                            <Line type="monotone" dataKey="s1pos" stroke="#94a3b8" strokeDasharray="2 4" dot={false} name="+1 SD" isAnimationActive={false} strokeWidth={1} opacity={0.3} />
                                            <Line type="monotone" dataKey="median" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="Median (0 SD)" isAnimationActive={false} />
                                            <Line type="monotone" dataKey="s1neg" stroke="#94a3b8" strokeDasharray="2 4" dot={false} name="-1 SD" isAnimationActive={false} strokeWidth={1} opacity={0.3} />
                                            <Line type="monotone" dataKey="s2neg" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="-2 SD" isAnimationActive={false} strokeWidth={1.5} opacity={0.6} />
                                            <Line type="monotone" dataKey="s3neg" stroke="#ef4444" strokeDasharray="3 3" dot={false} name="-3 SD" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                        </>
                                    )}

                                    {userPoints.length > 1 && (
                                        <Line data={userPoints} dataKey="val" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} connectNulls name="Patient" isAnimationActive={true} />
                                    )}
                                    {userPoints.map((p, i) => (
                                        <ReferenceDot key={i} x={p.age} y={p.val} r={6} fill="hsl(var(--primary))" stroke="#fff" strokeWidth={2} ifOverflow="extendDomain" />
                                    ))}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Status footer */}
                {!isSpecialView && (
                    <div className="gc-footer">
                        <div className="gc-footer-header">
                            <h4>
                                <span className="gc-dot" />
                                {getText("measurement", lang)}: {getText(currentOption?.label || "weightForAge", lang)}
                            </h4>
                            {userPoints.length > 0 && (
                                <span className={`gc-status-badge ${Math.abs(userPoints[userPoints.length - 1].zScore || 0) > 2 ? "warning" : "good"}`}>
                                    {Math.abs(userPoints[userPoints.length - 1].zScore || 0) > 2
                                        ? lang === "id" ? "Perlu Perhatian" : "Needs Attention"
                                        : "Optimal"}
                                </span>
                            )}
                        </div>
                        <div className="gc-footer-grid">
                            {userPoints.slice(-3).reverse().map((p, i) => (
                                <div key={i} className="gc-footer-card">
                                    <span className="gc-footer-age">{p.detailedAge || `${p.age}m`}</span>
                                    <div className="gc-footer-values">
                                        <span className="gc-footer-val">{p.val?.toFixed(2)} <span className="gc-footer-unit">{getUnit(effectiveChartType)}</span></span>
                                        <span className={`gc-footer-z ${Math.abs(p.zScore || 0) > 2 ? "warning" : ""}`}>Z: {p.zScore?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            {userPoints.length === 0 && (
                                <p className="gc-no-data">{lang === "id" ? "Belum ada data tercatat." : "No measurements recorded."}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showPrintPreview && isCDC && (
                <CDCPrintChart
                    gender={gender}
                    chartType={effectiveChartType as "weight" | "height" | "bmi"}
                    measurements={measurements
                        .filter(m => {
                            const val = effectiveChartType === "weight" ? m.weight : effectiveChartType === "height" ? m.height : m.bmi;
                            return val !== undefined && val > 0;
                        })
                        .map(m => ({
                            ageMonths: m.ageMonths,
                            value: (effectiveChartType === "weight" ? m.weight : effectiveChartType === "height" ? m.height : m.bmi) as number,
                            date: m.date,
                        }))}
                    patient={patientName ? { name: patientName, dob: patientDob || "", mrn: patientMrn } : undefined}
                    onClose={() => setShowPrintPreview(false)}
                />
            )}
        </>
    );
}
