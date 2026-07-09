module.exports.up = async (knex) => {
  await knex.schema.createTable('category_tag', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id');
    table.text('name').notNullable();

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('project_id');
  });

  // Seed the global default categories (project_id is null, so they're available everywhere).
  await knex.raw(`
    INSERT INTO category_tag (id, project_id, name, created_at)
    VALUES
      (next_id(), NULL, 'Admin', NOW()),
      (next_id(), NULL, 'Meeting', NOW()),
      (next_id(), NULL, 'Development', NOW())
  `);
};

module.exports.down = (knex) => knex.schema.dropTable('category_tag');
