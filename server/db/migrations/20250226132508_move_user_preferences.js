module.exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.createTable('user_prefs', (table) => {
      table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

      table.boolean('subscribe_to_own_cards').notNullable();
      table.text('language');
      table.string('description_mode').notNullable().defaultTo('edit');
      table.boolean('description_shown').defaultTo(true);
      table.boolean('tasks_shown').defaultTo(true);
      table.boolean('attachments_shown').defaultTo(true);
      table.boolean('comments_shown').defaultTo(true);
      table.string('comment_mode').notNullable().defaultTo('edit');
      table.boolean('sidebar_compact').defaultTo(false);

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);
    });

    await trx.raw(`
    INSERT INTO user_prefs (id, subscribe_to_own_cards, language, description_mode, description_shown, tasks_shown, attachments_shown, comments_shown, comment_mode, sidebar_compact, created_at)
    SELECT id, subscribe_to_own_cards, language, description_mode, description_shown, tasks_shown, attachments_shown, comments_shown, comment_mode, sidebar_compact, created_at
    FROM user_account
  `);

    await trx.schema.alterTable('user_account', (table) => {
      table.dropColumn('subscribe_to_own_cards');
      table.dropColumn('language');
      table.dropColumn('description_mode');
      table.dropColumn('description_shown');
      table.dropColumn('tasks_shown');
      table.dropColumn('attachments_shown');
      table.dropColumn('comments_shown');
      table.dropColumn('comment_mode');
      table.dropColumn('sidebar_compact');
    });
  });
};

module.exports.down = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.alterTable('user_account', (table) => {
      table.boolean('subscribe_to_own_cards').notNullable().defaultTo(false);
      table.text('language');
      table.string('description_mode').notNullable().defaultTo('edit');
      table.boolean('description_shown').defaultTo(true);
      table.boolean('tasks_shown').defaultTo(true);
      table.boolean('attachments_shown').defaultTo(true);
      table.boolean('comments_shown').defaultTo(true);
      table.string('comment_mode').notNullable().defaultTo('edit');
      table.boolean('sidebar_compact').defaultTo(false);
    });

    await trx.raw(`
      UPDATE user_account ua
      SET
        subscribe_to_own_cards = up.subscribe_to_own_cards,
        language = up.language,
        description_mode = up.description_mode,
        description_shown = up.description_shown,
        tasks_shown = up.tasks_shown,
        attachments_shown = up.attachments_shown,
        comments_shown = up.comments_shown,
        comment_mode = up.comment_mode,
        sidebar_compact = up.sidebar_compact
      FROM user_prefs up
      WHERE ua.id = up.id
    `);

    await trx.schema.dropTable('user_prefs');
  });
};
