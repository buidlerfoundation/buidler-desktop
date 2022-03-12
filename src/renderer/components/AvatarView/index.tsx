import React from 'react';
import './index.global.scss';

type AvatarViewProps = {
  user: any;
  size?: number;
};

const AvatarView = ({ user, size = 25 }: AvatarViewProps) => {
  return (
    <div className="avatar-view">
      <img
        className="avatar-image"
        alt=""
        src={user?.avatar_url}
        style={{ width: size, height: size }}
      />
      {user?.status && <div className={`status ${user.status}`} />}
    </div>
  );
};

export default AvatarView;
