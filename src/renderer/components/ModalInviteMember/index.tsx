import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';
import TextareaAutosize from 'react-textarea-autosize';

type ModalInviteMemberProps = {
  open: boolean;
  handleClose: () => void;
  onInvite: (emails: string) => void;
};

const ModalInviteMember = ({
  open,
  handleClose,
  onInvite,
}: ModalInviteMemberProps) => {
  const [emails, setEmails] = useState('');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="invite-member-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="invite-member-view__container">
          <span className="invite-member__title">Invite team members</span>
          <div style={{ height: 50 }} />
          <TextareaAutosize
            className="app-input-highlight"
            minRows={4}
            maxRows={6}
            placeholder="dev@notable.com, dev2@notable.com"
            onChange={(e) => setEmails(e.target.value)}
            value={emails}
            autoFocus
          />
          <div className="invite-member__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Send"
              onPress={() => {
                if (!emails) return;
                onInvite(emails);
              }}
              type="main"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalInviteMember;
