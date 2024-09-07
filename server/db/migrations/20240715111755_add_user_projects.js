module.exports.up = async (knex) => {
  await knex.schema.createTable('user_project', (table) => {
    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.boolean('is_collapsed').defaultTo(false);
    table.bigInteger('project_id').notNullable();
    table.bigInteger('user_id').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    table.unique(['project_id', 'user_id']);
  });

  const projectManagerData = await knex('project_manager').select('user_id', 'project_id');
  const boardData = await knex('board').select('id', 'project_id');
  const boardMembershipData = await knex('board_membership').select('board_id', 'user_id');

  const mergedBoardData = boardMembershipData
    .map((bm) => {
      const board = boardData.find((b) => b.id === bm.board_id);
      return board ? { ...bm, project_id: board.project_id } : null;
    })
    .filter((item) => item !== null);

  const combinedData = [...projectManagerData, ...mergedBoardData];
  const uniqueData = [];
  const uniqueKeys = new Set();

  combinedData.forEach((item) => {
    const key = `${item.project_id}-${item.user_id}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueData.push(item);
    }
  });

  const insertData = uniqueData.map((item) => ({
    project_id: item.project_id,
    user_id: item.user_id,
    is_collapsed: false,
    created_at: knex.fn.now(0),
  }));

  await knex('user_project').insert(insertData);
};

module.exports.down = (knex) => knex.schema.dropTable('user_project');
