const { expect } = require('chai');

const request = (url, { method = 'GET', data, accessToken } = {}) =>
  new Promise((resolve) => {
    sails.request({ url, method, data, headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {} }, (error, response, body) => {
      resolve({ status: error ? error.status : response.statusCode, body: error ? error.body : body });
    });
  });

const errorCodeOf = async (promise) => {
  try {
    await promise;
    return null;
  } catch (error) {
    return error.raw || error.code || error;
  }
};

describe('OIDC-only registration', () => {
  let admin;
  let member;
  let adminToken;
  let memberToken;
  let createAction;
  let enforced;

  const setCore = (values) => Core.updateOne({ id: '0' }).set(values);

  before(async () => {
    admin = await User.create({ id: '5001', email: 'oidc-admin@test.test', password: 'test', name: 'Admin', username: 'oidcadmin', isAdmin: true, createdById: '0' }).fetch();
    member = await User.create({ id: '5002', email: 'oidc-member@test.test', password: 'test', name: 'Member', username: 'oidcmember', createdById: '0' }).fetch();
    await Core.create({ id: '0', registrationEnabled: true, localRegistrationEnabled: true, ssoRegistrationEnabled: true, oidcOnlyRegistration: false, allowedRegisterDomains: [], createdById: admin.id });

    adminToken = sails.helpers.utils.createToken(admin.id);
    memberToken = sails.helpers.utils.createToken(member.id);
    await Session.create({ id: '5101', accessToken: adminToken, remoteAddress: '127.0.0.1', userId: admin.id });
    await Session.create({ id: '5102', accessToken: memberToken, remoteAddress: '127.0.0.1', userId: member.id });

    // Activity creation is not under test, and sails-disk ids break its associations
    createAction = sails.helpers.actions.createOne;
    sails.helpers.actions.createOne = { with: async () => undefined };
    enforced = sails.config.custom.oidcOnlyRegistrationEnforced;
  });

  afterEach(async () => {
    sails.config.custom.oidcOnlyRegistrationEnforced = enforced;
    await setCore({ registrationEnabled: true, localRegistrationEnabled: true, ssoRegistrationEnabled: true, oidcOnlyRegistration: false });
  });

  after(async () => {
    sails.helpers.actions.createOne = createAction;

    await Session.destroy({ userId: [admin.id, member.id] });
    await Core.destroy({ id: '0' });
    await User.destroy({ email: { startsWith: 'oidc-' } });
  });

  describe('local registration', () => {
    it('is refused when an admin has switched on OIDC-only registration', async () => {
      await setCore({ oidcOnlyRegistration: true });

      const { status, body } = await request('/api/register', { method: 'POST', data: { email: 'oidc-new@test.test', password: 'a very strong passphrase 42!', name: 'New', policy: true } });

      expect(status).to.equal(403);
      expect(JSON.stringify(body)).to.contain('localRegistrationDisabled');
    });

    it('is refused when OIDC_ONLY_REGISTRATION enforces it, even with the setting off', async () => {
      sails.config.custom.oidcOnlyRegistrationEnforced = true;

      const { status, body } = await request('/api/register', { method: 'POST', data: { email: 'oidc-new2@test.test', password: 'a very strong passphrase 42!', name: 'New', policy: true } });

      expect(status).to.equal(403);
      expect(JSON.stringify(body)).to.contain('localRegistrationDisabled');
    });
  });

  describe('SSO sign-in creating new accounts', () => {
    it('refuses new accounts from Google when OIDC-only registration is on', async () => {
      await setCore({ oidcOnlyRegistration: true });

      const code = await errorCodeOf(sails.helpers.users.getCreateOneForGoogleSso.with({ id: 'google-1', email: 'oidc-google@test.test', displayName: 'Google User' }));

      expect(code).to.equal('ssoRegistrationDisabled');
    });

    it('still lets OIDC create accounts when OIDC-only registration is on, even with SSO registration off', async () => {
      await setCore({ oidcOnlyRegistration: true, ssoRegistrationEnabled: false });

      const code = await errorCodeOf(sails.helpers.users.getCreateOneForOidcSso.with({ id: 'oidc-sub-1', email: 'oidc-oidc@test.test', displayName: 'OIDC User', username: 'oidcuser1', isAdmin: false }));

      expect(code).to.not.equal('ssoRegistrationDisabled');
      expect(code).to.not.equal('registrationDisabled');
    });

    it('still honours the main registration switch for OIDC', async () => {
      await setCore({ oidcOnlyRegistration: true, registrationEnabled: false });

      const code = await errorCodeOf(sails.helpers.users.getCreateOneForOidcSso.with({ id: 'oidc-sub-2', email: 'oidc-closed@test.test', displayName: 'OIDC User', username: 'oidcuser2', isAdmin: false }));

      expect(code).to.equal('registrationDisabled');
    });
  });

  describe('core settings', () => {
    it('reports the effective setting and whether it is enforced', async () => {
      sails.config.custom.oidcOnlyRegistrationEnforced = true;

      const { body } = await request('/api/core-settings-public');

      expect(body.item.oidcOnlyRegistration).to.equal(true);
      expect(body.item.oidcOnlyRegistrationEnforced).to.equal(true);
    });

    it('lets an admin switch OIDC-only registration on', async () => {
      const { status, body } = await request('/api/core-settings', { method: 'POST', data: { oidcOnlyRegistration: true }, accessToken: adminToken });

      expect(status).to.equal(200);
      expect(body.item.oidcOnlyRegistration).to.equal(true);
    });

    it('does not let other users change it', async () => {
      const { status } = await request('/api/core-settings', { method: 'POST', data: { oidcOnlyRegistration: true }, accessToken: memberToken });

      expect(status).to.equal(403);
      expect((await Core.findOne({ id: '0' })).oidcOnlyRegistration).to.equal(false);
    });
  });
});
