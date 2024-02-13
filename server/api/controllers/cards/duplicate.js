module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);
    const { list } = await sails.helpers.lists.getProjectPath(card.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.omit(card, ['id']); // Omit the id to create a new card
    const copiedCard = await sails.helpers.cards.createOne
      .with({
        values: {
          ...values,
          list,
          creatorUser: currentUser,
        },
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    if (!copiedCard) {
      throw Errors.CARD_NOT_FOUND;
    }

    const cardLabels = await CardLabel.find({ cardId: card.id });
    const subscriptionUsers = await CardSubscription.find({ cardId: card.id });
    const memberUsers = await CardMembership.find({ cardId: card.id });
    const tasks = await Task.find({ cardId: card.id });
    const attachments = await Attachment.find({ cardId: card.id });
    const actions = await Action.find({ cardId: card.id });
    const coverAttachment = attachments.find((attachment) => attachment.id === card.coverAttachmentId);
    const coverAttachmentDirname = coverAttachment != null ? coverAttachment.dirname : undefined;

    const copiedItemsPromises = [
      ...cardLabels.map((cardLabel) => CardLabel.create({ cardId: copiedCard.id, labelId: cardLabel.labelId })),
      ...subscriptionUsers.map((subscriptionUser) => CardSubscription.create({ ..._.omit(subscriptionUser, ['id']), cardId: copiedCard.id })),
      ...memberUsers.map((memberUser) => CardMembership.create({ ..._.omit(memberUser, ['id']), cardId: copiedCard.id })),
      ...tasks.map((task) => Task.create({ ..._.omit(task, ['id']), cardId: copiedCard.id })),
      ...attachments.map((attachment) => Attachment.create({ ..._.omit(attachment, ['id']), cardId: copiedCard.id, createdAt: attachment.createdAt })),
      ...actions.map((action) => Action.create({ ..._.omit(action, ['id']), cardId: copiedCard.id, createdAt: action.createdAt })),
    ];

    await Promise.all(copiedItemsPromises);

    const createdLabels = await sails.helpers.cards.getCardLabels(card.id);
    const createdMemberships = await sails.helpers.cards.getCardMemberships(card.id);
    const createdTasks = await sails.helpers.cards.getTasks(copiedCard.id);
    const createdActions = await sails.helpers.cards.getActions(copiedCard.id);
    const createdAttachments = await sails.helpers.cards.getAttachments(copiedCard.id);
    const createdCoverAttachment = await createdAttachments.find((attachment) => attachment.dirname === coverAttachmentDirname);
    const createdCoverAttachmentId = createdCoverAttachment != null ? createdCoverAttachment.id : undefined;
    await Card.updateOne({ id: copiedCard.id }).set({ coverAttachmentId: createdCoverAttachmentId });

    return {
      item: copiedCard,
      included: {
        cardLabels: createdLabels,
        cardMemberships: createdMemberships,
        tasks: createdTasks,
        attachments: createdAttachments,
        actions: createdActions,
        coverAttachmentId: createdCoverAttachmentId,
      },
    };
  },
};
