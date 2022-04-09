import React, { useState } from 'react';
import './index.scss';
import images from '../../common/images';
import ModalCreatePassword from '../../components/ModalCreatePassword';
import ModalImportSeedPhrase from '../../components/ModalImportSeedPhrase';
import { useHistory } from 'react-router-dom';
import { ethers, utils } from 'ethers';
import { encryptString, getIV } from 'renderer/utils/DataCrypto';
import { setCookie } from 'renderer/common/Cookie';
import { AsyncKey } from 'renderer/common/AppConfig';
import api from 'renderer/api';
import { isValidPrivateKey } from 'renderer/helpers/SeedHelper';
import { useDispatch } from 'react-redux';
import actionTypes from 'renderer/actions/ActionTypes';

const Started = () => {
  const dispatch = useDispatch();
  const history = useHistory();
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
    dispatch({ type: actionTypes.SET_PRIVATE_KEY, payload: privateKey });
    const data = { [publicKey]: privateKey };
    const encryptedData = encryptString(JSON.stringify(data), password, iv);
    if (backupLater) {
      const encryptedSeed = encryptString(seed, password, iv);
      setCookie(AsyncKey.encryptedSeedKey, encryptedSeed);
      dispatch({ type: actionTypes.SET_SEED_PHRASE, payload: seed });
    }
    setCookie(AsyncKey.encryptedDataKey, encryptedData);
    const { nonce } = await api.requestNonce(publicKey);
    if (nonce) {
      const msgHash = utils.hashMessage(nonce);
      const msgHashBytes = utils.arrayify(msgHash);
      const signature = signingKey.signDigest(msgHashBytes);
      const res = await api.verifyNonce(nonce, signature.compact);
      if (res.statusCode === 200) {
        setCookie(AsyncKey.accessTokenKey, res.token);
        history.replace('/home');
      }
    }
  };
  return (
    <div className="started-container">
      <div className="started-body">
        <div className="started-info-view">
          <img className="started-logo" alt="" src={images.notableLogo} />
          <span className="started-title">
            Your chats
            <br />
            is your tasks
          </span>
          <span className="started-description">
            Buidler is a daily tool for chat, tasks,
            <br />
            meeting for remote working.
          </span>
        </div>
        <div
          className="create-wallet-button normal-button"
          onClick={() => setOpenPasswordModal(true)}
        >
          Create a new wallet
        </div>
        <div
          className="import-wallet-button normal-button"
          onClick={() => setOpenImportModal(true)}
        >
          Import existing wallet
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

export default Started;
