import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { deleteUserRelatedData } from '../utils/paperCleanup.js';
import { syncUserPoints } from '../utils/points.js';
import { normalizeText, validateFullName, validateUniversity } from '../utils/validation.js';
import { validatePasswordStrength } from '../utils/passwordStrength.js';
import { sendOTPEmail } from '../utils/email.js';

function isPresent(value) {
  return value !== undefined && value !== null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export async function register(req, res) {
  const { fullName, university, email, password, confirmPassword } = req.body;

  if (!fullName || !university || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const fullNameError = validateFullName(fullName);
  if (fullNameError) {
    return res.status(400).json({ message: fullNameError });
  }

  const universityError = validateUniversity(university);
  if (universityError) {
    return res.status(400).json({ message: universityError });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const passwordStrengthError = validatePasswordStrength(password);
  if (passwordStrengthError) {
    return res.status(400).json({ message: passwordStrengthError });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (existingUser) {
    if (existingUser.status === 'pending') {
      // Allow re-registering / updating details for unverified accounts (pending)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const passwordHash = await bcrypt.hash(password, 10);

      existingUser.fullName = normalizeText(fullName);
      existingUser.university = normalizeText(university);
      existingUser.passwordHash = passwordHash;
      existingUser.otpCode = otpCode;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      console.log(`[OTP Register - Retry] Email: ${existingUser.email} | OTP: ${otpCode}`);

      try {
        await sendOTPEmail(existingUser.email, otpCode, 'register');
        return res.status(201).json({ message: 'Please check your email to get the OTP code for account verification.' });
      } catch (error) {
        console.error('Error sending email:', error);
        return res.status(201).json({ 
          message: 'Registration successful but failed to send email. Please check the server console for the OTP code to verify.',
          isEmailFailed: true 
        });
      }
    }
    return res.status(409).json({ message: 'Email already exists' });
  }

  // Generate random 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    fullName: normalizeText(fullName),
    university: normalizeText(university),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    otpCode,
    otpExpires,
    status: 'pending' // Pending activation status
  });

  console.log(`[OTP Register] Email: ${user.email} | OTP: ${otpCode}`);

  try {
    // Send email containing OTP code
    await sendOTPEmail(user.email, otpCode, 'register');
    res.status(201).json({ message: 'Please check your email to get the OTP code for account verification.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(201).json({ 
      message: 'Registration successful but failed to send email. Please check the server console for the OTP code to verify.',
      isEmailFailed: true 
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
  }

  if (!(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Kiểm tra trạng thái xác thực OTP
  if (user.status === 'pending') {
    return res.status(403).json({ message: 'Your account has not been verified. Please check your OTP email.' });
  }

  // Kiểm tra trạng thái khóa tài khoản
  if (user.status === 'banned') {
    return res.status(403).json({ message: 'Your account has been banned' });
  }

  res.json({ user: user.toSafeObject(), token: signToken(user) });
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

export async function updateMe(req, res) {
  const updates = {};

  if (isPresent(req.body.fullName)) updates.fullName = String(req.body.fullName).trim();
  if (isPresent(req.body.university)) updates.university = String(req.body.university).trim();

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  if (updates.fullName !== undefined && !updates.fullName) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  if (updates.fullName !== undefined) {
    const fullNameError = validateFullName(updates.fullName);
    if (fullNameError) {
      return res.status(400).json({ message: fullNameError });
    }
    updates.fullName = normalizeText(updates.fullName);
  }

  if (updates.university !== undefined && !updates.university) {
    return res.status(400).json({ message: 'University is required' });
  }

  if (updates.university !== undefined) {
    const universityError = validateUniversity(updates.university);
    if (universityError) {
      return res.status(400).json({ message: universityError });
    }
    updates.university = normalizeText(updates.university);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ user: user.toSafeObject() });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  }

  const passwordStrengthError = validatePasswordStrength(newPassword, 'New password');
  if (passwordStrengthError) {
    return res.status(400).json({ message: passwordStrengthError });
  }

  if (isPresent(confirmPassword) && newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ message: 'Invalid access token' });
  }

  if (!user.passwordHash) {
    return res.status(400).json({ message: 'Password change is not available for Google sign-in accounts' });
  }

  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid current password' });
  }

  if (await user.comparePassword(newPassword)) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  await user.save();

  res.json({ message: 'Password updated', token: signToken(user) });
}

export async function deleteMe(req, res) {
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ message: 'password is required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ message: 'Invalid access token' });
  }

  if (user.passwordHash) {
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid password' });
    }
  } else if (!user.googleId) {
    return res.status(400).json({ message: 'password is required' });
  }

  const affectedUserIds = await deleteUserRelatedData(user._id);
  await User.findByIdAndDelete(user._id);
  await Promise.all(affectedUserIds.map((userId) => syncUserPoints(userId)));

  res.json({ message: 'Account deleted' });
}

// Verify registration OTP
export async function verifyRegisterOTP(req, res) {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  
  if (!user || user.status !== 'pending') return res.status(400).json({ message: 'Invalid or already activated account.' });
  if (user.otpCode !== String(otp) || user.otpExpires < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP.' });

  user.status = 'active';
  user.emailVerified = true;
  user.otpCode = null;
  user.otpExpires = null;
  await user.save();

  res.json({ message: 'Verification successful', user: user.toSafeObject(), token: signToken(user) });
}

// Forgot Password - Send OTP code
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  
  if (!user) return res.status(404).json({ message: 'Email does not exist.' });
  if (user.status === 'banned') return res.status(403).json({ message: 'Account is banned.' });
  if (!user.passwordHash) {
    return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otpCode;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  console.log(`[OTP Forgot Password] Email: ${user.email} | OTP: ${otpCode}`);

  try {
    await sendOTPEmail(user.email, otpCode, 'forgot');
    res.json({ message: 'A password recovery code has been sent to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.json({ 
      message: 'Request successful but failed to send email. Please check the server console for the OTP code to verify.',
      isEmailFailed: true 
    });
  }
}

// Reset password using OTP
export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  
  if (!user) return res.status(404).json({ message: 'Account does not exist.' });
  if (user.otpCode !== String(otp) || user.otpExpires < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP.' });

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  user.otpCode = null;
  user.otpExpires = null;
  if (user.status === 'pending') user.status = 'active';
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
}