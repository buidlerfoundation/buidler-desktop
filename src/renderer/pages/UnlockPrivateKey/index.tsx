import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import actions from 'renderer/actions';
import actionTypes from 'renderer/actions/ActionTypes';
import { AsyncKey } from 'renderer/common/AppConfig';
import { getCookie } from 'renderer/common/Cookie';
import ImageHelper from 'renderer/common/ImageHelper';
import { createErrorMessageSelector } from 'renderer/reducers/selectors';
import { decryptString, getIV } from 'renderer/utils/DataCrypto';
import './index.scss';

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
  useEffect(() => {
    if (team == null && errorTeam === '') {
      findTeamAndChannel?.();
    }
  }, [team, errorTeam, findTeamAndChannel]);
  useEffect(() => {
    if (!userData) {
      findUser();
    }
  }, [userData, findUser]);
  if (!userData) return <div className="unlock-private-key__container" />;
  return (
    <div className="unlock-private-key__container">
      <img
        className="avatar"
        src={ImageHelper.normalizeImage(
          userData?.avatar_url,
          userData?.user_id
        )}
        alt=""
      />
      <span className="user-name">{userData.user_name}</span>
      <input
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="Password"
        className="input-password"
        type="password"
        onKeyDown={async (e) => {
          if (e.code === 'Enter') {
            try {
              const iv = await getIV();
              const encryptedStr: any = await getCookie(
                AsyncKey.encryptedDataKey
              );
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
                history.replace('/home');
              }
            } catch (error) {
              toast.error('Invalid Password');
            }
          }
        }}
      />
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
