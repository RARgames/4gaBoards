const Errors = {
  CHART_VIEW_NOT_FOUND: {
    chartViewNotFound: 'Chart view not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    config: {
      type: 'json',
    },
    position: {
      type: 'number',
    },
  },

  exits: {
    chartViewNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const chartView = await sails.helpers.chartViews.getOne(inputs.id);

    if (!chartView) {
      throw Errors.CHART_VIEW_NOT_FOUND;
    }

    const { isAdmin, isManager } = await sails.helpers.projects.getMembershipContext.with({ projectId: chartView.projectId, currentUser });

    if (!isAdmin && !isManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'config', 'position']);

    const updatedChartView = await sails.helpers.chartViews.updateOne.with({
      record: chartView,
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: updatedChartView,
    };
  },
};
