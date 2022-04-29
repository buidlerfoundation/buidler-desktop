import React, { useState } from 'react';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import AvatarView from '../../../../../../components/AvatarView';
import './index.scss';

type MemberChildProps = {
  user: any;
  onPress?: () => void;
  isUnSeen?: boolean;
  isSelected?: boolean;
  onContextChannel?: (e: any) => void;
};

const MemberChild = ({
  user,
  onPress = () => {},
  isUnSeen,
  isSelected,
  onContextChannel,
}: MemberChildProps) => {
  return (
    <div
      className={`member-child-container ${isSelected ? 'active' : ''} ${
        isUnSeen ? 'un-seen' : ''
      }`}
      onClick={onPress}
      onContextMenu={onContextChannel}
    >
      <div style={{ marginLeft: 20 }}>
        <AvatarView user={user} />
      </div>
      <span className="member-child__username ml10">
        {normalizeUserName(user.user_name)}
      </span>
    </div>
  );
};

export default MemberChild;
