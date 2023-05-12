import React, { memo, useCallback, useState } from 'react';
import './index.scss';
import images from 'renderer/common/images';
import ModalImportSeedPhrase from 'renderer/shared/ModalImportSeedPhrase';
import { encryptString, getIV } from 'renderer/utils/DataCrypto';
import { isValidPrivateKey } from 'renderer/helpers/SeedHelper';
import { ethers, utils } from 'ethers';
import { setCookie } from 'renderer/common/Cookie';
import { AsyncKey, LoginType } from 'renderer/common/AppConfig';
import useAppDispatch from 'renderer/hooks/useAppDispatch';
import actionTypes from 'renderer/actions/ActionTypes';
import api from 'renderer/api';
import { getPrivateChannel } from 'renderer/helpers/ChannelHelper';
import SocketUtils from 'renderer/utils/SocketUtils';
import { useHistory } from 'react-router-dom';

const DirectNotSupport = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [isOpenImportModal, setOpenImportModal] = useState(false);
  const handleOpenModalImport = useCallback(() => setOpenImportModal(true), []);
  const handleCloseModalImport = useCallback(
    () => setOpenImportModal(false),
    []
  );
  const loggedOn = useCallback(
    async (seed: string, password: string) => {
      const iv = await getIV();
      let privateKey;
      let signingKey;
      if (isValidPrivateKey(seed)) {
        privateKey = seed;
        if (privateKey.substring(0, 2) !== '0x') {
          privateKey = `0x${privateKey}`;
        }
        signingKey = new utils.SigningKey(privateKey);
      } else {
        const wallet = ethers.Wallet.fromMnemonic(seed);
        privateKey = wallet.privateKey;
        signingKey = wallet._signingKey();
        const encryptedSeed = encryptString(seed, password, iv);
        setCookie(AsyncKey.encryptedSeedKey, encryptedSeed);
      }
      const publicKey = utils.computePublicKey(privateKey, true);
      const address = utils.computeAddress(privateKey);
      dispatch({ type: actionTypes.SET_PRIVATE_KEY, payload: privateKey });
      const data = { [publicKey]: privateKey };
      const encryptedData = encryptString(JSON.stringify(data), password, iv);
      setCookie(AsyncKey.encryptedDataKey, encryptedData);
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        toast.error(nonceRes?.message || '');
        return;
      }
      const msgHash = utils.hashMessage(message);
      const msgHashBytes = utils.arrayify(msgHash);
      const signature = signingKey.signDigest(msgHashBytes);
      const res = await api.verifyNonce(message, signature.compact);
      if (res.statusCode === 200) {
        setCookie(AsyncKey.accessTokenKey, res.token);
        await setCookie(AsyncKey.refreshTokenKey, res?.refresh_token);
        await setCookie(AsyncKey.tokenExpire, res?.token_expire_at);
        await setCookie(
          AsyncKey.refreshTokenExpire,
          res?.refresh_token_expire_at
        );
        const privateKeyChannel = await getPrivateChannel(privateKey);
        dispatch({
          type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
          payload: privateKeyChannel,
        });
        await api.removeEncryptedKey();
        await setCookie(AsyncKey.loginType, LoginType.WalletImport);
        dispatch({
          type: actionTypes.UPDATE_LOGIN_TYPE,
          payload: LoginType.WalletImport,
        });
        setCookie(AsyncKey.isBackup, 'true');
        SocketUtils.disconnect();
        history.replace('/');
      }
    },
    [dispatch]
  );
  return (
    <div className="direct-not-support__container">
      <span className="direct-not-support-title">Encrypted Message</span>
      <span className="direct-not-support-subtext">
        This conversation has been secured with End-to-end encryption.{'\n'}You
        need to import your seed phrase to use this feature.
      </span>
      <div className="download__wrap">
        <div
          className="wallet-button normal-button"
          onClick={handleOpenModalImport}
        >
          <span>Import wallet</span>
          <div className="wallet-icon">
            <img src={images.icArrowForward} alt="" />
          </div>
        </div>
      </div>
      <ModalImportSeedPhrase
        open={isOpenImportModal}
        handleClose={handleCloseModalImport}
        loggedOn={loggedOn}
      />
    </div>
  );
};

export default memo(DirectNotSupport);
