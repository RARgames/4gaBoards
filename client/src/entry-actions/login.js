import EntryActionTypes from '../constants/EntryActionTypes';

const authenticate = (data) => ({
  type: EntryActionTypes.AUTHENTICATE,
  payload: {
    data,
  },
});

const authenticateGoogleSso = () => ({
  type: EntryActionTypes.AUTHENTICATE_GOOGLE_SSO,
  payload: {},
});

const clearAuthenticateError = () => ({
  type: EntryActionTypes.AUTHENTICATE_ERROR_CLEAR,
  payload: {},
});

export default {
  authenticate,
  authenticateGoogleSso,
  clearAuthenticateError,
};
