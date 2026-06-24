module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    isCompleted: {
      type: 'boolean',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, record, isCompleted, board, list, request } = inputs;

    let targetList;
    if (isCompleted) {
      [targetList] = await List.find({ boardId: board.id, isCompleted: true }).sort('position DESC').limit(1);

      if (!targetList) {
        const [lastList] = await List.find({ boardId: board.id }).sort('position DESC').limit(1);
        const nextPosition = (lastList?.position || 0) + sails.config.custom.positionGap;

        targetList = await sails.helpers.lists.createOne.with({
          values: {
            name: 'common.done',
            position: nextPosition,
            isCollapsed: false,
            isCompleted: true,
            board,
          },
          currentUser,
        });
      }
    } else {
      [targetList] = await List.find({ boardId: board.id, isCompleted: false }).sort('position').limit(1);
      if (!targetList) {
        targetList = await sails.helpers.lists.createOne.with({
          values: {
            name: 'common.open',
            position: 0,
            isCollapsed: false,
            isCompleted: false,
            board,
          },
          currentUser,
        });
      }
    }

    const prevCard = await Card.findOne(record.id);
    const prevList = list;

    const [lastCard] = await Card.find({ listId: targetList.id }).sort('position DESC').limit(1);
    const nextPosition = (lastCard?.position || 0) + sails.config.custom.positionGap;

    const card = await Card.updateOne(record.id).set({
      isCompleted,
      boardId: board.id,
      listId: targetList.id,
      position: nextPosition,
      updatedById: currentUser.id,
    });

    if (!card) {
      return card;
    }

    sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
      item: card,
    });

    await sails.helpers.actions.createOne.with({
      values: {
        card,
        prevCard,
        scope: Action.Scopes.CARD,
        type: isCompleted ? Action.Types.CARD_COMPLETE : Action.Types.CARD_UNCOMPLETE,
        data: {
          listFromId: prevList.id,
          listFromName: prevList.name,
          listToId: targetList.id,
          listToName: targetList.name,
          isCompleted,
        },
      },
      currentUser,
      request,
    });

    await sails.helpers.lists.updateMeta.with({ id: card.listId, currentUser });
    await sails.helpers.lists.updateMeta.with({ id: prevList.id, currentUser });

    return card;
  },
};
