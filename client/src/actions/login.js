import ActionTypes from '../constants/ActionTypes';

const authenticate = (data) => ({
  type: ActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

authenticate.success = () => ({
  type: ActionTypes.AUTHENTICATE__SUCCESS,
  payload: {},
});

authenticate.failure = (error) => ({
  type: ActionTypes.AUTHENTICATE__FAILURE,
  payload: {
    error,
  },
});

const clearAuthenticateError = () => ({
  type: ActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

const authenticateSso = (provider, method) => ({
  type: ActionTypes.AUTHENTICATE_SSO,
  payload: {
    provider,
    method,
  },
});

authenticateSso.success = (provider) => ({
  type: ActionTypes.AUTHENTICATE_SSO__SUCCESS,
  payload: {
    provider,
  },
});

authenticateSso.failure = (provider, error) => ({
  type: ActionTypes.AUTHENTICATE_SSO__FAILURE,
  payload: {
    provider,
    error,
  },
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

register.success = () => ({
  type: ActionTypes.REGISTER__SUCCESS,
  payload: {},
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
  clearAuthenticateError,
  authenticateSso,
  registerOpen,
  loginOpen,
  register,
  clearRegisterError,
};
