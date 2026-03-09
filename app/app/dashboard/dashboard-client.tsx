"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, User, Search, Trash2, X, Pencil, Check, Loader2 } from "lucide-react";
import { createPatient, updatePatient, deletePatient } from "../actions";
import { calculateDetailedAge } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

interface PatientData {
    id: string;
    name: string;
    dob: Date;
    gender: string;
    parentName: string | null;
    _count: { measurements: number };
}

export function DashboardClient({ patients, userName, userUsername, version }: { patients: PatientData[], userName: string, userUsername: string, version: string }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return patients;
        const q = searchQuery.toLowerCase().trim();
        return patients.filter(p => p.name.toLowerCase().includes(q));
    }, [patients, searchQuery]);

    return (
        <div className="min-h-screen bg-muted/20 p-8">
            <header className="mb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-primary">Pediatric Dashboard</h1>
                            <span className="text-xs font-mono font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">v{version}</span>
                        </div>
                        <p className="text-muted-foreground">Manage your patients and track their growth.</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <form action={createPatient} className="flex gap-2 items-center">
                            <input type="text" name="name" placeholder="Name" required className="px-3 py-2 border rounded text-sm" />
                            <input type="date" name="dob" required className="px-3 py-2 border rounded text-sm" />
                            <select name="gender" className="px-3 py-2 border rounded text-sm">
                                <option value="male">Boy</option>
                                <option value="female">Girl</option>
                            </select>
                            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow transition-colors hover:bg-primary/90">
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </form>
                        <div className="h-8 w-px bg-border mx-1"></div>
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-foreground">{userName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">@{userUsername}</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari pasien..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border-2 border-border/50 rounded-xl text-sm bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <span className="text-xs text-muted-foreground font-medium">
                        {filteredPatients.length} / {patients.length} pasien
                    </span>
                </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPatients.map((patient) => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}
                {filteredPatients.length === 0 && searchQuery && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Tidak ada pasien dengan nama &quot;{searchQuery}&quot;.
                    </div>
                )}
                {patients.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No patients found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Patient Card with inline Edit/Delete ---
function PatientCard({ patient }: { patient: PatientData }) {
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Hapus pasien "${patient.name}" beserta semua data kunjungannya?\n\nTindakan ini tidak bisa dibatalkan.`)) return;
        startTransition(async () => {
            await deletePatient(patient.id);
            router.refresh();
        });
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditing(true);
    };

    if (editing) {
        return (
            <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-card text-card-foreground shadow-md">
                <div className={`absolute inset-0 opacity-10 ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                <form
                    className="relative p-5 flex flex-col gap-3"
                    action={(formData) => {
                        startTransition(async () => {
                            await updatePatient(patient.id, formData);
                            setEditing(false);
                        });
                    }}
                >
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Edit Pasien</p>
                    <input
                        type="text"
                        name="name"
                        defaultValue={patient.name}
                        required
                        className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none font-semibold"
                        placeholder="Nama"
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            name="dob"
                            defaultValue={new Date(patient.dob).toISOString().split('T')[0]}
                            required
                            className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
                        />
                        <select
                            name="gender"
                            defaultValue={patient.gender}
                            className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
                        >
                            <option value="male">Boy</option>
                            <option value="female">Girl</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        name="parentName"
                        defaultValue={patient.parentName || ""}
                        placeholder="Nama Orang Tua"
                        className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 ring-primary/20 outline-none"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow transition-all hover:scale-[1.02] disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-all"
                        >
                            <X className="h-3.5 w-3.5" /> Batal
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className={`absolute inset-0 opacity-[0.07] ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />

            {/* Gender-specific sketch ornament */}
            {patient.gender === 'female' ? (
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.06] pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Flower 1 - top right */}
                    <ellipse cx="160" cy="30" rx="18" ry="8" stroke="#ec4899" strokeWidth="1.2" transform="rotate(0 160 30)" />
                    <ellipse cx="160" cy="30" rx="18" ry="8" stroke="#ec4899" strokeWidth="1.2" transform="rotate(60 160 30)" />
                    <ellipse cx="160" cy="30" rx="18" ry="8" stroke="#ec4899" strokeWidth="1.2" transform="rotate(120 160 30)" />
                    <circle cx="160" cy="30" r="5" stroke="#ec4899" strokeWidth="1.2" />
                    {/* Flower 2 - center right */}
                    <ellipse cx="180" cy="110" rx="14" ry="6" stroke="#f472b6" strokeWidth="1" transform="rotate(0 180 110)" />
                    <ellipse cx="180" cy="110" rx="14" ry="6" stroke="#f472b6" strokeWidth="1" transform="rotate(72 180 110)" />
                    <ellipse cx="180" cy="110" rx="14" ry="6" stroke="#f472b6" strokeWidth="1" transform="rotate(144 180 110)" />
                    <ellipse cx="180" cy="110" rx="14" ry="6" stroke="#f472b6" strokeWidth="1" transform="rotate(216 180 110)" />
                    <ellipse cx="180" cy="110" rx="14" ry="6" stroke="#f472b6" strokeWidth="1" transform="rotate(288 180 110)" />
                    <circle cx="180" cy="110" r="4" stroke="#f472b6" strokeWidth="1" />
                    {/* Leaf stem */}
                    <path d="M145 160 Q160 140 175 155" stroke="#ec4899" strokeWidth="1" />
                    <path d="M155 145 Q165 155 155 165" stroke="#ec4899" strokeWidth="0.8" />
                    {/* Small buds */}
                    <circle cx="130" cy="75" r="3" stroke="#f9a8d4" strokeWidth="0.8" />
                    <path d="M127 75 Q130 68 133 75" stroke="#f9a8d4" strokeWidth="0.8" />
                    <circle cx="195" cy="170" r="4" stroke="#f9a8d4" strokeWidth="0.8" />
                    <path d="M191 170 Q195 162 199 170" stroke="#f9a8d4" strokeWidth="0.8" />
                </svg>
            ) : (
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.06] pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Triangle */}
                    <polygon points="155,15 185,55 125,55" stroke="#3b82f6" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* Hexagon */}
                    <polygon points="180,100 195,112 195,132 180,144 165,132 165,112" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round" />
                    {/* Paper airplane */}
                    <path d="M120 80 L158 95 L135 100 Z" stroke="#3b82f6" strokeWidth="1.2" strokeLinejoin="round" />
                    <path d="M135 100 L140 115 L158 95" stroke="#3b82f6" strokeWidth="1" />
                    {/* Small diamond */}
                    <polygon points="140,160 150,170 140,180 130,170" stroke="#93c5fd" strokeWidth="0.8" />
                    {/* Circle */}
                    <circle cx="190" cy="170" r="10" stroke="#60a5fa" strokeWidth="0.8" />
                    {/* Small square */}
                    <rect x="110" cy="35" y="35" width="16" height="16" stroke="#93c5fd" strokeWidth="0.8" rx="1" transform="rotate(15 118 43)" />
                    {/* Dots pattern */}
                    <circle cx="170" cy="65" r="1.5" stroke="#93c5fd" strokeWidth="0.6" />
                    <circle cx="150" cy="130" r="1.5" stroke="#93c5fd" strokeWidth="0.6" />
                </svg>
            )}

            <Link href={`/patients/${patient.id}`} className="relative block p-6">
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${patient.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                        <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{calculateDetailedAge(patient.dob)}</p>
                        <p className="text-xs text-muted-foreground">DOB: {new Date(patient.dob).toLocaleDateString()}</p>
                    </div>
                    {patient._count.measurements === 0 && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 tracking-wide shrink-0">
                            Belum ada data
                        </span>
                    )}
                </div>
            </Link>

            {/* Action buttons — visible on hover, pointer-events only when visible */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex gap-1 z-10">
                <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-lg bg-white/90 border shadow-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                    title="Edit Pasien"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-1.5 rounded-lg bg-white/90 border shadow-sm text-muted-foreground hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50"
                    title="Hapus Pasien"
                >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
}

