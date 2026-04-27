import { getIsHyperDXEnabled, trackHyperDXAction } from './hyperdx-init';

// HyperDX - Redux middleware for tracking failed actions
const createHyperDXMiddleware = () => () => (next) => (action) => {
  const result = next(action);

  if (!getIsHyperDXEnabled()) {
    return result;
  }

  if (action.type && typeof action.type === 'string') {
    const isFailureAction = action.type.endsWith('__FAILURE');

    if (isFailureAction) {
      const actionMetadata = {
        actionType: action.type,
        timestamp: new Date().toISOString(),
      };

      if (action.payload && typeof action.payload === 'object') {
        if (action.payload.error) {
          const { error } = action.payload;
          actionMetadata.errorMessage = error.message || String(error);
          actionMetadata.errorCode = error.code;
        }
      }

      trackHyperDXAction(action.type, actionMetadata);
    }
  }

  return result;
};

export default createHyperDXMiddleware;
