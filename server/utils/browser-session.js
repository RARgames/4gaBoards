const jwt = require('jsonwebtoken');

const isBrowserRequest = (req, clientUrls) => {
  const applicationRequestHeader = Object.entries(req.headers).find(([name]) => name.toLowerCase() === 'x-4gaboards-request')?.[1];
  if (applicationRequestHeader !== '1') {
    return false;
  }

  const { origin } = req.headers;
  if (!origin) {
    return !req.isSocket;
  }

  const trustedOrigins = (Array.isArray(clientUrls) ? clientUrls : [clientUrls]).flatMap((url) => {
    try {
      return [new URL(url).origin];
    } catch {
      return [];
    }
  });

  return trustedOrigins.includes(origin);
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
