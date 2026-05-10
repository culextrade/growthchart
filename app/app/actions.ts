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

export async function createPatient(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const name = toTitleCase(formData.get("name") as string);
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentNameRaw = formData.get("parentName") as string;
    const parentName = parentNameRaw ? toTitleCase(parentNameRaw) : null;
    const tenant_id = (session.user as any).tenant_id;

    // Duplicate Check
    const existing = await prisma.patient.findFirst({
        where: {
            tenant_id,
            name: { equals: name, mode: 'insensitive' },
            dob: { equals: dob }
        }
    });

    if (existing) {
        return { error: "Patient data with the same name and date of birth already exists." };
    }

    await prisma.patient.create({
        data: {
            name,
            dob,
            gender,
            parentName,
            userId: (session.user as any).id,
            tenant_id
        },
    });

    revalidatePath("/dashboard");
    return { success: true };
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
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentNameRaw = formData.get("parentName") as string;
    const parentName = parentNameRaw ? toTitleCase(parentNameRaw) : null;

    // Duplicate Check excluding self
    const duplicate = await prisma.patient.findFirst({
        where: {
            tenant_id,
            name: { equals: name, mode: 'insensitive' },
            dob: { equals: dob },
            id: { not: id }
        }
    });

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
        const key = `${p.name.trim().toLowerCase()}|${p.dob.toISOString().split('T')[0]}`;
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
        const key = `${p.name.trim().toLowerCase()}|${p.dob.toISOString().split('T')[0]}`;
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
