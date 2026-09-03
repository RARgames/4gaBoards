const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

// Reverses encryptSecret. A value that will not decrypt is treated as unreadable rather than
// fatal so the caller can mark the owning record broken and prompt for a reconnect: that is what
// a rotated SECRET_ENCRYPTION_KEY looks like from here, and it is not a crash-worthy condition.
module.exports = {
  sync: true,

  inputs: {
    value: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    encryptionKeyMissing: {},
    undecryptable: {},
  },

  fn(inputs) {
    const key = sails.config.custom.secretEncryptionKey;

    if (!key) {
      throw 'encryptionKeyMissing';
    }

    const [version, iv, authTag, ciphertext] = inputs.value.split(':');

    if (version !== VERSION || !iv || !authTag || !ciphertext) {
      throw 'undecryptable';
    }

    try {
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));

      return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
    } catch {
      throw 'undecryptable';
    }
  },
};
