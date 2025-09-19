module.exports.up = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET data = jsonb_set(
      jsonb_set(data,
        '{listId}', data->'list'->'id'),
        '{listName}', data->'list'->'name')
        - 'list'
    WHERE type = 'cardCreate';
  `);
  await knex.raw(`
    UPDATE action
    SET data = jsonb_set(
      jsonb_set(data,
        '{listId}', data->'list'->'id'),
        '{listName}', data->'list'->'name')
        - 'list'
    WHERE type = 'cardDuplicate';
  `);
  await knex.raw(`
    UPDATE action
    SET data = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(data,
            '{listFromId}', data->'fromList'->'id'),
            '{listFromName}', data->'fromList'->'name'),
            '{listToId}', data->'toList'->'id'),
            '{listToName}', data->'toList'->'name')
            - 'fromList' - 'toList'
    WHERE type = 'cardMove';
  `);
};

module.exports.down = async (knex) => {
  await knex.raw(`
    UPDATE action
    SET data = jsonb_build_object(
      'list', jsonb_build_object(
        'id', data->'listId',
        'name', data->'listName'
      )
    )
    WHERE type = 'cardCreate';
  `);
  await knex.raw(`
    UPDATE action
    SET data = jsonb_build_object(
      'list', jsonb_build_object(
        'id', data->'listId',
        'name', data->'listName'
      )
    )
    WHERE type = 'cardDuplicate';
  `);
  await knex.raw(`
    UPDATE action
    SET data = jsonb_build_object(
      'fromList', jsonb_build_object(
        'id', data->'listFromId',
        'name', data->'listFromName'
      ),
      'toList', jsonb_build_object(
        'id', data->'listToId',
        'name', data->'listToName'
      )
    )
    WHERE type = 'cardMove';
  `);
};
