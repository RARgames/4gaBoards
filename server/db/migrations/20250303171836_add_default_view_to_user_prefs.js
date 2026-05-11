module.exports.up = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.string('defaultView').notNullable().defaultTo('board');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('defaultView');
  });
