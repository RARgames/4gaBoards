module.exports = {
  async fn() {
    const linkedCalendars = await sails.helpers.linkedCalendars.getMany.with({});

    return {
      items: linkedCalendars.map((linkedCalendar) => sails.helpers.linkedCalendars.presentOne(linkedCalendar)),
    };
  },
};
