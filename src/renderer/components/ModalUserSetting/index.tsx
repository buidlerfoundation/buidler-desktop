import React from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import images from '../../common/images';
import AppInput from '../AppInput';
import TagView from '../TagView';

type ModalUserSettingProps = {
  open: boolean;
  handleClose: () => void;
  user?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  channels?: Array<any>;
  onLogout: () => void;
};

const ModalUserSetting = ({
  open,
  user,
  handleClose,
  currentChannel,
  updateUserChannel,
  channels,
  onLogout,
}: ModalUserSettingProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="user-setting-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div className="user-setting__container">
        <div className="left-side">
          <div className="group-setting-title" style={{ marginTop: 10 }}>
            <span>GENERAL</span>
          </div>
          <div className="setting-item">
            <img alt="" src={images.icUserCircle} />
            <span className="setting-label">User profile</span>
          </div>
          <div className="setting-item">
            <div className="ic-notification">
              <img alt="" src={images.icSettingChannelNotification} />
            </div>
            <span className="setting-label">Notification</span>
          </div>
        </div>
        <div className="body">
          <span className="modal-label">Update user profile</span>
          <div className="user-avatar__wrapper">
            <img className="user-avatar" src={user?.avatar_url} alt="" />
          </div>
          <div className="input-wrapper">
            <AppInput
              className="app-input"
              placeholder="Enter your name"
              onChange={(e) => {}}
              value={user?.user_name}
              disabled
            />
          </div>
          <span className="modal-label" style={{ marginTop: 36 }}>
            User channel default
          </span>
          <div style={{ height: 35 }} />
          <TagView
            isUserChannel
            channels={
              user?.user_channels?.map?.((el: any) =>
                channels?.find((c) => c.channel_id === el)
              ) || []
            }
            currentChannel={currentChannel}
            onChange={(c) => {
              updateUserChannel?.(
                c.filter((el) => el.channel_type !== 'Direct')
              );
            }}
          />
          <span className="user-channel-des">
            Your task will be automatically added to channels default when a
            task has been created in a direct message.
          </span>
          <div className="log-out__wrapper" onClick={onLogout}>
            <img alt="" src={images.icLeaveTeam} />
            <span className="log-out-text">Logout</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalUserSetting;
