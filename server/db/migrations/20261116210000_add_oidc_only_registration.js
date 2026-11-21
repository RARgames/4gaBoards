module.exports.up = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.boolean('oidc_only_registration').notNullable().defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.dropColumn('oidc_only_registration');
  });
};
