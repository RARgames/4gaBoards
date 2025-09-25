module.exports.up = async (knex) => {
  // Add deleted_at to notification, mark as deleted when notification has no corresponding action or are read
  await knex.schema.alterTable('notification', (table) => {
    table.timestamp('deleted_at', true);
  });

  await knex('notification')
    .whereNotNull('action_id')
    .whereNotExists(function notExistsAction() {
      this.select(1).from('action').whereRaw('action.id = notification.action_id');
    })
    .update({
      deleted_at: knex.fn.now(),
    });

  await knex('notification').where('is_read', true).whereNull('deleted_at').update({
    deleted_at: knex.fn.now(),
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.dropColumn('deleted_at');
  });
};
