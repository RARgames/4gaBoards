import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'List';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    isCollapsed: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'lists',
    }),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdLists',
    }),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedLists',
    }),
  };

  static reducer({ type, payload }, List) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(list);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        List.all().delete();

        if (payload.lists) {
          payload.lists.forEach((list) => {
            List.upsert(list);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.lists.forEach((list) => {
          List.upsert(list);
        });

        break;
      case ActionTypes.LIST_CREATE:
      case ActionTypes.LIST_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE__SUCCESS:
      case ActionTypes.LIST_UPDATE_HANDLE:
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_CREATE__SUCCESS:
        List.withId(payload.localId).delete();
        List.upsert(payload.list);

        break;
      case ActionTypes.LIST_UPDATE:
        List.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LIST_DELETE:
        List.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.LIST_DELETE__SUCCESS:
      case ActionTypes.LIST_DELETE_HANDLE: {
        const listModel = List.withId(payload.list.id);

        if (listModel) {
          listModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  getOrderedCardsQuerySet() {
    return this.cards.orderBy('position');
  }

  getOrderedCardsModelArray() {
    return this.getOrderedCardsQuerySet().toModelArray();
  }

  getIsFiltered() {
    const filterUserIds = this.board.filterUsers.toRefArray().map((user) => user.id);
    const filterLabelIds = this.board.filterLabels.toRefArray().map((label) => label.id);
    const { searchParams } = this.board;
    return filterUserIds.length > 0 || filterLabelIds.length > 0 || searchParams.query !== '' || searchParams.dueDate !== null;
    // TODO merge with IsFilteredForBoard
  }

  getFilteredOrderedCardsModelArray() {
    let cardModels = this.getOrderedCardsQuerySet().toModelArray();
    cardModels.forEach((cardModel) => {
      // eslint-disable-next-line no-param-reassign
      cardModel.tasksUsers = cardModel.tasks.toModelArray().flatMap((task) => task.users.toRefArray()); // TODO include tasksUsers in the model
    });

    const filterUserIds = this.board.filterUsers.toRefArray().map((user) => user.id);
    const filterLabelIds = this.board.filterLabels.toRefArray().map((label) => label.id);
    const { searchParams } = this.board;

    if (searchParams.anyMatch) {
      if (filterUserIds.length > 0) {
        cardModels = cardModels.filter((cardModel) => {
          const users = cardModel.users.toRefArray();
          const taskUsers = cardModel.tasksUsers;
          return users.some((user) => filterUserIds.includes(user.id)) || taskUsers.some((user) => filterUserIds.includes(user.id));
        });
      }
      if (filterLabelIds.length > 0) {
        cardModels = cardModels.filter((cardModel) => {
          const labels = cardModel.labels.toRefArray();
          return labels.some((label) => filterLabelIds.includes(label.id));
        });
      }
      if (searchParams.query !== '') {
        if (searchParams.matchCase) {
          cardModels = cardModels.filter((cardModel) => cardModel.name.includes(searchParams.query));
        } else {
          cardModels = cardModels.filter((cardModel) => cardModel.name.toLowerCase().includes(searchParams.query.toLowerCase()));
        }
      }
    } else {
      cardModels = cardModels.filter((cardModel) => {
        const cardUserIds = cardModel.users.toRefArray().map((user) => user.id);
        const taskUserIds = cardModel.tasksUsers.map((user) => user.id);
        const cardLabelIds = cardModel.labels.toRefArray().map((label) => label.id);

        const matchesLabels = filterLabelIds.length === 0 || filterLabelIds.every((labelId) => cardLabelIds.includes(labelId));
        const matchesUsers = filterUserIds.length === 0 || filterUserIds.every((userId) => cardUserIds.includes(userId) || taskUserIds.includes(userId));
        let matchesSearch = true;
        if (searchParams.query !== '') {
          if (searchParams.matchCase) {
            matchesSearch = cardModel.name.includes(searchParams.query);
          } else {
            matchesSearch = cardModel.name.toLowerCase().includes(searchParams.query.toLowerCase());
          }
        }
        return matchesLabels && matchesUsers && matchesSearch;
      });
    }
    if (searchParams.dueDate) {
      cardModels = cardModels.filter((cardModel) => {
        if (!cardModel.dueDate) return false;
        if (searchParams.justSelectedDay) {
          const due = cardModel.dueDate;
          const filterDue = searchParams.dueDate;
          return due.getFullYear() === filterDue.getFullYear() && due.getMonth() === filterDue.getMonth() && due.getDate() === filterDue.getDate();
        }
        return cardModel.dueDate <= searchParams.dueDate;
      });
    }
    return cardModels;
  }

  deleteRelated() {
    this.cards.toModelArray().forEach((cardModel) => {
      cardModel.deleteWithRelated();
    });
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
