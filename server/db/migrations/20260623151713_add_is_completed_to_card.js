/* eslint-disable no-await-in-loop, no-restricted-syntax */
const POSITION_GAP = 65535;
const COMPLETED_LIST_KEYWORDS = ['done', 'closed', 'finished', 'complete', 'completed', 'common.done'];

const isCompletedListName = (name) => {
  if (!name) return false;
  return COMPLETED_LIST_KEYWORDS.includes(name.trim().toLowerCase());
};

module.exports.up = async (knex) => {
  await knex.schema.alterTable('list', (table) => {
    table.boolean('is_completed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('card', (table) => {
    table.boolean('is_completed').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('board_membership', (table) => {
    table.boolean('hide_completed_lists').nullable();
  });

  const now = new Date().toUTCString();

  // Backfill existing boards: mark completed lists and cards
  const [boards, lists] = await Promise.all([knex('board').select('id', 'created_by_id'), knex('list').select('id', 'board_id', 'name', 'position')]);

  const listsByBoard = new Map();
  for (const list of lists) {
    const arr = listsByBoard.get(list.board_id);
    if (arr) arr.push(list);
    else listsByBoard.set(list.board_id, [list]);
  }

  const completedListIds = [];
  const listsToInsert = [];

  for (const board of boards) {
    const boardLists = listsByBoard.get(board.id) || [];
    let hasCompleted = false;
    let maxPosition = 0;

    for (const list of boardLists) {
      if (isCompletedListName(list.name)) {
        completedListIds.push(list.id);
        hasCompleted = true;
      }

      if (list.position > maxPosition) {
        maxPosition = list.position;
      }
    }

    if (!hasCompleted) {
      listsToInsert.push({
        board_id: board.id,
        name: 'common.done',
        position: maxPosition + POSITION_GAP,
        is_collapsed: false,
        is_completed: true,
        created_by_id: board.created_by_id,
        created_at: now,
      });
    }
  }

  if (completedListIds.length) {
    await knex('list').whereIn('id', completedListIds).update({ is_completed: true });
    await knex('card').whereIn('list_id', completedListIds).update({ is_completed: true });
  }

  if (listsToInsert.length) {
    await knex('list').insert(listsToInsert);
  }

  // Update board templates
  const templates = await knex('board_template');
  for (const template of templates) {
    const { data } = template;
    data.lists = data.lists || [];

    let mutated = false;
    for (const list of data.lists) {
      if (isCompletedListName(list.name)) {
        if (!list.isCompleted) {
          list.isCompleted = true;
          mutated = true;
        }
      }
    }

    const hasCompletedList = data.lists.some((l) => l.isCompleted);
    if (!hasCompletedList) {
      const maxPosition = data.lists.reduce((max, list) => (list.position > max ? list.position : max), 0);

      data.lists.push({
        position: maxPosition + POSITION_GAP,
        name: 'common.done',
        isCollapsed: false,
        isCompleted: true,
      });
      mutated = true;
    }

    if (mutated) {
      await knex('board_template')
        .where({ id: template.id })
        .update({ data: JSON.stringify(data) });
    }
  }
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('list', (table) => {
    table.dropColumn('is_completed');
  });

  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('is_completed');
  });

  await knex.schema.alterTable('board_membership', (table) => {
    table.dropColumn('hide_completed_lists');
  });

  const templates = await knex('board_template');
  for (const template of templates) {
    const { data } = template;

    let mutated = false;

    for (const list of data.lists || []) {
      if ('isCompleted' in list) {
        delete list.isCompleted;
        mutated = true;
      }
    }

    if (mutated) {
      await knex('board_template')
        .where({ id: template.id })
        .update({ data: JSON.stringify(data) });
    }
  }
};
