import Link from "next/link";
import { ArrowLeft, Plus, Activity, Ruler, Scale, Info, TrendingUp, TrendingDown, Weight } from "lucide-react";
import { getPatient, addMeasurement } from "../../actions";
import { ClientThemeWrapper } from "./client-wrapper";
import { GrowthChart } from "@/components/growth-chart";
// Import interpretation
import { getInterpretation } from "@/lib/growth-standards";
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

    if (lastMeasurement && lastMeasurement.weight > 0 && lastMeasurement.height > 0) {
        interpretation = getInterpretation(
            lastMeasurement.weight,
            lastMeasurement.height, // in cm
            lastMeasurement.ageMonths,
            patient.gender as 'male' | 'female'
        );
    }

    return (
        <ClientThemeWrapper gender={patient.gender as "male" | "female"}>
            <div className="mx-auto max-w-6xl pb-10">
                <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>

                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                            {patient.name}
                        </h1>
                        <div className="mt-2 flex items-center gap-3 text-lg text-muted-foreground">
                            <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${patient.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {patient.gender}
                            </span>
                            <span>Born {patient.dob.toLocaleDateString()} ({calculateDetailedAge(patient.dob)})</span>
                        </div>
                    </div>

                    <form action={addMeasurement.bind(null, patient.id)} className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                        <input type="date" name="date" required className="px-2 py-1 border rounded text-sm" />
                        <input type="number" step="0.1" name="weight" placeholder="Kg" className="px-2 py-1 border rounded text-sm w-20" />
                        <input type="number" step="0.1" name="height" placeholder="Cm" className="px-2 py-1 border rounded text-sm w-20" />
                        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-primary-foreground shadow transition-transform hover:scale-105">
                            <Plus className="h-4 w-4" /> Add
                        </button>
                    </form>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <GrowthChart gender={patient.gender as "male" | "female"} measurements={measurements} />

                        {/* INTERPRETATION CARD - WHO Z-Score Based */}
                        {interpretation && (
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Interpretasi Klinis (Kunjungan Terakhir)
                                </h3>

                                {/* WHO Z-Score Interpretations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* TB/U (Height-for-Age) */}
                                    <div className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Ruler className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">TB/U (Tinggi Badan / Umur)</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getStatusColor(interpretation.heightForAge)}`}>
                                            {interpretation.heightForAge}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Z-Score: {interpretation.heightForAgeZScore}</div>
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <div className="flex items-start gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {interpretation.heightForAgeReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BB/U (Weight-for-Age) */}
                                    <div className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Scale className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">BB/U (Berat Badan / Umur)</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getStatusColor(interpretation.weightForAge)}`}>
                                            {interpretation.weightForAge}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Z-Score: {interpretation.weightForAgeZScore}</div>
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <div className="flex items-start gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {interpretation.weightForAgeReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BB/TB (Weight-for-Height) */}
                                    <div className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">BB/TB (Berat / Tinggi)</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getStatusColor(interpretation.weightForHeight)}`}>
                                            {interpretation.weightForHeight}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Z-Score: {interpretation.weightForHeightZScore}</div>
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <div className="flex items-start gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {interpretation.weightForHeightReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IMT/U (BMI-for-Age) */}
                                    <div className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Weight className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">IMT/U (BMI / Umur)</span>
                                        </div>
                                        <div className={`text-lg font-bold ${getStatusColor(interpretation.bmiForAge)}`}>
                                            {interpretation.bmiForAge}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Z-Score: {interpretation.bmiForAgeZScore}</div>
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <div className="flex items-start gap-1.5">
                                                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {interpretation.bmiForAgeReason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Waterlow Classification */}
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-primary" />
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
                                                <li>• 2-3 SD: Overweight</li>
                                                <li>• -2 to 2 SD: Normal</li>
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
