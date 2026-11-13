module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('sidebar_shown').notNullable().defaultTo(true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('sidebar_shown');
  });
};
