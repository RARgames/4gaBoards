module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const apiClients = await sails.helpers.apiClients.getMany({
      userId: currentUser.id,
      deletedAt: null,
    });

    return {
      items: apiClients,
    };
  },
};
