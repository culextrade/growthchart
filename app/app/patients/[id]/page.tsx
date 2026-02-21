import Link from "next/link";
import { ArrowLeft, Plus, Activity, Ruler, Scale, Info, TrendingUp, Weight } from "lucide-react";
import { getPatient, addMeasurement } from "../../actions";
import { ClientThemeWrapper } from "./client-wrapper";
import { GrowthChart } from "@/components/growth-chart";
// Import interpretation
import { getInterpretation, getGrowthTrend } from "@/lib/growth-standards";
import { calculateDetailedAge } from "@/lib/utils";

function calculateAgeMonths(dob: Date, measurementDate: Date) {
    const diffTime = Math.abs(measurementDate.getTime() - dob.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Number((diffDays / 30.44).toFixed(1));
}

// Helper to get status color
function getStatusColor(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('severely') || lowerStatus.includes('buruk')) return 'text-red-600';
    if (lowerStatus.includes('wasted') || lowerStatus.includes('kurang') || lowerStatus.includes('stunted') || lowerStatus.includes('underweight')) return 'text-orange-500';
    if (lowerStatus.includes('overweight') || lowerStatus.includes('risk') || lowerStatus.includes('risiko')) return 'text-yellow-600';
    if (lowerStatus.includes('obese') || lowerStatus.includes('obesitas')) return 'text-red-500';
    return 'text-green-600';
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
        const h = m.height ? m.height / 100 : 0; // convert cm to m for BMI
        const bmi = (m.weight && h > 0) ? (m.weight / (h * h)) : 0;

        return {
            date: m.date.toISOString().split('T')[0],
            weight: m.weight || 0,
            height: m.height || 0,
            bmi: parseFloat(bmi.toFixed(2)),
            ageMonths,
            detailedAge: calculateDetailedAge(patient.dob, m.date)
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

    return (
        <ClientThemeWrapper gender={patient.gender as "male" | "female"}>
            <div className="mx-auto max-w-6xl pb-10">
                <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-6">
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

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Entri Data Baru</span>
                        <form action={addMeasurement.bind(null, patient.id)} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-primary/20 shadow-sm">
                            <input type="date" name="date" required title="Tanggal Pengukuran" className="px-2 py-1.5 border rounded-lg text-sm bg-muted/30 focus:bg-white outline-none focus:ring-2 ring-primary/20 transition-all font-medium" defaultValue={new Date().toISOString().split('T')[0]} />
                            <input type="number" step="0.1" name="weight" placeholder="BB (kg)" className="px-2 py-1.5 border rounded-lg text-sm bg-muted/30 focus:bg-white outline-none focus:ring-2 ring-primary/20 transition-all w-24 font-bold" />
                            <input type="number" step="0.1" name="height" placeholder="TB (cm)" className="px-2 py-1.5 border rounded-lg text-sm bg-muted/30 focus:bg-white outline-none focus:ring-2 ring-primary/20 transition-all w-24 font-bold" />
                            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <Plus className="h-4 w-4" /> Simpan
                            </button>
                        </form>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <GrowthChart
                            gender={patient.gender as "male" | "female"}
                            measurements={measurements}
                            patientName={patient.name}
                            patientDob={new Date(patient.dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
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

                        {/* INTERPRETATION CARD - WHO Z-Score Based */}
                        {interpretation && (
                            <div className="rounded-2xl border-2 border-border/50 bg-white p-8 shadow-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        <Activity className="h-6 w-6 text-primary" />
                                        Interpretasi Klinis <span className="text-muted-foreground font-normal text-sm ml-2">(Data Terakhir)</span>
                                    </h3>
                                    <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                                        Medical Grade
                                    </div>
                                </div>

                                {/* WHO Z-Score Interpretations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    {/* TB/U (Height-for-Age) */}
                                    <div className="group p-5 bg-muted/10 hover:bg-muted/20 rounded-2xl border-2 border-transparent transition-all">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Ruler className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">TB/U (Tinggi Badan menurut Umur)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.heightForAge)}`}>
                                            {interpretation.heightForAge}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">Z-Score: <span className="text-foreground">{interpretation.heightForAgeZScore} SD</span></div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.heightForAgeReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BB/U (Weight-for-Age) */}
                                    <div className="group p-5 bg-muted/10 hover:bg-muted/20 rounded-2xl border-2 border-transparent transition-all">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Weight className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">BB/U (Berat Badan menurut Umur)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.weightForAge)}`}>
                                            {interpretation.weightForAge}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">Z-Score: <span className="text-foreground">{interpretation.weightForAgeZScore} SD</span></div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.weightForAgeReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BB/TB (Weight-for-Height) */}
                                    <div className="group p-5 bg-muted/10 hover:bg-muted/20 rounded-2xl border-2 border-transparent transition-all">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Scale className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">BB/TB (Berat Badan menurut Tinggi Badan)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.weightForHeight)}`}>
                                            {interpretation.weightForHeight}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">Z-Score: <span className="text-foreground">{interpretation.weightForHeightZScore} SD</span></div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.weightForHeightReason}
                                            </p>
                                        </div>
                                    </div>

                                    {/* IMT/U (BMI-for-Age) */}
                                    <div className="group p-5 bg-muted/10 hover:bg-muted/20 rounded-2xl border-2 border-transparent transition-all">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-white rounded-lg shadow-xs border">
                                                <Activity className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">IMT/U (Indeks Massa Tubuh menurut Umur)</span>
                                        </div>
                                        <div className={`text-xl font-black mb-1 ${getStatusColor(interpretation.bmiForAge)}`}>
                                            {interpretation.bmiForAge}
                                        </div>
                                        <div className="text-sm font-bold text-muted-foreground">Z-Score: <span className="text-foreground">{interpretation.bmiForAgeZScore} SD</span></div>
                                        <div className="mt-3 pt-3 border-t border-border/50 italic opacity-80">
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {interpretation.bmiForAgeReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Waterlow Classification */}
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-primary" />
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
                                            <div className="text-xl font-bold">{interpretation.heightAge} bulan</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-primary/20">
                                        <div className="flex items-start gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {interpretation.waterlowReason}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Classification Legend */}
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs text-muted-foreground mb-3 font-semibold">Referensi Interpretasi (WHO):</p>
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
                                        <div>
                                            <span className="font-medium block mb-1">BB/TB & IMT/U:</span>
                                            <ul className="space-y-0.5">
                                                <li>• &gt; 3 SD: Obese</li>
                                                <li>• 2 to 3 SD: Overweight</li>
                                                <li>• 1 to 2 SD: Risk of Overweight</li>
                                                <li>• -2 to 1 SD: Normal</li>
                                                <li>• -3 to -2 SD: Wasted</li>
                                                <li>• &lt; -3 SD: Severely Wasted</li>
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
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                            <h3 className="mb-4 font-semibold">Measurement History</h3>
                            <div className="space-y-4">
                                {[...measurements].reverse().map((m, i) => (
                                    <div key={i} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{m.date}</span>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{m.detailedAge}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            {m.weight > 0 && <span><strong>W:</strong> {m.weight}kg</span>}
                                            {m.height > 0 && <span><strong>H:</strong> {m.height}cm</span>}
                                            {m.bmi > 0 && <span><strong>BMI:</strong> {m.bmi}</span>}
                                        </div>
                                    </div>
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
