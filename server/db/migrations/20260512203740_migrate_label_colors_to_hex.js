const ACTION_TYPES = ['labelCreate', 'labelDelete', 'labelUpdate'];

const colorMap = {
  'berry-red': '#e04556',
  'pumpkin-orange': '#f0982d',
  'lagoon-blue': '#109dc0',
  'pink-tulip': '#f97394',
  'light-mud': '#c7a57b',
  'orange-peel': '#fab623',
  'bright-moss': '#a5c261',
  'antique-blue': '#6c99bb',
  'dark-granite': '#8b8680',
  'lagune-blue': '#00b4b1',
  'sunny-grass': '#bfca02',
  'morning-sky': '#52bad5',
  'light-orange': '#ffc66d',
  'midnight-blue': '#004d73',
  'tank-green': '#8aa177',
  'gun-metal': '#355263',
  'wet-moss': '#4a8753',
  'red-burgundy': '#ad5f7d',
  'light-concrete': '#afb0a4',
  'apricot-red': '#fc736d',
  'desert-sand': '#edcb76',
  'navy-blue': '#166a8f',
  'egg-yellow': '#f7d036',
  'coral-green': '#2b6a6c',
  'light-cocoa': '#87564a',
};

const buildCase = (map, column) => `
  CASE ${column}
    ${Object.entries(map)
      .map(([from, to]) => `WHEN '${from}' THEN '${to}'`)
      .join('\n')}
    ELSE ${column}
  END
`;

const reverseMap = Object.fromEntries(Object.entries(colorMap).map(([k, v]) => [v, k]));

module.exports.up = async (knex) => {
  await knex('label').update({
    color: knex.raw(buildCase(colorMap, 'color')),
  });

  await knex('action')
    .whereIn('type', ACTION_TYPES)
    .update({
      data: knex.raw(`
        jsonb_set(
          data,
          '{labelColor}',
          to_jsonb((
            ${buildCase(colorMap, "data->>'labelColor'")}
          )::text)
        )
      `),
    });

  await knex('action')
    .where('type', 'labelUpdate')
    .whereRaw(`data \\? 'labelPrevColor'`)
    .update({
      data: knex.raw(`
        jsonb_set(
          data,
          '{labelPrevColor}',
          to_jsonb((
            ${buildCase(colorMap, "data->>'labelPrevColor'")}
          )::text)
        )
      `),
    });
};

module.exports.down = async (knex) => {
  await knex('label').update({
    color: knex.raw(buildCase(reverseMap, 'color')),
  });

  await knex('action')
    .whereIn('type', ACTION_TYPES)
    .update({
      data: knex.raw(`
        jsonb_set(
          data,
          '{labelColor}',
          to_jsonb((
            ${buildCase(reverseMap, "data->>'labelColor'")}
          )::text)
        )
      `),
    });

  await knex('action')
    .where('type', 'labelUpdate')
    .whereRaw(`data \\? 'labelPrevColor'`)
    .update({
      data: knex.raw(`
        jsonb_set(
          data,
          '{labelPrevColor}',
          to_jsonb((
            ${buildCase(reverseMap, "data->>'labelPrevColor'")}
          )::text)
        )
      `),
    });
};
