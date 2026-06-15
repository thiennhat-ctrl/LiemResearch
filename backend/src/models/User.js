import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['pending', 'active', 'banned'], default: 'pending' },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    penaltyPoints: { type: Number, default: 0, min: 0 },
    emailVerificationToken: {
      type: String,
      default: null,
      index: true
    },
    emailVerificationExpires: {
      type: Date,
      default: null
    },
    otpCode: {
      type: String,
      default: null
    },
    otpExpires: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.otpCode;
  delete user.otpExpires;
  return user;
};

export const User = mongoose.model('User', userSchema);
