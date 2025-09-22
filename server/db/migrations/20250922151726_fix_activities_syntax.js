module.exports.up = async (knex) => {
  await knex.raw(`
    WITH action_with_card AS (
      SELECT a.id AS action_id, c.name AS card_name
      FROM action a
      LEFT JOIN card c ON a.card_id = c.id
      WHERE a.type IN ('cardCreate', 'cardDuplicate', 'cardMove')
    )
    UPDATE action a
    SET data = jsonb_set(a.data, '{cardName}', COALESCE(to_jsonb(awc.card_name), 'null'::jsonb), true)
    FROM action_with_card awc
    WHERE a.id = awc.action_id;
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET data = data - 'cardName'
    WHERE type IN ('cardCreate', 'cardDuplicate', 'cardMove');
  `);
};
