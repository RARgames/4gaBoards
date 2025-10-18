module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('color_schema').defaultTo('default');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('color_schema');
  });
};
