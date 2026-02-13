"use client";

import { useMemo, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceDot,
} from "recharts";
import {
    getStandardData
} from "@/lib/growth-standards";

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
}

type ChartType = 'weight' | 'height' | 'bmi';

// Custom Tooltip Component
interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: number;
    isCDC: boolean;
    userPoints: { age: number; detailedAge?: string; val?: number }[];
    chartType: ChartType;
}

function CustomTooltip({ active, payload, label, isCDC, userPoints, chartType }: CustomTooltipProps) {
    if (!active || !payload || !label) return null;

    // Find if there's a patient measurement at this age (within tolerance)
    const patientPoint = userPoints.find(p => Math.abs(p.age - label) < 0.5);

    const unit = chartType === 'weight' ? 'kg' : chartType === 'height' ? 'cm' : 'kg/m²';
    const ageLabel = isCDC ? `${(label / 12).toFixed(1)} years (${label}m)` : `${label} months`;

    return (
        <div className="bg-white/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
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
                    {patientPoint.detailedAge && (
                        <p className="text-xs text-muted-foreground ml-5">
                            Age: {patientPoint.detailedAge}
                        </p>
                    )}
                </div>
            )}

            {/* Percentile Lines */}
            <div className="space-y-1 text-xs">
                {payload.map((entry: any, index: number) => (
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

export function GrowthChart({ gender, measurements }: GrowthChartProps) {
    const [chartType, setChartType] = useState<ChartType>('weight');
    const maxAge = useMemo(() => Math.max(0, ...measurements.map(m => m.ageMonths)), [measurements]);

    // Default view based on age, but allow override
    const [viewMode, setViewMode] = useState<'auto' | 'who' | 'cdc'>('auto');

    const isCDC = useMemo(() => {
        if (viewMode === 'who') return false;
        if (viewMode === 'cdc') return true;
        return maxAge > 60;
    }, [viewMode, maxAge]);

    const standardData = useMemo(() => {
        // We pick a representative age to get the correct dataset (e.g. 10 months for WHO, 72 months for CDC)
        const representativeAge = isCDC ? 72 : 10;
        return getStandardData(chartType, gender, representativeAge);
    }, [chartType, gender, isCDC]);

    const yLabel = useMemo(() => {
        if (chartType === 'height') return 'Height (cm)';
        if (chartType === 'bmi') return 'BMI (kg/m²)';
        return 'Weight (kg)';
    }, [chartType]);

    // Format Data for Chart
    const chartData = useMemo(() => {
        return standardData.map((d) => {
            const getP = (z: number) => {
                const { L, M, S } = d;
                if (Math.abs(L) < 0.01) return M * Math.exp(S * z);
                return M * Math.pow(1 + L * S * z, 1 / L);
            };

            return {
                age: d.age_months,
                p3: getP(-1.881),
                p15: getP(-1.036),
                p50: d.M,
                p85: getP(1.036),
                p97: getP(1.881),
            };
        });
    }, [standardData]);

    const userPoints = useMemo(() => {
        return measurements
            .filter(m => {
                if (chartType === 'weight') return m.weight > 0;
                if (chartType === 'height') return m.height > 0;
                if (chartType === 'bmi') return (m.bmi || 0) > 0;
                return false;
            })
            .map(m => ({
                age: m.ageMonths,
                detailedAge: m.detailedAge,
                val: chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.bmi
            }));
    }, [measurements, chartType]);

    // Safety check: if no data, show message
    if (chartData.length === 0) {
        return <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">No growth data available</div>;
    }

    const xDomain = isCDC ? [24, 240] : [0, 60]; // 2-20y vs 0-5y

    return (
        <div className="w-full bg-white/50 rounded-xl shadow-sm border border-border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg">
                    {(['weight', 'height', 'bmi'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === type
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('who')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!isCDC && viewMode !== 'auto' || (viewMode === 'auto' && !isCDC)
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        WHO (0-5y)
                    </button>
                    <button
                        onClick={() => setViewMode('cdc')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isCDC
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        CDC (2-20y)
                    </button>
                    {viewMode !== 'auto' && (
                        <button
                            onClick={() => setViewMode('auto')}
                            className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            Auto
                        </button>
                    )}
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="age"
                            label={{ value: isCDC ? "Age (Years)" : "Age (Months)", position: "insideBottomRight", offset: -5 }}
                            type="number"
                            domain={xDomain}
                            ticks={isCDC ? [24, 48, 72, 96, 120, 144, 168, 192, 216, 240] : [0, 12, 24, 36, 48, 60]}
                            tickFormatter={(m) => isCDC ? `${m / 12}y` : `${m}m`}
                            allowDataOverflow={true}
                        />
                        <YAxis
                            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(v) => v.toFixed(1)}
                        />
                        <Tooltip
                            content={
                                <CustomTooltip
                                    isCDC={isCDC}
                                    userPoints={userPoints}
                                    chartType={chartType}
                                />
                            }
                        />
                        <Legend />

                        {/* Standard Curves - using natural interpolation for smoother lines */}
                        <Line type="natural" dataKey="p97" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="97th" isAnimationActive={false} strokeWidth={1.5} />
                        <Line type="natural" dataKey="p85" stroke="#a1a1aa" strokeDasharray="3 3" dot={false} name="85th" isAnimationActive={false} strokeWidth={1.5} />
                        <Line type="natural" dataKey="p50" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Median" isAnimationActive={false} />
                        <Line type="natural" dataKey="p15" stroke="#a1a1aa" strokeDasharray="3 3" dot={false} name="15th" isAnimationActive={false} strokeWidth={1.5} />
                        <Line type="natural" dataKey="p3" stroke="#cbd5e1" strokeDasharray="5 5" dot={false} name="3rd" isAnimationActive={false} strokeWidth={1.5} />

                        {/* Patient Measurements as Dots */}
                        {userPoints.map((p, i) => (
                            <ReferenceDot
                                key={i}
                                x={p.age}
                                y={p.val}
                                r={8}
                                fill="hsl(var(--primary))"
                                stroke="white"
                                strokeWidth={3}
                                className="cursor-pointer hover:r-10 transition-all"
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Patient Data Points ({chartType})</h4>
                <div className="flex flex-wrap gap-2">
                    {userPoints.map((p, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {p.detailedAge || `${p.age}m`}: {p.val?.toFixed(2)}
                        </span>
                    ))}
                    {userPoints.length === 0 && <span className="text-xs text-muted-foreground">No data for this metric</span>}
                </div>
            </div>
        </div>
    );
}
