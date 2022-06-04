import React, { useEffect, useState } from 'react';
import { Modal } from '@material-ui/core';
import api from 'renderer/api';
import GlobalVariable from 'renderer/services/GlobalVariable';
import './index.scss';
import images from '../../common/images';
import UpdateUserProfile from './UpdateUserProfile';
import UpdateNotification from './UpdateNotification';
import NormalButton from '../NormalButton';
import SettingSecurity from './SettingSecurity';
import ModalConfirmDelete from '../ModalConfirmDelete';
import SettingBalance from '../ModalWalletSetting/SettingBalance';

type ModalUserSettingProps = {
  open: boolean;
  handleClose: () => void;
  user?: any;
  onLogout: () => void;
  updateUser?: (userData: any) => any;
};

const ModalUserSetting = ({
  open,
  user,
  handleClose,
  onLogout,
  updateUser,
}: ModalUserSettingProps) => {
  const [isOpenConfirmLogout, setOpenConfirmLogout] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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
      id: '1',
      groupLabel: 'Wallet',
      items: [
        {
          label: 'Balance',
          icon: images.icSettingWalletBalance,
          id: 'wallet_balance',
        },
        {
          label: 'Transaction',
          icon: images.icSettingWalletTransaction,
          id: 'wallet_transaction',
        },
        {
          label: 'NFTs',
          icon: images.icSettingWalletNFT,
          id: 'wallet_nft',
        },
        {
          label: 'Settings',
          icon: images.icCommunitySetting,
          id: 'wallet_settings',
        },
      ],
    },
    {
      id: '2',
      groupLabel: 'General',
      items: [
        {
          label: 'User profile',
          icon: images.icUserCircle,
          id: 'general_user_profile',
        },
        {
          label: 'Notification',
          icon: images.icSettingChannelNotification,
          id: 'general_notification',
        },
        {
          label: 'Security',
          icon: images.icSettingSecure,
          id: 'general_security',
        },
      ],
    },
  ];
  const [currentPageId, setCurrentPageId] = useState('wallet_balance');
  const onSave = async () => {
    if (uploading) return;
    setLoading(true);
    await updateUser?.(userData);
    setLoading(false);
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
          {settings.map((group) => {
            return (
              <div key={group.id}>
                <div className="group-setting-title" style={{ marginTop: 10 }}>
                  <span>{group.groupLabel}</span>
                </div>
                {group.items.map((el) => {
                  const isActive = currentPageId === el.id;
                  return (
                    <div
                      className={`setting-item ${isActive && 'active'}`}
                      key={el.label}
                      onClick={() => setCurrentPageId(el.id)}
                    >
                      <img alt="" src={el.icon} />
                      <span className="setting-label">{el.label}</span>
                      {el.badge && <div className="badge-backup mr10" />}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div
            className="log-out__wrapper"
            onClick={() => setOpenConfirmLogout(true)}
          >
            <img alt="" src={images.icLeaveTeam} />
            <span className="log-out-text">Logout</span>
          </div>
          <div className="app-version">
            <span>{GlobalVariable.version}</span>
          </div>
        </div>
        <div className="body">
          {currentPageId === 'wallet_balance' && <SettingBalance />}
          {currentPageId === 'general_user_profile' && (
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
          {currentPageId === 'general_notification' && <UpdateNotification />}
          {currentPageId === 'general_security' && <SettingSecurity />}
          <div style={{ flex: 1 }} />
          <div className="bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title="Save"
              onPress={onSave}
              type="main"
              loading={loading}
            />
          </div>
        </div>
        <ModalConfirmDelete
          open={isOpenConfirmLogout}
          handleClose={() => setOpenConfirmLogout(false)}
          title="Logout"
          description="Buidler will automatically remove all your data from this account if you log out. Are you sure you want to log out?"
          onDelete={onLogout}
          contentDelete="Logout"
        />
      </div>
    </Modal>
  );
};

export default ModalUserSetting;
