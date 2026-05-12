module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const templates = await sails.helpers.boardTemplates.getMany({
      where: {
        or: [{ createdById: currentUser.id }, { isGlobal: true }],
      },
    });

    return {
      items: templates,
    };
  },
};
