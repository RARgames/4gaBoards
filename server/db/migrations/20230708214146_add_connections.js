module.exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.boolean('is_github_connected').notNullable().defaultTo(false);
    table.text('github_repo').notNullable().defaultTo('');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('is_github_connected');
    table.dropColumn('github_repo');
  });
