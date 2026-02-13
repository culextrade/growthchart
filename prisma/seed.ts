import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Create demo user
    const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
            email: "demo@example.com",
            password: "demo",
            name: "Dr. Demo",
        },
    });

    // Create sample patients only if none exist
    const count = await prisma.patient.count();
    if (count > 0) {
        console.log("Seed data already exists, skipping.");
        return;
    }

    // Boy patient — ~2 years old
    const boy = await prisma.patient.create({
        data: {
            name: "Ahmad Rizki",
            dob: new Date("2024-01-15"),
            gender: "male",
            parentName: "Budi Santoso",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    // Girl patient — ~1 year old
    const girl = await prisma.patient.create({
        data: {
            name: "Siti Nurhaliza",
            dob: new Date("2025-02-01"),
            gender: "female",
            parentName: "Dewi Sartika",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    // Measurements for Ahmad (boy)
    await prisma.measurement.createMany({
        data: [
            { patientId: boy.id, date: new Date("2024-01-15"), weight: 3.3, height: 49.5, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2024-04-15"), weight: 6.2, height: 61.0, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2024-07-15"), weight: 7.8, height: 67.5, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2024-10-15"), weight: 9.1, height: 72.0, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2025-01-15"), weight: 10.2, height: 76.5, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2025-07-15"), weight: 11.8, height: 84.0, tenant_id: user.tenant_id },
            { patientId: boy.id, date: new Date("2026-01-15"), weight: 12.5, height: 87.0, tenant_id: user.tenant_id },
        ],
    });

    // Measurements for Siti (girl)
    await prisma.measurement.createMany({
        data: [
            { patientId: girl.id, date: new Date("2025-02-01"), weight: 3.1, height: 48.5, tenant_id: user.tenant_id },
            { patientId: girl.id, date: new Date("2025-05-01"), weight: 5.5, height: 59.0, tenant_id: user.tenant_id },
            { patientId: girl.id, date: new Date("2025-08-01"), weight: 7.2, height: 65.5, tenant_id: user.tenant_id },
            { patientId: girl.id, date: new Date("2025-11-01"), weight: 8.5, height: 71.0, tenant_id: user.tenant_id },
            { patientId: girl.id, date: new Date("2026-02-01"), weight: 9.5, height: 74.5, tenant_id: user.tenant_id },
        ],
    });

    console.log("Seed data created successfully!");
    console.log(`Created ${2} patients with measurements.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
