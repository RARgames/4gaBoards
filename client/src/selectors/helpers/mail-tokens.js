// eslint-disable-next-line import-x/prefer-default-export
export const getMailTokens = (model, currentUserId) =>
  model.getOrderedMailTokensModelArray().map((mailTokenModel) => ({
    ...mailTokenModel.ref,
    user: mailTokenModel.user?.ref || null,
    isCurrentUser: mailTokenModel.userId === currentUserId,
  }));
