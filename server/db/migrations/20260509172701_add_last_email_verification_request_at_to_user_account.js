module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.timestamp('last_email_verification_request_at', true);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('last_email_verification_request_at');
  });
};
