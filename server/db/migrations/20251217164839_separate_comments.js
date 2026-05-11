module.exports.up = async (knex) => {
  await knex.schema.createTable('comment', (table) => {
    /* Columns */
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));
    table.bigInteger('card_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('created_at', true);
    table.bigInteger('created_by_id').notNullable();
    table.timestamp('updated_at', true);
    table.bigInteger('updated_by_id');
    table.timestamp('deleted_at', true);
    table.bigInteger('deleted_by_id');
    /* Indexes */
    table.index('card_id');
  });

  await knex.raw(`
    INSERT INTO comment ( id, card_id, user_id, data, created_at, created_by_id, updated_at, updated_by_id )
    SELECT id, card_id, user_id, data, created_at, created_by_id, updated_at, updated_by_id
    FROM action
    WHERE type = 'cardComment'
  `);

  await knex('action').where('type', 'cardComment').del();

  await knex.schema.alterTable('action', (table) => {
    table.dropColumn('updated_by_id');
  });

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentActionId' || jsonb_build_object('commentId', data->'commentActionId')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentActionId'
  `);

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentActionText' || jsonb_build_object('commentText', data->'commentActionText')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentActionText'
  `);

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentActionPrevText' || jsonb_build_object('commentPrevText', data->'commentActionPrevText')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentActionPrevText'
  `);
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('action', (table) => {
    table.bigInteger('updated_by_id');
  });

  await knex.raw(`
    INSERT INTO action ( id, card_id, user_id, data, created_at, created_by_id, updated_at, updated_by_id, type )
    SELECT id, card_id, user_id, data, created_at, created_by_id, updated_at, updated_by_id, 'cardComment'
    FROM comment
  `);

  await knex.schema.dropTable('comment');

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentId' || jsonb_build_object('commentActionId', data->'commentId')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentId'
  `);

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentText' || jsonb_build_object('commentActionText', data->'commentText')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentText'
  `);

  await knex.raw(`
    UPDATE action
    SET data = data - 'commentPrevText' || jsonb_build_object('commentActionPrevText', data->'commentPrevText')
    WHERE type IN ('cardCommentCreate', 'cardCommentUpdate', 'cardCommentDelete')
      AND data \\? 'commentPrevText'
  `);
};
