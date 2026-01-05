import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Comment';

  static fields = {
    id: attr(),
    data: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'comments',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'comments',
    }),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => false,
    }),
    lastActivityId: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdComments',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedComments',
    }),
  };

  static reducer({ type, payload }, Comment) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Comment.all().delete();

        payload.comments.forEach((comment) => {
          Comment.upsert(comment);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.comments.forEach((comment) => {
          Comment.upsert(comment);
        });

        break;
      case ActionTypes.COMMENTS_IN_CARD_FETCH__SUCCESS:
        payload.comments.forEach((comment) => {
          Comment.upsert(comment);
        });

        break;
      case ActionTypes.COMMENT_CREATE:
      case ActionTypes.COMMENT_UPDATE__SUCCESS:
      case ActionTypes.COMMENT_CREATE_HANDLE:
      case ActionTypes.COMMENT_UPDATE_HANDLE:
      case ActionTypes.COMMENT_DELETE__FAILURE:
      case ActionTypes.COMMENT_UPDATE__FAILURE:
        Comment.upsert(payload.comment);

        break;
      case ActionTypes.COMMENT_CREATE__SUCCESS:
        Comment.withId(payload.localId).delete();
        Comment.upsert(payload.comment);

        break;
      case ActionTypes.COMMENT_CREATE__FAILURE:
        Comment.withId(payload.localId).delete();

        break;
      case ActionTypes.COMMENT_UPDATE:
        Comment.withId(payload.id).update({ data: payload.data });

        break;
      case ActionTypes.COMMENT_DELETE:
        Comment.withId(payload.id).delete();

        break;
      case ActionTypes.COMMENT_DELETE__SUCCESS:
      case ActionTypes.COMMENT_DELETE_HANDLE: {
        const commentModel = Comment.withId(payload.comment.id);
        if (commentModel) {
          commentModel.delete();
        }

        break;
      }
      case ActionTypes.ACTIVITIES_COMMENT_FETCH:
        Comment.withId(payload.commentId).update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_COMMENT_FETCH__SUCCESS:
        Comment.withId(payload.commentId).update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
          lastActivityId: payload.activities.length > 0 ? payload.activities[payload.activities.length - 1].id : Comment.withId(payload.commentId).lastActivityId,
        });

        break;
      default:
    }
  }

  getOrderedActivitiesQuerySet() {
    return this.activities.orderBy('createdAt', false);
  }
}
