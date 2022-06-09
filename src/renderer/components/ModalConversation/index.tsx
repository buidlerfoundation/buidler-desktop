import React, { memo } from 'react';
import './index.scss';
import ModalFullScreen from '../ModalFullScreen';
import ConversationView from './ConversationView';

type ModalConversationProps = {
  open: boolean;
  handleClose: () => void;
  onAddReact: (id: string, name: string, userId: string) => void;
  onRemoveReact: (id: string, name: string, userId: string) => void;
  messageId: string;
};

const ModalConversation = ({
  handleClose,
  open,
  onAddReact,
  onRemoveReact,
  messageId,
}: ModalConversationProps) => {
  if (!open) return null;
  return (
    <ModalFullScreen onClosed={handleClose} open={open} position="right">
      <ConversationView
        onEsc={handleClose}
        onAddReact={onAddReact}
        onRemoveReact={onRemoveReact}
        messageId={messageId}
      />
    </ModalFullScreen>
  );
};

export default memo(ModalConversation);
