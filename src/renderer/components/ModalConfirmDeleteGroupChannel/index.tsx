import React from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';

type ModalConfirmDeleteGroupChannelProps = {
  open: boolean;
  handleClose: () => void;
  onDelete: () => void;
  groupName: string;
};

const ModalConfirmDeleteGroupChannel = ({
  open,
  handleClose,
  onDelete,
  groupName,
}: ModalConfirmDeleteGroupChannelProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="confirm-delete-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="confirm-delete-channel-view__container">
          <span className="confirm-delete-channel__title">
            Delete Group Channel
          </span>
          <div style={{ height: 24 }} />
          <div className="confirm-delete-channel__content-wrapper">
            <span className="confirm-delete-channel__content">
              Are you sure you want to delete?
            </span>
            <div className="channel-name">
              <span>{groupName}</span>
            </div>
          </div>
          <div className="confirm-delete-channel__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Delete Group Channel"
              onPress={onDelete}
              type="danger"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmDeleteGroupChannel;
