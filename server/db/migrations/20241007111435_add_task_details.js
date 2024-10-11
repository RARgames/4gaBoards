module.exports.up = async (knex) => {
  await knex.schema.alterTable('task', (table) => {
    table.timestamp('due_date', true);
  });
  await knex.schema.createTable('task_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('task_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['task_id', 'user_id']);
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('due_date');
  });
  await knex.schema.dropTable('task_membership');
};
