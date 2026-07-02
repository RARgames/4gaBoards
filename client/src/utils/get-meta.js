export default (model) => ({
  createdBy: model.createdBy?.ref || undefined,
  updatedBy: model.updatedBy?.ref || undefined,
  completedBy: model.completedBy?.ref || undefined,
});
