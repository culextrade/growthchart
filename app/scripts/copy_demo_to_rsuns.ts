import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data copy from demo to rsuns...');

    const demoUser = await prisma.user.findUnique({ where: { username: 'demo' } });
    const rsunsUser = await prisma.user.findUnique({ where: { username: 'rsuns' } });

    if (!demoUser || !rsunsUser) {
        console.error('Could not find either demo or rsuns user');
        return;
    }

    console.log(`Demo User ID: ${demoUser.id}, Tenant ID: ${demoUser.tenant_id}`);
    console.log(`Rsuns User ID: ${rsunsUser.id}, Tenant ID: ${rsunsUser.tenant_id}`);

    // Get all patients for demo
    const patients = await prisma.patient.findMany({
        where: { userId: demoUser.id },
        include: { measurements: true }
    });

    console.log(`Found ${patients.length} patients in demo account.`);

    let copiedPatients = 0;
    let copiedMeasurements = 0;

    for (const patient of patients) {
        // Create new patient for rsuns
        const newPatient = await prisma.patient.create({
            data: {
                name: patient.name,
                dob: patient.dob,
                gender: patient.gender,
                parentName: patient.parentName,
                userId: rsunsUser.id,
                tenant_id: rsunsUser.tenant_id,
                createdAt: patient.createdAt,
                updatedAt: patient.updatedAt
            }
        });

        copiedPatients++;

        // Copy measurements
        for (const measurement of patient.measurements) {
            await prisma.measurement.create({
                data: {
                    date: measurement.date,
                    weight: measurement.weight,
                    height: measurement.height,
                    headCircumference: measurement.headCircumference,
                    patientId: newPatient.id,
                    tenant_id: rsunsUser.tenant_id,
                    createdAt: measurement.createdAt,
                    updatedAt: measurement.updatedAt
                }
            });
            copiedMeasurements++;
        }
    }

    console.log(`\nCopy Complete!`);
    console.log(`Copied ${copiedPatients} patients.`);
    console.log(`Copied ${copiedMeasurements} measurements.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
