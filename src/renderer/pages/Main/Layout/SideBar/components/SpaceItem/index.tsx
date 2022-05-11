import { CircularProgress } from '@material-ui/core';
import { Emoji } from 'emoji-mart';
import { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import EmojiAndAvatarPicker from 'renderer/components/EmojiAndAvatarPicker';
import EmojiPicker from 'renderer/components/EmojiPicker';
import PopoverButton from 'renderer/components/PopoverButton';
import ChannelItem from './ChannelItem';
import './index.scss';

type SpaceItemProps = {
  space: any;
  channel: Array<any>;
  currentChannel: any;
  onCreateChannel: (group: any) => void;
  onContextChannel: (e: any, channel: any) => void;
  onContextSpaceChannel: (e: any) => void;
  updateSpaceChannel: (spaceId: string, body: any) => any;
  uploadSpaceAvatar: (teamId: string, spaceId: string, file: any) => any;
  isOwner: boolean;
};

const SpaceItem = ({
  space,
  channel,
  currentChannel,
  onCreateChannel,
  onContextChannel,
  onContextSpaceChannel,
  updateSpaceChannel,
  uploadSpaceAvatar,
  isOwner,
}: SpaceItemProps) => {
  const popupSpaceIconRef = useRef<any>();
  const [isCollapsed, setCollapsed] = useState(true);
  const currentTeam = useSelector((state) => state.user.currentTeam);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
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
  const renderSpaceIcon = () => {
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
    return <img className="space-icon" src={images.icLogoSquare} alt="" />;
  };
  const onAddFiles = async (fs) => {
    if (fs == null || fs.length === 0) return;
    const file = [...fs][0];
    uploadSpaceAvatar(currentTeam.team_id, space.space_id, file);
    popupSpaceIconRef.current?.hide();
  };
  const onAddEmoji = async (emoji) => {
    await updateSpaceChannel(space.space_id, {
      space_emoji: emoji.id,
      space_image_url: '',
    });
    popupSpaceIconRef.current?.hide();
  };
  return (
    <div className={`space-item__container ${isCollapsed ? '' : 'space-open'}`}>
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={onContextSpaceChannel}
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
                onClick={(e) => e.stopPropagation()}
              >
                <EmojiAndAvatarPicker
                  onAddFiles={onAddFiles}
                  onAddEmoji={onAddEmoji}
                />
              </div>
            }
          />
        ) : (
          <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
        )}

        <span className="title">{space.space_name}</span>
      </div>
      {channelSpace?.map?.((c: any) => (
        <ChannelItem
          key={c.channel_id}
          c={c}
          currentChannel={currentChannel}
          onContextChannel={onContextChannel}
          collapsed={isCollapsed}
        />
      ))}
    </div>
  );
};

export default SpaceItem;
