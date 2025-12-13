module.exports.up = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.bigInteger('attachment_id').nullable();
    table.bigInteger('task_id').nullable();
    table.bigInteger('comment_id').nullable();
    table.bigInteger('card_id').nullable().alter();
    table.bigInteger('list_id').nullable();
    table.bigInteger('board_id').nullable();
    table.bigInteger('project_id').nullable();
    table.bigInteger('user_account_id').nullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('notification', (table) => {
    table.dropColumn('attachment_id');
    table.dropColumn('task_id');
    table.dropColumn('comment_id');
    table.string('card_id').notNullable().alter();
    table.dropColumn('list_id');
    table.dropColumn('board_id');
    table.dropColumn('project_id');
    table.dropColumn('user_account_id');
  });
};
