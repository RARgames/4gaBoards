module.exports.up = async (knex) => {
  await knex.schema.table('user_account', (table) => {
    table.boolean('is_sso').notNullable().default(false);
    table.setNullable('password');
  });

  return knex.schema.alterTable('user_account', (table) => {
    table.boolean('is_sso').notNullable().alter();
  });
};

module.exports.down = async (knex) => {
  return knex.schema.table('user_account', (table) => {
    table.dropColumn('is_sso');
    table.dropNullable('password');
  });
};
