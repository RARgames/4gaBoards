module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('notification_aggregation_scope');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('notification_aggregation_scope').notNullable().defaultTo('card');
  });
};
