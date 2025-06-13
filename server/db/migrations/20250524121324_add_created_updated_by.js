module.exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const oldestUserAccount = await trx('user_account').orderBy('created_at', 'asc').first();
    const oldestUserId = oldestUserAccount?.id ?? 0;

    await trx.schema.alterTable('card', (table) => {
      table.renameColumn('creator_user_id', 'created_by_id');
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('attachment', (table) => {
      table.renameColumn('creator_user_id', 'created_by_id');
      table.bigInteger('updated_by_id');
    });

    const addCols = (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserId);
      table.bigInteger('updated_by_id');
    };
    const alterCols = (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(null).alter();
    };

    const tables = ['action', 'board', 'board_membership', 'card_label', 'card_membership', 'label', 'list', 'project', 'project_manager', 'task', 'task_membership', 'user_account', 'core'];
    await Promise.all(tables.map((t) => trx.schema.alterTable(t, addCols)));
    await Promise.all(tables.map((t) => trx.schema.alterTable(t, alterCols)));
    const allTables = [...tables, 'card', 'attachment'];
    await Promise.all(allTables.map((t) => trx(t).whereNotNull('updated_at').update({ updated_by_id: oldestUserId })));
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.renameColumn('created_by_id', 'creator_user_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('attachment', (table) => {
    table.renameColumn('created_by_id', 'creator_user_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('board', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('board_membership', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('card_label', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('card_membership', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('label', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('list', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('project', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('project_manager', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('task_membership', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
  await knex.schema.alterTable('core', (table) => {
    table.dropColumn('created_by_id');
    table.dropColumn('updated_by_id');
  });
};
