module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('sso_github_id');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('sso_github_id');
  });
};
