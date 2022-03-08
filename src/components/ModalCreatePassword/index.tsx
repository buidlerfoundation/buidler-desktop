import { Modal } from '@material-ui/core';
import React, { useMemo, useState, useCallback } from 'react';
import NormalButton from '../NormalButton';
import CreatePasswordState from './CreatePasswordState';
import './index.global.scss';
import { ethers } from 'ethers';
import StoreSeedPhraseState from './StoreSeedPhraseState';
import BackupSeedPhraseState from './BackupSeedPhraseState';
import { createConfirmSeedState } from '../../helpers/SeedHelper';
import { useHistory } from 'react-router-dom';

type ModalCreatePasswordProps = {
  open: boolean;
  handleClose: () => void;
};

type ModalState =
  | 'create-password'
  | 'store-seed-phrase'
  | 'backup-seed-phrase';

const ModalCreatePassword = ({
  open,
  handleClose,
}: ModalCreatePasswordProps) => {
  const history = useHistory();
  const seed = ethers.Wallet.createRandom().mnemonic.phrase;
  const [confirmSeed, setConfirmSeed] = useState(createConfirmSeedState());
  const [modalState, setModalState] = useState<ModalState>('create-password');
  const [password, setPassword] = useState('');
  const buttonSubText = useMemo(() => {
    switch (modalState) {
      case 'create-password':
        return 'Cancel';
      case 'store-seed-phrase':
        return 'Do it later';
      case 'backup-seed-phrase':
        return 'Back';
      default:
        return '';
    }
  }, [modalState]);
  const renderBody = useMemo(() => {
    if (modalState === 'create-password')
      return (
        <CreatePasswordState password={password} setPassword={setPassword} />
      );
    if (modalState === 'store-seed-phrase')
      return <StoreSeedPhraseState seed={seed} />;
    if (modalState === 'backup-seed-phrase')
      return (
        <BackupSeedPhraseState
          seed={seed}
          confirmSeed={confirmSeed}
          setConfirmSeed={setConfirmSeed}
        />
      );
    return null;
  }, [modalState, password, confirmSeed, seed]);
  const onNextPress = useCallback(() => {
    switch (modalState) {
      case 'create-password':
        setModalState('store-seed-phrase');
        break;
      case 'store-seed-phrase':
        setModalState('backup-seed-phrase');
        break;
      case 'backup-seed-phrase':
        history.replace('/home');
        break;
      default:
        break;
    }
  }, [modalState, history]);
  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
      }}
      className="create-password-modal"
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <div className="modal__container">
          {renderBody}
          <div className="password__bottom">
            <NormalButton
              title={buttonSubText}
              onPress={handleClose}
              type="normal"
            />
            <div style={{ width: 10 }} />
            <NormalButton title="Next" onPress={onNextPress} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreatePassword;
