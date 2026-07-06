import { createSelector } from 'redux-orm';

import orm from '../orm';

// Pull the linked card's name + board context for a link. For same-board links the
// linked Card is in redux-orm and we read from there. For cross-board links the linked
// Card is NOT in the local store, so we fall back to denormalized fields the server
// added to the CardLink payload (`linkedCardName`, `linkedCardBoardId`, `linkedCardBoardName`).
const resolveLinkedSide = (linkModel) => {
  const ref = linkModel.ref || {};
  const linkedFromOrm = linkModel.linkedCard; // populated for same-board links
  const ormName = linkedFromOrm ? linkedFromOrm.name : null;
  const ormBoardId = linkedFromOrm ? linkedFromOrm.boardId : null;
  return {
    linkedCardId: linkModel.linkedCardId,
    linkedCardName: ref.linkedCardName != null ? ref.linkedCardName : ormName,
    linkedCardBoardId: ref.linkedCardBoardId != null ? ref.linkedCardBoardId : ormBoardId,
    linkedCardBoardName: ref.linkedCardBoardName != null ? ref.linkedCardBoardName : null,
  };
};

const resolveSourceSide = (linkModel) => {
  const ref = linkModel.ref || {};
  const cardFromOrm = linkModel.card;
  const ormName = cardFromOrm ? cardFromOrm.name : null;
  const ormBoardId = cardFromOrm ? cardFromOrm.boardId : null;
  return {
    cardId: linkModel.cardId,
    cardName: ref.cardName != null ? ref.cardName : ormName,
    cardBoardId: ref.cardBoardId != null ? ref.cardBoardId : ormBoardId,
    cardBoardName: ref.cardBoardName != null ? ref.cardBoardName : null,
  };
};

// Outgoing: links the user added on this card. Each row carries enough info to render
// the linked card's pill, including cross-board context when applicable.
export const makeSelectOutgoingLinksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.outgoingLinks
        .toModelArray()
        .map((link) => ({
          id: link.id,
          type: link.type,
          ...resolveLinkedSide(link),
        }))
        .filter((row) => !!row.linkedCardName);
    },
  );

export const selectOutgoingLinksByCardId = makeSelectOutgoingLinksByCardId();

// Incoming: links other cards added that point at this card (rendered as the inverse phrasing).
export const makeSelectIncomingLinksByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return [];
      }
      return cardModel.incomingLinks
        .toModelArray()
        .map((link) => ({
          id: link.id,
          type: link.type,
          ...resolveSourceSide(link),
        }))
        .filter((row) => !!row.cardName);
    },
  );

export const selectIncomingLinksByCardId = makeSelectIncomingLinksByCardId();

// Whether the card should show the "blocked" indicator: it declares a blocker
// (outgoing blockedBy) OR appears as a blocker on someone else's card (incoming blockedBy).
export const makeSelectIsBlockedByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);
      if (!cardModel) {
        return false;
      }
      return cardModel.outgoingLinks.toRefArray().some((link) => link.type === 'blockedBy') || cardModel.incomingLinks.toRefArray().some((link) => link.type === 'blockedBy');
    },
  );

export const selectIsBlockedByCardId = makeSelectIsBlockedByCardId();

export default {
  makeSelectOutgoingLinksByCardId,
  selectOutgoingLinksByCardId,
  makeSelectIncomingLinksByCardId,
  selectIncomingLinksByCardId,
  makeSelectIsBlockedByCardId,
  selectIsBlockedByCardId,
};
