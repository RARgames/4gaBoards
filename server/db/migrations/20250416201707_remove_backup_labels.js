module.exports.up = async (knex) => {
  await knex.schema.dropTableIfExists('card_label_backup');
  await knex.schema.dropTableIfExists('label_backup');
};

module.exports.down = () => Promise.resolve();
