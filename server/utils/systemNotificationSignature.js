const crypto = require('crypto');

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

function verifySignature({ publicKey, signature, timestamp, signatureAlgorithm, rawBody }) {
  if (!publicKey || !signature || !timestamp || !signatureAlgorithm || !rawBody || signatureAlgorithm?.toLowerCase() !== 'ed25519') {
    return false;
  }

  try {
    if (Math.abs(Date.now() - timestamp) > MAX_SIGNATURE_AGE_MS) {
      return false;
    }

    const message = Buffer.from(`${timestamp}.${rawBody}`, 'utf8');
    return crypto.verify(null, message, publicKey, Buffer.from(String(signature).trim(), 'base64'));
  } catch (err) {
    sails.log.error('Signature verification error:', err);
    return false;
  }
}

function createSignature({ privateKey, timestamp, rawBody }) {
  if (!privateKey || !timestamp || !rawBody) {
    return null;
  }

  try {
    return crypto.sign(null, Buffer.from(`${timestamp}.${rawBody}`), privateKey).toString('base64');
  } catch {
    return null;
  }
}

module.exports = {
  createSignature,
  verifySignature,
};
