import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateMeasurements(patientId: string, tenantId: string, dob: Date, months: number, isBoy: boolean) {
    const measurements = [];
    let currentHeight = 50; // cm
    let currentWeight = 3.3; // kg

    for (let m = 0; m <= months; m += 3) {
        const date = new Date(dob);
        date.setMonth(date.getMonth() + m);

        // Simple growth curve simulation
        if (m <= 12) {
            currentHeight += 2.1;
            currentWeight += 0.6;
        } else if (m <= 36) {
            currentHeight += 0.8;
            currentWeight += 0.2;
        } else {
            currentHeight += 0.5;
            currentWeight += 0.15;
        }

        // Add some random variation (abnormal/normal mix)
        const variationH = (Math.random() * 2) - 1;
        const variationW = (Math.random() * 1) - 0.5;

        measurements.push({
            patientId,
            tenant_id: tenantId,
            date,
            height: parseFloat((currentHeight + variationH).toFixed(1)),
            weight: parseFloat((currentWeight + variationW).toFixed(1)),
        });
    }
    return measurements;
}

async function main() {
    // Ensure we have a user
    const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: {
            email: "demo@example.com",
            password: "demo",
            name: "Dr. Demo",
        },
    });

    console.log("Clearing old dummy data...");
    await prisma.patient.deleteMany();

    const today = new Date();

    // 3 Years Old = 36 months
    const dob3Years = new Date(today);
    dob3Years.setFullYear(today.getFullYear() - 3);

    // 7 Years Old = 84 months
    const dob7Years = new Date(today);
    dob7Years.setFullYear(today.getFullYear() - 7);

    console.log("Creating 4 new dummy patients...");

    // 1. Boy - 3 Years
    const boy3 = await prisma.patient.create({
        data: {
            name: "Bima (3 Thn)",
            dob: dob3Years,
            gender: "male",
            parentName: "Ayah Bima",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    // 2. Boy - 7 Years
    const boy7 = await prisma.patient.create({
        data: {
            name: "Arya (7 Thn)",
            dob: dob7Years,
            gender: "male",
            parentName: "Ayah Arya",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    // 3. Girl - 3 Years
    const girl3 = await prisma.patient.create({
        data: {
            name: "Cinta (3 Thn)",
            dob: dob3Years,
            gender: "female",
            parentName: "Ibu Cinta",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    // 4. Girl - 7 Years
    const girl7 = await prisma.patient.create({
        data: {
            name: "Dian (7 Thn)",
            dob: dob7Years,
            gender: "female",
            parentName: "Ibu Dian",
            userId: user.id,
            tenant_id: user.tenant_id,
        },
    });

    console.log("Generating 3-monthly measurements...");

    const m1 = generateMeasurements(boy3.id, user.tenant_id, dob3Years, 36, true);
    const m2 = generateMeasurements(boy7.id, user.tenant_id, dob7Years, 84, true);
    const m3 = generateMeasurements(girl3.id, user.tenant_id, dob3Years, 36, false);
    const m4 = generateMeasurements(girl7.id, user.tenant_id, dob7Years, 84, false);

    await prisma.measurement.createMany({ data: [...m1, ...m2, ...m3, ...m4] });

    console.log("Seed data created successfully with 3-monthly data points!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
