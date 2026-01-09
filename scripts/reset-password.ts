#!/usr/bin/env bun

/**
 * Script to reset a user's password
 * Usage: bun scripts/reset-password.ts <email> <new-password>
 */

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Error: Email and new password are required');
    console.log('Usage: bun scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters');
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
      },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Success! Password reset for user "${user.name || email}" (${email})`);
    console.log(`\nYou can now log in with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
