module.exports.up = async (knex) => {
  await knex.schema.createTable('project_membership', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.text('role').notNullable().defaultTo('member');
    table.boolean('can_edit_wiki').notNullable().defaultTo(true);
    table.boolean('can_manage_documents').notNullable().defaultTo(true);

    table.bigInteger('created_by_id');
    table.bigInteger('updated_by_id');

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.unique(['project_id', 'user_id']);
    table.index('user_id');
  });

  // Backfill: every user who currently has access to a project (via any board membership,
  // or via being a project manager) keeps exactly that access as a project membership.
  await knex.raw(`
    INSERT INTO project_membership (id, project_id, user_id, role, created_at)

    SELECT next_id(), b.project_id, bm.user_id, 'member', NOW()
    FROM board_membership bm
    JOIN board b ON bm.board_id = b.id

    UNION ALL

    SELECT next_id(), pm.project_id, pm.user_id, 'member', NOW()
    FROM project_manager pm

    ON CONFLICT (project_id, user_id) DO NOTHING
  `);
};

module.exports.down = (knex) => knex.schema.dropTable('project_membership');
