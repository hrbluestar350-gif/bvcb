import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { seed } from '@/lib/seed';

export async function POST() {
  try { await connectDB(); const r = await seed(); return NextResponse.json(r); }
  catch (e: unknown) { const m = e instanceof Error ? e.message : 'Seed failed'; return NextResponse.json({ success: false, message: m }, { status: 500 }); }
}
export async function GET() {
  try {
    await connectDB();
    const User = (await import('@/lib/models/User')).default;
    const InvitationCode = (await import('@/lib/models/InvitationCode')).default;
    return NextResponse.json({ users: await User.countDocuments(), codes: await InvitationCode.countDocuments() });
  } catch { return NextResponse.json({ users: 0, codes: 0 }); }
}