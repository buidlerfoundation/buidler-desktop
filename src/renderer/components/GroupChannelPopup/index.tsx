import React from 'react';
import './index.scss';

type GroupChannelPopupProps = {
  group: Array<any>;
  onSelect: (item: any) => void;
};

const GroupChannelPopup = ({ group, onSelect }: GroupChannelPopupProps) => {
  return (
    <div className="channel-popup__container">
      {group.map((g) => (
        <div
          key={g?.group_channel_name}
          className="group-item normal-button"
          onClick={() => onSelect(g)}
        >
          <span>{g?.group_channel_name}</span>
        </div>
      ))}
    </div>
  );
};

export default GroupChannelPopup;
