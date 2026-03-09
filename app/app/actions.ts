"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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

    const name = formData.get("name") as string;
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentName = formData.get("parentName") as string;

    await prisma.patient.create({
        data: {
            name,
            dob,
            gender,
            parentName,
            userId: (session.user as any).id,
            tenant_id: (session.user as any).tenant_id
        },
    });

    revalidatePath("/dashboard");
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

    const existing = await prisma.patient.findUnique({
        where: { id, tenant_id: (session.user as any).tenant_id },
    });
    if (!existing) throw new Error("Patient not found or unauthorized");

    const name = formData.get("name") as string;
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentName = (formData.get("parentName") as string) || null;

    await prisma.patient.update({
        where: { id },
        data: { name, dob, gender, parentName },
    });

    revalidatePath(`/patients/${id}`);
    revalidatePath("/dashboard");
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

    // Get all patients with measurement count
    const patients = await prisma.patient.findMany({
        where: { tenant_id: tenantId },
        include: { _count: { select: { measurements: true } } },
    });

    // Group by normalized name + dob
    const groups = new Map<string, typeof patients>();
    for (const p of patients) {
        const key = `${p.name.trim().toLowerCase()}|${p.dob.toISOString().split('T')[0]}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    }

    // Collect IDs to delete: from groups with >1 patient, delete those with 0 measurements
    const idsToDelete: string[] = [];
    for (const [, group] of groups) {
        if (group.length <= 1) continue;

        // Keep patients with measurements, collect empty ones for deletion
        const withData = group.filter(p => p._count.measurements > 0);
        const withoutData = group.filter(p => p._count.measurements === 0);

        // Only delete empty duplicates if at least one patient with data exists,
        // OR if all are empty, keep one (the oldest created)
        if (withData.length > 0) {
            idsToDelete.push(...withoutData.map(p => p.id));
        } else {
            // All empty — keep the first (oldest), delete the rest
            const sorted = [...withoutData].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            idsToDelete.push(...sorted.slice(1).map(p => p.id));
        }
    }

    if (idsToDelete.length > 0) {
        await prisma.patient.deleteMany({
            where: { id: { in: idsToDelete }, tenant_id: tenantId },
        });
    }

    revalidatePath("/dashboard");
    return idsToDelete.length;
}
