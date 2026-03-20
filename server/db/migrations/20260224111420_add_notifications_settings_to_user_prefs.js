module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('email_notifications_enabled').notNullable().defaultTo(true);
    table
      .json('email_notifications_enabled_types')
      .notNullable()
      .defaultTo(JSON.stringify(['project', 'board', 'list', 'card', 'task', 'comment', 'attachment']));
    table.string('email_notifications_delivery_mode').notNullable().defaultTo('instant_then_batched');
    table.boolean('email_notifications_mark_read_as_delivered').notNullable().defaultTo(true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('email_notifications_enabled');
    table.dropColumn('email_notifications_enabled_types');
    table.dropColumn('email_notifications_delivery_mode');
    table.dropColumn('email_notifications_mark_read_as_delivered');
  });
};
