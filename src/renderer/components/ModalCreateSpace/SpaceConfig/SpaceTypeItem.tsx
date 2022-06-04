import React, { useCallback } from 'react';
import '../index.scss';

type SpaceTypeItemProps = {
  item: string;
  onClick: (item: string) => void;
  isActive: boolean;
};

const SpaceTypeItem = ({ item, onClick, isActive }: SpaceTypeItemProps) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);
  return (
    <div
      className={`space-type ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <span>{item}</span>
    </div>
  );
};

export default SpaceTypeItem;
