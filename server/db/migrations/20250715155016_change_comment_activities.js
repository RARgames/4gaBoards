module.exports.up = async (knex) => {
  await knex('action').where({ type: 'commentCard' }).update({ type: 'cardComment' });
  await knex('action').where({ type: 'moveCard' }).update({ type: 'cardMove' });
  await knex('action').where({ type: 'duplicateCard' }).update({ type: 'cardDuplicate' });
  await knex('action').where({ type: 'createCard' }).update({ type: 'cardCreate' });
  await knex.raw(`
    INSERT INTO action (card_id, user_id, type, data, created_at, created_by_id, updated_at, updated_by_id)
    SELECT card_id, user_id, 'cardCommentCreate', json_build_object('id', id::text, 'text', (data::json)->>'text'), created_at, created_by_id, updated_at, updated_by_id
    FROM action
    WHERE type = 'cardComment'
  `);
};

module.exports.down = async (knex) => {
  await knex('action').where({ type: 'cardComment' }).update({ type: 'commentCard' });
  await knex('action').where({ type: 'cardMove' }).update({ type: 'moveCard' });
  await knex('action').where({ type: 'cardDuplicate' }).update({ type: 'duplicateCard' });
  await knex('action').where({ type: 'cardCreate' }).update({ type: 'createCard' });
  await knex('action').where({ type: 'cardCommentCreate' }).del();
};
