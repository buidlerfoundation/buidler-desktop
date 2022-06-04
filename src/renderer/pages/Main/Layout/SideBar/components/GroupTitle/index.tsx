import React, { useCallback } from 'react';
import './index.scss';
import images from '../../../../../../common/images';

type GroupTitleProps = {
  title: string;
  onCreateChannel?: () => void;
  isCollapsed?: boolean;
  toggleCollapsed?: () => void;
};

const GroupTitle = ({
  title,
  onCreateChannel,
  isCollapsed,
  toggleCollapsed,
}: GroupTitleProps) => {
  const handleCreateChannel = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onCreateChannel?.();
    },
    [onCreateChannel]
  );
  return (
    <div
      className="group-title-container normal-button"
      onClick={toggleCollapsed}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          className={`group-title__icon ${isCollapsed ? 'rotate' : ''}`}
          alt=""
          src={images.icCollapse}
        />
      </div>
      <span className="group-title__title">{title}</span>
      <div style={{ flex: 1 }} />
      {onCreateChannel && (
        <div
          className="plus-button"
          style={{ padding: 7 }}
          onClick={handleCreateChannel}
        >
          <img alt="" src={images.icPlus} />
        </div>
      )}
      <div style={{ width: 10 }} />
    </div>
  );
};

export default GroupTitle;
