module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.json('suppressed_system_notification_tags').notNullable().defaultTo(JSON.stringify([]));
    table.boolean('show_full_due_dates').notNullable().defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('suppressed_system_notification_tags');
    table.dropColumn('show_full_due_dates');
  });
};
