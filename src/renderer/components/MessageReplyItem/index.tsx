import React, { useRef, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { MessageData } from 'renderer/models';
import images from '../../common/images';
import {
  normalizeMessageText,
  normalizeUserName,
} from '../../helpers/MessageHelper';
import { dateFormatted, messageFromNow } from '../../utils/DateUtils';
import AvatarView from '../AvatarView';
import EmojiPicker from '../EmojiPicker';
import MessagePhotoItem from '../MessagePhotoItem';
import PopoverButton, { PopoverItem } from '../PopoverButton';
import ReactView from '../ReactView';
import './index.scss';

type MessageReplyItemProps = {
  message: MessageData;
  onCreateTask: () => void;
  onClick?: () => void;
  onReplyPress?: () => void;
  disableHover?: boolean;
  disableMenu?: boolean;
  zIndex?: number;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  onMenuSelected: (menu: PopoverItem) => void;
  onSelectTask: (task: any) => void;
};

const MessageReplyItem = ({
  message,
  onCreateTask,
  onClick,
  disableHover,
  disableMenu = false,
  zIndex,
  onReplyPress,
  onAddReact,
  onRemoveReact,
  onMenuSelected,
  onSelectTask,
}: MessageReplyItemProps) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const reactData = useAppSelector((state) => state.reactReducer.reactData);
  const { userData, teamUserData, currentTeam } = useAppSelector(
    (state) => state.user
  );
  const history = useHistory();
  const sender = useMemo(
    () => teamUserData.find((u) => u.user_id === message.sender_id),
    [message.sender_id, teamUserData]
  );
  const reacts = useMemo(
    () => reactData?.[message.message_id] || [],
    [message.message_id, reactData]
  );
  const messageMenu = useMemo<Array<PopoverItem>>(() => {
    const menu = [];
    if (userData?.user_id === sender.user_id) {
      menu.push({
        label: 'Edit',
        value: 'Edit',
      });
      menu.push({
        label: 'Delete',
        value: 'Delete',
        type: 'destructive',
      });
    }
    return menu;
  }, [sender?.user_id, userData?.user_id]);
  const popupMenuRef = useRef<any>();
  const head = useMemo(
    () => message.isHead || message.isConversationHead,
    [message.isConversationHead, message.isHead]
  );
  const popupEmojiRef = useRef<any>();
  const handleHeadClick = useCallback(() => {
    if (message.task) {
      onSelectTask?.(message.task);
    } else {
      onClick?.();
    }
  }, [message.task, onClick, onSelectTask]);
  const onReactPress = useCallback(
    (name: string) => {
      const isExisted = !!reacts.find(
        (react: any) => react.reactName === name && react?.isReacted
      );
      if (isExisted) {
        onRemoveReact?.(message.message_id, name, userData.user_id);
      } else {
        onAddReact?.(message.message_id, name, userData.user_id);
      }
    },
    [message.message_id, onAddReact, onRemoveReact, reacts, userData.user_id]
  );
  const renderSpaceLeft = useCallback(() => {
    if (head) return null;
    if (!disableHover) {
      return (
        <div className="message-reply-item__space-left">
          <span className="message-reply-item__time">
            {dateFormatted(message.createdAt, 'HH:mm A')}
          </span>
        </div>
      );
    }
    return <div className="message-reply-item__space-left" />;
  }, [disableHover, head, message.createdAt]);
  const onUserClick = useCallback(() => {
    history.replace(`/home?user_id=${sender.user_id}`);
  }, [history, sender.user_id]);
  const handleEmojiClick = useCallback(
    (emoji: EmojiData) => {
      onReactPress(emoji.id);
      setPopoverOpen(false);
      popupEmojiRef.current?.hide();
    },
    [onReactPress]
  );
  const handleSelectedMenu = useCallback(
    (menu: PopoverItem) => {
      onMenuSelected(menu);
      setPopoverOpen(false);
    },
    [onMenuSelected]
  );
  const handlePopoverButtonClose = useCallback(() => setPopoverOpen(false), []);
  const handlePopoverButtonOpen = useCallback(() => setPopoverOpen(true), []);
  if (!sender) return null;
  return (
    <div className="message-reply-item-wrapper">
      {head && <div style={{ height: 15 }} />}
      <div className="message-reply-item-container">
        {head && (
          <div
            className="message-reply-item__avatar-view"
            onClick={onUserClick}
          >
            <AvatarView user={sender} size={35} />
          </div>
        )}
        {renderSpaceLeft()}
        <div className="message-reply-item__content">
          {head && (
            <div className="message-reply-item__user" onClick={onUserClick}>
              <span className="message-reply-item__user-name">
                {normalizeUserName(sender?.user_name)}
              </span>
              <span
                className="message-reply-item__time"
                style={{ marginLeft: 5 }}
              >
                {messageFromNow(message.createdAt)}
              </span>
            </div>
          )}
          {head && (
            <div className="message-root__container">
              <div className="message-root__indicator" />
              <div className="message-root__content">
                <span
                  className="message-reply-item__reply"
                  onClick={handleHeadClick}
                >
                  {message.task && <span className="view-task">View task</span>}
                  {message.task?.comment_count > 0
                    ? `${message.task?.comment_count} Replies`
                    : message?.conversation_data?.length - 1 > 0 && (
                        <span className="mention">
                          {message?.conversation_data?.length - 1} Replies
                        </span>
                      )}
                </span>
              </div>
            </div>
          )}
          <div
            className={`message-reply-item__message ${
              head ? 'message-head__message' : ''
            } ${
              message.isSending ? 'message-reply-sending' : ''
            } enable-user-select`}
            dangerouslySetInnerHTML={{
              __html: normalizeMessageText(message.content),
            }}
          />
          <MessagePhotoItem
            photos={message?.message_attachment || []}
            teamId={currentTeam.team_id}
            isHead={head}
          />
          {reacts.length > 0 && (
            <div
              className={`message-reply-item__reacts ${
                head && 'message-reply-item__reacts-head'
              }`}
            >
              <ReactView
                reacts={reacts}
                onClick={onReactPress}
                teamUserData={teamUserData}
                parentId={message.message_id}
              />
            </div>
          )}
        </div>
        {!disableHover && !disableMenu && (
          <div
            className={`message-reply-item__menu ${
              isPopoverOpen ? 'popover-open' : ''
            }`}
            style={zIndex ? { zIndex } : {}}
          >
            <PopoverButton
              ref={popupEmojiRef}
              componentButton={
                <div className="message-reply-item__menu-item">
                  <img alt="" src={images.icReact} />
                </div>
              }
              onClose={handlePopoverButtonClose}
              onOpen={handlePopoverButtonOpen}
              componentPopup={
                <div className="emoji-picker__container">
                  <EmojiPicker onClick={handleEmojiClick} />
                </div>
              }
            />
            <div
              className="message-reply-item__menu-item"
              onClick={onReplyPress}
            >
              <img alt="" src={images.icReply} />
            </div>
            <div
              className="message-reply-item__menu-item"
              onClick={onCreateTask}
            >
              <img alt="" src={images.icPinned} />
            </div>
            {messageMenu.length > 0 && (
              <PopoverButton
                ref={popupMenuRef}
                data={messageMenu}
                onSelected={handleSelectedMenu}
                onClose={handlePopoverButtonClose}
                onOpen={handlePopoverButtonOpen}
                componentButton={
                  <div className="message-reply-item__menu-item">
                    <img alt="" src={images.icMoreWhite} />
                  </div>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReplyItem;
