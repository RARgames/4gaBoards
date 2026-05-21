module.exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.text('priority');
    table.index('priority');
  });

  await knex.schema.alterTable('task', (table) => {
    table.text('priority');
    table.index('priority');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('priority');
  });

  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('priority');
  });
};
