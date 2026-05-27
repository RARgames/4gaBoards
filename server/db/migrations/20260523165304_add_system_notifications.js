module.exports.up = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.string('instance_id').nullable();
    table.text('system_notifications_public_key').nullable();
    table.text('system_notification_responses_public_key').nullable();
    table.text('system_notification_responses_private_key').nullable();
  });

  await knex.schema.createTable('system_notification', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));
    table.uuid('system_notification_id').notNullable().unique();
    table.string('type').notNullable();
    table.string('tag').notNullable();
    table.text('title').notNullable();
    table.text('content').nullable();
    table.json('answers').nullable();
    table.string('target_users').notNullable();
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);
  });

  await knex.schema.alterTable('notification', (table) => {
    table.bigInteger('action_id').nullable().alter();
    table.bigInteger('system_notification_id').nullable();
  });

  await knex.raw(`
    ALTER TABLE notification
    ADD CONSTRAINT notification_exactly_one_target_action_check
    CHECK (
      (
        action_id IS NOT NULL
        AND system_notification_id IS NULL
      )
      OR
      (
        action_id IS NULL
        AND system_notification_id IS NOT NULL
      )
    )
  `);
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('core', (table) => {
    table.dropColumn('instance_id');
    table.dropColumn('system_notifications_public_key');
    table.dropColumn('system_notification_responses_public_key');
    table.dropColumn('system_notification_responses_private_key');
  });

  await knex.raw(`
    ALTER TABLE notification
    DROP CONSTRAINT IF EXISTS notification_exactly_one_target_action_check
  `);

  await knex('notification').whereNull('action_id').del();

  await knex.schema.alterTable('notification', (table) => {
    table.dropColumn('system_notification_id');
    table.bigInteger('action_id').notNullable().alter();
  });

  await knex.schema.dropTable('system_notification');
};
