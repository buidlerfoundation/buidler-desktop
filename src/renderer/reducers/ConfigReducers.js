import actionTypes from 'renderer/actions/ActionTypes';

const initialState = {
  privateKey: '',
};

const configReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_PRIVATE_KEY: {
      return {
        privateKey: payload,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        privateKey: '',
      };
    }
    default:
      return state;
  }
};

export default configReducers;
