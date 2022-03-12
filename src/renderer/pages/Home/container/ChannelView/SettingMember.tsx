import React, { useMemo } from 'react';
import api from '../../../../api';
import images from '../../../../common/images';
import AvatarView from '../../../../components/AvatarView';
import PopoverButton from '../../../../components/PopoverButton';
import TeamUserPopup from '../../../../components/TeamUserPopup';

type SettingMemberProps = {
  currentChannel?: any;
  setCurrentChannel?: (channel: any) => any;
  teamUserData: Array<any>;
};

const SettingMember = ({
  currentChannel,
  setCurrentChannel,
  teamUserData,
}: SettingMemberProps) => {
  const users = useMemo(() => {
    if (!currentChannel) return [];
    const { channel_type, channel_member } = currentChannel;
    if (channel_type === 'Public') {
      return teamUserData;
    }
    if (!channel_member) return [];
    return channel_member
      .filter((id: string) => !!teamUserData.find((el) => el.user_id === id))
      .map((id: any) => teamUserData.find((el) => el.user_id === id));
  }, [currentChannel, teamUserData]);
  return (
    <div className="setting-body">
      <div style={{ height: 7.5 }} />
      {users.map((el: any) => (
        <div key={el.user_id} className="setting-member-item">
          <AvatarView user={el} />
          <span className="member-name">{el.full_name}</span>
        </div>
      ))}
      <PopoverButton
        componentButton={
          <div className="setting-member-item">
            <div
              style={{
                width: 25,
                height: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={images.icEditMember} alt="" />
            </div>
            <span className="member-name">Edit member</span>
          </div>
        }
        componentPopup={
          <TeamUserPopup
            selected={users}
            onClick={async (u) => {
              const isSelected = !!users.find(
                (el: any) => el.user_id === u.user_id
              );
              const res = isSelected
                ? await api.removeUserFromChannel(
                    currentChannel.channel_id,
                    u.user_id
                  )
                : await api.addUserToChannel(
                    currentChannel.channel_id,
                    u.user_id
                  );

              if (res.statusCode === 200) {
                setCurrentChannel?.({
                  ...currentChannel,
                  channel_member: isSelected
                    ? currentChannel.channel_member.filter(
                        (el: string) => el !== u.user_id
                      )
                    : [...currentChannel.channel_member, u.user_id],
                });
              }
            }}
          />
        }
      />
    </div>
  );
};

export default SettingMember;
