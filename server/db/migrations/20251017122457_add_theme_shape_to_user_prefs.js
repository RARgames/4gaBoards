module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('theme_shape').defaultTo('default');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('theme_shape');
  });
};
