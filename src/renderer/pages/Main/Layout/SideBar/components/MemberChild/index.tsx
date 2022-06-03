import { useCallback } from 'react';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import AvatarView from '../../../../../../components/AvatarView';
import './index.scss';

type MemberChildProps = {
  user: any;
  onPress?: () => void;
  isUnSeen?: boolean;
  isSelected?: boolean;
  onContextChannel?: (e: any, u: any) => void;
  collapsed: boolean;
};

const MemberChild = ({
  user,
  onPress = () => {},
  isUnSeen,
  isSelected,
  onContextChannel,
  collapsed,
}: MemberChildProps) => {
  const handleContextMenu = useCallback(
    (e) => {
      onContextChannel?.(e, user);
    },
    [onContextChannel, user]
  );
  return (
    <div
      className={`member-child-container ${collapsed ? 'collapsed' : ''} ${
        isSelected ? 'active' : ''
      } ${isUnSeen ? 'un-seen' : ''}`}
      onClick={onPress}
      onContextMenu={handleContextMenu}
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
