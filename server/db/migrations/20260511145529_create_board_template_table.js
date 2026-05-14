const POSITION_GAP = 65535;

const defaultLabels = [
  { name: 'common.critical', color: '#c62828' },
  { name: 'common.highPriority', color: '#ef4444' },
  { name: 'common.mediumPriority', color: '#f59e0b' },
  { name: 'common.lowPriority', color: '#4a8753' },
  { name: 'common.improvement', color: '#7c3aed' },
  { name: 'common.blocked', color: '#6b7280' },
  { name: 'common.review', color: '#3b82f6' },
  { name: 'common.urgent', color: '#dc2626' },
  { name: 'common.actionRequired', color: '#c500b8' },
  { name: 'common.future', color: '#64748b' },
];

const extraDefaultLabels = [
  { name: 'common.bug', color: '#ff1744' },
  { name: 'common.feature', color: '#5164cf' },
];

const defaultBoardTemplates = [
  {
    name: 'common.simple',
    isGlobal: true,
    data: {
      lists: ['common.open', 'common.todo', 'common.inProgress', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [...defaultLabels, ...extraDefaultLabels],
    },
  },
  {
    name: 'common.kanban',
    isGlobal: true,
    data: {
      lists: ['common.open', 'common.todo', 'common.inProgress', 'common.toTest', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [...defaultLabels, ...extraDefaultLabels],
    },
  },
  {
    name: 'common.softwareDevelopment',
    isGlobal: true,
    data: {
      lists: ['common.open', 'common.todo', 'common.inProgress', 'common.codeReview', 'common.testing', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [
        ...defaultLabels,
        ...extraDefaultLabels,
        { name: 'common.refactor', color: '#8b5cf6' },
        { name: 'common.frontend', color: '#06b6d4' },
        { name: 'common.backend', color: '#f97316' },
        { name: 'common.devops', color: '#6366f1' },
        { name: 'common.ux', color: '#ec4899' },
      ],
    },
  },
  {
    name: 'common.marketingCampaign',
    isGlobal: true,
    data: {
      lists: ['common.open', 'common.planned', 'common.creating', 'common.review', 'common.scheduled', 'common.published', 'common.analytics'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [
        ...defaultLabels,
        ...extraDefaultLabels,
        { name: 'common.socialMedia', color: '#3b82f6' },
        { name: 'common.email', color: '#8b5cf6' },
        { name: 'common.seo', color: '#10b981' },
        { name: 'common.ads', color: '#f59e0b' },
        { name: 'common.blog', color: '#06b6d4' },
        { name: 'common.video', color: '#6d4c41' },
      ],
    },
  },
  {
    name: 'common.personal',
    isGlobal: true,
    data: {
      lists: ['common.open', 'common.planned', 'common.today', 'common.thisWeek', 'common.done'].map((name, index) => ({
        position: (index + 1) * POSITION_GAP,
        name,
        isCollapsed: false,
      })),
      labels: [
        ...defaultLabels,
        { name: 'common.work', color: '#3b82f6' },
        { name: 'common.personal', color: '#8b5cf6' },
        { name: 'common.shopping', color: '#ec4899' },
        { name: 'common.finance', color: '#10b981' },
        { name: 'common.health', color: '#f97316' },
      ],
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
