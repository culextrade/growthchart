import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    const patients = await prisma.patient.findMany();
    const measurements = await prisma.measurement.findMany();

    const data = { users, patients, measurements };
    writeFileSync('scripts/db-dump.json', JSON.stringify(data, null, 2));

    console.log('Users: ' + users.length);
    console.log('Patients: ' + patients.length);
    console.log('Measurements: ' + measurements.length);
    console.log('Data saved to scripts/db-dump.json');
}

main()
    .then(() => prisma['$disconnect']())
    .catch((e) => { console.error(e); process.exit(1); });
