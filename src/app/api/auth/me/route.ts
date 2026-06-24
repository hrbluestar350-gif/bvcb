import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import User from '@/lib/models/User';
import Trade from '@/lib/models/Trade';

export async function GET(req: Request) {
  try {
    const payload = requireAuth(req);
    await connectDB();
    const user = await User.findById(payload.userId).select('-password -twoFactorSecret');
    if (!user) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    const activeTrades = await Trade.countDocuments({ userId: user._id, status: { $in: ['pending', 'running'] } });
    const completedTrades = await Trade.countDocuments({ userId: user._id, status: { $in: ['won', 'lost'] } });
    return NextResponse.json({ success: true, user: { ...user.toObject(), activeTrades, completedTrades } });
  } catch { return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }); }
}