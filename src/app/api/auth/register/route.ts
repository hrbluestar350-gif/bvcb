import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { seed, hashPassword } from '@/lib/seed';
import User from '@/lib/models/User';
import InvitationCode from '@/lib/models/InvitationCode';

let seeded = false;
async function ensureReady() {
  if (seeded) return;
  await connectDB();
  try { if (await User.countDocuments() > 0) { seeded = true; return; } } catch {}
  await seed(); seeded = true;
}

export async function POST(req: NextRequest) {
  try {
    await ensureReady();
    const { username, email, password, invitationCode, phone, country } = await req.json();
    if (!username || !email || !password || !invitationCode)
      return NextResponse.json({ success: false, message: 'All fields required: username, email, password, invitation code' }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });

    if (await User.findOne({ email: email.toLowerCase() }))
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
    if (await User.findOne({ username }))
      return NextResponse.json({ success: false, message: 'Username already taken' }, { status: 400 });

    const code = await InvitationCode.findOne({ code: invitationCode.toUpperCase(), isActive: true }).populate('ownerId');
    if (!code) return NextResponse.json({ success: false, message: 'Invalid or inactive invitation code' }, { status: 400 });
    const owner = await User.findById(code.ownerId);
    if (!owner || owner.role !== 'sub_agent')
      return NextResponse.json({ success: false, message: 'Invalid invitation code' }, { status: 400 });

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = 'NX'; for (let i = 0; i < 6; i++) referralCode += chars[Math.floor(Math.random() * chars.length)];

    const user = await User.create({
      uid: `UID-${Math.floor(100000 + Math.random() * 900000)}`,
      username, email: email.toLowerCase(), password: hashPassword(password),
      phone: phone || null, country: country || null, role: 'user', status: 'active',
      emailVerified: false, mustChangePass: false, referralCode,
      subAgentId: code.ownerId, invitationCode: code.code, balance: 0,
    });

    return NextResponse.json({ success: true, message: 'Registration successful! Please login.', user: { id: String(user._id), uid: user.uid, username: user.username, email: user.email, role: user.role, subAgentId: String(user.subAgentId), invitationCode: user.invitationCode } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    console.error('Register error:', error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}