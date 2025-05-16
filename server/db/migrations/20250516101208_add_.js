module.exports.up = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.boolean('project_creation_all_enabled').defaultTo(true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.dropColumn('project_creation_all_enabled');
  });
};
