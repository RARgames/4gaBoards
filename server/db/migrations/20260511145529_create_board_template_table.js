const POSITION_GAP = 65535;

const defaultBoardTemplates = [
  {
    name: 'common.simple',
    isGlobal: true,
    data: {
      lists: ['common.ideas', 'common.todo', 'common.inProgress', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [],
    },
  },
  {
    name: 'common.kanban',
    isGlobal: true,
    data: {
      lists: ['common.ideas', 'common.todo', 'common.inProgress', 'common.toTest', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [],
    },
  },
];

module.exports.up = async (knex) => {
  const oldestUserAccount = await knex('user_account').orderBy('created_at', 'asc').first();
  const oldestUserId = oldestUserAccount?.id ?? 0;

  await knex.schema.createTable('board_template', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.text('name').notNullable();
    table.boolean('is_global').notNullable().defaultTo(false);
    table.jsonb('data').notNullable().defaultTo('{}');
    table.bigInteger('created_by_id').notNullable();
    table.bigInteger('updated_by_id');
    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.index('created_by_id');
    table.index('is_global');
    table.index('name');
  });

  await knex('board_template').insert(
    defaultBoardTemplates.map((template) => ({
      ...template,
      created_by_id: oldestUserId,
    })),
  );
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('board_template');
};
