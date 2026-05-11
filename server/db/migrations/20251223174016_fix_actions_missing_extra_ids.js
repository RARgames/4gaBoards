module.exports.up = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET comment_id = (data->>'commentId')::bigint
    WHERE scope = 'comment'
      AND data \\? 'commentId'
  `);

  await knex.raw(`
    UPDATE action
    SET attachment_id = (data->>'attachmentId')::bigint
    WHERE scope = 'attachment'
      AND data \\? 'attachmentId'
  `);

  await knex.raw(`
    UPDATE action
    SET task_id = (data->>'taskId')::bigint
    WHERE scope = 'task'
      AND data \\? 'taskId'
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET comment_id = NULL
    WHERE scope = 'comment'
      AND data \\? 'commentId'
  `);

  await knex.raw(`
    UPDATE action
    SET attachment_id = NULL
    WHERE scope = 'attachment'
      AND data \\? 'attachmentId'
  `);

  await knex.raw(`
    UPDATE action
    SET task_id = NULL
    WHERE scope = 'task'
      AND data \\? 'taskId'
  `);
};
