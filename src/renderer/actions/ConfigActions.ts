import { Dispatch } from 'redux';
import actionTypes from './ActionTypes';
import VenomUtils from 'renderer/services/connectors/VenomUtils';

export const onUpdateKey =
  (payload: { privateKey: string; seed?: string }) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.SET_PRIVATE_KEY,
      payload: payload.privateKey,
    });
    if (payload.seed) {
      const venomKeyPair = await VenomUtils.deriveSignKeysFromSeed(
        payload.seed
      );
      const venomAddress = await VenomUtils.getWalletAddress(
        venomKeyPair.public
      );
      dispatch({
        type: actionTypes.SET_VENOM_KEY,
        payload: {
          publicKey: venomKeyPair.public,
          address: venomAddress,
          secret: venomKeyPair.secret,
        },
      });
    }
  };
