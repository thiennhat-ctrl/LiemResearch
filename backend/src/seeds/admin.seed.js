import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';

dotenv.config();

await connectDb();

const adminEmail = 'admin@liemresearch.com';
const password = 'Admin123456';
const passwordHash = await bcrypt.hash(password, 10);

const admin = await User.findOneAndUpdate(
  { email: adminEmail },
  {
    fullName: 'LiemResearch Admin',
    university: 'FPT University',
    studentId: 'ADMIN001',
    email: adminEmail,
    passwordHash,
    role: 'admin',
  },
  { upsert: true, new: true }
);

console.log('\n' + '='.repeat(50));
console.log('✅ Admin account is ready!');
console.log('='.repeat(50));
console.log(`📧 Email:    ${admin.email}`);
console.log(`🔑 Password: ${password}`);
console.log('='.repeat(50) + '\n');

process.exit(0);