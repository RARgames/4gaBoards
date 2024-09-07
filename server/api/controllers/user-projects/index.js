module.exports = {
  async fn() {
    const { currentUser } = this.req;
    const userProjects = await sails.helpers.userProjects.getMany({ userId: currentUser.id });

    return {
      items: userProjects,
    };
  },
};
