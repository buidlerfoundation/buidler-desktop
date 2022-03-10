import React, { useCallback, useMemo, useState } from 'react';
import { Modal } from '@material-ui/core';
import './index.global.scss';
import NormalButton from '../NormalButton';
import ImportState from './ImportState';
import CreatePasswordState from '../ModalCreatePassword/CreatePasswordState';
import { useHistory } from 'react-router-dom';

type ModalImportSeedPhraseProps = {
  open: boolean;
  handleClose: () => void;
};

type ModalState = 'import' | 'create-password';

const ModalImportSeedPhrase = ({
  open,
  handleClose,
}: ModalImportSeedPhraseProps) => {
  const history = useHistory();
  const [seed, setSeed] = useState('');
  const [modalState, setModalState] = useState<ModalState>('import');
  const renderBody = useMemo(() => {
    if (modalState === 'import')
      return <ImportState seed={seed} setSeed={setSeed} />;
    if (modalState === 'create-password') return <CreatePasswordState />;

    return null;
  }, [modalState, seed]);
  const onNextPress = useCallback(() => {
    switch (modalState) {
      case 'import':
        setModalState('create-password');
        break;
      case 'create-password':
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
      className="import-seed-modal"
      BackdropProps={{
        style: {
          backgroundColor: 'var(--color-backdrop)',
        },
      }}
    >
      <div style={{ display: 'table' }}>
        <div className="modal__container">
          {renderBody}
          <div className="import__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Next" onPress={onNextPress} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalImportSeedPhrase;
