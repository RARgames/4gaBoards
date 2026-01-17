module.exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.alterTable('user_prefs', (table) => {
      table.boolean('subscribe_to_new_boards').defaultTo(true);
      table.boolean('subscribe_to_new_projects').defaultTo(true);
      table.boolean('subscribe_to_users').defaultTo(false);
      table.boolean('subscribe_to_instance').defaultTo(true);
    });

    await trx.schema.alterTable('board_membership', (table) => {
      table.boolean('is_subscribed').defaultTo(true);
    });

    await trx.schema.createTable('project_membership', (table) => {
      /* Columns */
      table.bigInteger('id').primary().defaultTo(trx.raw('next_id()'));
      table.bigInteger('project_id').notNullable();
      table.bigInteger('user_id').notNullable();
      table.boolean('is_collapsed').defaultTo(false);
      table.boolean('is_subscribed').defaultTo(true);
      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);
      /* Indexes */
      table.unique(['project_id', 'user_id']);
      table.index('user_id');
    });

    // Create projectMemberships based on existing board memberships and project managers
    await trx.raw(`
      INSERT INTO project_membership (id, project_id, user_id, created_at)

      SELECT next_id(), b.project_id, bm.user_id, NOW()
      FROM board_membership bm
      JOIN board b ON bm.board_id = b.id

      UNION ALL

      SELECT next_id(), pm.project_id, pm.user_id, NOW()
      FROM project_manager pm

      ON CONFLICT (project_id, user_id) DO NOTHING
    `);

    // Sync is_collapsed state from user_project if exists
    await trx.raw(`
      UPDATE project_membership pm
      SET is_collapsed = up.is_collapsed
      FROM user_project up
      WHERE pm.project_id = up.project_id
      AND pm.user_id = up.user_id
    `);

    await trx.schema.dropTable('user_project');
  });
};

module.exports.down = async (knex) => {
  await knex.transaction(async (trx) => {
    await trx.schema.alterTable('user_prefs', (table) => {
      table.dropColumn('subscribe_to_new_boards');
      table.dropColumn('subscribe_to_new_projects');
      table.dropColumn('subscribe_to_users');
      table.dropColumn('subscribe_to_instance');
    });

    await trx.schema.alterTable('board_membership', (table) => {
      table.dropColumn('is_subscribed');
    });

    await trx.schema.createTable('user_project', (table) => {
      table.bigInteger('id').primary().defaultTo(trx.raw('next_id()'));

      table.boolean('is_collapsed').defaultTo(false);
      table.bigInteger('project_id').notNullable();
      table.bigInteger('user_id').notNullable();

      table.timestamp('created_at', true);
      table.timestamp('updated_at', true);

      table.unique(['project_id', 'user_id']);
    });

    await trx.raw(`
      INSERT INTO user_project (id, project_id, user_id, is_collapsed, created_at, updated_at)
      SELECT next_id(), project_id, user_id, is_collapsed, created_at, updated_at
      FROM project_membership
      ON CONFLICT (project_id, user_id) DO NOTHING
    `);

    await trx.schema.dropTable('project_membership');
  });
};
