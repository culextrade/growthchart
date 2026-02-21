"use client";

import { useMemo, useState } from "react";
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
} from "recharts";
import {
    getStandardData,
    calculateZScore
} from "@/lib/growth-standards";
import {
    CDC_WEIGHT_PERCENTILES,
    CDC_HEIGHT_PERCENTILES,
    CDC_BMI_PERCENTILES,
} from "@/lib/cdc-percentile-data";
import { CDCPrintChart } from "./cdc-print-chart";

interface Measurement {
    date: string;
    ageMonths: number;
    detailedAge?: string;
    weight: number;
    height: number;
    bmi?: number;
}

interface GrowthChartProps {
    gender: "male" | "female";
    measurements: Measurement[];
    patientName?: string;
    patientDob?: string;
    patientMrn?: string;
}

type ChartType = 'weight' | 'height' | 'bmi';

// Custom Tooltip Component
interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: number;
    isCDC: boolean;
    userPoints: { age: number; detailedAge?: string; val?: number; zScore?: number }[];
    chartType: ChartType;
    gender: "male" | "female";
}

function CustomTooltip({ active, payload, label, isCDC, userPoints, chartType, gender }: CustomTooltipProps) {
    if (!active || !payload || !label) return null;

    // Find if there's a patient measurement at this age (within tolerance)
    const patientPoint = userPoints.find(p => Math.abs(p.age - label) < (isCDC ? 1 : 0.5));

    const unit = chartType === 'weight' ? 'kg' : chartType === 'height' ? 'cm' : 'kg/m²';
    const ageLabel = isCDC ? `${(label / 12).toFixed(1)} years (${label}m)` : `${label} months`;

    return (
        <div className="bg-white/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg min-w-[200px] z-50">
            <p className="font-semibold text-sm text-foreground mb-2">{ageLabel}</p>

            {/* Patient Measurement */}
            {patientPoint && patientPoint.val && (
                <div className="mb-2 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="font-bold text-primary">
                            Patient: {patientPoint.val.toFixed(2)} {unit}
                        </span>
                    </div>
                    {patientPoint.zScore !== undefined && (
                        <p className="text-xs font-medium text-primary ml-5">
                            Z-Score: {patientPoint.zScore > 0 ? '+' : ''}{patientPoint.zScore.toFixed(2)} SD
                        </p>
                    )}
                    {patientPoint.detailedAge && (
                        <p className="text-xs text-muted-foreground ml-5">
                            Visit Age: {patientPoint.detailedAge}
                        </p>
                    )}
                </div>
            )}

            {/* Percentile Lines */}
            <div className="space-y-1 text-xs">
                {payload.filter(p => !p.name.includes('Zone')).map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center gap-4">
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium" style={{ color: entry.stroke }}>
                            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {unit}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GrowthChart({ gender, measurements, patientName, patientDob, patientMrn }: GrowthChartProps) {
    const [chartType, setChartType] = useState<ChartType>('weight');
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const maxAge = useMemo(() => Math.max(0, ...measurements.map(m => m.ageMonths)), [measurements]);

    // Default view based on age, but allow override
    const [viewMode, setViewMode] = useState<'auto' | 'who' | 'cdc'>('auto');

    const isCDC = useMemo(() => {
        if (viewMode === 'who') return false;
        if (viewMode === 'cdc') return true;
        return maxAge > 60;
    }, [viewMode, maxAge]);

    // WHO data (for non-CDC mode)
    const whoData = useMemo(() => {
        if (isCDC) return [];
        const representativeAge = 10;
        return getStandardData(chartType, gender, representativeAge);
    }, [chartType, gender, isCDC]);

    // CDC percentile data
    const cdcPercentileData = useMemo(() => {
        if (!isCDC) return [];
        const source = chartType === 'weight'
            ? CDC_WEIGHT_PERCENTILES
            : chartType === 'height'
                ? CDC_HEIGHT_PERCENTILES
                : CDC_BMI_PERCENTILES;
        return [...source[gender]] as any[];
    }, [chartType, gender, isCDC]);

    const yLabel = useMemo(() => {
        if (chartType === 'height') return 'Tinggi (cm)';
        if (chartType === 'bmi') return 'IMT (kg/m²)';
        return 'Berat (kg)';
    }, [chartType]);

    // Safe LMS percentile calculation (WHO mode)
    const safeGetP = (L: number, M: number, S: number, z: number): number => {
        if (Math.abs(L) < 0.01) return M * Math.exp(S * z);
        const base = 1 + L * S * z;
        if (base <= 0) return M * Math.exp(S * z);
        const result = M * Math.pow(base, 1 / L);
        if (result <= 0 || result > M * 10) return M * Math.exp(S * z);
        return result;
    };

    // Chart data: CDC uses pre-computed percentiles, WHO uses LMS Z-score calculation
    const chartData = useMemo(() => {
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
        return whoData.map((d) => {
            const p = (z: number) => safeGetP(d.L, d.M, d.S, z);
            return {
                age: d.age_months,
                s3pos: p(3), s2pos: p(2), s1pos: p(1),
                median: d.M,
                s1neg: p(-1), s2neg: p(-2), s3neg: p(-3),
            };
        });
    }, [isCDC, cdcPercentileData, whoData]);

    const userPoints = useMemo(() => {
        return measurements
            .filter(m => {
                const val = chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.bmi;
                return val !== undefined && val > 0;
            })
            .map(m => {
                const val = chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.bmi as number;
                return {
                    age: m.ageMonths,
                    detailedAge: m.detailedAge,
                    val: val,
                    zScore: calculateZScore(val, m.ageMonths, gender, chartType)
                };
            })
            .sort((a, b) => a.age - b.age);
    }, [measurements, chartType, gender]);

    // Safety check: if no data, show message
    if (chartData.length === 0) {
        return <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border">No growth data available</div>;
    }

    const xDomain = isCDC ? [24, 240] : [0, 60]; // 2-20y vs 0-5y

    return (
        <>
            <div className="w-full bg-white rounded-xl shadow-md border border-border overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-foreground capitalize">Kurva Pertumbuhan {chartType}</h3>
                            <p className="text-xs text-muted-foreground">Standard: {isCDC ? 'CDC (2-20 thn)' : 'WHO (0-5 thn)'}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex bg-muted p-1 rounded-lg">
                                {(['weight', 'height', 'bmi'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartType === type
                                            ? 'bg-background shadow-sm text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-muted p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('who')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${!isCDC && viewMode !== 'auto' || (viewMode === 'auto' && !isCDC)
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    WHO
                                </button>
                                <button
                                    onClick={() => setViewMode('cdc')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${isCDC
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    CDC
                                </button>
                                <button
                                    onClick={() => setViewMode('auto')}
                                    className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${viewMode === 'auto'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Auto
                                </button>
                            </div>

                            {isCDC && (
                                <button
                                    onClick={() => setShowPrintPreview(true)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    🖨️ Cetak
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 pt-8">
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                            >
                                <defs>
                                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
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
                                    ticks={isCDC ? [24, 48, 72, 96, 120, 144, 168, 192, 216, 240] : [0, 12, 24, 36, 48, 60]}
                                    tickFormatter={(m) => isCDC ? `${m / 12}y` : `${m}m`}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    label={{ value: isCDC ? "Age (Years)" : "Age (Months)", position: "insideBottom", offset: -10, fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickFormatter={(val: number) => Number.isFinite(val) ? val.toFixed(1) : ''}
                                    label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 12, fill: '#64748b' }}
                                    width={55}
                                />

                                <Tooltip
                                    content={
                                        <CustomTooltip
                                            gender={gender}
                                            isCDC={isCDC}
                                            userPoints={userPoints}
                                            chartType={chartType}
                                        />
                                    }
                                />

                                {isCDC ? (
                                    <>
                                        {/* CDC Percentile Background Zones */}
                                        <Area type="monotone" dataKey="P90" stackId="bg" stroke="none" fill="#f59e0b" fillOpacity={0.04} name=">P90 Zone" isAnimationActive={false} />
                                        <Area type="monotone" dataKey="P10" stackId="bg2" stroke="none" fill="#ef4444" fillOpacity={0.04} name="<P10 Zone" isAnimationActive={false} />

                                        {/* CDC Percentile Curves */}
                                        <Line type="monotone" dataKey="P97" stroke="#dc2626" strokeDasharray="3 3" dot={false} name="P97" isAnimationActive={false} strokeWidth={1} opacity={0.5} />
                                        <Line type="monotone" dataKey="P95" stroke="#ef4444" strokeDasharray="4 4" dot={false} name="P95" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                        <Line type="monotone" dataKey="P90" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="P90" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                        {chartType === 'bmi' && <Line type="monotone" dataKey="P85" stroke="#d97706" strokeDasharray="4 3" dot={false} name="P85" isAnimationActive={false} strokeWidth={1} opacity={0.5} />}
                                        <Line type="monotone" dataKey="P75" stroke="#84cc16" strokeDasharray="3 6" dot={false} name="P75" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                        <Line type="monotone" dataKey="P50" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="P50 (Median)" isAnimationActive={false} />
                                        <Line type="monotone" dataKey="P25" stroke="#84cc16" strokeDasharray="3 6" dot={false} name="P25" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                        <Line type="monotone" dataKey="P10" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="P10" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                        <Line type="monotone" dataKey="P5" stroke="#ef4444" strokeDasharray="4 4" dot={false} name="P5" isAnimationActive={false} strokeWidth={1.2} opacity={0.6} />
                                        <Line type="monotone" dataKey="P3" stroke="#dc2626" strokeDasharray="3 3" dot={false} name="P3" isAnimationActive={false} strokeWidth={1} opacity={0.5} />
                                    </>
                                ) : (
                                    <>
                                        {/* WHO Background Zones */}
                                        <Area type="monotone" dataKey="s2pos" stackId="bg" stroke="none" fill="#22c55e" fillOpacity={0.06} name="Normal Zone" isAnimationActive={false} />
                                        <Area type="monotone" dataKey="s3neg" stackId="bg2" stroke="none" fill="#ef4444" fillOpacity={0.06} name="Critical Zone" isAnimationActive={false} />

                                        {/* WHO Standard SDS Curves */}
                                        <Line type="monotone" dataKey="s3pos" stroke="#ef4444" strokeDasharray="3 3" dot={false} name="+3 SD" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                        <Line type="monotone" dataKey="s2pos" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="+2 SD" isAnimationActive={false} strokeWidth={1.5} opacity={0.6} />
                                        <Line type="monotone" dataKey="s1pos" stroke="#94a3b8" strokeDasharray="2 4" dot={false} name="+1 SD" isAnimationActive={false} strokeWidth={1} opacity={0.3} />
                                        <Line type="monotone" dataKey="median" stroke="#0ea5e9" strokeWidth={2.5} dot={false} name="Median (0 SD)" isAnimationActive={false} />
                                        <Line type="monotone" dataKey="s1neg" stroke="#94a3b8" strokeDasharray="2 4" dot={false} name="-1 SD" isAnimationActive={false} strokeWidth={1} opacity={0.3} />
                                        <Line type="monotone" dataKey="s2neg" stroke="#f59e0b" strokeDasharray="5 5" dot={false} name="-2 SD" isAnimationActive={false} strokeWidth={1.5} opacity={0.6} />
                                        <Line type="monotone" dataKey="s3neg" stroke="#ef4444" strokeDasharray="3 3" dot={false} name="-3 SD" isAnimationActive={false} strokeWidth={1} opacity={0.4} />
                                    </>
                                )}

                                {/* Patient Data Line (Trend) */}
                                {userPoints.length > 1 && (
                                    <Line
                                        data={userPoints}
                                        dataKey="val"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={false}
                                        connectNulls
                                        name="Patient Trend"
                                        isAnimationActive={true}
                                    />
                                )}

                                {/* Patient Measurements as Dots */}
                                {userPoints.map((p, i) => (
                                    <ReferenceDot
                                        key={i}
                                        x={p.age}
                                        y={p.val}
                                        r={6}
                                        fill="hsl(var(--primary))"
                                        stroke="#fff"
                                        strokeWidth={2}
                                        ifOverflow="extendDomain"
                                    />
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="px-6 py-4 bg-muted/10 border-t">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Status Terkini: {chartType}
                        </h4>
                        {userPoints.length > 0 && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${Math.abs(userPoints[userPoints.length - 1].zScore || 0) > 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {Math.abs(userPoints[userPoints.length - 1].zScore || 0) > 2 ? 'Perlu Perhatian' : 'Optimal'}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {userPoints.slice(-3).reverse().map((p, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border shadow-sm flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.detailedAge || `${p.age}m`}</span>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-extrabold">{p.val?.toFixed(2)} <span className="font-normal text-muted-foreground text-xs">{chartType === 'weight' ? 'kg' : chartType === 'height' ? 'cm' : ''}</span></span>
                                    <span className={`text-[10px] font-bold ${Math.abs(p.zScore || 0) > 2 ? 'text-red-500' : 'text-primary'}`}>
                                        Z: {p.zScore?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {userPoints.length === 0 && <p className="text-xs text-muted-foreground italic">Belum ada data tercatat.</p>}
                    </div>
                </div>
            </div>

            {
                showPrintPreview && isCDC && (
                    <CDCPrintChart
                        gender={gender}
                        chartType={chartType}
                        measurements={measurements
                            .filter(m => {
                                const val = chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.bmi;
                                return val !== undefined && val > 0;
                            })
                            .map(m => ({
                                ageMonths: m.ageMonths,
                                value: (chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.bmi) as number,
                                date: m.date,
                            }))}
                        patient={patientName ? {
                            name: patientName,
                            dob: patientDob || '',
                            mrn: patientMrn,
                        } : undefined}
                        onClose={() => setShowPrintPreview(false)}
                    />
                )
            }
        </>
    );
}
