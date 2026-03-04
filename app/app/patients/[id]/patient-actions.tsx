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
    measurement: { id: string; date: string; weight: number; height: number; bmi: number };
    patientId: string;
    detailedAge: string;
}) {
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    if (editing) {
        return (
            <form
                className="flex flex-col gap-2 border-b pb-3 last:border-0 p-2 bg-muted/20 rounded-lg animate-in fade-in"
                action={(formData) => {
                    startTransition(async () => {
                        await updateMeasurement(measurement.id, patientId, formData);
                        setEditing(false);
                    });
                }}
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="date"
                        name="date"
                        defaultValue={measurement.date}
                        required
                        className="px-2 py-1 border rounded text-xs bg-white focus:ring-2 ring-primary/20 outline-none"
                        title="Tanggal pengukuran"
                    />
                    <input
                        type="number"
                        step="0.1"
                        name="weight"
                        defaultValue={measurement.weight || ""}
                        placeholder="BB (kg)"
                        className="px-2 py-1 border rounded text-xs bg-white focus:ring-2 ring-primary/20 outline-none w-20"
                    />
                    <input
                        type="number"
                        step="0.1"
                        name="height"
                        defaultValue={measurement.height || ""}
                        placeholder="TB (cm)"
                        className="px-2 py-1 border rounded text-xs bg-white focus:ring-2 ring-primary/20 outline-none w-20"
                    />
                </div>
                <div className="flex gap-1">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        Simpan
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted/50"
                    >
                        <X className="h-3 w-3" /> Batal
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex flex-col gap-1 border-b pb-3 last:border-0 group">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{measurement.date}</span>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{detailedAge}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 ml-1">
                        <button
                            onClick={() => setEditing(true)}
                            className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                        >
                            <Pencil className="h-3 w-3" />
                        </button>
                        <button
                            disabled={isPending}
                            onClick={() => {
                                if (!confirm("Hapus data kunjungan ini?")) return;
                                startTransition(async () => {
                                    await deleteMeasurement(measurement.id, patientId);
                                });
                            }}
                            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Hapus"
                        >
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 text-sm">
                {measurement.weight > 0 && <span><strong>W:</strong> {measurement.weight}kg</span>}
                {measurement.height > 0 && <span><strong>H:</strong> {measurement.height}cm</span>}
                {measurement.bmi > 0 && <span><strong>BMI:</strong> {measurement.bmi}</span>}
            </div>
        </div>
    );
}
