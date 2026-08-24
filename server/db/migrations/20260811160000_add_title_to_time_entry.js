module.exports.up = async (knex) => {
  await knex.schema.alterTable('time_entry', (table) => {
    table.text('title');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('time_entry', (table) => {
    table.dropColumn('title');
  });
};
