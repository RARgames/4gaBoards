import { attr, fk, many, oneToOne } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import { ActivityTypes, ActivityScopes } from '../constants/Enums';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Card';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    description: attr(),
    dueDate: attr(),
    timer: attr(),
    commentCount: attr({
      getDefault: () => 0,
    }),
    isSubscribed: attr({
      getDefault: () => false,
    }),
    isCommentsFetching: attr({
      getDefault: () => false,
    }),
    isAllCommentsFetched: attr({
      getDefault: () => false,
    }),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => false,
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'cards',
    }),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'cards',
    }),
    coverAttachmentId: oneToOne({
      to: 'Attachment',
      as: 'coverAttachment',
      relatedName: 'coveredCard',
    }),
    users: many('User', 'cards'),
    labels: many('Label', 'cards'),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdCards',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedCards',
    }),
  };

  static reducer({ type, payload }, Card) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.cards) {
          payload.cards.forEach((card) => {
            Card.upsert(card);
          });
        }

        if (payload.cardMemberships) {
          const cardIds = new Set(payload.cardMemberships.map(({ cardId }) => cardId));
          cardIds.forEach((cardId) => {
            Card.withId(cardId).deleteUsers();
          });

          payload.cardMemberships.forEach(({ cardId, userId }) => {
            Card.withId(cardId).users.add(userId);
          });
        }

        if (payload.cardLabels) {
          const cardIds = new Set(payload.cardLabels.map(({ cardId }) => cardId));
          cardIds.forEach((cardId) => {
            Card.withId(cardId).deleteLabels();
          });

          payload.cardLabels.forEach(({ cardId, labelId }) => {
            Card.withId(cardId).labels.add(labelId);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Card.all()
          .toModelArray()
          .forEach((cardModel) => {
            cardModel.deleteWithClearable();
          });

        if (payload.cards) {
          payload.cards.forEach((card) => {
            Card.upsert(card);
          });
        }

        if (payload.cardMemberships) {
          payload.cardMemberships.forEach(({ cardId, userId }) => {
            Card.withId(cardId).users.add(userId);
          });
        }

        if (payload.cardLabels) {
          payload.cardLabels.forEach(({ cardId, labelId }) => {
            Card.withId(cardId).labels.add(labelId);
          });
        }

        break;
      case ActionTypes.USER_TO_TASK_ADD: {
        if (payload.isCurrent) {
          const cardModel = Card.withId(payload.cardId);
          cardModel.isSubscribed = true;
        }

        break;
      }
      case ActionTypes.USER_TO_CARD_ADD: {
        const cardModel = Card.withId(payload.cardId);
        cardModel.users.add(payload.id);

        if (payload.isCurrent) {
          cardModel.isSubscribed = true;
        }

        break;
      }
      case ActionTypes.USER_TO_CARD_ADD__SUCCESS:
      case ActionTypes.USER_TO_CARD_ADD_HANDLE:
        try {
          Card.withId(payload.cardMembership.cardId).users.add(payload.cardMembership.userId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).users.remove(payload.id);

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE__SUCCESS:
      case ActionTypes.USER_FROM_CARD_REMOVE_HANDLE:
        try {
          Card.withId(payload.cardMembership.cardId).users.remove(payload.cardMembership.userId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.LABEL_TO_CARD_ADD:
        Card.withId(payload.cardId).labels.add(payload.id);

        break;
      case ActionTypes.LABEL_TO_CARD_ADD__SUCCESS:
      case ActionTypes.LABEL_TO_CARD_ADD_HANDLE:
        try {
          Card.withId(payload.cardLabel.cardId).labels.add(payload.cardLabel.labelId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.LABEL_FROM_CARD_REMOVE:
        Card.withId(payload.cardId).labels.remove(payload.id);

        break;
      case ActionTypes.LABEL_FROM_CARD_REMOVE__SUCCESS:
      case ActionTypes.LABEL_FROM_CARD_REMOVE_HANDLE:
        try {
          Card.withId(payload.cardLabel.cardId).labels.remove(payload.cardLabel.labelId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.CARD_CREATE:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_UPDATE__SUCCESS:
      case ActionTypes.CARD_UPDATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE:
      case ActionTypes.CARD_DUPLICATE_HANDLE:
        Card.upsert(payload.card);
        break;
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        Card.upsert(payload.card);
        payload.cardLabels.forEach((label) => {
          Card.withId(payload.card.id).labels.add(label.labelId);
        });
        payload.cardMemberships.forEach((member) => {
          Card.withId(payload.card.id).users.add(member.userId);
        });
        Card.withId(payload.card.id).update({ coverAttachmentId: payload.coverAttachmentId });
        break;
      case ActionTypes.CARD_CREATE__SUCCESS:
        Card.withId(payload.localId).delete();
        Card.upsert(payload.card);

        break;
      case ActionTypes.CARD_UPDATE:
        Card.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CARD_DELETE:
        Card.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.CARD_DELETE__SUCCESS:
      case ActionTypes.CARD_DELETE_HANDLE: {
        const cardModel = Card.withId(payload.card.id);

        if (cardModel) {
          cardModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH:
        Card.withId(payload.cardId).update({
          isCommentsFetching: true,
        });

        break;
      case ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH__SUCCESS:
        Card.withId(payload.cardId).update({
          isCommentsFetching: false,
          isAllCommentsFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
        });

        break;
      case ActionTypes.ACTIVITIES_CARD_FETCH:
        Card.withId(payload.cardId).update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_CARD_FETCH__SUCCESS:
        Card.withId(payload.cardId).update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
        });

        break;
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.cards.forEach((card) => {
          Card.upsert(card);
        });

        break;
      default:
    }
  }

  getOrderedTasksQuerySet() {
    return this.tasks.orderBy('position');
  }

  getOrderedAttachmentsQuerySet() {
    return this.attachments.orderBy('createdAt', true);
  }

  getAttachmentsCount() {
    return this.attachments.count();
  }

  getOrderedCardCommentsQuerySet() {
    return this.activities.filter({ type: ActivityTypes.CARD_COMMENT }).orderBy('createdAt', false);
  }

  getOrderedCardActivitiesQuerySet() {
    return this.activities.filter((activity) => activity.type !== ActivityTypes.CARD_COMMENT).orderBy('createdAt', false);
  }

  getOrderedTaskActivitiesQuerySet() {
    return this.activities.filter((activity) => activity.scope === ActivityScopes.TASK).orderBy('createdAt', false);
  }

  getOrderedAttachmentActivitiesQuerySet() {
    return this.activities.filter((activity) => activity.scope === ActivityScopes.ATTACHMENT).orderBy('createdAt', false);
  }

  getOrderedCommentActivitiesQuerySet() {
    return this.activities.filter((activity) => activity.scope === ActivityScopes.COMMENT).orderBy('createdAt', false);
  }

  getOrderedCardActivitiesFullQuerySet() {
    return this.activities.orderBy('createdAt', false);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications.filter({
      isRead: false,
      deletedAt: null,
    });
  }

  isAvailableForUser(userId) {
    return this.board && this.board.isAvailableForUser(userId);
  }

  deleteUsers() {
    this.users.clear();
  }

  deleteLabels() {
    this.labels.clear();
  }

  deleteClearable() {
    this.deleteUsers();
    this.deleteLabels();
  }

  deleteActivities() {
    this.activities.toModelArray().forEach((activityModel) => {
      if (activityModel.notification) {
        activityModel.update({
          isInCard: false,
        });
      } else {
        activityModel.delete();
      }
    });
  }

  deleteRelated() {
    this.deleteClearable();
    this.tasks.delete();
    this.attachments.delete();
    this.deleteActivities();
  }

  deleteWithClearable() {
    this.deleteClearable();
    this.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
