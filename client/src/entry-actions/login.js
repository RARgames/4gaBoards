import EntryActionTypes from '../constants/EntryActionTypes';

const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

const authenticateSso = (provider, method) => ({
  type: EntryActionTypes.AUTHENTICATE_SSO,
  payload: {
    provider,
    method,
  },
});

const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

const registerOpen = () => ({
  type: EntryActionTypes.REGISTER_OPEN,
  payload: {},
});

const loginOpen = () => ({
  type: EntryActionTypes.LOGIN_OPEN,
  payload: {},
});

const register = (data) => ({
  type: EntryActionTypes.REGISTER,
  payload: {
    data,
  },
});

const clearRegisterError = () => ({
  type: EntryActionTypes.REGISTER_ERROR_CLEAR,
  payload: {},
});

export default {
  authenticate,
  authenticateSso,
  clearAuthenticateError,
  registerOpen,
  loginOpen,
  register,
  clearRegisterError,
};
