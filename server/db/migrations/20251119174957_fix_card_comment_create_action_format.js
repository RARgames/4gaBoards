module.exports.up = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET data = jsonb_build_object(
      'cardName', data->>'cardName',
      'commentActionId', data->>'commentId',
      'commentActionText', data->>'commentText'
    )
    WHERE type = 'cardCommentCreate'
      AND data->>'commentId' IS NOT NULL
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET data = jsonb_build_object(
      'cardName', data->>'cardName',
      'commentId', data->>'commentActionId',
      'commentText', data->>'commentActionText'
    )
    WHERE type = 'cardCommentCreate'
      AND data->>'commentActionId' IS NOT NULL
  `);
};
