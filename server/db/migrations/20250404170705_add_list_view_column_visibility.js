module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table
      .jsonb('list_view_column_visibility')
      .notNullable()
      .defaultTo(
        JSON.stringify({
          notificationsCount: true,
          coverUrl: false,
          name: true,
          labels: true,
          users: true,
          listName: true,
          hasDescription: true,
          attachmentsCount: true,
          commentCount: true,
          dueDate: true,
          timer: true,
          tasks: true,
          createdAt: true,
          updatedAt: true,
          description: false,
          actions: true,
        }),
      );
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('list_view_column_visibility');
  });
