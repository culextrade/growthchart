export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, User } from "lucide-react";
import { getPatients, createPatient } from "../actions";
import { calculateDetailedAge } from "@/lib/utils";

export default async function DashboardPage() {
    const patients = await getPatients();

    return (
        <div className="min-h-screen bg-muted/20 p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Pediatric Dashboard</h1>
                    <p className="text-muted-foreground">Manage your patients and track their growth.</p>
                </div>

                {/* Simple Form for now - could be a Dialog in a real app */}
                <div className="flex gap-2">
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
                </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                    <Link
                        key={patient.id}
                        href={`/patients/${patient.id}`}
                        className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:scale-105 hover:shadow-md"
                    >
                        <div className={`absolute inset-0 opacity-10 ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${patient.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{patient.name}</h3>
                                    <p className="text-sm text-muted-foreground">{calculateDetailedAge(patient.dob)}</p>
                                    <p className="text-xs text-muted-foreground">DOB: {new Date(patient.dob).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {patients.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No patients found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
