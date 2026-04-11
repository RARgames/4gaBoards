const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

const escapeAttribute = (value) => escapeHtml(value).replace(/`/g, '&#96;');

const buildClientRouteUrl = (baseClientUrl, path) => {
  if (!baseClientUrl) {
    return null;
  }

  return `${String(baseClientUrl).replace(/\/$/, '')}${path}`;
};

const buildActionLinks = (action, baseClientUrl) => ({
  card: action.cardId ? buildClientRouteUrl(baseClientUrl, `/cards/${action.cardId}`) : null,
  board: action.boardId ? buildClientRouteUrl(baseClientUrl, `/boards/${action.boardId}`) : null,
  project: action.projectId ? buildClientRouteUrl(baseClientUrl, `/projects/${action.projectId}`) : null,
});

const buildTagRenderers = (links) => {
  const renderStrong = (content) => `<strong>${escapeHtml(content)}</strong>`;
  const renderLinkedStrong = (content, link) => (link ? `<a href="${escapeAttribute(link)}"><strong>${escapeHtml(content)}</strong></a>` : renderStrong(content));

  return {
    card: (content) => renderLinkedStrong(content, links.card),
    board: (content) => renderLinkedStrong(content, links.board),
    project: (content) => renderLinkedStrong(content, links.project),
    default: (content) => renderStrong(content),
  };
};

const getRendererBySlot = (slot, tagRenderers) => {
  return tagRenderers[slot] || tagRenderers.default;
};

const renderLocalizedHtmlFromTransProps = (t, transProps, action, baseClientUrl) => {
  const translated = String(t(transProps.i18nKey, transProps.values || {}) || '');
  if (!translated) {
    return null;
  }

  const links = buildActionLinks(action, baseClientUrl);
  const tagRenderers = buildTagRenderers(links);
  const componentRenderers = {};

  (transProps.components || []).forEach(({ slot }) => {
    componentRenderers[slot] = getRendererBySlot(slot, tagRenderers);
  });

  return translated.replace(/<([a-z0-9_-]+)>([\s\S]*?)<\/\1>/gi, (_, tag, content) => {
    const renderer = componentRenderers[tag];
    return renderer ? renderer(content) : escapeHtml(content);
  });
};

const buildFallbackActivityHtml = (action) => {
  const dataEntries = Object.entries(action.data || {});

  if (!dataEntries.length) {
    return `<p>&bull; <strong>${escapeHtml(action.type)}</strong></p>`;
  }

  const changesHtml = dataEntries.map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`).join('');

  return `<p>&bull; <strong>${escapeHtml(action.type)}</strong></p><ul>${changesHtml}</ul>`;
};

module.exports = {
  escapeHtml,
  buildFallbackActivityHtml,
  renderLocalizedHtmlFromTransProps,
};
