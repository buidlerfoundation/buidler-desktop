import React, { useCallback } from 'react';
import IconStar from 'renderer/components/SVG/IconStar';
import '../index.scss';

type SpaceBadgeItemProps = {
  item: any;
  onClick: (item: any) => void;
  isActive: boolean;
};

const SpaceBadgeItem = ({ item, onClick, isActive }: SpaceBadgeItemProps) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);
  return (
    <div
      className="badge-item"
      style={{
        '--hover-background': item.backgroundColor,
        outline: isActive ? `1px solid ${item.color}` : 'none',
      }}
      onClick={handleClick}
    >
      <IconStar fill={item.color} />
    </div>
  );
};

export default SpaceBadgeItem;
