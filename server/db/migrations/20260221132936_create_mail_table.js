module.exports.up = (knex) =>
  knex.schema.createTable('mail', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('mail_id').notNullable().unique(); // random ID (hex string)

    table.bigInteger('user_id').notNullable();
    table.bigInteger('project_id').notNullable();
    table.bigInteger('board_id').notNullable();
    table.bigInteger('list_id').nullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('user_id');
    table.index('project_id');
    table.index('board_id');
    table.index('list_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('mail');
