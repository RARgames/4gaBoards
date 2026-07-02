module.exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.timestamp('completed_at', true);
    table.bigInteger('completed_by_id');
  });

  await knex.schema.alterTable('task', (table) => {
    table.timestamp('completed_at', true);
    table.bigInteger('completed_by_id');
  });

  await knex.raw(`
    UPDATE "card"
    SET completed_by_id = created_by_id,
        completed_at = COALESCE(
          GREATEST(due_date - interval '14 days', created_at),
          created_at
        )
    WHERE is_completed
  `);

  await knex.raw(`
    UPDATE "task"
    SET completed_by_id = created_by_id,
        completed_at = COALESCE(
          GREATEST(due_date - interval '14 days', created_at),
          created_at
        )
    WHERE is_completed
  `);
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('completed_at');
    table.dropColumn('completed_by_id');
  });

  await knex.schema.alterTable('task', (table) => {
    table.dropColumn('completed_at');
    table.dropColumn('completed_by_id');
  });
};
