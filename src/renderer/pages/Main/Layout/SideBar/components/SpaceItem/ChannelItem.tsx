import { CircularProgress } from '@material-ui/core';
import { Emoji } from 'emoji-mart';
import { useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import EmojiAndAvatarPicker from 'renderer/components/EmojiAndAvatarPicker';
import PopoverButton from 'renderer/components/PopoverButton';
import './index.scss';

type ChannelItemProps = {
  c: any;
  currentChannel: any;
  onContextChannel: (e: any, channel: any) => void;
  collapsed: boolean;
  isOwner: boolean;
  updateChannel: (channelId: string, body: any) => any;
  uploadChannelAvatar: (teamId: string, channelId: string, file: any) => any;
};

const ChannelItem = ({
  c,
  currentChannel,
  onContextChannel,
  collapsed,
  isOwner,
  updateChannel,
  uploadChannelAvatar,
}: ChannelItemProps) => {
  const popupChannelIconRef = useRef<any>();
  const history = useHistory();
  const currentTeam = useSelector((state) => state.user.currentTeam);
  const isSelected = useMemo(
    () => c?.channel_id === currentChannel?.channel_id,
    [c?.channel_id, currentChannel?.channel_id]
  );
  const isPrivate = useMemo(
    () => c.channel_type === 'Private',
    [c.channel_type]
  );
  const isUnSeen = useMemo(() => !c.seen, [c.seen]);
  const isMuted = useMemo(
    () => c.notification_type === 'Muted',
    [c.notification_type]
  );
  const isQuiet = useMemo(
    () => c.notification_type === 'Quiet',
    [c.notification_type]
  );
  const renderChannelIcon = useCallback(() => {
    if (c.attachment) {
      return (
        <>
          <img className="channel-icon" src={c.attachment.file} alt="" />
          {c?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={20} />
            </div>
          )}
        </>
      );
    }
    if (c.channel_image_url) {
      return (
        <img
          className="channel-icon"
          src={ImageHelper.normalizeImage(
            c.channel_image_url,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (c.channel_emoji) {
      return <Emoji emoji={c.channel_emoji} set="apple" size={16} />;
    }
    if (isPrivate) {
      return <img className="img-private" alt="" src={images.icPrivateWhite} />;
    }
    return <img className="img-private" alt="" src={images.icPublicChannel} />;
  }, [
    c.attachment,
    c.channel_emoji,
    c.channel_image_url,
    currentTeam.team_id,
    isPrivate,
  ]);
  const handleClick = useCallback(
    () => history.replace(`/home?channel_id=${c?.channel_id}`),
    [c?.channel_id, history]
  );
  const handleContextMenu = useCallback(
    (e) => onContextChannel(e, c),
    [c, onContextChannel]
  );
  const handlePopupClick = useCallback((e) => e.stopPropagation(), []);
  const onAddFiles = useCallback(
    async (fs) => {
      if (fs == null || fs.length === 0) return;
      const file = [...fs][0];
      uploadChannelAvatar(currentTeam.team_id, c?.channel_id, file);
      popupChannelIconRef.current?.hide();
    },
    [c?.channel_id, currentTeam?.team_id, uploadChannelAvatar]
  );
  const onAddEmoji = useCallback(
    async (emoji) => {
      await updateChannel(c?.channel_id, {
        channel_emoji: emoji.id,
        channel_image_url: '',
      });
      popupChannelIconRef.current?.hide();
    },
    [c?.channel_id, updateChannel]
  );
  const onSelectRecentFile = useCallback(
    async (file) => {
      await updateChannel(currentChannel?.channel_id, {
        channel_emoji: '',
        channel_image_url: file.file_url,
      });
      popupChannelIconRef.current?.hide();
    },
    [currentChannel?.channel_id, updateChannel]
  );
  return (
    <div
      className={`channel-wrapper ${collapsed ? 'collapsed' : ''} ${
        isSelected ? 'channel-selected' : ''
      } ${isMuted ? 'channel-muted' : ''} ${isUnSeen ? 'channel-un-seen' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {isOwner ? (
        <PopoverButton
          ref={popupChannelIconRef}
          componentButton={
            <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
          }
          componentPopup={
            <div className="emoji-picker__container" onClick={handlePopupClick}>
              <EmojiAndAvatarPicker
                onAddFiles={onAddFiles}
                onAddEmoji={onAddEmoji}
                channelId={c?.channel_id}
                onSelectRecentFile={onSelectRecentFile}
              />
            </div>
          }
        />
      ) : (
        <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
      )}
      <span className="channel-name">{c.channel_name}</span>
      {isQuiet && <img className="img-bell" alt="" src={images.icBellQuite} />}
    </div>
  );
};

export default ChannelItem;
