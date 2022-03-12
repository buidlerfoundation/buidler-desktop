import React, { useState } from 'react';
import './index.scss';
import images from '../../common/images';
import ModalCreatePassword from '../../components/ModalCreatePassword';
import ModalImportSeedPhrase from '../../components/ModalImportSeedPhrase';

const Started = () => {
  const [isOpenPasswordModal, setOpenPasswordModal] = useState(false);
  const [isOpenImportModal, setOpenImportModal] = useState(false);
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
      />
      <ModalImportSeedPhrase
        open={isOpenImportModal}
        handleClose={() => setOpenImportModal(false)}
      />
    </div>
  );
};

export default Started;
