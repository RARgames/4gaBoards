module.exports = {
  async fn() {
    const { androidPackageName, androidSha256Fingerprint } = sails.config.custom;

    return this.res.json([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: androidPackageName,
          sha256_cert_fingerprints: [androidSha256Fingerprint],
        },
      },
    ]);
  },
};
