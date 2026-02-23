module.exports.up = (knex) =>
  knex.schema.createTable('mail_token', (table) => {
    /* Columns */
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('token').notNullable().unique();
    table.bigInteger('user_id').notNullable();
    table.bigInteger('board_id').nullable();
    table.bigInteger('list_id').nullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */
    table.index('user_id');
    table.index('board_id');
    table.index('list_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('mail_token');
