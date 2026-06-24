import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import InvitationCode from '@/lib/models/InvitationCode';

const BCRYPT_ROUNDS = 10;
export function hashPassword(p: string) { return bcrypt.hashSync(p, BCRYPT_ROUNDS); }
export function verifyPassword(p: string, h: string) { return bcrypt.compareSync(p, h); }

function genUID() { return `UID-${Math.floor(100000 + Math.random() * 900000)}`; }
function genReferral() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = 'NX';
  for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}

export async function seed() {
  console.log('Seeding database...');
  const existing = await User.findOne({ email: 'crdbixx@gmail.com' });
  if (existing) { console.log('Already seeded'); return { success: true, message: 'Already seeded' }; }

  const superAdmin = await User.create({
    uid: genUID(), username: 'Super Admin', email: 'crdbixx@gmail.com',
    password: hashPassword('123playbeat'), role: 'super_admin', status: 'active',
    emailVerified: true, mustChangePass: false, referralCode: genReferral(),
  });
  console.log('Super Admin created');

  const agents = [
    { name: 'SubAgent 1', email: 'subagent1@trade.com', password: 'default', code: 'PB-AG001' },
    { name: 'SubAgent 2', email: 'subagent2@trade2.com', password: 'default', code: 'PB-AG002' },
    { name: 'SubAgent 3', email: 'subagent3@trade3.com', password: 'default', code: 'PB-AG003' },
    { name: 'SubAgent 4', email: 'subagent4@trade4.com', password: 'default', code: 'PB-AG004' },
    { name: 'SubAgent 5', email: 'subagent5@trade5.com', password: 'default', code: 'PB-AG005' },
  ];

  for (const a of agents) {
    const user = await User.create({
      uid: genUID(), username: a.name, email: a.email,
      password: hashPassword(a.password), role: 'sub_agent', status: 'active',
      emailVerified: true, mustChangePass: true, referralCode: genReferral(),
    });
    await InvitationCode.create({ code: a.code, ownerId: user._id, isActive: true });
    console.log(`Agent ${a.code} created`);
  }

  console.log('Seed complete!');
  return { success: true, message: 'Database seeded successfully' };
}