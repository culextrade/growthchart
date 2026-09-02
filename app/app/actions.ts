"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function toTitleCase(str: string): string {
    return str.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function normalizePatientName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getJakartaDateString(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(new Date(date));
}

export async function getPatients() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    return await prisma.patient.findMany({
        where: { tenant_id: (session.user as any).tenant_id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { measurements: true } } }
    });
}

export async function getPatient(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    return await prisma.patient.findUnique({
        where: { id, tenant_id: (session.user as any).tenant_id },
        include: {
            measurements: {
                orderBy: { date: "asc" }
            }
        },
    });
}

interface SessionUser {
    id: string;
    tenant_id: string;
    name?: string | null;
    email?: string | null;
    username?: string | null;
    role?: string | null;
}

const pendingPatientCreations = new Set<string>();

export async function createPatient(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const rawName = formData.get("name") as string;
    const rawDob = formData.get("dob") as string;
    const gender = (formData.get("gender") as string) || "male";
    const parentNameRaw = formData.get("parentName") as string;

    if (!rawName || !rawName.trim()) {
        return { error: "Nama pasien wajib diisi." };
    }
    if (!rawDob) {
        return { error: "Tanggal lahir wajib diisi." };
    }

    const user = session.user as SessionUser;
    const name = toTitleCase(rawName);
    const searchName = normalizePatientName(name);
    const dob = new Date(rawDob);
    const parentName = parentNameRaw ? toTitleCase(parentNameRaw) : null;
    const tenant_id = user.tenant_id;

    // Concurrency Lock: Prevent parallel double-click submissions
    const submissionKey = `${tenant_id}:${searchName}:${getJakartaDateString(dob)}`;
    if (pendingPatientCreations.has(submissionKey)) {
        return { error: "Sedang memproses data pasien ini. Mohon tunggu sebentar..." };
    }
    pendingPatientCreations.add(submissionKey);

    try {
        // Optimized Duplicate Check: Only query DOB window (+/- 24 hours) with minimal fields
        // This avoids pulling the entire tenant patient list into Node.js memory
        const minDob = new Date(dob.getTime() - 24 * 60 * 60 * 1000);
        const maxDob = new Date(dob.getTime() + 24 * 60 * 60 * 1000);

        const candidates = await prisma.patient.findMany({
            where: {
                tenant_id,
                dob: {
                    gte: minDob,
                    lte: maxDob,
                }
            },
            select: {
                id: true,
                name: true,
                dob: true
            }
        });

        const duplicate = candidates.find(p => 
            normalizePatientName(p.name) === searchName &&
            getJakartaDateString(p.dob) === getJakartaDateString(dob)
        );

        if (duplicate) {
            return { error: "Data pasien dengan nama dan tanggal lahir yang sama sudah terdaftar." };
        }

        const newPatient = await prisma.patient.create({
            data: {
                name,
                dob,
                gender,
                parentName,
                userId: user.id,
                tenant_id
            },
        });

        revalidatePath("/dashboard");
        return { success: true, patientId: newPatient.id };
    } finally {
        pendingPatientCreations.delete(submissionKey);
    }
}

export async function addMeasurement(patientId: string, formData: FormData) {
    const parseOptionalFloat = (name: string) => {
        const val = formData.get(name);
        if (!val || (val as string).trim() === '') return null;
        const num = parseFloat(val as string);
        return isNaN(num) ? null : num;
    };

    const weight = parseOptionalFloat('weight');
    const height = parseOptionalFloat('height');
    const headCircumference = parseOptionalFloat('headCircumference');
    const armCircumference = parseOptionalFloat('armCircumference');
    const subscapularSkinfold = parseOptionalFloat('subscapularSkinfold');
    const tricepsSkinfold = parseOptionalFloat('tricepsSkinfold');
    const date = new Date(formData.get("date") as string || new Date().toISOString());

    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const patient = await prisma.patient.findUnique({
        where: { id: patientId, tenant_id: (session.user as any).tenant_id },
        select: { tenant_id: true }
    });

    if (!patient) throw new Error("Patient not found or unauthorized");

    await prisma.measurement.create({
        data: {
            patientId,
            weight,
            height,
            headCircumference,
            armCircumference,
            subscapularSkinfold,
            tricepsSkinfold,
            date,
            tenant_id: patient.tenant_id
        }
    });

    revalidatePath(`/patients/${patientId}`);
}

