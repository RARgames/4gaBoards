module.exports = {
  async fn() {
    const connections = await sails.helpers.calendarConnections.getMany();

    return {
      items: connections.map((connection) => sails.helpers.calendarConnections.presentOne(connection)),
      available: sails.helpers.integrations.google.getConfig().available,
    };
  },
};
