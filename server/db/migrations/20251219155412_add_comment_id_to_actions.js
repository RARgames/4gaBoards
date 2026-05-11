module.exports.up = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET comment_id = (data->>'commentId')::bigint
    WHERE scope = 'comment'
      AND data \\? 'commentId'
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET comment_id = NULL
    WHERE scope = 'comment'
      AND data \\? 'commentId'
  `);
};
