import React, { useState } from 'react';
import './index.scss';
import images from '../../../../../../common/images';
import TaskChild from '../TaskChild';

type GroupChildProps = {
  title: string;
  type: string;
  isSelected?: boolean;
  onPress?: () => void;
  isPrivate?: boolean;
  isUnSeen?: boolean;
  isMuted?: boolean;
};

const GroupChild = ({
  title,
  type,
  isSelected,
  onPress = () => {},
  isPrivate,
  isUnSeen,
  isMuted,
}: GroupChildProps) => {
  const [isHover, setHover] = useState(false);
  if (type === 'task') {
    return <TaskChild title={title} />;
  }
  const prefix = !isPrivate ? '# ' : '';
  const filter: any =
    isSelected || isUnSeen || isHover ? null : 'brightness(0.5)';
  return (
    <div
      className={`group-child-container ${isMuted && 'muted'} ${
        isSelected && 'group-selected'
      } ${isUnSeen && 'group-un-seen'} normal-button`}
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ width: 25 }} />
      <div className="ml15" style={{ display: 'flex', alignItems: 'center' }}>
        {isPrivate && (
          <img
            style={{ marginLeft: 5, width: 12, height: 'auto', filter }}
            alt=""
            src={images.icPrivateWhite}
          />
        )}
        <span className="group-child__title ml5">
          {prefix}
          {title}
        </span>
      </div>
    </div>
  );
};

GroupChild.defaultProps = {
  isSelected: false,
};

export default GroupChild;
