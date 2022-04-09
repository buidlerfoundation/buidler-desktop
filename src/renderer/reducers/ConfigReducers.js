import actionTypes from 'renderer/actions/ActionTypes';

const initialState = {
  privateKey: '',
  seed: '',
};

const configReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: payload,
      };
    }
    case actionTypes.SET_SEED_PHRASE: {
      return {
        ...state,
        seed: payload,
      };
    }
    case actionTypes.REMOVE_SEED_PHRASE: {
      return {
        ...state,
        seed: '',
      };
    }
    case actionTypes.LOGOUT: {
      return {
        privateKey: '',
        seed: '',
      };
    }
    default:
      return state;
  }
};

export default configReducers;
