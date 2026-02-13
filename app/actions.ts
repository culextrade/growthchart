"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getPatients() {
    return await prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { measurements: true } } }
    });
}

export async function getPatient(id: string) {
    return await prisma.patient.findUnique({
        where: { id },
        include: {
            measurements: {
                orderBy: { date: "asc" }
            }
        },
    });
}

export async function createPatient(formData: FormData) {
    const name = formData.get("name") as string;
    const dob = new Date(formData.get("dob") as string);
    const gender = formData.get("gender") as string;
    const parentName = formData.get("parentName") as string;

    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "demo@example.com",
                password: "demo",
                name: "Dr. Demo",
            }
        });
    }

    await prisma.patient.create({
        data: {
            name,
            dob,
            gender,
            parentName,
            userId: user.id,
            tenant_id: user.tenant_id
        },
    });

    revalidatePath("/dashboard");
}

export async function addMeasurement(patientId: string, formData: FormData) {
    const weightVal = formData.get("weight");
    const heightVal = formData.get("height");

    const weight = weightVal ? parseFloat(weightVal as string) : null;
    const height = heightVal ? parseFloat(heightVal as string) : null;

    const date = new Date(formData.get("date") as string || new Date().toISOString());

    // Get tenant_id from patient
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { tenant_id: true }
    });

    if (!patient) throw new Error("Patient not found");

    await prisma.measurement.create({
        data: {
            patientId,
            weight,
            height,
            date,
            tenant_id: patient.tenant_id
        }
    });


    revalidatePath(`/patients/${patientId}`);
}
