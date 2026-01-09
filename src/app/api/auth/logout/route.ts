import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use Auth.js signOut with redirect option
    await signOut({ redirectTo: '/login' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}
