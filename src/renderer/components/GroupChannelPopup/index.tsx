import React, { useCallback } from 'react';
import './index.scss';

type SelectSpaceItemProps = {
  space: any;
  onClick: (space: any) => void;
};

const SelectSpaceItem = ({ space, onClick }: SelectSpaceItemProps) => {
  const handleSelectSpace = useCallback(() => {
    onClick(space);
  }, [onClick, space]);
  return (
    <div className="group-item normal-button" onClick={handleSelectSpace}>
      <span>{space?.space_name}</span>
    </div>
  );
};

type GroupChannelPopupProps = {
  space: Array<any>;
  onSelect: (item: any) => void;
};

const GroupChannelPopup = ({ space, onSelect }: GroupChannelPopupProps) => {
  const handleSelectSpace = useCallback((item) => onSelect(item), [onSelect]);
  const renderSpaceItem = useCallback(
    (item) => (
      <SelectSpaceItem
        space={item}
        key={item?.space_id}
        onClick={handleSelectSpace}
      />
    ),
    [handleSelectSpace]
  );
  return (
    <div className="channel-popup__container">{space.map(renderSpaceItem)}</div>
  );
};

export default GroupChannelPopup;
