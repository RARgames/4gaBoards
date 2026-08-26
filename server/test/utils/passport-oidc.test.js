const crypto = require('crypto');
const { expect } = require('chai');

const OIDCStrategy = require('../../strategies/passport-oidc');

const STATE_SECRET = 'state-secret';
const OPTIONS = {
  authorizationURL: 'https://issuer.example/authorize',
  tokenURL: 'https://issuer.example/token',
  userInfoURL: 'https://issuer.example/userinfo',
  clientID: 'client-id',
  callbackURL: 'https://boards.example/auth/oidc/callback',
};

function createStrategy(pkceEnabled) {
  const strategy = new OIDCStrategy({ ...OPTIONS, pkceEnabled }, () => {});
  strategy.redirect = (url) => url;
  return strategy;
}

async function decryptState(state) {
  const { jwtDecrypt } = await import('jose');
  const key = crypto.createHash('sha256').update(STATE_SECRET).digest();
  return jwtDecrypt(state, key);
}

describe('OIDCStrategy', () => {
  const previousStateSecret = process.env.OIDC_STATE_SECRET;

  before(() => {
    process.env.OIDC_STATE_SECRET = STATE_SECRET;
  });

  after(() => {
    if (previousStateSecret === undefined) {
      delete process.env.OIDC_STATE_SECRET;
    } else {
      process.env.OIDC_STATE_SECRET = previousStateSecret;
    }
  });

  it('uses an encrypted state in the default flow', async () => {
    const url = await createStrategy(false).startAuth({ query: {} });
    const params = new URL(url).searchParams;

    expect(params.get('state').split('.')).to.have.length(5);
    expect(params.has('code_challenge')).to.be.false;
    expect((await decryptState(params.get('state'))).payload.codeVerifier).to.be.undefined;
  });

  it('adds an S256 code challenge and puts its verifier in the encrypted state', async () => {
    const url = await createStrategy(true).startAuth({ query: {} });
    const params = new URL(url).searchParams;
    const { payload } = await decryptState(params.get('state'));
    const codeChallenge = crypto.createHash('sha256').update(payload.codeVerifier).digest('base64url');

    expect(params.get('code_challenge_method')).to.equal('S256');
    expect(params.get('code_challenge')).to.equal(codeChallenge);
  });
});
