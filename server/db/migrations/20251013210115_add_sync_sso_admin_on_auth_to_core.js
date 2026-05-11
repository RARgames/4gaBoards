module.exports.up = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.boolean('sync_sso_admin_on_auth').defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  return knex.schema.alterTable('core', (table) => {
    table.dropColumn('sync_sso_admin_on_auth');
  });
};
