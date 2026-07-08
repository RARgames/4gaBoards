module.exports.up = async (knex) => {
  await knex.schema.createTable('document', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.text('folder');

    table.text('name').notNullable();
    table.text('description');

    table.text('dirname').notNullable();
    table.text('filename').notNullable();
    table.json('image');

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index(['project_id', 'folder']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('document');
};
