module.exports.up = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.timestamp('completed_at').nullable();
    table.timestamp('archived_at').nullable();
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('card', (table) => {
    table.dropColumn('completed_at');
    table.dropColumn('archived_at');
  });
