import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

// Membership rows are keyed by (cardId, userId) instead of the server id so optimistic
// rows and their server-confirmed counterparts collapse into a single record.
const buildId = (cardId, userId) => `${cardId}:${userId}`;

const upsertFromApi = (CardMembership, { cardId, userId, createdAt }) => {
  CardMembership.upsert({
    id: buildId(cardId, userId),
    cardId,
    userId,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
  });
};

const deleteById = (CardMembership, cardId, userId) => {
  const membershipModel = CardMembership.withId(buildId(cardId, userId));

  if (membershipModel) {
    membershipModel.delete();
  }
};

// Mirrors every card-membership mutation in the Card model's reducer. The Card model keeps
// its plain users many-to-many for all existing consumers; this model exists to preserve
// membership creation time, which determines a card's swimlane (most recent member wins).
export default class extends BaseModel {
  static modelName = 'CardMembership';

  static fields = {
    id: attr(),
    createdAt: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'memberships',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'cardMemberships',
    }),
  };

  static reducer({ type, payload }, CardMembership) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.cardMemberships) {
          const cardIds = new Set(payload.cardMemberships.map(({ cardId }) => cardId));
          CardMembership.filter((membership) => cardIds.has(membership.cardId)).delete();

          payload.cardMemberships.forEach((cardMembership) => {
            upsertFromApi(CardMembership, cardMembership);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        CardMembership.all().delete();

        if (payload.cardMemberships) {
          payload.cardMemberships.forEach((cardMembership) => {
            upsertFromApi(CardMembership, cardMembership);
          });
        }

        break;
      case ActionTypes.USER_TO_CARD_ADD:
        upsertFromApi(CardMembership, {
          cardId: payload.cardId,
          userId: payload.id,
        });

        break;
      case ActionTypes.USER_TO_CARD_ADD__SUCCESS:
      case ActionTypes.USER_TO_CARD_ADD_HANDLE:
        upsertFromApi(CardMembership, payload.cardMembership);

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE:
        deleteById(CardMembership, payload.cardId, payload.id);

        break;
      case ActionTypes.USER_FROM_CARD_REMOVE__SUCCESS:
      case ActionTypes.USER_FROM_CARD_REMOVE_HANDLE:
        deleteById(CardMembership, payload.cardMembership.cardId, payload.cardMembership.userId);

        break;
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.cardMemberships.forEach((cardMembership) => {
          upsertFromApi(CardMembership, cardMembership);
        });

        break;
      case ActionTypes.CARD_DELETE:
        CardMembership.filter((membership) => membership.cardId === payload.id).delete();

        break;
      case ActionTypes.CARD_DELETE__SUCCESS:
      case ActionTypes.CARD_DELETE_HANDLE:
        CardMembership.filter((membership) => membership.cardId === payload.card.id).delete();

        break;
      default:
    }
  }
}
