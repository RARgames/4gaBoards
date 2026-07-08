module.exports.up = async (knex) => {
  await knex.schema.createTable('wiki_page', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('parent_id');

    table.text('title').notNullable();
    table.text('slug').notNullable();
    table.text('content').notNullable().defaultTo('');
    table.specificType('position', 'double precision').notNullable();

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['project_id', 'slug']);
    table.index('parent_id');
  });

  await knex.schema.createTable('wiki_page_revision', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('wiki_page_id').notNullable();
    table.text('title').notNullable();
    table.text('content').notNullable().defaultTo('');

    table.bigInteger('created_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('wiki_page_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('wiki_page_revision');
  await knex.schema.dropTable('wiki_page');
};
