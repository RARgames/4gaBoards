module.exports.up = async (knex) => {
  await knex('notification')
    .whereNotNull('deleted_at')
    .update({
      deleted_at: knex.raw(`date_trunc('second', deleted_at)`),
    });
};

module.exports.down = async () => {
  return Promise.resolve();
};
