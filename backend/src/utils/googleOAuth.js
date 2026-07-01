import { OAuth2Client } from 'google-auth-library';

let oauthClient;

function getGoogleOAuthClient() {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  return oauthClient;
}

export function getGoogleAuthUrl(state) {
  const client = getGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
}

export async function exchangeGoogleCode(code) {
  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(String(code));

  if (!tokens.id_token) {
    throw new Error('Google did not return an ID token');
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Unable to read Google profile');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    emailVerified: Boolean(payload.email_verified),
  };
}

export function getFrontendUrl() {
  return process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
}
