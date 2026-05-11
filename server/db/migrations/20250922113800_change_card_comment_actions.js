module.exports.up = async (knex) => {
  await knex.raw(`
    UPDATE action a
    SET data = jsonb_set(a.data::jsonb, '{userId}', to_jsonb(a.user_id), true)
               || jsonb_build_object('userName', ua.name)
    FROM user_account ua
    WHERE a.type = 'cardComment'
      AND a.user_id = ua.id
  `);

  await knex.raw(`
    WITH action_with_card AS (
      SELECT a.id AS action_id, c.name AS card_name, a.data
      FROM action a
      LEFT JOIN card c ON a.card_id = c.id
      WHERE a.type = 'cardCommentCreate'
    )
    UPDATE action a
    SET data = jsonb_build_object(
        'cardName', awc.card_name,
        'commentId', (awc.data->>'id')::text,
        'commentText', awc.data->>'text'
    )
    FROM action_with_card awc
    WHERE a.id = awc.action_id;
  `);
};

module.exports.down = async (knex) => {
  await knex('action')
    .where('type', 'cardComment')
    .update({
      data: knex.raw(`data - 'userId' - 'userName'`),
    });

  await knex.raw(`
    UPDATE action a
    SET data = jsonb_build_object(
      'id', a.data->>'commentId',
      'text', a.data->>'commentText'
      )
    WHERE a.type = 'cardCommentCreate'
  `);
};
