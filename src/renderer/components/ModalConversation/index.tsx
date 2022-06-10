import React, { memo } from 'react';
import './index.scss';
import { ConversationData } from 'renderer/models';
import ModalFullScreen from '../ModalFullScreen';
import ConversationView from './ConversationView';

type ModalConversationProps = {
  open: boolean;
  handleClose: () => void;
  onAddReact: (id: string, name: string, userId: string) => void;
  onRemoveReact: (id: string, name: string, userId: string) => void;
  deleteMessage: (
    messageId: string,
    parentId: string,
    channelId: string
  ) => any;
  conversations: Array<ConversationData>;
};

const ModalConversation = ({
  handleClose,
  open,
  onAddReact,
  onRemoveReact,
  deleteMessage,
  conversations,
}: ModalConversationProps) => {
  if (!open) return null;
  return (
    <ModalFullScreen onClosed={handleClose} open={open} position="right">
      <ConversationView
        onEsc={handleClose}
        onAddReact={onAddReact}
        onRemoveReact={onRemoveReact}
        deleteMessage={deleteMessage}
        conversations={conversations}
      />
    </ModalFullScreen>
  );
};

export default memo(ModalConversation);
