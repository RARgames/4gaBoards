module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('ssoGoogleId');
    table.text('ssoGithubUsername');
    table.text('ssoMicrosoftEmail');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('ssoGoogleId');
    table.dropColumn('ssoGithubUsername');
    table.dropColumn('ssoMicrosoftEmail');
  });
};
