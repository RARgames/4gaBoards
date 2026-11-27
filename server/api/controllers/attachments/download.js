const fs = require('fs');
const path = require('path');

const Errors = {
  ATTACHMENT_NOT_FOUND: { attachmentNotFound: 'Attachment not found' },
};

// Video formats browsers can play natively, served with their real type so <video> can stream them
const VIDEO_TYPES = new Map([
  ['mp4', 'video/mp4'],
  ['m4v', 'video/mp4'],
  ['webm', 'video/webm'],
  ['mkv', 'video/webm'], // mkv is not supported, but we can usually serve it as webm
  ['mov', 'video/mp4'], // mov is not supported, but we can usually serve it as mp4
]);

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    attachmentNotFound: { responseType: 'notFound' },
    partialContent: { statusCode: 206 },
    rangeNotSatisfiable: { statusCode: 416 },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { attachment, card, project } = await sails.helpers.attachments.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
      }
    }

    const filePath = path.join(sails.config.custom.attachmentsPath, attachment.dirname, attachment.filename);

    if (!fs.existsSync(filePath)) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    const { size } = fs.statSync(filePath);
    const videoType = VIDEO_TYPES.get(path.extname(attachment.filename).slice(1).toLowerCase());

    this.res.type(videoType || 'application/octet-stream');
    this.res.set('Content-Disposition', 'attachment');
    this.res.set('X-Content-Type-Options', 'nosniff');
    this.res.set('Content-Security-Policy', "sandbox; default-src 'none'");
    this.res.set('Cache-Control', `private, max-age=${sails.config.custom.cacheMaxAge}`);
    this.res.set('Accept-Ranges', 'bytes');

    // Single byte range (video seeking, resumed downloads); multiple ranges get the full file
    const ranges = this.req.range(size, { combine: true });

    if (ranges === -1) {
      this.res.set('Content-Range', `bytes */${size}`);
      throw 'rangeNotSatisfiable';
    }

    const range = Array.isArray(ranges) && ranges.type === 'bytes' && ranges.length === 1 ? ranges[0] : undefined;
    const stream = fs.createReadStream(filePath, range && { start: range.start, end: range.end });

    // Release the file when the client aborts, players cancel requests on every seek
    this.res.once('close', () => stream.destroy());

    if (range) {
      this.res.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
      this.res.set('Content-Length', range.end - range.start + 1);

      return exits.partialContent(stream);
    }

    this.res.set('Content-Length', size);

    return exits.success(stream);
  },
};
