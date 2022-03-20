import React, {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import images from '../../../../common/images';
import AvatarView from '../../../../components/AvatarView';
import PopoverButton from '../../../../components/PopoverButton';
import ChannelSettings from './ChannelSettings';
import './index.scss';

type ChannelHeaderProps = {
  currentChannel?: any;
  teamUserData: Array<any>;
  setCurrentChannel?: (channel: any) => any;
  deleteChannel: (channelId: string) => any;
  updateChannel: (channelId: string, body: any) => any;
};

const ChannelHeader = forwardRef(
  (
    {
      currentChannel,
      teamUserData,
      setCurrentChannel,
      deleteChannel,
      updateChannel,
    }: ChannelHeaderProps,
    ref
  ) => {
    const [isActiveMember, setActiveMember] = useState(false);
    const [isActiveName, setActiveName] = useState(false);
    const settingButtonRef = useRef<any>();
    const settingRef = useRef<any>();
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
    const isChannelPrivate = currentChannel?.channel_type === 'Private';
    const prefix = isChannelPrivate ? '' : '# ';
    useImperativeHandle(ref, () => {
      return {
        showSetting(action: 'edit-member' | 'edit-name') {
          if (action === 'edit-member') {
            setActiveMember(true);
          }
          if (action === 'edit-name') {
            setActiveName(true);
          }
          settingButtonRef.current.click();
        },
        hideSetting() {
          settingRef.current?.hide?.();
        },
      };
    });
    return (
      <div className="channel-view__header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 5,
          }}
        >
          {currentChannel?.user && (
            <div style={{ marginLeft: 15 }}>
              <AvatarView
                user={teamUserData.find(
                  (u) => u.user_id === currentChannel?.user?.user_id
                )}
                size={35}
              />
            </div>
          )}
          {isChannelPrivate && (
            <img
              style={{
                marginLeft: 15,
                marginTop: 1,
              }}
              alt=""
              src={images.icPrivateWhite}
            />
          )}
          <div
            ref={settingButtonRef}
            onClick={(e) => {
              settingRef.current?.show(e.currentTarget, {
                x: 385,
                y: 110,
              });
            }}
          >
            <span
              className="channel-view__title"
              style={{ marginLeft: isChannelPrivate ? 5 : 15 }}
            >
              {currentChannel?.user?.user_name ||
                `${prefix}${currentChannel?.channel_name}`}
            </span>
          </div>
          {isChannelPrivate && (
            <div
              className="channel-view__members"
              onClick={(e) => {
                setActiveMember(true);
                settingRef.current?.show(e.currentTarget, {
                  x: e.pageX,
                  y: e.pageY,
                });
              }}
            >
              {users.slice(0, 10).map((el: any, index: number) => (
                <div
                  key={el.user_id}
                  className="avatar__wrapper"
                  style={{ left: 15 * index }}
                >
                  <img
                    className="avatar"
                    src={el.avatar_url}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
              {users.length - 10 > 0 && (
                <div
                  className="avatar-more__wrapper"
                  style={{ left: 15 * Math.min(10, users.length) }}
                >
                  <span>{users.length - 10}+</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="channel-view__actions">
          <PopoverButton
            popupOnly
            ref={settingRef}
            onClose={() => {
              setActiveMember(false);
              setActiveName(false);
            }}
            componentPopup={
              <ChannelSettings
                currentChannel={currentChannel}
                setCurrentChannel={setCurrentChannel}
                teamUserData={teamUserData}
                isActiveMember={isActiveMember}
                isActiveName={isActiveName}
                deleteChannel={deleteChannel}
                updateChannel={updateChannel}
                onClose={() => {
                  settingRef.current?.hide?.();
                }}
              />
            }
          />
        </div>
      </div>
    );
  }
);

export default ChannelHeader;
