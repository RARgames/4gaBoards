module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.string('description_mode').notNullable().defaultTo('edit').alter();
  });

  await knex('user_account').where('description_mode', 'code').update('description_mode', 'edit');
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.string('description_mode').notNullable().defaultTo('code').alter();
  });

  await knex('user_account').where('description_mode', 'edit').update('description_mode', 'code');
};
