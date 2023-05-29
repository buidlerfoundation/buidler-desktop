import { AnyAction, Reducer } from 'redux';
import actionTypes from 'renderer/actions/ActionTypes';

interface ConfigReducerState {
  privateKey: string;
  seed: string;
  channelPrivateKey: { [key: string]: any };
  openOTP: boolean;
  requestOtpCode: string;
  dataFromUrl: {
    invitationId: string;
    invitationRef?: string;
  };
  isFullScreen: boolean;
  somethingWrong?: boolean | null;
  isOpenModalConfirmSignMessage: boolean;
  internetConnection?: boolean;
  loginType?: string;
  venomKey?: {
    publicKey?: string;
    address?: string;
    secret?: string;
  };
}

const initialState: ConfigReducerState = {
  privateKey: '',
  seed: '',
  channelPrivateKey: {},
  openOTP: false,
  requestOtpCode: '',
  dataFromUrl: {
    invitationId: '',
  },
  isFullScreen: false,
  somethingWrong: null,
  isOpenModalConfirmSignMessage: false,
  internetConnection: true,
  loginType: '',
  venomKey: {
    publicKey: '',
    address: '',
    secret: '',
  },
};

const configReducers: Reducer<ConfigReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_VENOM_KEY: {
      return {
        ...state,
        venomKey: payload,
      };
    }
    case actionTypes.UPDATE_LOGIN_TYPE: {
      return {
        ...state,
        loginType: payload,
      };
    }
    case actionTypes.UPDATE_INTERNET_CONNECTION: {
      return {
        ...state,
        internetConnection: payload,
      };
    }
    case actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE: {
      return {
        ...state,
        isOpenModalConfirmSignMessage: payload,
      };
    }
    case actionTypes.SOMETHING_WRONG: {
      return {
        ...state,
        somethingWrong: true,
      };
    }
    case actionTypes.UPDATE_FULL_SCREEN: {
      return {
        ...state,
        isFullScreen: payload,
      };
    }
    case actionTypes.SET_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: payload,
      };
    }
    case actionTypes.REMOVE_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: {
          invitationId: '',
        },
      };
    }
    case actionTypes.TOGGLE_OTP: {
      return {
        ...state,
        openOTP: payload?.open != null ? payload?.open : !state.openOTP,
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
        ...initialState,
        dataFromUrl: state.dataFromUrl,
      };
    }
    default:
      return state;
  }
};

export default configReducers;
