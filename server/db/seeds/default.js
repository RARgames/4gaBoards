const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  const date = new Date().toUTCString();

  await knex('user_account').insert({
    email: 'demo@demo.demo',
    password: bcrypt.hashSync('demo', 10),
    isAdmin: true,
    name: 'Demo Demo',
    username: 'demo',
    createdAt: date,
    updatedAt: date,
  });

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
      updatedAt: date,
    })
    .onConflict('id')
    .merge({
      registrationEnabled,
      localRegistrationEnabled,
      ssoRegistrationEnabled,
      projectCreationAllEnabled,
      updatedAt: date,
    });
};
