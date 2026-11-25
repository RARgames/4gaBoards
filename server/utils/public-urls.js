const normalizePublicUrl = (value) => {
  if (!value) return undefined;

  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) return undefined;

    return url.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
};

const getPublicUrls = (env = process.env) => {
  const values = [env.BASE_URL, env.CLIENT_URL, ...(env.CLIENT_URLS || '').split(/[;,]/)];
  return [...new Set(values.map(normalizePublicUrl).filter(Boolean))];
};

const getFirstHeaderValue = (req, name) =>
  String(req.headers[name] || '')
    .split(',')[0]
    .trim();

const getRequestPublicUrl = (req, publicUrls, fallbackUrl) => {
  const host = getFirstHeaderValue(req, 'x-forwarded-host') || getFirstHeaderValue(req, 'host');
  const protocol = getFirstHeaderValue(req, 'x-forwarded-proto') || req.protocol || 'http';
  const prefix = getFirstHeaderValue(req, 'x-forwarded-prefix');
  if (!host) return fallbackUrl;

  const origin = `${protocol}://${host}`;
  const matchingUrls = publicUrls.filter((publicUrl) => new URL(publicUrl).origin === origin);
  if (matchingUrls.length === 1) return matchingUrls[0];

  const normalizedPrefix = prefix ? `/${prefix.replace(/^\/+|\/+$/g, '')}` : '';
  return matchingUrls.find((publicUrl) => new URL(publicUrl).pathname.replace(/\/$/, '') === normalizedPrefix) || fallbackUrl;
};

module.exports = { getPublicUrls, getRequestPublicUrl };
