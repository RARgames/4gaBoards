import EntryActionTypes from '../constants/EntryActionTypes';

const createMembershipInCurrentBoard = (data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const createMembershipInBoard = (id, data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_BOARD_CREATE,
  payload: {
    id,
    data,
  },
});

const handleBoardMembershipCreate = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    boardMembership,
  },
});

const updateBoardMembership = (id, data) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBoardMembershipUpdate = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    boardMembership,
  },
});

const deleteBoardMembership = (id) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

const handleBoardMembershipDelete = (boardMembership) => ({
  type: EntryActionTypes.BOARD_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    boardMembership,
  },
});

export default {
  createMembershipInCurrentBoard,
  createMembershipInBoard,
  handleBoardMembershipCreate,
  updateBoardMembership,
  handleBoardMembershipUpdate,
  deleteBoardMembership,
  handleBoardMembershipDelete,
};
