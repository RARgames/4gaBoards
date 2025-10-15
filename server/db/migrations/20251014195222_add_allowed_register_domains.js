module.exports.up = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.json('allowed_register_domains').defaultTo('[]');
  });
};

module.exports.down = async (knex) => {
  return knex.schema.alterTable('core', (table) => {
    table.dropColumn('allowed_register_domains');
  });
};
