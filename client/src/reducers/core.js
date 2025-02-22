import ActionTypes from '../constants/ActionTypes';
import ModalTypes from '../constants/ModalTypes';
import { LOCATION_CHANGE_HANDLE } from '../lib/redux-router';

const initialState = {
  isInitializing: true,
  isLogouting: false,
  currentModal: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LOCATION_CHANGE_HANDLE:
    case ActionTypes.MODAL_CLOSE:
      return {
        ...state,
        currentModal: null,
      };
    case ActionTypes.CORE_INITIALIZE:
      return {
        ...state,
        isInitializing: false,
      };
    case ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE:
      return {
        ...state,
        isLogouting: true,
      };
    case ActionTypes.MODAL_OPEN:
      return {
        ...state,
        currentModal: payload.type,
      };
    case ActionTypes.PROJECT_MANAGER_DELETE:
    case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE:
      if (state.currentModal === ModalTypes.PROJECT_SETTINGS && payload.isCurrentUser && payload.isCurrentProject) {
        return {
          ...state,
          currentModal: null,
        };
      }

      return state;
    default:
      return state;
  }
};
