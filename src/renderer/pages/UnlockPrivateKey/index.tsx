import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import actionTypes from 'renderer/actions/ActionTypes';
import {
  findTeamAndChannel,
  findUser,
  logout,
} from 'renderer/actions/UserActions';
import { AsyncKey } from 'renderer/common/AppConfig';
import { clearData, getCookie } from 'renderer/common/Cookie';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import {
  getPrivateChannel,
  uniqChannelPrivateKey,
} from 'renderer/helpers/ChannelHelper';
import useAppSelector from 'renderer/hooks/useAppSelector';
import GlobalVariable from 'renderer/services/GlobalVariable';
import ModalConfirmDelete from 'renderer/shared/ModalConfirmDelete';
import IconClose from 'renderer/shared/SVG/IconClose';
import { decryptString, getIV } from 'renderer/utils/DataCrypto';
import './index.scss';
import { onUpdateKey } from 'renderer/actions/ConfigActions';

type UnlockPrivateKeyProps = {
  onUnlock?: (secureData: string) => void;
  embedded?: boolean;
  onClose?: () => void;
};

const UnlockPrivateKey = ({
  onUnlock,
  embedded,
  onClose,
}: UnlockPrivateKeyProps) => {
  const [isOpenConfirmLogout, setOpenConfirmLogout] = useState(false);
  const userData = useAppSelector((state) => state.user.userData);
  const history = useHistory();
  const [pass, setPass] = useState('');
  const dispatch = useDispatch();
  const initApp = useCallback(async () => {
    await uniqChannelPrivateKey();
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === 'string') {
      await dispatch(findUser());
    }
  }, [dispatch]);
  useEffect(() => {
    if (!userData.user_id) {
      initApp();
    }
  }, [userData, initApp]);
  const handleErrorAvatar = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.onerror = null; // prevents looping
      e.currentTarget.src = images.icImageDefault;
    },
    []
  );
  const handleChangePass = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPass(e.target.value),
    []
  );
  const handlePasswordKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.code === 'Enter') {
        try {
          const iv = await getIV();
          const encryptedStr: any = await getCookie(AsyncKey.encryptedDataKey);
          const encryptedSeed: any = await getCookie(AsyncKey.encryptedSeedKey);
          let seed = null;
          if (Object.keys(encryptedSeed || {}).length > 0) {
            seed = decryptString(encryptedSeed, pass, iv);
          }
          const decryptedStr = decryptString(encryptedStr, pass, iv);
          if (!decryptedStr) {
            toast.error('Invalid Password');
          } else {
            const json = JSON.parse(decryptedStr);
            const privateKey = json?.[userData.user_id];
            if (embedded) {
              onUnlock?.(seed || privateKey);
              return;
            }
            dispatch(onUpdateKey({ privateKey, seed }));
            const privateKeyChannel = await getPrivateChannel(privateKey);
            dispatch({
              type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
              payload: privateKeyChannel,
            });
            await dispatch(findTeamAndChannel());
            history.replace('/channels');
          }
        } catch (error) {
          toast.error('Something went wrong, please try again later.');
        }
      }
    },
    [dispatch, embedded, history, onUnlock, pass, userData.user_id]
  );
  const handleLogout = useCallback(() => {
    clearData(() => {
      history.replace('/started');
      dispatch(logout());
    });
  }, [dispatch, history]);
  const toggleModalLogout = useCallback(
    () => setOpenConfirmLogout((current) => !current),
    []
  );
  if (!userData) return <div className="unlock-private-key__container" />;
  return (
    <div className="unlock-private-key__container">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          className="avatar"
          src={ImageHelper.normalizeImage(
            userData?.avatar_url,
            userData?.user_id
          )}
          alt=""
          onError={handleErrorAvatar}
        />
        <span className="user-name">{userData.user_name}</span>
        <input
          value={pass}
          onChange={handleChangePass}
          placeholder="Password"
          className="input-password"
          type="password"
          autoFocus
          onKeyDown={handlePasswordKeyDown}
        />
      </div>
      {!embedded && (
        <>
          <div
            className="add-other-button normal-button"
            onClick={toggleModalLogout}
          >
            <span>Logout</span>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-highlight-action-high)',
              marginBottom: 15,
            }}
          >
            Version: {GlobalVariable.version}
          </span>
        </>
      )}
      <ModalConfirmDelete
        open={isOpenConfirmLogout}
        handleClose={toggleModalLogout}
        title="Logout"
        description="Buidler will automatically remove all your data from this account if you log out. Are you sure you want to log out?"
        onDelete={handleLogout}
        contentDelete="Logout"
      />
      {embedded && (
        <div
          className="normal-button-clear"
          style={{ position: 'fixed', padding: 10, top: 0, right: 0 }}
          onClick={onClose}
        >
          <IconClose />
        </div>
      )}
    </div>
  );
};

export default UnlockPrivateKey;
