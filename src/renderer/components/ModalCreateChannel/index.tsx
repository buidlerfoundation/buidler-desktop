import React, { useEffect, useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import CreateChannelView from './CreateChannelView';

type ModalCreateChannelProps = {
  open: boolean;
  handleClose: () => void;
  onCreateChannel: (channelData: any) => void;
  group: Array<any>;
  initialGroup?: any;
};

const ModalCreateChannel = ({
  open,
  handleClose,
  onCreateChannel,
  group,
  initialGroup,
}: ModalCreateChannelProps) => {
  const [channelData, setChannelData] = useState<any>({
    name: '',
    group: null,
    isPrivate: false,
    members: [],
  });
  useEffect(() => {
    setChannelData((data: any) => ({ ...data, group: initialGroup }));
  }, [initialGroup]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="create-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <CreateChannelView
          group={group}
          onCancel={handleClose}
          onCreate={() => {
            if (channelData.group == null) {
              // show error
              return;
            }
            onCreateChannel(channelData);
          }}
          channelData={channelData}
          update={(key, val) => {
            setChannelData((data: any) => ({ ...data, [key]: val }));
          }}
        />
      </div>
    </Modal>
  );
};

export default ModalCreateChannel;
