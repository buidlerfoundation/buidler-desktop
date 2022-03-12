import React, { useEffect, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';

type ModalEditGroupChannelProps = {
  open: boolean;
  handleClose: () => void;
  onEditGroupChannel: (groupChannelData: any) => void;
  groupName: string;
};

const ModalEditGroupChannel = ({
  open,
  handleClose,
  onEditGroupChannel,
  groupName,
}: ModalEditGroupChannelProps) => {
  const [groupChannelData, setGroupChannelData] = useState({
    name: '',
  });

  useEffect(() => {
    setGroupChannelData({ name: groupName });
  }, [groupName]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="edit-group-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="edit-group-channel-view__container">
          <span className="edit-group-channel__title">
            Edit group channel name
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
              title="Save"
              onPress={() => {
                if (!groupChannelData.name) return;
                onEditGroupChannel(groupChannelData);
              }}
              type="main"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditGroupChannel;
