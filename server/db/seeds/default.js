const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  const date = new Date().toUTCString();
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'demo';
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'demo@demo.demo';
  const adminName = process.env.DEFAULT_ADMIN_NAME || 'Demo Demo';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'demo';

  const [adminUser] = await knex('user_account')
    .insert({
      email: adminEmail.toLowerCase(),
      password: bcrypt.hashSync(adminPassword, 10),
      isAdmin: true,
      name: adminName,
      username: adminUsername.toLowerCase(),
      createdAt: date,
      createdById: 0,
    })
    .returning(['id']);
  await knex('user_account').where({ id: adminUser.id }).update({ createdById: adminUser.id });

  const registrationEnabled = process.env.DEFAULT_REGISTRATION_ENABLED !== 'false';
  const localRegistrationEnabled = process.env.DEFAULT_LOCAL_REGISTRATION_ENABLED !== 'false';
  const ssoRegistrationEnabled = process.env.DEFAULT_SSO_REGISTRATION_ENABLED !== 'false';
  const projectCreationAllEnabled = process.env.DEFAULT_PROJECT_CREATION_ALL !== 'false';
  const syncSsoDataOnAuth = process.env.DEFAULT_SYNC_SSO_DATA_ON_AUTH === 'true';
  const syncSsoAdminOnAuth = process.env.DEFAULT_SYNC_SSO_ADMIN_ON_AUTH === 'true';
  const allowedRegisterDomains = process.env.DEFAULT_ALLOWED_REGISTER_DOMAINS ? process.env.DEFAULT_ALLOWED_REGISTER_DOMAINS.split(';').map((d) => d.trim().toLowerCase()) : [];

  await knex('core')
    .insert({
      id: 0,
      registrationEnabled,
      localRegistrationEnabled,
      ssoRegistrationEnabled,
      projectCreationAllEnabled,
      syncSsoDataOnAuth,
      syncSsoAdminOnAuth,
      allowedRegisterDomains: JSON.stringify(allowedRegisterDomains),
      createdAt: date,
      createdById: adminUser.id,
    })
    .onConflict('id')
    .merge({
      registrationEnabled,
      localRegistrationEnabled,
      ssoRegistrationEnabled,
      projectCreationAllEnabled,
      syncSsoDataOnAuth,
      syncSsoAdminOnAuth,
      allowedRegisterDomains: JSON.stringify(allowedRegisterDomains),
      updatedAt: date,
      updatedById: adminUser.id,
    });
};
