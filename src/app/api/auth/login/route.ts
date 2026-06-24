import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { seed, hashPassword, verifyPassword } from '@/lib/seed';
import { generateToken, AuthError } from '@/lib/auth';
import User from '@/lib/models/User';
import InvitationCode from '@/lib/models/InvitationCode';
import Trade from '@/lib/models/Trade';

let seeded = false;
async function ensureReady() {
  if (seeded) return;
  await connectDB();
  try {
    const c = await User.countDocuments();
    if (c > 0) { seeded = true; return; }
  } catch { /* collection might not exist */ }
  await seed();
  seeded = true;
}

export async function POST(req: NextRequest) {
  try {
    await ensureReady();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    if (user.status === 'banned') return NextResponse.json({ success: false, message: 'Account banned' }, { status: 403 });
    if (user.status === 'suspended') return NextResponse.json({ success: false, message: 'Account suspended' }, { status: 403 });
    if (!verifyPassword(password, user.password)) return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });

    const token = generateToken({ userId: String(user._id), email: user.email, role: user.role });

    let invitationCode = null;
    if (user.role === 'sub_agent') {
      const code = await InvitationCode.findOne({ ownerId: user._id, isActive: true });
      invitationCode = code?.code || null;
    }

    const activeTrades = await Trade.countDocuments({ userId: user._id, status: { $in: ['pending', 'running'] } });
    const completedTrades = await Trade.countDocuments({ userId: user._id, status: { $in: ['won', 'lost'] } });

    return NextResponse.json({
      success: true, token,
      user: {
        id: String(user._id), uid: user.uid, username: user.username, email: user.email,
        phone: user.phone || '', country: user.country || '', avatar: user.avatar,
        role: user.role, balance: user.balance, frozenBalance: user.frozenBalance,
        bonusBalance: user.bonusBalance, totalProfit: user.totalProfit,
        todayProfit: 0, todayLoss: 0, activeTrades, completedTrades,
        referralCode: user.referralCode, twoFactor: user.twoFactor,
        emailVerified: user.emailVerified, mustChangePass: user.mustChangePass,
        subAgentId: user.subAgentId ? String(user.subAgentId) : null,
        invitationCode, userInvitationCode: user.invitationCode || null,
      },
      message: user.mustChangePass ? 'Please change your default password' : 'Login successful',
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    const msg = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}