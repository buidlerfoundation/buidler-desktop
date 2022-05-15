import React from 'react';
import { spaceNameToAvatar } from 'renderer/helpers/ChannelHelper';
import './index.scss';

type DefaultSpaceIconProps = {
  name: string;
};

const DefaultSpaceIcon = ({ name }: DefaultSpaceIconProps) => {
  return (
    <div className="default-space-icon__container">
      <span className="text">{spaceNameToAvatar(name)}</span>
    </div>
  );
};

export default DefaultSpaceIcon;
