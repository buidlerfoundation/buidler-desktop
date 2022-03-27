import React from 'react';
import ImageHelper from 'renderer/common/ImageHelper';
import './index.scss';

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
        src={ImageHelper.normalizeImage(user?.avatar_url, user?.user_id)}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
      {user?.status && <div className={`status ${user.status}`} />}
    </div>
  );
};

export default AvatarView;
