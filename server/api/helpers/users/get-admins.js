module.exports = {
  async fn() {
    const users = await sails.helpers.users.getMany({
      isAdmin: true,
    });

    return users;
  },
};
