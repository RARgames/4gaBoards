module.exports.up = async (knex) => {
  // Add project_id and board_id to action, fill with data inserting 0 if not available, mark old notifications as read
  await knex.schema.alterTable('action', (table) => {
    table.string('board_id');
    table.string('project_id');
  });

  await knex.raw(`
    UPDATE action a
    SET board_id = COALESCE(c.board_id, '0'),
        project_id = COALESCE(b.project_id, '0')
    FROM card c
    LEFT JOIN board b ON c.board_id = b.id
    WHERE a.card_id = c.id
  `);

  await knex('action').whereNull('board_id').update({ board_id: '0' });
  await knex('action').whereNull('project_id').update({ project_id: '0' });

  await knex.raw(`
    UPDATE notification n
    SET is_read = true
    FROM action a
    WHERE n.action_id = a.id
      AND (a.board_id = '0' OR a.project_id = '0')
  `);

  await knex.schema.alterTable('action', (table) => {
    table.string('board_id').notNullable().alter();
    table.string('project_id').notNullable().alter();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('board_id');
    table.dropColumn('project_id');
  });
};
