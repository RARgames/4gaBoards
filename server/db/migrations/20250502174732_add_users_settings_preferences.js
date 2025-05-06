module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.string('users_settings_style').notNullable().defaultTo('compact');
    table
      .jsonb('users_settings_column_visibility')
      .notNullable()
      .defaultTo(
        JSON.stringify({
          avatar: true,
          name: true,
          username: true,
          email: true,
          administrator: true,
          ssoGoogleEmail: true,
          lastLogin: true,
          createdAt: false,
          actions: true,
        }),
      );
    table.boolean('users_settings_fit_screen').defaultTo(true);
    table.string('users_settings_items_per_page').defaultTo('all');
  });
};

module.exports.down = (knex) =>
  knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('users_settings_style');
    table.dropColumn('users_settings_column_visibility');
    table.dropColumn('users_settings_fit_screen');
    table.dropColumn('users_settings_items_per_page');
  });
