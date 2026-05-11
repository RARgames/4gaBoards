module.exports.up = async (knex) => {
  const now = new Date().toUTCString();

  await knex.schema.alterTable('notification', (table) => {
    table.timestamp('delivered_at', true);
    table.string('scope').notNullable().defaultTo('card');
  });

  await knex('notification').update({
    delivered_at: now,
  });

  await knex.raw(`
    UPDATE notification
    SET scope = action.scope
    FROM action
    WHERE notification.action_id = action.id
  `);
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.dropColumn('delivered_at');
    table.dropColumn('scope');
  });
};