export async function updatePatient(id: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const tenant_id = (session.user as any).tenant_id;
    const existing = await prisma.patient.findUnique({ where: { id, tenant_id } });
    if (!existing) throw new Error("Patient not found or unauthorized");

    const name = toTitleCase(formData.get("name") as string);
    const searchName = normalizePatientName(name);
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentNameRaw = formData.get("parentName") as string;
    const parentName = parentNameRaw ? toTitleCase(parentNameRaw) : null;

    // Duplicate Check excluding self, using normalized name & Jakarta date representation
    const candidates = await prisma.patient.findMany({
        where: { tenant_id, id: { not: id } }
    });

    const duplicate = candidates.find(p => 
        normalizePatientName(p.name) === searchName &&
        getJakartaDateString(p.dob) === getJakartaDateString(dob)
    );

    if (duplicate) {
        return { error: "Patient data with the same name and date of birth already exists." };
    }

    await prisma.patient.update({
        where: { id },
        data: { name, dob, gender, parentName },
    });

    revalidatePath(`/patients/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deletePatient(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const existing = await prisma.patient.findUnique({
        where: { id, tenant_id: (session.user as any).tenant_id },
    });
    if (!existing) throw new Error("Patient not found or unauthorized");

    await prisma.patient.delete({ where: { id } });

    revalidatePath("/dashboard");
}

export async function updateMeasurement(measurementId: string, patientId: string, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const existing = await prisma.measurement.findUnique({
        where: { id: measurementId, tenant_id: (session.user as any).tenant_id },
    });
    if (!existing) throw new Error("Measurement not found or unauthorized");

    const date = new Date(formData.get("date") as string);
    const parseOptionalFloat = (name: string) => {
        const val = formData.get(name);
        if (!val || (val as string).trim() === '') return null;
        const num = parseFloat(val as string);
        return isNaN(num) ? null : num;
    };

    const weight = parseOptionalFloat('weight');
    const height = parseOptionalFloat('height');
    const headCircumference = parseOptionalFloat('headCircumference');
    const armCircumference = parseOptionalFloat('armCircumference');
    const subscapularSkinfold = parseOptionalFloat('subscapularSkinfold');
    const tricepsSkinfold = parseOptionalFloat('tricepsSkinfold');

    await prisma.measurement.update({
        where: { id: measurementId },
        data: { date, weight, height, headCircumference, armCircumference, subscapularSkinfold, tricepsSkinfold },
    });

    revalidatePath(`/patients/${patientId}`);
}

export async function deleteMeasurement(measurementId: string, patientId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const existing = await prisma.measurement.findUnique({
        where: { id: measurementId, tenant_id: (session.user as any).tenant_id },
    });
    if (!existing) throw new Error("Measurement not found or unauthorized");

    await prisma.measurement.delete({ where: { id: measurementId } });

    revalidatePath(`/patients/${patientId}`);
}

export async function removeDuplicatePatients(): Promise<number> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const tenantId = (session.user as any).tenant_id;
    const patients = await prisma.patient.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { measurements: true } } },
    });

    const groups = new Map<string, typeof patients>();
    for (const p of patients) {
        const key = `${normalizePatientName(p.name)}|${getJakartaDateString(p.dob)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    }

    const idsToDelete: string[] = [];
    for (const [, group] of groups) {
        if (group.length <= 1) continue;
        const withData = group.filter(p => p._count.measurements > 0);
        const withoutData = group.filter(p => p._count.measurements === 0);
        if (withData.length > 0) {
            idsToDelete.push(...withoutData.map(p => p.id));
        } else {
            const sorted = [...withoutData].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            idsToDelete.push(...sorted.slice(1).map(p => p.id));
        }
    }

    if (idsToDelete.length > 0) {
        await prisma.patient.deleteMany({ where: { id: { in: idsToDelete }, tenant_id: tenantId } });
    }

    revalidatePath("/dashboard");
    return idsToDelete.length;
}

export async function mergeDuplicatePatients(): Promise<{ mergedGroups: number; deletedRecords: number }> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const tenantId = (session.user as any).tenant_id;

    const patients = await prisma.patient.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { measurements: true } } },
        orderBy: { createdAt: 'asc' },
    });

    const groups = new Map<string, typeof patients>();
    for (const p of patients) {
        const key = `${normalizePatientName(p.name)}|${getJakartaDateString(p.dob)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    }

    let mergedGroups = 0;
    let deletedRecords = 0;

    for (const [, group] of groups) {
        if (group.length <= 1) continue;

        // Primary = most measurements; on tie, keep oldest
        const sorted = [...group].sort(
            (a, b) => b._count.measurements - a._count.measurements || a.createdAt.getTime() - b.createdAt.getTime()
        );
        const primary = sorted[0];
        const duplicates = sorted.slice(1);
        const duplicateIds = duplicates.map(d => d.id);

        // Reassign all measurements from duplicates → primary
        await prisma.measurement.updateMany({
            where: { patientId: { in: duplicateIds }, tenant_id: tenantId },
            data: { patientId: primary.id },
        });

        // Normalize primary name to Title Case
        const normalizedName = toTitleCase(primary.name);
        if (normalizedName !== primary.name) {
            await prisma.patient.update({ where: { id: primary.id }, data: { name: normalizedName } });
        }

        // Delete duplicate records
        await prisma.patient.deleteMany({ where: { id: { in: duplicateIds }, tenant_id: tenantId } });

        mergedGroups++;
        deletedRecords += duplicateIds.length;
    }

    revalidatePath("/dashboard");
    return { mergedGroups, deletedRecords };
}
