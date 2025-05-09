import ActionTypes from '../constants/ActionTypes';

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

const authenticateGithubSso = () => ({
  type: ActionTypes.AUTHENTICATE_GITHUB_SSO,
  payload: {},
});

authenticateGithubSso.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE_GITHUB_SSO__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateGithubSso.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE_GITHUB_SSO__FAILURE,
  payload: {
    error,
  },
});

const authenticateMicrosoftSso = () => ({
  type: ActionTypes.AUTHENTICATE_MICROSOFT_SSO,
  payload: {},
});

authenticateMicrosoftSso.success = (accessToken) => ({
  type: ActionTypes.AUTHENTICATE_MICROSOFT_SSO__SUCCESS,
  payload: {
    accessToken,
  },
});

authenticateMicrosoftSso.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE_MICROSOFT_SSO__FAILURE,
  payload: {
    error,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

const registerOpen = () => ({
  type: ActionTypes.REGISTER_OPEN,
  payload: {},
});

const loginOpen = () => ({
  type: ActionTypes.LOGIN_OPEN,
  payload: {},
});

const register = (data) => ({
  type: ActionTypes.REGISTER,
  payload: {
    data,
  },
});

register.success = (accessToken) => ({
  type: ActionTypes.REGISTER__SUCCESS,
  payload: {
    accessToken,
  },
});

register.failure = (error) => ({
  type: ActionTypes.REGISTER__FAILURE,
  payload: {
    error,
  },
});

const clearRegisterError = () => ({
  type: ActionTypes.REGISTER_ERROR_CLEAR,
  payload: {},
});

export default {
  authenticate,
  authenticateGoogleSso,
  authenticateGithubSso,
  authenticateMicrosoftSso,
  clearAuthenticateError,
  registerOpen,
  loginOpen,
  register,
  clearRegisterError,
};
