module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('self_assign_by_spacebar').notNullable().defaultTo(true);
    table.boolean('right_click_context_menu').notNullable().defaultTo(true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('self_assign_by_spacebar');
    table.dropColumn('right_click_context_menu');
  });
};
