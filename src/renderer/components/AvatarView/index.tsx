import React, { useCallback } from 'react';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import './index.scss';

type AvatarViewProps = {
  user: any;
  size?: number;
};

const AvatarView = ({ user, size = 25 }: AvatarViewProps) => {
  const handleErrorAvatar = useCallback(({ currentTarget }) => {
    currentTarget.onerror = null; // prevents looping
    currentTarget.src = images.icImageDefault;
  }, []);
  return (
    <div className="avatar-view">
      <img
        className="avatar-image"
        alt=""
        src={ImageHelper.normalizeImage(user?.avatar_url, user?.user_id)}
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
        onError={handleErrorAvatar}
      />
      {user?.status && <div className={`status ${user.status}`} />}
    </div>
  );
};

export default AvatarView;
