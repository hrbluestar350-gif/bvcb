import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/seed';
import { requireAuth, generateToken } from '@/lib/auth';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req);
    await connectDB();
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || newPassword.length < 6)
      return NextResponse.json({ success: false, message: 'Both passwords required (min 6 chars)' }, { status: 400 });

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    if (!verifyPassword(currentPassword, user.password))
      return NextResponse.json({ success: false, message: 'Current password incorrect' }, { status: 401 });

    user.password = hashPassword(newPassword);
    user.mustChangePass = false;
    await user.save();

    const token = generateToken({ userId: String(user._id), email: user.email, role: user.role });
    return NextResponse.json({ success: true, message: 'Password changed', token, user: { id: String(user._id), uid: user.uid, username: user.username, email: user.email, role: user.role, mustChangePass: false, referralCode: user.referralCode } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}