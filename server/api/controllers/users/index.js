module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const users = await sails.helpers.users.getMany();
    const sanitizedUsers = await sails.helpers.users.sanitize(users, currentUser);

    return { items: sanitizedUsers };
  },
};
