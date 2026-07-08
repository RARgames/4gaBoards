module.exports.up = async (knex) => {
  await knex.schema.createTable('chart_view', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();

    table.text('type').notNullable();
    table.text('name').notNullable();
    table.jsonb('config').notNullable().defaultTo('{}');
    table.specificType('position', 'double precision').notNullable();

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('chart_view');
};
