module.exports.up = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.boolean('sidebar_compact').defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('sidebar_compact');
  });
