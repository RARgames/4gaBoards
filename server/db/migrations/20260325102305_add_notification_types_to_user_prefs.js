module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table
      .json('notification_types')
      .notNullable()
      .defaultTo(JSON.stringify(['project', 'board', 'list', 'card', 'task', 'comment', 'attachment']));
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('notification_types');
  });
};
