import actionTypes from 'renderer/actions/ActionTypes';

const initialState = {
  privateKey: '',
  seed: '',
  channelPrivateKey: {},
  openOTP: false,
  requestOtpCode: '',
};

const configReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.TOGGLE_OTP: {
      return {
        ...state,
        openOTP: state.open != null ? state.open : !state.openOTP,
        requestOtpCode: payload?.otp || '',
      };
    }
    case actionTypes.SET_CHANNEL_PRIVATE_KEY: {
      return {
        ...state,
        channelPrivateKey: payload,
      };
    }
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
    case actionTypes.REMOVE_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: '',
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
