const skipMetadataKeys = ['createdById', 'updatedById', 'updatedAt'];

module.exports = function sanitizeItem(item, skipMetadata) {
  if (!skipMetadata) return item;

  const clonedItem = { ...item };
  skipMetadataKeys.forEach((key) => {
    delete clonedItem[key];
  });
  return clonedItem;
};
