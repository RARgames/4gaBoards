const fs = require('fs');
const path = require('path');

const Errors = {
  ATTACHMENT_NOT_FOUND: { attachmentNotFound: 'Attachment not found' },
  RANGE_NOT_SATISFIABLE: { rangeNotSatisfiable: 'Range not satisfiable' },
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

    let size;

    try {
      ({ size } = await fs.promises.stat(filePath));
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
        throw Errors.ATTACHMENT_NOT_FOUND;
      }

      throw error;
    }

    const fileType = path.extname(attachment.filename).slice(1).toLowerCase();
    const isPdf = fileType === 'pdf';
    const mimeType = VIDEO_TYPES.get(fileType) || (isPdf ? 'application/pdf' : 'application/octet-stream');

    this.res.type(mimeType);
    this.res.set('Content-Disposition', videoType || isPdf ? 'inline' : 'attachment');
    this.res.set('X-Content-Type-Options', 'nosniff');
    this.res.set('Content-Security-Policy', "sandbox; default-src 'none'");
    this.res.set('Cache-Control', `private, max-age=${sails.config.custom.cacheMaxAge}`);
    this.res.set('Accept-Ranges', 'bytes');

    // Single byte range (video seeking, resumed downloads); multiple ranges get the full file
    const ranges = this.req.range(size, { combine: true });

    if (ranges === -1 || ranges === -2) {
      this.res.set('Content-Range', `bytes */${size}`);
      throw Errors.RANGE_NOT_SATISFIABLE;
    }

    const range = Array.isArray(ranges) && ranges.type === 'bytes' && ranges.length === 1 ? ranges[0] : undefined;
    const stream = fs.createReadStream(filePath, range && { start: range.start, end: range.end });

    // Release the file when the client aborts, players cancel requests on every seek
    this.res.once('close', () => stream.destroy());
    stream.once('error', () => {
      if (this.res.headersSent) {
        this.res.destroy();
        return;
      }

      this.res.sendStatus(500);
    });

    if (range) {
      this.res.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
      this.res.set('Content-Length', range.end - range.start + 1);

      return exits.partialContent(stream);
    }

    this.res.set('Content-Length', size);

    return exits.success(stream);
  },
};
