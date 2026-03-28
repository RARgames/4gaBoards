// eslint-disable-next-line import-x/prefer-default-export
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
