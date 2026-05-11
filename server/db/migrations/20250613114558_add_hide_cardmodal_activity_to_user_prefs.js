module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.boolean('hide_card_modal_activity').defaultTo(false);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_prefs', (table) => {
    table.dropColumn('hide_card_modal_activity');
  });
};
