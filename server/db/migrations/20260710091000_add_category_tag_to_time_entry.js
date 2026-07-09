module.exports.up = async (knex) => {
  await knex.schema.alterTable('time_entry', (table) => {
    table.bigInteger('category_tag_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('time_entry', (table) => {
    table.dropColumn('category_tag_id');
  });
};
