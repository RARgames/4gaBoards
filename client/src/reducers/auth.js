import ActionTypes from '../constants/ActionTypes';
import { getAccessToken } from '../utils/access-token-storage';

const initialState = {
  accessToken: getAccessToken(),
  userId: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.AUTHENTICATE__SUCCESS:
    case ActionTypes.AUTHENTICATE_GOOGLE_SSO__SUCCESS:
    case ActionTypes.AUTHENTICATE_GITHUB_SSO__SUCCESS:
    case ActionTypes.AUTHENTICATE_MICROSOFT_SSO__SUCCESS:
    case ActionTypes.REGISTER__SUCCESS:
      return {
        ...state,
        accessToken: payload.accessToken,
      };
    case ActionTypes.SOCKET_RECONNECT_HANDLE:
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        userId: payload.user.id,
      };
    case ActionTypes.USER_PASSWORD_UPDATE__SUCCESS:
      if (payload.accessToken) {
        return {
          ...state,
          accessToken: payload.accessToken,
        };
      }

      return state;
    default:
      return state;
  }
};
