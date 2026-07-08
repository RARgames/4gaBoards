// Resolves the optional project/card link for a time entry, deriving the project from the
// card's board when a card is given (a card always wins over a separately-supplied projectId),
// and checking the current user can actually access whatever gets linked.

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  exits: {
    projectNotFound: {},
    cardNotFound: {},
    notEnoughRights: {},
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    let card = null;
    let project = null;

    if (inputs.cardId) {
      ({ card, project } = await sails.helpers.cards.getProjectPath(inputs.cardId).intercept('pathNotFound', () => 'cardNotFound'));
    } else if (inputs.projectId) {
      project = await Project.findOne(inputs.projectId);

      if (!project) {
        throw 'projectNotFound';
      }
    }

    if (project) {
      const { isAdmin, isManager, isMember } = await sails.helpers.projects.getMembershipContext.with({ projectId: project.id, currentUser });

      if (!isAdmin && !isManager && !isMember) {
        throw 'notEnoughRights';
      }
    }

    return { project, card };
  },
};
