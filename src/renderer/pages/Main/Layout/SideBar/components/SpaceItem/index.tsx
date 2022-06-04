import { CircularProgress } from '@material-ui/core';
import { Emoji } from 'emoji-mart';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ImageHelper from 'renderer/common/ImageHelper';
import DefaultSpaceIcon from 'renderer/components/DefaultSpaceIcon';
import EmojiAndAvatarPicker from 'renderer/components/EmojiAndAvatarPicker';
import PopoverButton from 'renderer/components/PopoverButton';
import SpaceItemBadge from 'renderer/components/SpaceItemBadge';
import ChannelItem from './ChannelItem';
import './index.scss';

type SpaceItemProps = {
  space: any;
  channel: Array<any>;
  currentChannel: any;
  onContextChannel: (e: any, channel: any) => void;
  onContextSpaceChannel: (e: any, c: any) => void;
  updateSpaceChannel: (spaceId: string, body: any) => any;
  uploadSpaceAvatar: (teamId: string, spaceId: string, file: any) => any;
  isOwner: boolean;
  updateChannel: (channelId: string, body: any) => any;
  uploadChannelAvatar: (teamId: string, channelId: string, file: any) => any;
};

const SpaceItem = ({
  space,
  channel,
  currentChannel,
  onContextChannel,
  onContextSpaceChannel,
  updateSpaceChannel,
  uploadSpaceAvatar,
  isOwner,
  updateChannel,
  uploadChannelAvatar,
}: SpaceItemProps) => {
  const popupSpaceIconRef = useRef<any>();
  const [isCollapsed, setCollapsed] = useState(true);
  const currentTeam = useSelector((state) => state.user.currentTeam);
  const toggleCollapsed = useCallback(
    () => setCollapsed((current) => !current),
    []
  );
  const handleContextMenuSpaceChannel = useCallback(
    (e) => {
      onContextSpaceChannel(e, space);
    },
    [onContextSpaceChannel, space]
  );
  const channelSpace = useMemo(() => {
    return channel
      ?.filter((c: any) => c?.space_id === space?.space_id)
      .sort((a1, a2) => {
        if (a1.channel_name < a2.channel_name) return 1;
        if (a1.channel_name > a2.channel_name) return -1;
        return 0;
      })
      .sort((b1, b2) => {
        if (b1.channel_type < b2.channel_type) return 1;
        return -1;
      });
  }, [channel, space?.space_id]);
  const renderSpaceIcon = useCallback(() => {
    if (space.attachment) {
      return (
        <>
          <img className="space-icon" src={space.attachment.file} alt="" />
          {space?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={30} />
            </div>
          )}
        </>
      );
    }
    if (space.space_image_url) {
      return (
        <img
          className="space-icon"
          src={ImageHelper.normalizeImage(
            space.space_image_url,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (space.space_emoji) {
      return <Emoji emoji={space.space_emoji} set="apple" size={20} />;
    }
    return <DefaultSpaceIcon name={space.space_name} />;
  }, [
    currentTeam?.team_id,
    space?.attachment,
    space?.space_emoji,
    space?.space_image_url,
    space?.space_name,
  ]);
  const handlePopupClick = useCallback((e) => e.stopPropagation(), []);
  const onAddFiles = useCallback(
    async (fs) => {
      if (fs == null || fs.length === 0) return;
      const file = [...fs][0];
      uploadSpaceAvatar(currentTeam.team_id, space.space_id, file);
      popupSpaceIconRef.current?.hide();
    },
    [currentTeam?.team_id, space?.space_id, uploadSpaceAvatar]
  );
  const onAddEmoji = useCallback(
    async (emoji) => {
      await updateSpaceChannel(space.space_id, {
        space_emoji: emoji.id,
        space_image_url: '',
      });
      popupSpaceIconRef.current?.hide();
    },
    [space?.space_id, updateSpaceChannel]
  );
  const onSelectRecentFile = useCallback(
    async (file) => {
      await updateSpaceChannel(space.space_id, {
        space_emoji: '',
        space_image_url: file.file_url,
      });
      popupSpaceIconRef.current?.hide();
    },
    [space?.space_id, updateSpaceChannel]
  );
  const renderChannelItem = useCallback(
    (c: any) => (
      <ChannelItem
        key={c.channel_id}
        c={c}
        currentChannel={currentChannel}
        onContextChannel={onContextChannel}
        collapsed={isCollapsed}
        isOwner={isOwner}
        updateChannel={updateChannel}
        uploadChannelAvatar={uploadChannelAvatar}
      />
    ),
    [
      currentChannel,
      isCollapsed,
      isOwner,
      onContextChannel,
      updateChannel,
      uploadChannelAvatar,
    ]
  );
  return (
    <div className={`space-item__container ${isCollapsed ? '' : 'space-open'}`}>
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={handleContextMenuSpaceChannel}
      >
        {isOwner ? (
          <PopoverButton
            ref={popupSpaceIconRef}
            componentButton={
              <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
            }
            componentPopup={
              <div
                className="emoji-picker__container"
                onClick={handlePopupClick}
              >
                <EmojiAndAvatarPicker
                  onAddFiles={onAddFiles}
                  onAddEmoji={onAddEmoji}
                  spaceId={space.space_id}
                  onSelectRecentFile={onSelectRecentFile}
                />
              </div>
            }
          />
        ) : (
          <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
        )}
        <span className="title text-ellipsis">{space.space_name}</span>
        {space.space_type === 'Private' && (
          <SpaceItemBadge
            color={space.icon_color}
            backgroundColor={space.icon_sub_color}
          />
        )}
      </div>
      {channelSpace?.map?.(renderChannelItem)}
    </div>
  );
};

export default SpaceItem;
