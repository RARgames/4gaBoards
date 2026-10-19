/**
 * Tests for issue #279: deleting a list while a card in that list is open
 * should navigate to the board before removing the list from the store.
 *
 * Strategy: step through the generator manually and compare effect descriptors.
 * All heavy dependencies (selectors, actions, api, request) are module-mocked
 * so that no ORM / window.BASE_URL wiring is needed in the test environment.
 */

/* global jest */

import { call, put, select } from 'redux-saga/effects';

jest.mock('../../../selectors', () => ({
  selectPath: jest.fn(),
  selectCardById: jest.fn(),
}));

jest.mock('../../../actions', () => {
  const deleteListAction = jest.fn((id) => ({ type: 'LIST_DELETE', payload: { id } }));
  deleteListAction.success = jest.fn((list) => ({ type: 'LIST_DELETE__SUCCESS', payload: { list } }));
  deleteListAction.failure = jest.fn((id, error) => ({ type: 'LIST_DELETE__FAILURE', payload: { id, error } }));

  const handleListDeleteAction = jest.fn((list) => ({ type: 'LIST_DELETE_HANDLE', payload: { list } }));

  return {
    deleteList: deleteListAction,
    handleListDelete: handleListDeleteAction,
  };
});

jest.mock('../request', () => jest.fn());
jest.mock('../../../api', () => ({ deleteList: jest.fn() }));

// router module — only goToBoard is used by the sagas under test
jest.mock('./router', () => ({
  goToBoard: jest.fn(),
}));

// Lazy-require after mocks are set up (jest.mock calls are hoisted, but CJS
// require runs after that, ensuring mocked modules are returned).
const actions = require('../../../actions');
const selectors = require('../../../selectors');
const request = require('../request');
const { deleteList, handleListDelete } = require('./lists');
const { goToBoard } = require('./router');

const LIST_ID = 'list-1';
const BOARD_ID = 'board-1';
const CARD_ID = 'card-1';

// ---------------------------------------------------------------------------
// deleteList
// ---------------------------------------------------------------------------

describe('deleteList', () => {
  const DELETED_LIST = { id: LIST_ID };

  test('navigates to board before deleting when open card belongs to the list', () => {
    const gen = deleteList(LIST_ID);

    // Step 1 — select path
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — cardId is set → select card
    expect(gen.next({ cardId: CARD_ID, boardId: BOARD_ID }).value).toEqual(select(selectors.selectCardById, CARD_ID));

    // Step 3 — card.listId === LIST_ID → navigate away BEFORE dispatching
    expect(gen.next({ id: CARD_ID, listId: LIST_ID }).value).toEqual(call(goToBoard, BOARD_ID));

    // Step 4 — dispatch deleteList action
    expect(gen.next().value).toEqual(put(actions.deleteList(LIST_ID)));

    // Step 5 — API call
    expect(gen.next().value).toEqual(call(request, expect.anything(), LIST_ID));

    // Step 6 — success
    expect(gen.next({ item: DELETED_LIST }).value).toEqual(put(actions.deleteList.success(DELETED_LIST)));

    expect(gen.next().done).toBe(true);
  });

  test('does NOT navigate when open card belongs to a different list', () => {
    const gen = deleteList(LIST_ID);

    // Step 1 — select path
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — select card
    expect(gen.next({ cardId: CARD_ID, boardId: BOARD_ID }).value).toEqual(select(selectors.selectCardById, CARD_ID));

    // Step 3 — card.listId !== LIST_ID → no navigation; dispatch action directly
    expect(gen.next({ id: CARD_ID, listId: 'other-list' }).value).toEqual(put(actions.deleteList(LIST_ID)));

    // Step 4 — API call
    expect(gen.next().value).toEqual(call(request, expect.anything(), LIST_ID));

    // Step 5 — success
    expect(gen.next({ item: DELETED_LIST }).value).toEqual(put(actions.deleteList.success(DELETED_LIST)));

    expect(gen.next().done).toBe(true);
  });

  test('does NOT navigate when no card is currently open (cardId is null)', () => {
    const gen = deleteList(LIST_ID);

    // Step 1 — select path (not on a card route)
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — cardId is falsy → skip card select; dispatch action directly
    expect(gen.next({ cardId: null, boardId: BOARD_ID }).value).toEqual(put(actions.deleteList(LIST_ID)));

    // Step 3 — API call
    expect(gen.next().value).toEqual(call(request, expect.anything(), LIST_ID));

    // Step 4 — success
    expect(gen.next({ item: DELETED_LIST }).value).toEqual(put(actions.deleteList.success(DELETED_LIST)));

    expect(gen.next().done).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// handleListDelete (socket event)
// ---------------------------------------------------------------------------

describe('handleListDelete', () => {
  const LIST_OBJ = { id: LIST_ID };

  test('navigates to board before handling when open card belongs to the list', () => {
    const gen = handleListDelete(LIST_OBJ);

    // Step 1 — select path
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — select card
    expect(gen.next({ cardId: CARD_ID, boardId: BOARD_ID }).value).toEqual(select(selectors.selectCardById, CARD_ID));

    // Step 3 — card.listId matches → navigate away
    expect(gen.next({ id: CARD_ID, listId: LIST_ID }).value).toEqual(call(goToBoard, BOARD_ID));

    // Step 4 — dispatch handleListDelete action
    expect(gen.next().value).toEqual(put(actions.handleListDelete(LIST_OBJ)));

    expect(gen.next().done).toBe(true);
  });

  test('does NOT navigate when open card belongs to a different list', () => {
    const gen = handleListDelete(LIST_OBJ);

    // Step 1 — select path
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — select card
    expect(gen.next({ cardId: CARD_ID, boardId: BOARD_ID }).value).toEqual(select(selectors.selectCardById, CARD_ID));

    // Step 3 — card.listId differs → no navigation; dispatch action
    expect(gen.next({ id: CARD_ID, listId: 'other-list' }).value).toEqual(put(actions.handleListDelete(LIST_OBJ)));

    expect(gen.next().done).toBe(true);
  });

  test('does NOT navigate when no card is currently open (cardId is null)', () => {
    const gen = handleListDelete(LIST_OBJ);

    // Step 1 — select path
    expect(gen.next().value).toEqual(select(selectors.selectPath));

    // Step 2 — cardId null → skip; dispatch action
    expect(gen.next({ cardId: null, boardId: BOARD_ID }).value).toEqual(put(actions.handleListDelete(LIST_OBJ)));

    expect(gen.next().done).toBe(true);
  });
});
