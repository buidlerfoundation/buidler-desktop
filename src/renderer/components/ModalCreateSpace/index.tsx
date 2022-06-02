import { Modal } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CreateSpaceData } from 'renderer/models';
import NormalButton from '../NormalButton';
import './index.scss';
import SpaceConfig from './SpaceConfig';
import SpaceInformation from './SpaceInformation';

type ModalCreateSpaceProps = {
  open: boolean;
  handleClose: () => void;
  onCreateSpace: (spaceData: CreateSpaceData) => void;
};

const ModalCreateSpace = ({
  open,
  handleClose,
  onCreateSpace,
}: ModalCreateSpaceProps) => {
  const [modalState, setModalState] = useState<'Information' | 'Config'>(
    'Information'
  );
  const [spaceData, setSpaceData] = useState<CreateSpaceData>({
    name: '',
    description: '',
    attachment: null,
    emoji: null,
    spaceType: 'Exclusive',
  });
  const onSecondaryPress = () => {
    if (modalState === 'Config') {
      setModalState('Information');
    } else {
      handleClose();
    }
  };
  const onPrimaryPress = () => {
    if (modalState === 'Information') {
      if (!spaceData.name) {
        toast.error('Space name can not be empty');
        return;
      }
      setModalState('Config');
    } else {
      // Create Space
    }
  };
  return (
    <Modal open={open} onClose={handleClose} className="modal-container">
      <div className="create-space__container">
        <div className="label">
          <span>Create Space</span>
        </div>
        {modalState === 'Information' && (
          <SpaceInformation spaceData={spaceData} setSpaceData={setSpaceData} />
        )}
        {modalState === 'Config' && (
          <SpaceConfig spaceData={spaceData} setSpaceData={setSpaceData} />
        )}
        <div className="create-space__footer">
          <NormalButton
            title={modalState === 'Information' ? 'Cancel' : 'Back'}
            type="normal"
            onPress={onSecondaryPress}
          />
          <NormalButton
            title={modalState === 'Information' ? 'Next' : 'Create'}
            type="main"
            onPress={onPrimaryPress}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateSpace;
