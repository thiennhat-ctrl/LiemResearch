import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { createOAuthState, verifyOAuthState } from '../utils/oauthState.js';
import { exchangeGoogleCode, getFrontendUrl, getGoogleAuthUrl } from '../utils/googleOAuth.js';

function redirectWithError(res, message) {
  const frontendUrl = getFrontendUrl();
  const params = new URLSearchParams({ error: message });
  return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
}

function redirectWithSuccess(res, token) {
  const frontendUrl = getFrontendUrl();
  const params = new URLSearchParams({ token });
  return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
}

async function findOrCreateGoogleUser(profile) {
  const email = String(profile.email || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Google account does not include an email address');
  }

  if (!profile.googleId) {
    throw new Error('Google account does not include a user id');
  }

  let user = await User.findOne({ googleId: profile.googleId });
  if (user) {
    if (user.status === 'banned') {
      throw new Error('Your account has been banned');
    }

    if (profile.picture && user.avatar !== profile.picture) {
      user.avatar = profile.picture;
      await user.save();
    }

    return user;
  }

  user = await User.findOne({ email });
  if (user) {
    if (user.status === 'banned') {
      throw new Error('Your account has been banned');
    }

    if (user.googleId && user.googleId !== profile.googleId) {
      throw new Error('This email is already linked to a different Google account');
    }

    user.googleId = profile.googleId;

    if (!user.passwordHash) {
      user.provider = 'google';
    }

    if (profile.picture && !user.avatar) {
      user.avatar = profile.picture;
    }

    if (profile.emailVerified) {
      user.emailVerified = true;
    }

    if (user.status === 'pending' && profile.emailVerified) {
      user.status = 'active';
      user.otpCode = null;
      user.otpExpires = null;
    }

    await user.save();
    return user;
  }

  user = await User.create({
    fullName: profile.name || email.split('@')[0],
    university: 'Not specified',
    email,
    provider: 'google',
    googleId: profile.googleId,
    avatar: profile.picture || null,
    emailVerified: profile.emailVerified,
    status: profile.emailVerified ? 'active' : 'pending',
  });

  return user;
}

export function startGoogleAuth(req, res) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return res.status(503).json({ message: 'Google sign-in is not configured' });
  }

  const state = createOAuthState();
  const authUrl = getGoogleAuthUrl(state);
  return res.redirect(authUrl);
}

export async function googleAuthCallback(req, res) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
      return redirectWithError(res, 'Google sign-in is not configured');
    }

    const { code, state, error } = req.query;

    if (error) {
      return redirectWithError(res, 'Google sign-in was cancelled');
    }

    if (!code) {
      return redirectWithError(res, 'Missing authorization code from Google');
    }

    if (!verifyOAuthState(state)) {
      return redirectWithError(res, 'Invalid OAuth state. Please try again.');
    }

    const profile = await exchangeGoogleCode(code);
    const user = await findOrCreateGoogleUser(profile);

    if (user.status === 'pending') {
      return redirectWithError(res, 'Your account has not been verified. Please contact support.');
    }

    const token = signToken(user);
    return redirectWithSuccess(res, token);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return redirectWithError(res, err.message || 'Google sign-in failed');
  }
}
