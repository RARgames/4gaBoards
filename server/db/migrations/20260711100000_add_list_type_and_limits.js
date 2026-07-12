module.exports.up = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.string('type').notNullable().defaultTo('none');
    table.integer('wip_limit').nullable();
    table.integer('auto_archive_days').nullable().defaultTo(30);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('list', (table) => {
    table.dropColumn('type');
    table.dropColumn('wip_limit');
    table.dropColumn('auto_archive_days');
  });
