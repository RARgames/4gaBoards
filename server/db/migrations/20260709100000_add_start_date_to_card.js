module.exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.timestamp('start_date', true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('start_date');
  });
};
