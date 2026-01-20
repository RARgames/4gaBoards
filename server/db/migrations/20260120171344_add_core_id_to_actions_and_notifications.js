module.exports.up = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.bigInteger('core_id').nullable().defaultTo(0);
  });

  await knex.schema.alterTable('action', (table) => {
    table.bigInteger('core_id').nullable().defaultTo(0);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.dropColumn('core_id');
  });

  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('core_id');
  });
};
