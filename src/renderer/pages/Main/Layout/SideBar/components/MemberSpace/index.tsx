import { Emoji } from 'emoji-mart';
import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import images from 'renderer/common/images';
import MemberChild from '../MemberChild';
import './index.scss';

type MemberSpaceProps = {
  teamUserData?: Array<any>;
  userData: any;
  channel: Array<any>;
  currentChannel: any;
  onInviteMember: () => void;
  onContextMenu: (u: any) => (e: any) => void;
};

const MemberSpace = ({
  teamUserData,
  userData,
  channel,
  currentChannel,
  onInviteMember,
  onContextMenu,
}: MemberSpaceProps) => {
  const history = useHistory();
  const [isCollapsed, setCollapsed] = useState(true);
  const toggleCollapsed = useCallback(
    () => setCollapsed((current) => !current),
    []
  );
  const user = useMemo(
    () => teamUserData?.find?.((u) => u.user_id === userData?.user_id),
    [teamUserData, userData?.user_id]
  );
  const handleClickUser = useCallback(() => {
    history.replace(`/home?user_id=${user?.user_id}`);
  }, [history, user?.user_id]);
  const handleClickMember = useCallback(
    (u) => () => {
      history.replace(`/home?user_id=${u.user_id}`);
    },
    [history]
  );
  const handleFilterMember = useCallback(
    (u) => u.user_id !== userData?.user_id,
    [userData?.user_id]
  );
  const renderMember = useCallback(
    (u) => (
      <MemberChild
        onContextChannel={onContextMenu(u)}
        user={u}
        key={u.user_id}
        isUnSeen={
          channel.find((c: any) => c?.channel_id === u.direct_channel)?.seen ===
          false
        }
        isSelected={
          currentChannel?.channel_id === u.direct_channel ||
          currentChannel?.user?.user_id === u.user_id
        }
        onPress={handleClickMember(u)}
        collapsed={isCollapsed}
      />
    ),
    [
      channel,
      currentChannel?.channel_id,
      currentChannel?.user?.user_id,
      handleClickMember,
      isCollapsed,
      onContextMenu,
    ]
  );
  return (
    <div
      className={`member-space__container ${isCollapsed ? '' : 'space-open'}`}
    >
      <div className="title-wrapper" onClick={toggleCollapsed}>
        <div className="icon-wrapper">
          <Emoji emoji="smile" set="apple" size={20} />
        </div>
        <span className="title">Members</span>
      </div>
      {user && (
        <MemberChild
          user={user}
          isUnSeen={
            channel.find((c: any) => c?.channel_id === user.direct_channel)
              ?.seen === false
          }
          isSelected={
            currentChannel?.channel_id === user.direct_channel ||
            currentChannel?.user?.user_id === user.user_id
          }
          onPress={handleClickUser}
          collapsed={isCollapsed}
        />
      )}
      {teamUserData?.filter?.(handleFilterMember)?.map?.(renderMember)}
      <div
        className="member-child-container normal-button"
        onClick={onInviteMember}
      >
        <img alt="" src={images.icEditMember} style={{ marginLeft: 20 }} />
        <span className="member-child__username ml10">Invite member</span>
      </div>
    </div>
  );
};

export default MemberSpace;
