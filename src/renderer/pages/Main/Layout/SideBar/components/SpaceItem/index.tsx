import React, { useMemo, useState } from 'react';
import { Collapse } from 'react-collapse';
import ChannelItem from './ChannelItem';
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
  const [isCollapsed, setCollapsed] = useState(false);
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
  const currentChannelSpace = channelSpace.find(
    (el) => el.channel_id === currentChannel.channel_id
  );
  return (
    <div className={`space-item__container ${isCollapsed ? '' : 'space-open'}`}>
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={onContextSpaceChannel}
      >
        <span className="title">{space.space_name}</span>
      </div>
      {!!currentChannelSpace && (
        <div
          className={`fake-channel-child ${
            isCollapsed ? 'fake-channel-child-open' : ''
          }`}
        >
          <ChannelItem
            c={currentChannelSpace}
            currentChannel={currentChannel}
            onContextChannel={onContextChannel}
          />
        </div>
      )}
      <Collapse isOpened={!isCollapsed}>
        {channelSpace?.map?.((c: any) => (
          <ChannelItem
            key={c.channel_id}
            c={c}
            currentChannel={currentChannel}
            onContextChannel={onContextChannel}
          />
        ))}
      </Collapse>
    </div>
  );
};

export default SpaceItem;
