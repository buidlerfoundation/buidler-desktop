import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.global.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';

type ModalCreateGroupChannelProps = {
  open: boolean;
  handleClose: () => void;
  onCreateGroupChannel: (groupChannelData: any) => void;
};

const ModalCreateGroupChannel = ({
  open,
  handleClose,
  onCreateGroupChannel,
}: ModalCreateGroupChannelProps) => {
  const [groupChannelData, setGroupChannelData] = useState({
    name: '',
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="create-group-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="create-group-channel-view__container">
          <span className="create-group-channel__title">
            Create group channel
          </span>
          <div style={{ height: 95 }} />
          <AppInput
            className="app-input-highlight"
            placeholder="Enter group channel name"
            onChange={(e) =>
              setGroupChannelData({ name: e.target.value.toUpperCase() })
            }
            value={groupChannelData?.name}
            autoFocus
          />
          <div className="group-channel__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Create group channel"
              onPress={() => {
                if (!groupChannelData.name) return;
                onCreateGroupChannel(groupChannelData);
              }}
              type="main"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateGroupChannel;
