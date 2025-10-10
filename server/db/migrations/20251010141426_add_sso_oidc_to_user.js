module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('ssoOidcId');
    table.text('ssoOidcEmail');
  });
};

module.exports.down = (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('ssoOidcId');
    table.dropColumn('ssoOidcEmail');
  });
};
