module.exports = {
  async fn() {
    const { currentUser } = this.req;
    const projectMemberships = await sails.helpers.projectMemberships.getMany({ userId: currentUser.id });

    return {
      items: projectMemberships,
    };
  },
};
