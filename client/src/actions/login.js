import ActionTypes from '../constants/ActionTypes';

const fetchSsoEnabled = (googleSsoEnabled) => ({
  type: ActionTypes.FETCH_SSO_ENABLED,
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
  type: ActionTypes.AUTHENTICATE_GOOGLE_SSO,
  payload: {},
});

authenticateGoogleSso.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE_GOOGLE_SSO__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateGoogleSso.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE_GOOGLE_SSO__FAILURE,
  payload: {
    error,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  fetchSsoEnabled,
  authenticate,
  authenticateGoogleSso,
  clearAuthenticateError,
};
