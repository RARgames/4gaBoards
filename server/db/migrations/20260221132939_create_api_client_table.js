module.exports.up = (knex) =>
  knex.schema.createTable('api_client', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.text('label').notNullable();
    table.text('client_id').notNullable().unique();
    table.text('client_secret').notNullable();
    table.jsonb('permissions').notNullable().defaultTo('[]');
    table.bigInteger('user_id');

    table.timestamp('created_at', true);
    table.bigInteger('created_by_id').notNullable();
    table.timestamp('updated_at', true);
    table.bigInteger('updated_by_id');
  });

module.exports.down = (knex) => knex.schema.dropTable('api_client');
