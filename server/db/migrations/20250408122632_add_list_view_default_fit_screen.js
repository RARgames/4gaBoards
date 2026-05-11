module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('list_view_fit_screen').defaultTo(true);
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('list_view_fit_screen');
  });
