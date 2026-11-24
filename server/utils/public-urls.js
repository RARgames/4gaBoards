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
  const host = getFirstHeaderValue(req, 'x-forwarded-host');
  const protocol = getFirstHeaderValue(req, 'x-forwarded-proto');
  const prefix = getFirstHeaderValue(req, 'x-forwarded-prefix');
  const publicUrl = host ? `${protocol || req.protocol || 'http'}://${host}${prefix ? `/${prefix.replace(/^\/+|\/+$/g, '')}` : ''}` : undefined;

  return publicUrls.includes(publicUrl) ? publicUrl : fallbackUrl;
};

module.exports = { getPublicUrls, getRequestPublicUrl };
