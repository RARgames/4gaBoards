module.exports.up = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.bigInteger('card_id').nullable().alter();
    table.bigInteger('board_id').nullable().alter();
    table.bigInteger('project_id').nullable().alter();
  });

  await knex.raw(`
    UPDATE action
    SET
      board_id = NULLIF(board_id, '0'),
      project_id = NULLIF(project_id, '0')
  `);

  await knex.schema.alterTable('action', (table) => {
    table.bigInteger('list_id').nullable();
    table.bigInteger('attachment_id').nullable();
    table.bigInteger('task_id').nullable();
    table.bigInteger('comment_id').nullable();
    table.bigInteger('user_account_id').nullable();
  });

  await knex.raw(`
    UPDATE action
    SET
      list_id = card.list_id
    FROM card
    WHERE action.card_id = card.id
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET
      board_id = COALESCE(board_id, '0'),
      project_id = COALESCE(project_id, '0'),
      card_id = COALESCE(card_id, '0')
  `);

  await knex.schema.alterTable('action', (table) => {
    table.string('card_id').notNullable().alter();
    table.string('board_id').notNullable().alter();
    table.string('project_id').notNullable().alter();
  });

  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('list_id');
    table.dropColumn('attachment_id');
    table.dropColumn('task_id');
    table.dropColumn('comment_id');
    table.dropColumn('user_account_id');
  });
};
