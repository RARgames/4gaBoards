module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('email_notifications_enabled').notNullable().defaultTo(true);
    table
      .json('enabled_notification_types')
      .notNullable()
      .defaultTo(JSON.stringify(['user', 'project']));
    table.string('notification_delivery_mode').notNullable().defaultTo('first_instant_then_batch');
    table.string('notification_aggregation_scope').notNullable().defaultTo('card');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('email_notifications_enabled');
    table.dropColumn('enabled_notification_types');
    table.dropColumn('notification_delivery_mode');
    table.dropColumn('notification_aggregation_scope');
  });
};
