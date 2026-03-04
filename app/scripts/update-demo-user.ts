import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const updated = await prisma.user.update({
        where: { id: 'cmlyws8se00005b3s17hg91r4' },
        data: {
            username: 'demo',
            password: hashedPassword,
        },
        select: { id: true, username: true, email: true, name: true, role: true }
    });

    console.log('User updated successfully:');
    console.log(JSON.stringify(updated, null, 2));
}

main()
    .then(() => prisma['$disconnect']())
    .catch((e) => { console.error(e); process.exit(1); });
