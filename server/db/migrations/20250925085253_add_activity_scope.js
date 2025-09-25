module.exports.up = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.string('scope').notNullable().defaultTo('card');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('scope');
  });
};
