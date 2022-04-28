import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import { useHistory } from 'react-router-dom';
import images from 'renderer/common/images';
import './index.scss';

type SpaceItemProps = {
  space: any;
  channel: Array<any>;
  currentChannel: any;
  onCreateChannel: (group: any) => void;
  onContextChannel: (e: any, channel: any) => void;
  onContextSpaceChannel: (e: any) => void;
};

const SpaceItem = ({
  space,
  channel,
  currentChannel,
  onCreateChannel,
  onContextChannel,
  onContextSpaceChannel,
}: SpaceItemProps) => {
  const history = useHistory();
  const [isCollapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
  return (
    <div className={`space-item__container ${isCollapsed ? '' : 'space-open'}`}>
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={onContextSpaceChannel}
      >
        <span className="title">{space.space_name}</span>
      </div>
      <Collapse isOpened={!isCollapsed}>
        {channel
          ?.filter((c: any) => c?.space_id === space?.space_id)
          .sort((a1, a2) => {
            if (a1.channel_name < a2.channel_name) return 1;
            if (a1.channel_name > a2.channel_name) return -1;
            return 0;
          })
          .sort((b1, b2) => {
            if (b1.channel_type < b2.channel_type) return 1;
            return -1;
          })
          ?.map?.((c: any, idx: number) => {
            const isSelected = c.channel_id === currentChannel.channel_id;
            const isPrivate = c.channel_type === 'Private';
            const isUnSeen = !c.seen;
            const isMuted = c.notification_type === 'Muted';
            const isQuiet = c.notification_type === 'Quiet';
            const prefix = !isPrivate ? '# ' : '';
            return (
              <div
                className={`channel-wrapper ${
                  isSelected ? 'channel-selected' : ''
                } ${isMuted ? 'channel-muted' : ''} ${
                  isUnSeen ? 'channel-un-seen' : ''
                }`}
                key={c.channel_id}
                onClick={() =>
                  history.replace(`/home?channel_id=${c.channel_id}`)
                }
                onContextMenu={(e) => onContextChannel(e, c)}
              >
                {isPrivate && (
                  <img
                    className="img-private"
                    alt=""
                    src={images.icPrivateWhite}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <span className="channel-name">
                    {prefix}
                    {c.channel_name}
                  </span>
                </div>
                {isQuiet && (
                  <img className="img-bell" alt="" src={images.icBellQuite} />
                )}
              </div>
            );
          })}
      </Collapse>
    </div>
  );
};

export default SpaceItem;
