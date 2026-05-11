module.exports.up = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.string('list_view_style').notNullable().defaultTo('compact');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('list_view_style');
  });
