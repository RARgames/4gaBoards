module.exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const oldestUserAccount = await trx('user_account').orderBy('created_at', 'asc').first();
    await trx.schema.alterTable('card', (table) => {
      table.renameColumn('creator_user_id', 'created_by_id');
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('attachment', (table) => {
      table.renameColumn('creator_user_id', 'created_by_id');
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('action', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('board', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('board_membership', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('card_label', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('card_membership', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('label', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('list', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('project', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('project_manager', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('task', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('task_membership', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('user_account', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
    await trx.schema.alterTable('core', (table) => {
      table.bigInteger('created_by_id').notNullable().defaultTo(oldestUserAccount.id);
      table.bigInteger('updated_by_id');
    });
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
