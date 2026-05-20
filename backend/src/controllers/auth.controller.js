import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';

export async function register(req, res) {
  const { fullName, university, studentId, email, password } = req.body;

  if (!fullName || !university || !studentId || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, university, studentId, email, passwordHash });

  res.status(201).json({ user: user.toSafeObject(), token: signToken(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ user: user.toSafeObject(), token: signToken(user) });
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
