import { useHistory } from 'react-router-dom';
import images from 'renderer/common/images';
import './index.scss';

type ChannelItemProps = {
  c: any;
  currentChannel: any;
  onContextChannel: (e: any, channel: any) => void;
};

const ChannelItem = ({
  c,
  currentChannel,
  onContextChannel,
}: ChannelItemProps) => {
  const history = useHistory();
  const isSelected = c.channel_id === currentChannel.channel_id;
  const isPrivate = c.channel_type === 'Private';
  const isUnSeen = !c.seen;
  const isMuted = c.notification_type === 'Muted';
  const isQuiet = c.notification_type === 'Quiet';
  const prefix = !isPrivate ? '# ' : '';
  return (
    <div
      className={`channel-wrapper ${isSelected ? 'channel-selected' : ''} ${
        isMuted ? 'channel-muted' : ''
      } ${isUnSeen ? 'channel-un-seen' : ''}`}
      onClick={() => history.replace(`/home?channel_id=${c.channel_id}`)}
      onContextMenu={(e) => onContextChannel(e, c)}
    >
      {isPrivate && (
        <img className="img-private" alt="" src={images.icPrivateWhite} />
      )}
      <div style={{ flex: 1 }}>
        <span className="channel-name">
          {prefix}
          {c.channel_name}
        </span>
      </div>
      {isQuiet && <img className="img-bell" alt="" src={images.icBellQuite} />}
    </div>
  );
};

export default ChannelItem;
