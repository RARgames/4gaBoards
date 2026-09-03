module.exports = {
  sync: true,

  fn() {
    return sails.config.custom.googleCalendar;
  },
};
