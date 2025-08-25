module.exports.up = (knex) =>
  knex.schema.createTable('api_client', (table) => {

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('client_id').notNullable().unique();
    table.text('client_secret').notNullable();

    table.jsonb('permissions').notNullable().defaultTo('[]');

    table.timestamp('created_at', true)
    table.timestamp('updated_at', true)
  });

module.exports.down = (knex) => knex.schema.dropTable('api_client');
