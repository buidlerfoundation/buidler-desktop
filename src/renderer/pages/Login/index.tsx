import React from 'react';
import { ipcRenderer } from 'electron';
import './index.scss';
import images from '../../common/images';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

type LoginScreenProps = {
  login: (accessToken: string, callback: (res: boolean) => void) => boolean;
  loginGoogleUrl?: string;
};

const LoginScreen = ({ login, loginGoogleUrl }: LoginScreenProps) => {
  const history = useHistory();
  const extractResponseFromGoogle = (data: string) => {
    return data.split('response=')?.[1];
  };
  const openBrowserLoginGoogle = () => {
    // const redirectUrl = 'http://localhost:3006';
    // const redirectUrl = 'https://redirect.remotetoday.app';
    // window.open(
    //   `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?access_type=offline&scope=profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&prompt=select_account&response_type=code&client_id=172062646996-7iehu6ue6lsdd2iasibhf0us4kpsh236.apps.googleusercontent.com&redirect_uri=${redirectUrl}&flowName=GeneralOAuthFlow`
    // );
    window.open(loginGoogleUrl);
    ipcRenderer.removeAllListeners('login-response');
    ipcRenderer.send('doing-login', 'ping');
    ipcRenderer.on('login-response', async (event, arg) => {
      const code = extractResponseFromGoogle(arg);
      if (code) {
        await login(code, (res: boolean) => {
          if (res) {
            history.replace('/home');
          }
        });
      }
    });
  };
  return (
    <div className="login-container">
      <div className="login-body">
        <div className="login-info-view">
          <img className="login-logo" alt="" src={images.notableLogo} />
          <span className="login-title">
            Buidler
            <br />
            is a new day
          </span>
          <span className="login-description">
            Buidler is a daily tool for chat, tasks,
            <br />
            meeting
          </span>
        </div>
        {loginGoogleUrl && (
          <div
            className="normal-button google-button"
            onClick={openBrowserLoginGoogle}
          >
            <img className="logo-google" src={images.icGoogle} alt="" />
            <span className="login-google-text">Sign in with Google</span>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    loginGoogleUrl: state.user.loginGoogleUrl,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(LoginScreen);
