#!/usr/bin/env bun

/**
 * Script to make a user an admin
 * Usage: bun scripts/make-admin.ts <email>
 */

import { prisma } from '../src/lib/prisma';

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Email address is required');
    console.log('Usage: bun scripts/make-admin.ts <email>');
    process.exit(1);
  }

  try {
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`ℹ️  User "${user.name || email}" is already an admin`);
      process.exit(0);
    }

    // Make user admin
    await prisma.users.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log(`✅ Success! User "${user.name || email}" (${email}) is now an admin`);
    console.log(`\nThey can now access the admin dashboard at: /admin/logins`);
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
