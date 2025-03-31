module.exports.up = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.string('list_view_style').notNullable().defaultTo('default');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('list_view_style');
  });
