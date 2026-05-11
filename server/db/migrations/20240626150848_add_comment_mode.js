module.exports.up = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.string('comment_mode').notNullable().defaultTo('edit');
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('comment_mode');
  });
