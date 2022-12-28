import React, { useCallback, useEffect, useState } from 'react';
import './index.scss';
import { useHistory } from 'react-router-dom';
import { ethers, utils } from 'ethers';
import { encryptString, getIV } from 'renderer/utils/DataCrypto';
import { clearData, getDeviceCode, setCookie } from 'renderer/common/Cookie';
import { AsyncKey, LoginType } from 'renderer/common/AppConfig';
import api from 'renderer/api';
import { isValidPrivateKey } from 'renderer/helpers/SeedHelper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from 'renderer/actions/UserActions';
import actionTypes from 'renderer/actions/ActionTypes';
import { getPrivateChannel } from 'renderer/helpers/ChannelHelper';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import toast from 'react-hot-toast';
import images from '../../common/images';
import ModalCreatePassword from '../../shared/ModalCreatePassword';
import ModalImportSeedPhrase from '../../shared/ModalImportSeedPhrase';
import GlobalVariable from 'renderer/services/GlobalVariable';
import GoogleAnalytics from 'renderer/services/analytics/GoogleAnalytics';

const Started = () => {
  useEffect(() => {
    GoogleAnalytics.tracking('Login Started', { category: 'Login' });
  }, []);
  const dispatch = useDispatch();
  const history = useHistory();
  const dataFromUrl = useSelector((state: any) => state.configs.dataFromUrl);
  const gaLoginSuccess = useCallback((label: string) => {
    GoogleAnalytics.tracking('Login Successful', {
      category: 'Login',
      method: label,
    });
  }, []);
  const gaLoginSubmit = useCallback((label: string) => {
    GoogleAnalytics.tracking('Login Submitted', {
      category: 'Login',
      method: label,
    });
  }, []);
  const gaLoginClick = useCallback((label: string) => {
    GoogleAnalytics.tracking('Login Method Selected', {
      category: 'Login',
      method: label,
    });
  }, []);
  const [isOpenPasswordModal, setOpenPasswordModal] = useState(false);
  const [isOpenImportModal, setOpenImportModal] = useState(false);
  const doingLogin = useCallback(async () => {
    if (
      !WalletConnectUtils.connector ||
      !WalletConnectUtils.connector?.connected
    )
      return;
    try {
      const { accounts } = WalletConnectUtils.connector;
      const address = accounts?.[0];
      const nonceRes = await api.requestNonceWithAddress(address);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        return;
      }
      const params = [
        utils.hexlify(ethers.utils.toUtf8Bytes(message)),
        address,
      ];
      const signature = await WalletConnectUtils.connector.signPersonalMessage(
        params
      );
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        GlobalVariable.loginType = LoginType.WalletConnect;
        await setCookie(AsyncKey.accessTokenKey, res?.token);
        await setCookie(AsyncKey.loginType, LoginType.WalletConnect);
        await setCookie(AsyncKey.refreshTokenKey, res?.refresh_token);
        await setCookie(AsyncKey.tokenExpire, res?.token_expire_at);
        await setCookie(
          AsyncKey.refreshTokenExpire,
          res?.refresh_token_expire_at
        );
        gaLoginSuccess('WalletConnect');
        dispatch({
          type: actionTypes.UPDATE_LOGIN_TYPE,
          payload: LoginType.WalletConnect,
        });
        history.replace('/channels');
      } else {
        toast.error(res.message || '');
        WalletConnectUtils.connector.killSession();
      }
    } catch (err) {
      console.log(err);
      WalletConnectUtils.connector.killSession();
    }
  }, [dispatch, gaLoginSuccess, history]);
  const handleOpenModalCreate = useCallback(
    () => setOpenPasswordModal(true),
    []
  );
  const handleOpenModalImport = useCallback(() => setOpenImportModal(true), []);
  const onWCConnected = useCallback(() => {
    setTimeout(doingLogin, 300);
  }, [doingLogin]);
  const onWCDisconnected = useCallback(async () => {
    if (!window.location.href.includes('started')) {
      const deviceCode = await getDeviceCode();
      await api.removeDevice({
        device_code: deviceCode,
      });
    }
    clearData(() => {
      if (!window.location.href.includes('started')) {
        window.location.reload();
      }
      dispatch(logout());
    });
  }, [dispatch]);
  const handleWalletConnect = useCallback(() => {
    gaLoginClick('Wallet Connect');
    WalletConnectUtils.connect(onWCConnected, onWCDisconnected);
  }, [gaLoginClick, onWCConnected, onWCDisconnected]);
  const handleCloseModalCreate = useCallback(
    () => setOpenPasswordModal(false),
    []
  );
  const handleCloseModalImport = useCallback(
    () => setOpenImportModal(false),
    []
  );
  const loggedOn = useCallback(
    async (seed: string, password: string, backupLater?: boolean) => {
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
      }
      const publicKey = utils.computePublicKey(privateKey, true);
      const address = utils.computeAddress(privateKey);
      dispatch({ type: actionTypes.SET_PRIVATE_KEY, payload: privateKey });
      const data = { [publicKey]: privateKey };
      const encryptedData = encryptString(JSON.stringify(data), password, iv);
      if (backupLater) {
        const encryptedSeed = encryptString(seed, password, iv);
        setCookie(AsyncKey.encryptedSeedKey, encryptedSeed);
        dispatch({ type: actionTypes.SET_SEED_PHRASE, payload: seed });
      }
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
        if (dataFromUrl?.includes?.('invitation')) {
          const invitationId = dataFromUrl.split('=')[1];
          const acceptRes = await api.acceptInvitation(invitationId);
          if (acceptRes.statusCode === 200) {
            dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
          }
        }
        await setCookie(AsyncKey.loginType, LoginType.WalletImport);
        dispatch({
          type: actionTypes.UPDATE_LOGIN_TYPE,
          payload: LoginType.WalletImport,
        });
        history.replace('/channels');
      }
    },
    [dataFromUrl, dispatch, history]
  );
  return (
    <div className="started-container">
      <div className="started-body">
        <div className="started-info-view">
          <img className="started-logo" alt="" src={images.icLogoSquare} />
          <span className="started-title">
            A new home
            <br />
            for your community
            <br />
            to buidl together
          </span>
          <span className="started-description">
            Web3 application for your community, teams, and supporters to
            connect, communicate and collaborate.
          </span>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={handleOpenModalCreate}
        >
          <span>New wallet</span>
          <div className="wallet-icon">
            <img src={images.icPlusWhite} alt="" />
          </div>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={handleOpenModalImport}
        >
          <span>Import wallet</span>
          <div className="wallet-icon">
            <img src={images.icArrowForward} alt="" />
          </div>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={handleWalletConnect}
          style={{ display: 'none' }}
        >
          <span>WalletConnect</span>
          <div className="wallet-icon">
            <img src={images.icWalletConnect} alt="" />
          </div>
        </div>
      </div>
      <ModalCreatePassword
        open={isOpenPasswordModal}
        handleClose={handleCloseModalCreate}
        loggedOn={loggedOn}
      />
      <ModalImportSeedPhrase
        open={isOpenImportModal}
        handleClose={handleCloseModalImport}
        loggedOn={loggedOn}
      />
    </div>
  );
};

export default Started;
