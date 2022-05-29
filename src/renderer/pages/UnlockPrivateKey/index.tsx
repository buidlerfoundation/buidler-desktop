import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import actions from 'renderer/actions';
import actionTypes from 'renderer/actions/ActionTypes';
import { AsyncKey } from 'renderer/common/AppConfig';
import { clearData, getCookie } from 'renderer/common/Cookie';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import {
  getPrivateChannel,
  uniqChannelPrivateKey,
} from 'renderer/helpers/ChannelHelper';
import { createErrorMessageSelector } from 'renderer/reducers/selectors';
import { decryptString, getIV } from 'renderer/utils/DataCrypto';
import './index.scss';
import EmojiPicker from '../../components/EmojiPicker';
// import EthCrypto from 'eth-crypto';

type UnlockPrivateKeyProps = {
  findUser: () => any;
  findTeamAndChannel: () => any;
  team?: any;
  errorTeam?: any;
  userData?: any;
};

const UnlockPrivateKey = ({
  findUser,
  findTeamAndChannel,
  team,
  errorTeam,
  userData,
}: UnlockPrivateKeyProps) => {
  const history = useHistory();
  const [pass, setPass] = useState('');
  const dispatch = useDispatch();
  const initApp = useCallback(async () => {
    await uniqChannelPrivateKey();
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === 'string') {
      await findUser();
    }
  }, [findUser]);
  useEffect(() => {
    if (!userData) {
      initApp();
    }
  }, [userData, initApp]);
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
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = images.icImageDefault;
          }}
        />
        <span className="user-name">{userData.user_name}</span>
        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
          className="input-password"
          type="password"
          autoFocus
          onKeyDown={async (e) => {
            if (e.code === 'Enter') {
              try {
                const iv = await getIV();
                const encryptedStr: any = await getCookie(
                  AsyncKey.encryptedDataKey
                );
                const encryptedSeed: any = await getCookie(
                  AsyncKey.encryptedSeedKey
                );

                if (Object.keys(encryptedSeed || {}).length > 0) {
                  const seed = decryptString(encryptedSeed, pass, iv);
                  dispatch({
                    type: actionTypes.SET_SEED_PHRASE,
                    payload: seed,
                  });
                }
                const decryptedStr = decryptString(encryptedStr, pass, iv);
                if (!decryptedStr) {
                  toast.error('Invalid Password');
                } else {
                  const json = JSON.parse(decryptedStr);
                  const privateKey = json?.[userData.user_id];
                  dispatch({
                    type: actionTypes.SET_PRIVATE_KEY,
                    payload: privateKey,
                  });
                  const privateKeyChannel = await getPrivateChannel(privateKey);
                  dispatch({
                    type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
                    payload: privateKeyChannel,
                  });
                  await findTeamAndChannel?.();
                  history.replace('/home');
                }
              } catch (error) {
                toast.error('Invalid Password');
              }
            }
          }}
        />
      </div>
      {/* <EmojiPicker onClick={(emoji) => {}} /> */}
      <div
        className="add-other-button normal-button"
        onClick={() => {
          // clearData();
        }}
      >
        <span>Add other account</span>
      </div>
    </div>
  );
};

const errorSelector = createErrorMessageSelector([actionTypes.TEAM_PREFIX]);

const mapStateToProps = (state: any) => {
  return {
    team: state.user.team,
    errorTeam: errorSelector(state),
    userData: state.user.userData,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(UnlockPrivateKey);
