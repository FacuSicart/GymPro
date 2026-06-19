import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const requiredEnv = {
  email: process.env.FIRST_ADMIN_EMAIL,
  password: process.env.FIRST_ADMIN_PASSWORD,
  firstName: process.env.FIRST_ADMIN_FIRST_NAME,
  lastName: process.env.FIRST_ADMIN_LAST_NAME,
  tenantName: process.env.FIRST_ADMIN_TENANT_NAME,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    throw new Error(`${key} is required to seed the first admin.`);
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString('base64url')}`;
}

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash: await hashPassword(requiredEnv.password!),
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`Admin already exists: ${existingAdmin.email}`);
    return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: requiredEnv.tenantName!,
    },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: requiredEnv.email!.toLowerCase(),
      passwordHash: await hashPassword(requiredEnv.password!),
      firstName: requiredEnv.firstName!,
      lastName: requiredEnv.lastName!,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      approvedAt: new Date(),
    },
  });

  console.log(`Created first admin: ${admin.email}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
