export const dynamic = 'force-dynamic';

import Link from "next/link";
import { ArrowLeft, Plus, Activity, Ruler, Scale, Info, TrendingUp, Weight } from "lucide-react";
import { getPatient, addMeasurement } from "../../actions";
import { ClientThemeWrapper } from "./client-wrapper";
import { GrowthChart } from "@/components/growth-chart";
import { MeasurementRow } from "./patient-actions";
import { getInterpretation, getGrowthTrend } from "@/lib/growth-standards";
import { calculateDetailedAge, formatMonthsToDetailedAge } from "@/lib/utils";

function calculateAgeMonths(dob: Date, measurementDate: Date) {
    const diffTime = Math.abs(measurementDate.getTime() - dob.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Number((diffDays / 30.44).toFixed(1));
}

// Helper to get status color
function getStatusColor(status: string): string {
    const lowerStatus = status.toLowerCase();

    // Normal / Healthy states
    if (lowerStatus === 'normal' || lowerStatus.includes('gizi baik') || lowerStatus.includes('healthy weight') || lowerStatus === 'tidak digunakan') {
        return 'text-green-600';
    }

    // Graded warnings
    if (lowerStatus.includes('severely') || lowerStatus.includes('buruk') || lowerStatus.includes('obese') || lowerStatus.includes('obesitas') || lowerStatus.includes('obesity')) return 'text-red-600';
    if (lowerStatus.includes('wasted') || lowerStatus.includes('kurang') || lowerStatus.includes('stunted') || lowerStatus.includes('underweight') || lowerStatus.includes('short stature')) return 'text-orange-500';
    if (lowerStatus.includes('overweight') || lowerStatus.includes('risk') || lowerStatus.includes('risiko') || lowerStatus.includes('tall')) return 'text-yellow-600';

    // Default any other unhandled abnormal state to red
    return 'text-red-600';
}

// Helper for trend styles
function getTrendStyles(status: string) {
    switch (status) {
        case 'faltering': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' };
        case 'concerning': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' };
        case 'improving': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' };
        case 'stable': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' };
        default: return { bg: 'bg-muted/30', text: 'text-muted-foreground', border: 'border-border', icon: 'text-muted-foreground' };
    }
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const patient = await getPatient(id);

    if (!patient) {
        return <div>Patient not found</div>;
    }

    // Transform measurements
    const measurements = patient.measurements.map(m => {
        const ageMonths = calculateAgeMonths(patient.dob, m.date);
        const h = m.height ? m.height / 100 : 0;
        const bmi = (m.weight && h > 0) ? (m.weight / (h * h)) : 0;

        return {
            id: m.id,
            date: m.date.toISOString().split('T')[0],
            weight: m.weight || 0,
            height: m.height || 0,
            bmi: parseFloat(bmi.toFixed(2)),
            ageMonths,
            detailedAge: calculateDetailedAge(patient.dob, m.date),
            headCircumference: m.headCircumference || undefined,
            armCircumference: m.armCircumference || undefined,
            subscapularSkinfold: m.subscapularSkinfold || undefined,
            tricepsSkinfold: m.tricepsSkinfold || undefined
        };
    });

    // Calculate Interpretation for the LATEST measurement
    const lastMeasurement = measurements[measurements.length - 1];
    let interpretation = null;
    let trend = null;

    if (lastMeasurement && lastMeasurement.weight > 0 && lastMeasurement.height > 0) {
        interpretation = getInterpretation(
            lastMeasurement.weight,
            lastMeasurement.height, // in cm
            lastMeasurement.ageMonths,
            patient.gender as 'male' | 'female'
        );

        trend = getGrowthTrend(
            measurements.map(m => ({ weight: m.weight, ageMonths: m.ageMonths })),
            patient.gender as 'male' | 'female'
        );
    }

    // Clinical thinking: Waterlow first → show IMT/U only if Waterlow indicates overweight/obesity (>110%)
    const showBmiInterpretation = interpretation ? interpretation.waterlowPercent > 110 : false;

    return (
        <ClientThemeWrapper gender={patient.gender as "male" | "female"}>
            <div className="mx-auto max-w-6xl pb-10">
                <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <header className="mb-8 flex flex-col gap-4 border-b pb-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${patient.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {patient.gender}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">ID: {patient.id.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                {patient.name}
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Lahir: <span className="font-semibold text-foreground">{patient.dob.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span> ({calculateDetailedAge(patient.dob)})
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 bg-card border border-border shadow-sm p-4 md:p-5 rounded-[24px] relative z-10 w-full md:w-auto">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Entri Data Baru</span>
                            <form action={addMeasurement.bind(null, patient.id)} className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <input type="date" name="date" required title="Tanggal Pengukuran" className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:bg-background outline-none focus:ring-2 ring-primary/20 transition-all font-medium min-w-[130px]" defaultValue={new Date().toISOString().split('T')[0]} />
                                    <input type="number" step="0.1" name="weight" placeholder="BB (kg)" className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:bg-background outline-none focus:ring-2 ring-primary/20 transition-all w-[100px] font-bold" />
                                    <input type="number" step="0.1" name="height" placeholder="TB (cm)" className="px-3 py-2 border border-border rounded-xl text-sm bg-muted/30 focus:bg-background outline-none focus:ring-2 ring-primary/20 transition-all w-[100px] font-bold" />
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)] transition-all hover:scale-[1.02] active:scale-[0.98] ml-auto md:ml-0">
                                        <Plus className="h-4 w-4" /> Simpan
                                    </button>
                                </div>
                                <div className="mt-1">
                                    <input type="checkbox" id="toggle-data-tambahan" className="peer hidden" />
                                    <label htmlFor="toggle-data-tambahan" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none inline-flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-full cursor-pointer outline-none hover:ring-2 ring-primary/20 peer-checked:[&>span]:-rotate-180">
                                        <span className="transition-transform duration-300 origin-center text-[10px]">▼</span> Data Tambahan (Opsional)
                                    </label>
                                    <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-in-out peer-checked:grid-rows-[1fr] peer-checked:opacity-100 overflow-hidden">
                                        <div className="min-h-0 pt-3">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl shadow-inner">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] text-muted-foreground font-semibold ml-1">Lingkar Kepala</label>
                                                    <input type="number" step="0.1" name="headCircumference" placeholder="LK (cm)" className="px-3 py-2 border border-border rounded-xl text-sm bg-background focus:ring-2 ring-primary/20 outline-none w-full transition-shadow" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] text-muted-foreground font-semibold ml-1">Lengan Atas</label>
                                                    <input type="number" step="0.1" name="armCircumference" placeholder="LiLA (cm)" className="px-3 py-2 border border-border rounded-xl text-sm bg-background focus:ring-2 ring-primary/20 outline-none w-full transition-shadow" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] text-muted-foreground font-semibold ml-1">Subskapula</label>
                                                    <input type="number" step="0.1" name="subscapularSkinfold" placeholder="SS (mm)" className="px-3 py-2 border border-border rounded-xl text-sm bg-background focus:ring-2 ring-primary/20 outline-none w-full transition-shadow" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] text-muted-foreground font-semibold ml-1">Triseps</label>
                                                    <input type="number" step="0.1" name="tricepsSkinfold" placeholder="TS (mm)" className="px-3 py-2 border border-border rounded-xl text-sm bg-background focus:ring-2 ring-primary/20 outline-none w-full transition-shadow" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <GrowthChart
                            gender={patient.gender as "male" | "female"}
                            measurements={measurements}
                            patientName={patient.name}
                            patientDob={new Date(patient.dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            showBmi={showBmiInterpretation}
                        />

                        {/* TREND ANALYSIS CARD */}
                        {trend && (
                            <div className={`rounded-xl border-2 p-5 shadow-sm ${getTrendStyles(trend.status).bg} ${getTrendStyles(trend.status).border} transition-all`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl bg-white shadow-sm border ${getTrendStyles(trend.status).border}`}>
                                            <TrendingUp className={`h-6 w-6 ${getTrendStyles(trend.status).icon}`} />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-black ${getTrendStyles(trend.status).text}`}>
                                                {trend.message}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1 font-medium leading-tight max-w-md">
                                                {trend.description}
                                            </p>
                                        </div>
                                    </div>
                                    {trend.velocity !== undefined && (
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase block">Velocity</span>
                                            <span className="text-xl font-black text-foreground">{trend.velocity > 0 ? '+' : ''}{trend.velocity.toFixed(2)}</span>
                                            <span className="text-xs text-muted-foreground font-medium ml-1">kg/bln</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* INTERPRETATION CARD - Differentiated WHO vs CDC */}
                        {interpretation && (
                            <div className={`relative overflow-hidden rounded-2xl border-2 bg-white p-8 shadow-md ${interpretation.isCDC ? 'border-blue-500/20 shadow-blue-500/5' : 'border-green-500/20 shadow-green-500/5'
                                }`}>
                                {/* Background Accent Ribbon */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${interpretation.isCDC ? 'bg-blue-500' : 'bg-green-500'
                                    }`} />

                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        <Activity className={`h-6 w-6 ${interpretation.isCDC ? 'text-blue-500' : 'text-green-500'}`} />
                                        Interpretasi Klinis <span className="text-muted-foreground font-normal text-sm ml-2">(Data Terakhir)</span>
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${interpretation.isCDC ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {interpretation.isCDC ? 'Standar CDC (Percentile)' : 'Standar WHO (Z-Score)'}
                                        </div>
                                        <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                                            Medical Grade
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    {/* TB/U (Height-for-Age) */}
                                    <div className={`group p-5 rounded-2xl border-2 border-transparent transition-all ${interpretation.isCDC ? 'bg-blue-50/50 hover:bg-blue-50/80 hover:border-blue-100' : 'bg-green-50/50 hover:bg-green-50/80 hover:border-green-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Ruler className={`h-4 w-4 ${interpretation.isCDC ? 'text-blue-500' : 'text-green-600'}`} />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">TB/U (Tinggi Badan menurut Umur)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.heightForAge)}`}>
                                            {interpretation.heightForAge}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">
                                            {interpretation.isCDC ? (
                                                <>Percentile: <span className="text-foreground">P{Math.round(interpretation.heightForAgePercentile)}</span></>
                                            ) : (
                                                <>Z-Score: <span className="text-foreground">{interpretation.heightForAgeZScore} SD</span></>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.heightForAgeReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BB/U (Weight-for-Age) */}
                                    <div className={`group p-5 rounded-2xl border-2 border-transparent transition-all ${interpretation.isCDC ? 'bg-blue-50/50 hover:bg-blue-50/80 hover:border-blue-100' : 'bg-green-50/50 hover:bg-green-50/80 hover:border-green-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Weight className={`h-4 w-4 ${interpretation.isCDC ? 'text-blue-500' : 'text-green-600'}`} />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">BB/U (Berat Badan menurut Umur)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.weightForAge)}`}>
                                            {interpretation.weightForAge}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">
                                            {interpretation.isCDC ? (
                                                <>Percentile: <span className="text-foreground">P{Math.round(interpretation.weightForAgePercentile)}</span></>
                                            ) : (
                                                <>Z-Score: <span className="text-foreground">{interpretation.weightForAgeZScore} SD</span></>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.weightForAgeReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BB/TB (Weight-for-Height) */}
                                    <div className={`group p-5 rounded-2xl border-2 border-transparent transition-all ${interpretation.isCDC ? 'bg-muted/10 opacity-60 grayscale' : 'bg-green-50/50 hover:bg-green-50/80 hover:border-green-100'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Scale className={`h-4 w-4 ${interpretation.isCDC ? 'text-muted-foreground' : 'text-green-600'}`} />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">BB/TB (Berat Badan menurut Tinggi Badan)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${interpretation.isCDC ? 'text-muted-foreground' : getStatusColor(interpretation.weightForHeight)}`}>
                                            {interpretation.weightForHeight}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">
                                            {interpretation.isCDC ? (
                                                <>Percentile: <span className="text-foreground">-</span></>
                                            ) : (
                                                <>Z-Score: <span className="text-foreground">{interpretation.weightForHeightZScore} SD</span></>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.weightForHeightReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* IMT/U (BMI-for-Age) — only shown when Waterlow indicates overweight/obesity */}
                                    {showBmiInterpretation ? (
                                        <div className={`group p-5 rounded-2xl border-2 border-transparent transition-all ${interpretation.isCDC ? 'bg-blue-50/50 hover:bg-blue-50/80 hover:border-blue-100' : 'bg-green-50/50 hover:bg-green-50/80 hover:border-green-100'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                    <Activity className={`h-4 w-4 ${interpretation.isCDC ? 'text-blue-500' : 'text-green-600'}`} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">IMT/U (Indeks Massa Tubuh menurut Umur)</span>
                                            </div>
                                            <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.bmiForAge)}`}>
                                                {interpretation.bmiForAge}
                                            </div>
                                            <div className="text-sm font-bold text-muted-foreground">
                                                {interpretation.isCDC ? (
                                                    <>Percentile: <span className="text-foreground">P{Math.round(interpretation.bmiForAgePercentile)}</span></>
                                                ) : (
                                                    <>Z-Score: <span className="text-foreground">{interpretation.bmiForAgeZScore} SD</span></>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                    {interpretation.bmiForAgeReason}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`p-5 rounded-2xl border-2 border-dashed flex items-center justify-center min-h-[120px] ${interpretation.isCDC ? 'bg-blue-50/30 border-blue-200' : 'bg-green-50/30 border-green-200'
                                            }`}>
                                            <p className="text-xs text-muted-foreground text-center italic leading-relaxed">
                                                IMT/U tidak ditampilkan — Waterlow tidak menunjukkan overweight/obesitas ({interpretation.waterlowPercent}%)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Waterlow Classification */}
                                <div className={`p-4 rounded-lg border ${interpretation.isCDC ? 'bg-blue-500/5 border-blue-500/20' : 'bg-green-500/5 border-green-500/20'
                                    }`}>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Info className={`h-4 w-4 ${interpretation.isCDC ? 'text-blue-600' : 'text-green-600'}`} />
                                        Klasifikasi Waterlow
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase">Status Gizi</span>
                                            <div className={`text-xl font-bold ${getStatusColor(interpretation.waterlowStatus)}`}>
                                                {interpretation.waterlowStatus}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{interpretation.waterlowPercent}%</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase">BB Ideal</span>
                                            <div className="text-xl font-bold">{interpretation.ibw} kg</div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase">Height Age</span>
                                            <div className="text-xl font-bold">{formatMonthsToDetailedAge(interpretation.heightAge)}</div>
                                        </div>
                                    </div>
                                    <div className={`mt-3 pt-3 border-t ${interpretation.isCDC ? 'border-blue-500/20' : 'border-green-500/20'
                                        }`}>
                                        <div className="flex items-start gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {interpretation.waterlowReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Classification Legend Differentiated */}
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs text-muted-foreground mb-3 font-semibold">
                                        Referensi Interpretasi ({interpretation.isCDC ? 'CDC' : 'WHO'}):
                                    </p>

                                    {!interpretation.isCDC ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                                            <div>
                                                <span className="font-medium block mb-1">TB/U:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 3 SD: Very Tall</li>
                                                    <li>• -2 to 3 SD: Normal</li>
                                                    <li>• -3 to -2 SD: Stunted</li>
                                                    <li>• &lt; -3 SD: Severely Stunted</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium block mb-1">BB/U:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 1 SD: Risiko BB Lebih</li>
                                                    <li>• -2 to 1 SD: Normal</li>
                                                    <li>• -3 to -2 SD: Underweight</li>
                                                    <li>• &lt; -3 SD: Severely Underweight</li>
                                                </ul>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium block mb-1">BB/TB (&lt;5 tahun):</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 3 SD: Obese</li>
                                                    <li>• 2 to 3 SD: Overweight</li>
                                                    <li>• -2 to 2 SD: Normal</li>
                                                    <li>• -3 to -2 SD: Wasted</li>
                                                    <li>• &lt; -3 SD: Severely Wasted</li>
                                                </ul>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium block mb-1">IMT/U (0-19 tahun):</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 3 SD: Obese</li>
                                                    <li>• 2 to 3 SD: Overweight</li>
                                                    <li>• 1 to 2 SD: Risk of Overweight</li>
                                                    <li>• -2 to 1 SD: Normal</li>
                                                    <li>• -3 to -2 SD: Thinness</li>
                                                    <li>• &lt; -3 SD: Severe Thinness</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium block mb-1">Waterlow:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 120%: Obesitas</li>
                                                    <li>• 110-120%: Overweight</li>
                                                    <li>• 90-110%: Gizi Baik</li>
                                                    <li>• 70-90%: Gizi Kurang</li>
                                                    <li>• &lt; 70%: Gizi Buruk</li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                                            <div>
                                                <span className="font-medium block mb-1">TB/U:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &ge; P5: Normal</li>
                                                    <li>• &lt; P5: Short Stature</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium block mb-1">BB/U:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; P95: Overweight</li>
                                                    <li>• P5 - P95: Normal</li>
                                                    <li>• &lt; P5: Underweight</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium block mb-1">IMT/U:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &ge; P95: Obesity</li>
                                                    <li>• P85 - P95: Overweight</li>
                                                    <li>• P5 - &lt; P85: Healthy Weight</li>
                                                    <li>• &lt; P5: Underweight</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="font-medium block mb-1">Waterlow:</span>
                                                <ul className="space-y-0.5">
                                                    <li>• &gt; 120%: Obesitas</li>
                                                    <li>• 110-120%: Overweight</li>
                                                    <li>• 90-110%: Gizi Baik</li>
                                                    <li>• 70-90%: Gizi Kurang</li>
                                                    <li>• &lt; 70%: Gizi Buruk</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                            <h3 className="mb-4 font-semibold">Measurement History</h3>
                            <div className="space-y-4">
                                {[...measurements].reverse().map((m) => (
                                    <MeasurementRow
                                        key={m.id}
                                        measurement={m}
                                        patientId={patient.id}
                                        detailedAge={m.detailedAge}
                                    />
                                ))}
                                {measurements.length === 0 && <p className="text-sm text-muted-foreground">No records yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientThemeWrapper>
    );
}
