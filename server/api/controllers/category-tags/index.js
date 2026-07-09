module.exports = {
  async fn() {
    const categoryTags = await sails.helpers.categoryTags.getMany({});

    return {
      items: categoryTags,
    };
  },
};
