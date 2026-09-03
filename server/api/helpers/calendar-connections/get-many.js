module.exports = {
  async fn() {
    return CalendarConnection.find().sort('id ASC');
  },
};
