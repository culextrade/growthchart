"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { updatePatient, deletePatient, updateMeasurement, deleteMeasurement } from "../../actions";

// --- Edit Patient Button (inline form toggle) ---
export function EditPatientButton({
    patient,
}: {
    patient: { id: string; name: string; dob: string; gender: string; parentName: string | null };
}) {
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    if (!editing) {
        return (
            <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            >
                <Pencil className="h-3.5 w-3.5" /> Edit Pasien
            </button>
        );
    }

    return (
        <form
            className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-xl border-2 border-primary/20 animate-in fade-in"
            action={(formData) => {
                startTransition(async () => {
                    await updatePatient(patient.id, formData);
                    setEditing(false);
                });
            }}
        >
            <input
                type="text"
                name="name"
                defaultValue={patient.name}
                required
                className="px-2 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none font-medium"
                placeholder="Nama"
                title="Nama pasien"
            />
            <input
                type="date"
                name="dob"
                defaultValue={patient.dob}
                required
                className="px-2 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
                title="Tanggal lahir"
            />
            <select
                name="gender"
                defaultValue={patient.gender}
                className="px-2 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
                title="Jenis kelamin"
            >
                <option value="male">Boy</option>
                <option value="female">Girl</option>
            </select>
            <input
                type="text"
                name="parentName"
                defaultValue={patient.parentName || ""}
                placeholder="Nama Ortu"
                className="px-2 py-1.5 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
            />
            <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Simpan
            </button>
            <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-all"
            >
                <X className="h-3.5 w-3.5" /> Batal
            </button>
        </form>
    );
}

// --- Delete Patient Button ---
export function DeletePatientButton({ patientId, patientName }: { patientId: string; patientName: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <button
            disabled={isPending}
            onClick={() => {
                if (!confirm(`Hapus pasien "${patientName}" beserta semua data kunjungannya? Tindakan ini tidak bisa dibatalkan.`)) return;
                startTransition(async () => {
                    await deletePatient(patientId);
                    router.push("/dashboard");
                });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
        >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Hapus
        </button>
    );
}

// --- Measurement Row with Edit/Delete ---
export function MeasurementRow({
    measurement,
    patientId,
    detailedAge,
}: {
    measurement: { id: string; date: string; weight: number; height: number; bmi: number; headCircumference?: number; armCircumference?: number; subscapularSkinfold?: number; tricepsSkinfold?: number };
    patientId: string;
    detailedAge: string;
}) {
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    if (editing) {
        return (
            <form
                className="flex flex-col gap-3 p-4 bg-muted/10 rounded-2xl animate-in fade-in transition-all border border-border/50 shadow-[0_4px_14px_0_rgb(0,0,0,0.02)] mb-3"
                action={(formData) => {
                    startTransition(async () => {
                        await updateMeasurement(measurement.id, patientId, formData);
                        setEditing(false);
                    });
                }}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">Tanggal</label>
                        <input type="date" name="date" required defaultValue={measurement.date} title="Tanggal Pengukuran" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">BB (kg)</label>
                        <input type="number" step="0.1" name="weight" defaultValue={measurement.weight || ''} placeholder="BB" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">TB (cm)</label>
                        <input type="number" step="0.1" name="height" defaultValue={measurement.height || ''} placeholder="TB" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">LK (cm)</label>
                        <input type="number" step="0.1" name="headCircumference" defaultValue={measurement.headCircumference || ''} placeholder="LK" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">LiLA (cm)</label>
                        <input type="number" step="0.1" name="armCircumference" defaultValue={measurement.armCircumference || ''} placeholder="LiLA" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">Subskapula (mm)</label>
                        <input type="number" step="0.1" name="subscapularSkinfold" defaultValue={measurement.subscapularSkinfold || ''} placeholder="SS" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground ml-1">Triseps (mm)</label>
                        <input type="number" step="0.1" name="tricepsSkinfold" defaultValue={measurement.tricepsSkinfold || ''} placeholder="TS" className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-shadow w-full" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border/50">
                    <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-semibold rounded-xl text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                    <button type="submit" disabled={isPending} className="px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_14px_0_hsl(var(--primary)/0.39)] outline-none focus-visible:ring-2 ring-offset-2 ring-primary disabled:opacity-50 inline-flex items-center gap-2">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Simpan
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-3 hover:bg-muted/30 rounded-2xl transition-colors group mb-1 border border-transparent hover:border-border/50">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold tracking-tight">{measurement.date}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{detailedAge}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
                        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95" title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button disabled={isPending} onClick={() => { if (!confirm("Hapus data kunjungan ini?")) return; startTransition(async () => { await deleteMeasurement(measurement.id, patientId); }); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-all active:scale-95 disabled:opacity-50" title="Hapus">
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex gap-x-4 gap-y-1 text-sm flex-wrap text-muted-foreground mt-0.5">
                {measurement.weight > 0 && <span className="text-foreground"><strong className="font-semibold text-muted-foreground">BB:</strong> <span className="font-semibold tracking-tight">{measurement.weight}</span>kg</span>}
                {measurement.height > 0 && <span className="text-foreground"><strong className="font-semibold text-muted-foreground">TB:</strong> <span className="font-semibold tracking-tight">{measurement.height}</span>cm</span>}
                {measurement.bmi > 0 && <span><strong className="font-semibold text-muted-foreground">IMT:</strong> {measurement.bmi}</span>}
                {measurement.headCircumference ? <span><strong className="font-semibold text-muted-foreground">LK:</strong> {measurement.headCircumference}cm</span> : null}
                {measurement.armCircumference ? <span><strong className="font-semibold text-muted-foreground">LiLA:</strong> {measurement.armCircumference}cm</span> : null}
                {measurement.subscapularSkinfold ? <span><strong className="font-semibold text-muted-foreground">SS:</strong> {measurement.subscapularSkinfold}mm</span> : null}
                {measurement.tricepsSkinfold ? <span><strong className="font-semibold text-muted-foreground">TS:</strong> {measurement.tricepsSkinfold}mm</span> : null}
            </div>
        </div>
    );
}
