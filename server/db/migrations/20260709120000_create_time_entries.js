module.exports.up = async (knex) => {
  await knex.schema.createTable('time_entry', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('user_id').notNullable();
    table.bigInteger('project_id');
    table.bigInteger('card_id');

    table.timestamp('started_at', true).notNullable();
    table.timestamp('ended_at', true).notNullable();
    table.text('description');

    table.text('imported_from');

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index(['user_id', 'started_at']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('time_entry');
};
