import React from 'react';
import images from 'renderer/common/images';
import AvatarView from '../AvatarView';
import './index.scss';

type TeamUserItemProps = {
  user: any;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const TeamUserItem = ({
  user,
  isSelected,
  onClick,
  disabled,
}: TeamUserItemProps) => {
  return (
    <div className="user-item" onClick={disabled ? undefined : onClick}>
      <AvatarView user={user} size={25} />
      <span className={`user-name ${isSelected && 'selected'}`}>
        {user.user_name}
      </span>
      <div style={{ flex: 1 }} />
      {isSelected && <img alt="" src={images.icCheckWhite} />}
    </div>
  );
};

export default TeamUserItem;