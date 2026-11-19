const { isBrowserRequest, clearAccessTokenCookie } = require('../../../utils/browser-session');

module.exports = {
  async fn() {
    const { accessToken } = this.req;

    await Session.updateOne({
      accessToken,
      deletedAt: null,
    }).set({
      deletedAt: new Date().toUTCString(),
    });

    if (isBrowserRequest(this.req, sails.config.custom.clientUrl)) {
      if (!this.req.isSocket) {
        clearAccessTokenCookie(this.res);
      }
      return { item: true };
    }

    return {
      item: accessToken,
    };
  },
};
