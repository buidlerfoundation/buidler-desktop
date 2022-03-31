import React, { useEffect, useState } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import images from '../../common/images';
import UpdateUserProfile from './UpdateUserProfile';
import UpdateNotification from './UpdateNotification';
import UpdateDefaultChannel from './UpdateDefaultChannel';
import api from 'renderer/api';
import NormalButton from '../NormalButton';

type ModalUserSettingProps = {
  open: boolean;
  handleClose: () => void;
  user?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  channels?: Array<any>;
  onLogout: () => void;
  updateUser?: (userData: any) => any;
};

const ModalUserSetting = ({
  open,
  user,
  handleClose,
  currentChannel,
  updateUserChannel,
  channels,
  onLogout,
  updateUser,
}: ModalUserSettingProps) => {
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState({
    avatarUrl: user?.avatar_url,
    userName: user?.user_name,
    ensAsset: null,
    nftAsset: null,
  });
  const [collectibleData, setCollectibleData] = useState({ ens: [], nft: [] });
  const fetchData = async () => {
    const res = await api.getCollectibles();
    if (res.statusCode === 200) {
      setCollectibleData({
        ens: res.ens_assets,
        nft: res.nft_assets.filter((el: any) => el.is_active),
      });
    }
  };
  useEffect(() => {
    if (open) {
      fetchData();
      setUserData({
        avatarUrl: user?.avatar_url,
        userName: user?.user_name,
        ensAsset: user?.is_verified_username ? user?.user_name : null,
        nftAsset: null,
      });
    }
  }, [user, open]);
  const settings = [
    {
      label: 'User profile',
      activeIcon: images.icUserCircleWhite,
      icon: images.icUserCircle,
      id: '1',
    },
    {
      label: 'Notification',
      activeIcon: images.icUserSettingNotificationWhite,
      icon: images.icUserSettingNotification,
      id: '2',
    },
    {
      label: 'Default channel',
      activeIcon: images.icUserSettingDefaultChannelWhite,
      icon: images.icUserSettingDefaultChannel,
      id: '3',
    },
  ];
  const [currentPageId, setCurrentPageId] = useState(settings[0].id);
  const onSave = async () => {
    if (uploading) return;
    await updateUser?.(userData);
    handleClose();
  };
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
          {settings.map((el) => {
            const isActive = currentPageId === el.id;
            return (
              <div
                className={`setting-item ${isActive && 'active'}`}
                key={el.label}
                onClick={() => setCurrentPageId(el.id)}
              >
                <img alt="" src={isActive ? el.activeIcon : el.icon} />
                <span className="setting-label">{el.label}</span>
              </div>
            );
          })}
          <div className="log-out__wrapper" onClick={onLogout}>
            <img alt="" src={images.icLeaveTeam} />
            <span className="log-out-text">Logout</span>
          </div>
        </div>
        <div className="body">
          {currentPageId === '1' && (
            <UpdateUserProfile
              setUploading={setUploading}
              collectibleData={collectibleData}
              userData={userData}
              user={user}
              onUpdateAvatar={(url) =>
                setUserData({ ...userData, avatarUrl: url || user?.avatar_url })
              }
              onUpdateENS={(ens) => setUserData({ ...userData, ensAsset: ens })}
              onUpdateNFT={(nft) => setUserData({ ...userData, nftAsset: nft })}
              onUpdateUserName={(name) =>
                setUserData({ ...userData, userName: name })
              }
            />
          )}
          {currentPageId === '2' && <UpdateNotification />}
          {currentPageId === '3' && (
            <UpdateDefaultChannel
              user={user}
              channels={channels}
              currentChannel={currentChannel}
              updateUserChannel={updateUserChannel}
            />
          )}
          <div style={{ flex: 1 }} />
          <div className="bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Save" onPress={onSave} type="main" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalUserSetting;
