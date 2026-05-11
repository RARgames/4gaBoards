module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('theme').defaultTo('default');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('theme');
  });
};
