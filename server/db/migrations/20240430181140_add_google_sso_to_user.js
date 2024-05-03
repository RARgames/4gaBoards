module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.setNullable('password');
    table.timestamp('last_login', true);
    table.text('sso_google_email');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('last_login');
    table.dropColumn('sso_google_email');
  });
};
