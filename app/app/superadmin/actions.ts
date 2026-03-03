"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getHospitalAccounts() {
    return await prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            username: true,
            name: true,
            isLocked: true,
            createdAt: true,
        }
    });
}

export async function createHospitalAccount(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!username || !password || !name) {
        throw new Error("Missing required fields");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                role: "USER"
            }
        });
        revalidatePath("/superadmin");
    } catch (e: any) {
        if (e.code === "P2002") {
            throw new Error("Username sudah terdaftar");
        }
        throw new Error("Gagal membuat akun");
    }
}

export async function updateHospitalPassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
        throw new Error("Password minimal 6 karakter");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        revalidatePath("/superadmin");
    } catch {
        throw new Error("Gagal memperbarui password");
    }
}

export async function updateHospitalInfo(id: string, name: string, username: string) {
    if (!name || !username) {
        throw new Error("Nama dan Username tidak boleh kosong");
    }

    try {
        await prisma.user.update({
            where: { id },
            data: { name, username }
        });
        revalidatePath("/superadmin");
    } catch (e: any) {
        if (e.code === "P2002") {
            throw new Error("Username sudah terpakai");
        }
        throw new Error("Gagal memperbarui informasi faskes");
    }
}

export async function toggleLockAccount(id: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id }, select: { isLocked: true } });
        if (!user) throw new Error("User tidak ditemukan");

        await prisma.user.update({
            where: { id },
            data: { isLocked: !user.isLocked }
        });
        revalidatePath("/superadmin");
    } catch {
        throw new Error("Gagal mengubah status akun");
    }
}

export async function deleteHospitalAccount(id: string) {
    try {
        // Delete related measurements first, then patients, then user
        const patients = await prisma.patient.findMany({
            where: { userId: id },
            select: { id: true }
        });

        if (patients.length > 0) {
            await prisma.measurement.deleteMany({
                where: { patientId: { in: patients.map(p => p.id) } }
            });
            await prisma.patient.deleteMany({
                where: { userId: id }
            });
        }

        await prisma.user.delete({
            where: { id }
        });
        revalidatePath("/superadmin");
    } catch {
        throw new Error("Gagal menghapus akun");
    }
}

export async function changeSelfPassword(currentPassword: string, newPassword: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    if (!newPassword || newPassword.length < 6) {
        throw new Error("Password baru minimal 6 karakter");
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User tidak ditemukan");

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error("Password lama salah");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    revalidatePath("/superadmin");
    revalidatePath("/dashboard");
}
