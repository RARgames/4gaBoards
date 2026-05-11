module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.jsonb('theme_custom_colors').defaultTo('{}');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('theme_custom_colors');
  });
};
