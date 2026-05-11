module.exports.up = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.string('description_mode').notNullable().defaultTo('code');
    table.boolean('description_shown').defaultTo(true);
    table.boolean('tasks_shown').defaultTo(true);
    table.boolean('attachments_shown').defaultTo(true);
    table.boolean('comments_shown').defaultTo(true);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('description_mode');
    table.dropColumn('description_shown');
    table.dropColumn('tasks_shown');
    table.dropColumn('attachments_shown');
    table.dropColumn('comments_shown');
  });
