const jwt = require('jsonwebtoken');

const isBrowserRequest = (req, clientUrl) => {
  if (req.headers['x-4gaboards-request'] !== '1') {
    return false;
  }

  const { origin } = req.headers;
  if (!origin) {
    return !req.isSocket;
  }

  try {
    return origin === new URL(clientUrl).origin;
  } catch {
    return false;
  }
};

const setAccessTokenCookie = (res, accessToken, baseUrl) => {
  const { exp } = jwt.decode(accessToken);
  res.set('Cache-Control', 'no-store');
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: new URL(baseUrl).protocol === 'https:',
    sameSite: 'strict',
    expires: new Date(exp * 1000),
    path: '/',
  });
};

const clearAccessTokenCookie = (res) => {
  res.set('Cache-Control', 'no-store');
  res.clearCookie('accessToken', { path: '/' });
};

module.exports = { isBrowserRequest, setAccessTokenCookie, clearAccessTokenCookie };
