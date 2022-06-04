import React from 'react';
import IconStar from '../SVG/IconStar';
import './index.scss';

type SpaceBadgeProps = {
  color: string;
  backgroundColor: string;
};

const SpaceItemBadge = ({ color, backgroundColor }: SpaceBadgeProps) => {
  return (
    <div
      className="space-badge__container"
      style={{ backgroundColor: backgroundColor || '#56C1951A' }}
    >
      <IconStar fill={color || '#56C195'} size={10} />
    </div>
  );
};

export default SpaceItemBadge;
