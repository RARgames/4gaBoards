const jwt = require('jsonwebtoken');
const lodash = require('lodash');
const assert = require('node:assert/strict');

const deleteAccessToken = require('../../api/controllers/access-tokens/delete');
const updatePassword = require('../../api/controllers/users/update-password');
const defineCurrentUserHook = require('../../api/hooks/current-user');
const { isBrowserRequest, setAccessTokenCookie } = require('../../utils/browser-session');
const { getPublicUrls, getRequestPublicUrl } = require('../../utils/public-urls');

describe('public URLs', () => {
  const urls = ['https://test.4gaboards.com', 'https://app.4gaboards.com/instance/test'];

  it('loads canonical and additional public URLs from the environment', () => {
    assert.deepEqual(getPublicUrls({ BASE_URL: urls[0], CLIENT_URLS: `${urls[1]};${urls[1]}` }), urls);
  });

  it('selects the public URL matching the forwarded host and prefix', () => {
    const req = {
      headers: {
        host: 'server.internal:1337',
        'x-forwarded-host': 'app.4gaboards.com',
        'x-forwarded-prefix': '/instance/test',
        'x-forwarded-proto': 'https',
      },
      protocol: 'http',
    };

    assert.equal(getRequestPublicUrl(req, urls, urls[0]), urls[1]);
    assert.equal(isBrowserRequest({ headers: { 'x-4gaboards-request': '1', origin: 'https://app.4gaboards.com' }, isSocket: true }, urls), true);
  });
});

describe('current-user API authentication', () => {
  const currentUser = { id: '1' };
  const sails = {
    config: { custom: { clientUrl: 'https://boards.example', publicUrls: ['https://boards.example'] } },
    helpers: { utils: { getUser: async (token) => (token === 'valid-token' ? currentUser : null) } },
    sockets: { join: () => {} },
  };
  const authenticate = defineCurrentUserHook(sails).routes.before['/api/*'].fn;

  it('authenticates a cookie request with the application request header', async () => {
    const request = { headers: { 'x-4gaBoards-Request': '1' }, cookies: { accessToken: 'valid-token' } };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, currentUser);
  });

  it('does not authenticate a cookie request without the application request header', async () => {
    const request = { headers: {}, cookies: { accessToken: 'valid-token' } };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, undefined);
  });

  it('does not authenticate cookie requests from an untrusted origin', async () => {
    const request = { headers: { 'x-4gaBoards-Request': '1', origin: 'https://evil.example' }, cookies: { accessToken: 'valid-token' }, isSocket: true };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, undefined);
  });

  it('authenticates cookie requests from the trusted socket origin', async () => {
    const request = { headers: { 'x-4gaBoards-Request': '1', origin: 'https://boards.example' }, cookies: { accessToken: 'valid-token' }, isSocket: true };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, currentUser);
  });

  it('does not authenticate socket cookie requests without an origin', async () => {
    const request = { headers: { 'x-4gaBoards-Request': '1' }, cookies: { accessToken: 'valid-token' }, isSocket: true };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, undefined);
  });

  it('continues to authenticate bearer tokens without a cookie', async () => {
    const request = { headers: { authorization: 'Bearer valid-token' } };

    await authenticate(request, {}, () => {});

    assert.equal(request.currentUser, currentUser);
  });
});

describe('browser session cookies', () => {
  it('sets an HttpOnly, secure, strict cookie with the token expiry', () => {
    const token = jwt.sign({ exp: 2000000000 }, 'test-secret');
    let cookie;
    let cacheControl;

    setAccessTokenCookie(
      {
        set: (name, value) => {
          cacheControl = { name, value };
        },
        cookie: (name, value, options) => {
          cookie = { name, value, options };
        },
      },
      token,
      'https://boards.example',
    );

    assert.equal(cookie.name, 'accessToken');
    assert.equal(cookie.value, token);
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.sameSite, 'strict');
    assert.equal(cookie.options.expires.getTime(), 2000000000000);
    assert.deepEqual(cacheControl, { name: 'Cache-Control', value: 'no-store' });
  });

  it('does not return a revoked token to a browser socket', async () => {
    const previousSails = global.sails;
    const previousSession = global.Session;
    global.sails = { config: { custom: { clientUrl: 'https://boards.example', publicUrls: ['https://boards.example'] } } };
    global.Session = { updateOne: () => ({ set: async () => {} }) };

    try {
      const req = { accessToken: 'secret', isSocket: true, headers: { 'x-4gaBoards-Request': '1', origin: 'https://boards.example' } };
      const result = await deleteAccessToken.fn.call({ req });
      assert.deepEqual(result, { item: true });
    } finally {
      global.sails = previousSails;
      global.Session = previousSession;
    }
  });

  it('rotates a browser password session without returning the token', async () => {
    const previousSails = global.sails;
    const previousSession = global.Session;
    const previousLodash = global._;
    const token = jwt.sign({ exp: 2000000000 }, 'test-secret');
    const user = { id: '1', passwordChangedAt: new Date().toUTCString() };
    let tokenIssuedAt;
    global._ = lodash;
    global.sails = {
      config: { custom: { clientUrl: 'https://boards.example', publicUrls: ['https://boards.example'], baseUrl: 'https://boards.example', requiredPasswordStrength: 0 } },
      helpers: {
        users: { getOne: async () => user, updateOne: { with: async () => user }, sanitize: async () => user },
        utils: {
          createToken: (userId, issuedAt) => {
            assert.equal(userId, user.id);
            tokenIssuedAt = issuedAt;
            return token;
          },
        },
      },
    };
    global.Session = { create: async () => {} };

    try {
      let cookie;
      const req = { currentUser: user, headers: { 'x-4gaBoards-Request': '1' }, ip: '127.0.0.1' };
      const res = {
        set: () => {},
        cookie: (name, value, options) => {
          cookie = { name, value, options };
        },
      };
      const result = await updatePassword.fn.call({ req, res }, { id: user.id, password: 'new-password' });

      assert.deepEqual(result, { item: user });
      assert.equal(new Date(tokenIssuedAt).getTime(), new Date(user.passwordChangedAt).getTime());
      assert.equal(cookie.value, token);
      assert.equal(cookie.options.httpOnly, true);
    } finally {
      global.sails = previousSails;
      global.Session = previousSession;
      global._ = previousLodash;
    }
  });

  it('rejects cookie-based password rotation over a socket', async () => {
    const previousSails = global.sails;
    global.sails = { config: { custom: { clientUrl: 'https://boards.example', publicUrls: ['https://boards.example'] } } };

    try {
      const req = { currentUser: { id: '1' }, isSocket: true, headers: { 'x-4gaBoards-Request': '1', origin: 'https://boards.example' } };
      await assert.rejects(updatePassword.fn.call({ req }, { id: '1', password: 'new-password' }), (error) => !!error.insufficientPermissions);
    } finally {
      global.sails = previousSails;
    }
  });
});
