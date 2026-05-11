module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('hide_closest_due_date').defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('hide_closest_due_date');
  });
};
