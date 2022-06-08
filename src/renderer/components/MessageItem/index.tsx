import { EmojiData } from 'emoji-mart';
import React, { useRef, useMemo, useCallback, useState, memo } from 'react';
import { useHistory } from 'react-router-dom';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { MessageData, TaskData } from 'renderer/models';
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

type MessageItemProps = {
  message: MessageData;
  onCreateTask?: (message: MessageData) => void;
  onReplyPress?: (message: MessageData) => void;
  disableHover?: boolean;
  disableMenu?: boolean;
  zIndex?: number;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  onMenuSelected?: (menu: PopoverItem, message: MessageData) => void;
  onSelectTask?: (task: TaskData) => void;
  content: string;
};

const MessageItem = ({
  message,
  onCreateTask,
  disableHover,
  disableMenu = false,
  zIndex,
  onReplyPress,
  onAddReact,
  onRemoveReact,
  onMenuSelected,
  onSelectTask,
  content,
}: MessageItemProps) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const { teamUserData, currentTeam, userData } = useAppSelector(
    (state) => state.user
  );
  const reactData = useAppSelector((state) => state.reactReducer.reactData);
  const history = useHistory();
  const popupMenuRef = useRef<any>();
  const popupEmojiRef = useRef<any>();
  const sender = useMemo(
    () => teamUserData.find((u) => u.user_id === message.sender_id),
    [message.sender_id, teamUserData]
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
  const reacts = useMemo(
    () => reactData?.[message.message_id] || [],
    [message.message_id, reactData]
  );
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
    [message.message_id, onAddReact, onRemoveReact, reacts, userData?.user_id]
  );
  const handleViewTask = useCallback(
    () => onSelectTask?.(message.task),
    [message.task, onSelectTask]
  );
  const handleEmojiClick = useCallback(
    (emoji: EmojiData) => {
      onReactPress(emoji.id);
      setPopoverOpen(false);
      popupEmojiRef.current?.hide();
    },
    [onReactPress]
  );
  const handleReplyPress = useCallback(
    () => onReplyPress(message),
    [message, onReplyPress]
  );
  const onPinned = useCallback(
    () => onCreateTask?.(message),
    [message, onCreateTask]
  );
  const handleSelectedMenu = useCallback(
    (menu: PopoverItem) => {
      onMenuSelected?.(menu, message);
      setPopoverOpen(false);
    },
    [message, onMenuSelected]
  );
  const handlePopoverButtonClose = useCallback(() => setPopoverOpen(false), []);
  const handlePopoverButtonOpen = useCallback(() => setPopoverOpen(true), []);
  const renderSpaceLeft = useCallback(() => {
    if (message.isHead) return null;
    if (!disableHover) {
      return (
        <div className="message-item__space-left">
          <span className="message-item__time">
            {dateFormatted(message.createdAt, 'HH:mm A')}
          </span>
        </div>
      );
    }
    return <div className="message-item__space-left" />;
  }, [disableHover, message.createdAt, message.isHead]);
  const onUserClick = useCallback(() => {
    history.replace(`/home?user_id=${sender.user_id}`);
  }, [history, sender?.user_id]);
  if (!sender) return null;
  return (
    <div className="message-item-wrapper">
      {message.isHead && <div style={{ height: 15 }} />}
      <div className="message-item-container">
        {message.isHead && (
          <div className="message-item__avatar-view" onClick={onUserClick}>
            <AvatarView user={sender} size={35} />
          </div>
        )}
        {renderSpaceLeft()}
        <div className="message-item__content">
          {message.isHead && (
            <div className="message-item__user" onClick={onUserClick}>
              <span className="message-item__user-name">
                {normalizeUserName(sender?.user_name)}
              </span>
              <span className="message-item__time" style={{ marginLeft: 5 }}>
                {messageFromNow(message.createdAt)}
              </span>
            </div>
          )}
          <div>
            {!!message.task && (
              <div
                className={`message-task ${
                  message.isHead ? 'message-head__message' : ''
                }`}
                onClick={handleViewTask}
              >
                <div className="message-task__indicator" />
                <span className="view-task">View task</span>
              </div>
            )}
            <div
              className={`message-item__message ${
                message.isHead ? 'message-head__message' : ''
              } ${message.isSending ? 'message-item-sending' : ''}`}
              dangerouslySetInnerHTML={{
                __html: normalizeMessageText(content),
              }}
            />
          </div>

          <MessagePhotoItem
            photos={message?.message_attachment || []}
            teamId={currentTeam.team_id}
            isHead={message.isHead}
          />
          {reacts.length > 0 && (
            <div
              className={`message-item__reacts ${
                message.isHead && 'message-item__reacts-head'
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
            className={`message-item__menu ${
              isPopoverOpen ? 'popover-open' : ''
            }`}
            style={zIndex ? { zIndex } : {}}
          >
            <PopoverButton
              ref={popupEmojiRef}
              componentButton={
                <div className="message-item__menu-item">
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
            <div className="message-item__menu-item" onClick={handleReplyPress}>
              <img alt="" src={images.icReply} />
            </div>
            <div className="message-item__menu-item" onClick={onPinned}>
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
                  <div className="message-item__menu-item">
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

export default memo(MessageItem);
