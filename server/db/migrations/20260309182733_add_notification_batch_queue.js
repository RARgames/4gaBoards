module.exports.up = (knex) =>
  knex.schema.createTable('notification_batch_queue', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));
    table.bigInteger('notification_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.text('type').notNullable();
    table.text('scope').notNullable();

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('sent_at', { useTz: true });

    table.index('user_id');
    table.index(['user_id', 'type', 'scope']);
  });

module.exports.down = (knex) => knex.schema.dropTable('notification_batch_queue');
