import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { apiLogger } from '@/lib/logger';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Get the user to get their ID and current avatar
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, avatar: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete old avatar from Vercel Blob if it exists
    if (user.avatar && user.avatar.includes('blob.vercel-storage.com')) {
      try {
        await del(user.avatar);
      } catch {
        // Ignore deletion errors for old avatars
      }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/avatar-${user.id}-${Date.now()}.${fileExt}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    // Update user's avatar in database
    await prisma.users.update({
      where: { id: user.id },
      data: { avatar: blob.url },
    });

    apiLogger.info({ userId: user.id, avatarUrl: blob.url }, 'Avatar uploaded successfully');

    return NextResponse.json({ avatarUrl: blob.url });
  } catch (error) {
    apiLogger.error({ error }, 'Avatar upload failed');
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current avatar URL
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      select: { id: true, avatar: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from Vercel Blob if it exists
    if (user.avatar && user.avatar.includes('blob.vercel-storage.com')) {
      try {
        await del(user.avatar);
      } catch {
        // Ignore deletion errors
      }
    }

    // Update user's avatar to empty
    await prisma.users.update({
      where: { id: user.id },
      data: { avatar: null },
    });

    apiLogger.info({ userId: user.id }, 'Avatar removed');

    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.error({ error }, 'Avatar deletion failed');
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
  }
}
