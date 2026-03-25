module.exports.up = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.boolean('is_created_via_api').notNullable().defaultTo(false);
    table.string('mail_creator_address').nullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('is_created_via_api');
    table.dropColumn('mail_creator_address');
  });
};
