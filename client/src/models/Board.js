import { attr, fk, many } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Board';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    isGithubConnected: attr(),
    githubRepo: attr(),
    isFetching: attr({
      getDefault: () => null,
    }),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'boards',
    }),
    memberUsers: many({
      to: 'User',
      through: 'BoardMembership',
      relatedName: 'boards',
    }),
    filterUsers: many('User', 'filterBoards'),
    filterLabels: many('Label', 'filterBoards'),
    searchParams: attr({
      getDefault: () => ({
        query: '',
        anyMatch: false,
        matchCase: false,
      }),
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdBoards',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedBoards',
    }),
  };

  static reducer({ type, payload }, Board) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
        if (payload.board) {
          Board.upsert({
            ...payload.board,
            isFetching: false,
          });
        }

        break;
      case ActionTypes.LOCATION_CHANGE_HANDLE__BOARD_FETCH:
      case ActionTypes.BOARD_FETCH:
        Board.withId(payload.id).update({
          isFetching: true,
        });

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Board.all().delete();

        if (payload.board) {
          Board.upsert({
            ...payload.board,
            isFetching: false,
          });
        }

        payload.boards.forEach((board) => {
          Board.upsert(board);
        });

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE__CORE_FETCH:
        Board.all()
          .toModelArray()
          .forEach((boardModel) => {
            if (boardModel.id !== payload.currentBoardId) {
              boardModel.update({
                isFetching: null,
              });

              boardModel.deleteRelated(payload.currentUserId);
            }
          });

        break;
      case ActionTypes.CORE_INITIALIZE:
        if (payload.board) {
          Board.upsert({
            ...payload.board,
            isFetching: false,
          });
        }

        payload.boards.forEach((board) => {
          Board.upsert(board);
        });

        break;
      case ActionTypes.BOARD_SEARCH_PARAMS_UPDATE: {
        const board = Board.withId(payload.id);
        Board.withId(payload.id).update({
          searchParams: {
            query: payload.searchParams.query !== undefined ? payload.searchParams.query : board.searchParams.query,
            anyMatch: payload.searchParams.anyMatch !== undefined ? payload.searchParams.anyMatch : board.searchParams.anyMatch,
            matchCase: payload.searchParams.matchCase !== undefined ? payload.searchParams.matchCase : board.searchParams.matchCase,
          },
        });

        break;
      }
      case ActionTypes.USER_TO_BOARD_FILTER_ADD:
        Board.withId(payload.boardId).filterUsers.add(payload.id);

        break;
      case ActionTypes.USER_FROM_BOARD_FILTER_REMOVE:
        Board.withId(payload.boardId).filterUsers.remove(payload.id);

        break;
      case ActionTypes.PROJECT_CREATE_HANDLE:
      case ActionTypes.PROJECT_IMPORT_GETTING_STARTED__SUCCESS:
        payload.boards.forEach((board) => {
          Board.upsert(board);
        });

        break;
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.boards) {
          payload.boards.forEach((board) => {
            Board.upsert({
              ...board,
              ...(payload.board &&
                payload.board.id === board.id && {
                  isFetching: false,
                }),
            });
          });
        }

        break;
      case ActionTypes.BOARD_CREATE:
      case ActionTypes.BOARD_CREATE_HANDLE:
      case ActionTypes.BOARD_UPDATE__SUCCESS:
      case ActionTypes.BOARD_UPDATE_HANDLE:
        Board.upsert(payload.board);

        break;
      case ActionTypes.BOARD_CREATE__SUCCESS:
        Board.withId(payload.localId).delete();
        Board.upsert(payload.board);

        break;
      case ActionTypes.BOARD_CREATE__FAILURE:
        Board.withId(payload.localId).delete();

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        Board.upsert({
          ...payload.board,
          isFetching: false,
        });

        break;
      case ActionTypes.BOARD_FETCH__FAILURE:
        Board.withId(payload.id).update({
          isFetching: null,
        });

        break;
      case ActionTypes.BOARD_UPDATE:
        Board.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.BOARD_DELETE:
        Board.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.BOARD_DELETE__SUCCESS:
      case ActionTypes.BOARD_DELETE_HANDLE: {
        const boardModel = Board.withId(payload.board.id);

        if (boardModel) {
          boardModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.LABEL_TO_BOARD_FILTER_ADD:
        Board.withId(payload.boardId).filterLabels.add(payload.id);

        break;
      case ActionTypes.LABEL_FROM_BOARD_FILTER_REMOVE:
        Board.withId(payload.boardId).filterLabels.remove(payload.id);

        break;

      case ActionTypes.BOARD_EXPORT__SUCCESS:
        if (payload.downloadUrl) {
          window.open(payload.downloadUrl, '_blank');
        }
        break;
      default:
    }
  }

  getOrderedMembershipsQuerySet() {
    return this.memberships.orderBy('id');
  }

  getOrderedLabelsQuerySet() {
    return this.labels.orderBy('position');
  }

  getOrderedListsQuerySet() {
    return this.lists.orderBy('position');
  }

  getMembershipModelForUser(userId) {
    return this.memberships
      .filter({
        userId,
      })
      .first();
  }

  hasMembershipForUser(userId) {
    return this.memberships
      .filter({
        userId,
      })
      .exists();
  }

  isAvailableForUser(userId) {
    return this.project && (this.project.hasManagerForUser(userId) || this.hasMembershipForUser(userId));
  }

  deleteRelated(exceptMemberUserId) {
    this.memberships.toModelArray().forEach((boardMembershipModel) => {
      if (boardMembershipModel.userId !== exceptMemberUserId) {
        boardMembershipModel.deleteWithRelated();
      }
    });

    this.labels.delete();

    this.lists.toModelArray().forEach((listModel) => {
      listModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
