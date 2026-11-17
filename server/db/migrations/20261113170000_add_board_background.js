module.exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.jsonb('background');
    table.jsonb('background_image');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.dropColumn('background');
    table.dropColumn('background_image');
  });
};
