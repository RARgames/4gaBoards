import ActionTypes from '../constants/ActionTypes';

const setGoogleLoginButton = (googleSsoEnabled) => ({
  type: ActionTypes.GOOGLE_SSO,
  payload: {
    googleSsoEnabled,
  },
});

const authenticate = (data) => ({
  type: ActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

authenticate.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticate.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE__FAILURE,
  payload: {
    error,
  },
});

const authenticateGoogleSso = () => ({
  type: ActionTypes.GOOGLE_SSO_AUTHENTICATE,
  payload: {},
});

authenticateGoogleSso.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateGoogleSso.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE__FAILURE,
  payload: {
    error,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  setGoogleLoginButton,
  authenticate,
  authenticateGoogleSso,
  clearAuthenticateError,
};
