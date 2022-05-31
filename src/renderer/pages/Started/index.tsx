import React, { useCallback, useEffect, useState } from 'react';
import './index.scss';
import { useHistory } from 'react-router-dom';
import { ethers, utils } from 'ethers';
import { encryptString, getIV } from 'renderer/utils/DataCrypto';
import { clearData, getDeviceCode, setCookie } from 'renderer/common/Cookie';
import { AsyncKey, LoginType } from 'renderer/common/AppConfig';
import api from 'renderer/api';
import { isValidPrivateKey } from 'renderer/helpers/SeedHelper';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from 'renderer/actions';
import actionTypes from 'renderer/actions/ActionTypes';
import { getPrivateChannel } from 'renderer/helpers/ChannelHelper';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import toast from 'react-hot-toast';
import images from '../../common/images';
import ModalCreatePassword from '../../components/ModalCreatePassword';
import ModalImportSeedPhrase from '../../components/ModalImportSeedPhrase';

type StartedProps = {
  logout: () => any;
};

const Started = ({ logout }: StartedProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const dataFromUrl = useSelector((state: any) => state.configs.dataFromUrl);
  const [isOpenPasswordModal, setOpenPasswordModal] = useState(false);
  const [isOpenImportModal, setOpenImportModal] = useState(false);
  const loggedOn = async (
    seed: string,
    password: string,
    backupLater?: boolean
  ) => {
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
    const { nonce } = await api.requestNonceWithAddress(address);
    if (nonce) {
      const msgHash = utils.hashMessage(nonce);
      const msgHashBytes = utils.arrayify(msgHash);
      const signature = signingKey.signDigest(msgHashBytes);
      const res = await api.verifyNonce(nonce, signature.compact);
      if (res.statusCode === 200) {
        setCookie(AsyncKey.accessTokenKey, res.token);
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
        history.replace('/home');
      }
    }
  };
  const doingLogin = useCallback(async () => {
    if (
      !WalletConnectUtils.connector ||
      !WalletConnectUtils.connector.connected
    )
      return;
    try {
      const { accounts, peerMeta } = WalletConnectUtils.connector;
      const address = accounts?.[0];
      const { nonce } = await api.requestNonceWithAddress(address);
      if (peerMeta.name === 'MetaMask') {
        toast.error('Something wrongs, you can try another wallet');
        WalletConnectUtils.connector.killSession();
        return;
      }
      const params = ['0xd6302729c18fE9be641B00eC70A6c01654C8b507', nonce];
      const signature = await WalletConnectUtils.connector.signMessage(params);
      const res = await api.verifyNonce(nonce, signature);
      await setCookie(AsyncKey.accessTokenKey, res.token);
      await setCookie(AsyncKey.loginType, LoginType.WalletConnect);
      history.replace('/home');
    } catch (err) {
      console.log(err);
      WalletConnectUtils.connector.killSession();
    }
  }, [history]);
  return (
    <div className="started-container">
      <div className="started-body">
        <div className="started-info-view">
          <img className="started-logo" alt="" src={images.icLogoSquare} />
          <span className="started-title">
            One-stop
            <br />
            Web3 Application
            <br />
            for your community
          </span>
          <span className="started-description">
            Buidler is a Web3 Application for your
            <br />
            community, fans, team, and supporters.
          </span>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={() => setOpenPasswordModal(true)}
        >
          <span>New wallet</span>
          <div className="wallet-icon">
            <img src={images.icPlusWhite} alt="" />
          </div>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={() => setOpenImportModal(true)}
        >
          <span>Import wallet</span>
          <div className="wallet-icon">
            <img src={images.icArrowForward} alt="" />
          </div>
        </div>
        <div
          className="wallet-button normal-button"
          onClick={() => {
            WalletConnectUtils.connect(
              async () => {
                setTimeout(doingLogin, 300);
              },
              async () => {
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
                  logout?.();
                });
              }
            );
          }}
        >
          <span>WalletConnect</span>
          <div className="wallet-icon">
            <img src={images.icWalletConnect} alt="" />
          </div>
        </div>
      </div>
      <ModalCreatePassword
        open={isOpenPasswordModal}
        handleClose={() => setOpenPasswordModal(false)}
        loggedOn={loggedOn}
      />
      <ModalImportSeedPhrase
        open={isOpenImportModal}
        handleClose={() => setOpenImportModal(false)}
        loggedOn={loggedOn}
      />
    </div>
  );
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(undefined, mapActionsToProps)(Started);
