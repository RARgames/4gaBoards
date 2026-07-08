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

    const deletedChartView = await sails.helpers.chartViews.deleteOne.with({
      record: chartView,
      request: this.req,
    });

    return {
      item: deletedChartView,
    };
  },
};
