const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12;

// Encrypts a value for storage at rest, for secrets the server must be able to read back later
// (OAuth refresh tokens, for example) rather than merely compare — so hashing is not an option.
// The output is self-describing, `v1:<iv>:<authTag>:<ciphertext>` in base64, so the format can be
// migrated later without guessing at what an existing row holds.
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
  },

  fn(inputs) {
    const key = sails.config.custom.secretEncryptionKey;

    if (!key) {
      throw 'encryptionKeyMissing';
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(inputs.value, 'utf8'), cipher.final()]);

    return [VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), ciphertext.toString('base64')].join(':');
  },
};
