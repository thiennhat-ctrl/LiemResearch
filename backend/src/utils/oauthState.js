import crypto from 'crypto';

function getStateSecret() {
  return process.env.JWT_SECRET || 'liemresearch_local_secret';
}

export function createOAuthState() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', getStateSecret())
    .update(nonce)
    .digest('hex');

  return `${nonce}.${signature}`;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== 'string') {
    return false;
  }

  const [nonce, signature] = state.split('.');
  if (!nonce || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getStateSecret())
    .update(nonce)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
