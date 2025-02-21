module.exports.up = async (knex) => {
  await knex.schema.table('board_membership', (table) => {
    table.boolean('migrate_added_project_managers').defaultTo(false);
  });
  // Add board memberships for project managers with role 'editor' and canComment null
  await knex.raw(`
      INSERT INTO board_membership (user_id, board_id, role, can_comment, created_at, migrate_added_project_managers)
      SELECT pm.user_id, b.id, 'editor', null, CURRENT_TIMESTAMP(0), true
      FROM project_manager pm
      JOIN project p ON pm.project_id = p.id
      JOIN board b ON p.id = b.project_id
      ON CONFLICT DO NOTHING
    `);
};

module.exports.down = async (knex) => {
  await knex('board_membership').where('migrate_added_project_managers', true).del();
  await knex.schema.table('board_membership', (table) => {
    table.dropColumn('migrate_added_project_managers');
  });
};
