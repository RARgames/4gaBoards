module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.decimal('weekly_hours', 5, 2).notNullable().defaultTo(40);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('weekly_hours');
  });
};
