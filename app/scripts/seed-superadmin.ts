const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const existingSuperadmin = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' }
    });

    if (existingSuperadmin) {
        console.log("Superadmin already exists:", existingSuperadmin.username);
        return;
    }

    const hashedPassword = await bcrypt.hash('sehaadmin2026', 10);

    const superadmin = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            name: 'Super System Administrator',
            role: 'SUPERADMIN'
        }
    });

    console.log("Superadmin created successfully!");
    console.log("Username: admin");
    console.log("Password: sehaadmin2026");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
