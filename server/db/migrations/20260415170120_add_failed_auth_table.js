module.exports.up = async (knex) =>
  knex.schema.createTable('failed_auth', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('attempted_identifier').notNullable();
    table.text('remote_address').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.index(['attempted_identifier', 'remote_address', 'created_at']);
    table.index('created_at');
  });

module.exports.down = async (knex) => knex.schema.dropTable('failed_auth');
