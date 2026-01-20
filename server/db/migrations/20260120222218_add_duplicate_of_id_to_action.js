module.exports.up = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.bigInteger('duplicate_of_id').nullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('duplicate_of_id');
  });
};
