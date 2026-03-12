// eslint-disable-next-line import/prefer-default-export
export const transformApiClient = (apiClient) => ({
  ...apiClient,
  ...(apiClient.createdAt && {
    createdAt: new Date(apiClient.createdAt),
  }),
  ...(apiClient.updatedAt && {
    updatedAt: new Date(apiClient.updatedAt),
  }),
  ...(apiClient.lastUsedAt && {
    lastUsedAt: new Date(apiClient.lastUsedAt),
  }),
});
