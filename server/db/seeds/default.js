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

  const projectCreationAllEnabled = process.env.DEFAULT_PROJECT_CREATION_ALL !== 'false';
  const registrationEnabled = process.env.DEFAULT_REGISTRATION_ENABLED !== 'false';
  const localRegistrationEnabled = process.env.DEFAULT_LOCAL_REGISTRATION_ENABLED !== 'false';
  const ssoRegistrationEnabled = process.env.DEFAULT_SSO_REGISTRATION_ENABLED !== 'false';

  await knex('core')
    .insert({
      id: 0,
      registrationEnabled,
      localRegistrationEnabled,
      ssoRegistrationEnabled,
      projectCreationAllEnabled,
      createdAt: date,
      createdById: adminUser.id,
    })
    .onConflict('id')
    .merge({
      registrationEnabled,
      localRegistrationEnabled,
      ssoRegistrationEnabled,
      projectCreationAllEnabled,
      updatedAt: date,
      updatedById: adminUser.id,
    });
};
