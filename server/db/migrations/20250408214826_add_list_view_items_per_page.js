module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('list_view_items_per_page').defaultTo('all');
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('list_view_items_per_page');
  });
