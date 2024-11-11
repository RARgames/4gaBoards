module.exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.boolean('is_imported_board').defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('is_imported_board');
  });
