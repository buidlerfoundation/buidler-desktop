import React, { useCallback, useEffect } from 'react';
import './App.scss';
import './styles/spacing.scss';
import './emoji.scss';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import TextareaAutosize from 'react-textarea-autosize';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core';
import { testSC } from './common/EthereumFunction';
import Main from './pages/Main';
import AppToastNotification from './components/AppToastNotification';
import GlobalVariable from './services/GlobalVariable';
import SocketUtils from './utils/SocketUtils';
import actions from './actions';
import WalletConnectUtils from './services/connectors/WalletConnectUtils';
import { clearData, getCookie, getDeviceCode } from './common/Cookie';
import { AsyncKey, LoginType } from './common/AppConfig';
import actionTypes from './actions/ActionTypes';
import api from './api';

type AppProps = {
  findUser: () => any;
  getInitial: () => () => void;
  logout: () => any;
};

function App({ findUser, getInitial, logout }: AppProps) {
  // console.log('XXX');
  // testSC();
  window.electron.cookies.setPath();
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const imgDomain = useSelector((state: any) => state.user.imgDomain);
  const initApp = useCallback(async () => {
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === 'string') {
      await findUser();
      history.replace('/home');
    }
    if (!imgDomain) {
      await getInitial?.();
    }
  }, [findUser, getInitial, imgDomain, history]);
  useEffect(() => {
    TextareaAutosize.defaultProps = {
      ...TextareaAutosize.defaultProps,
      onFocus: () => {
        GlobalVariable.isInputFocus = true;
      },
      onBlur: () => {
        GlobalVariable.isInputFocus = false;
      },
    };
    const eventOffline = () => {
      SocketUtils.socket?.disconnect?.();
    };
    const eventOnline = () => {
      if (!user) {
        initApp();
      } else {
        SocketUtils.reconnectIfNeeded();
      }
    };
    const eventPaste = (e: any) => {
      e.preventDefault();
      if (!e.clipboardData.types.includes('Files')) {
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    };
    window.addEventListener('offline', eventOffline);
    window.addEventListener('online', eventOnline);
    window.addEventListener('paste', eventPaste);
    return () => {
      window.removeEventListener('offline', eventOffline);
      window.removeEventListener('online', eventOnline);
      window.removeEventListener('paste', eventPaste);
    };
  }, [user, initApp]);
  const initGeneratedPrivateKey = useCallback(async () => {
    const generatedPrivateKey = await getCookie(AsyncKey.generatedPrivateKey);
    if (typeof generatedPrivateKey === 'string') {
      dispatch({
        type: actionTypes.SET_PRIVATE_KEY,
        payload: generatedPrivateKey,
      });
    }
  }, [dispatch]);
  useEffect(() => {
    initGeneratedPrivateKey();
  }, [initGeneratedPrivateKey]);
  const walletConnectLogout = useCallback(async () => {
    const deviceCode = await getDeviceCode();
    await api.removeDevice({
      device_code: deviceCode,
    });
    clearData(() => {
      window.location.reload();
      logout?.();
    });
  }, [logout]);
  useEffect(() => {
    WalletConnectUtils.init(walletConnectLogout);
    if (!WalletConnectUtils.connector?.connected) {
      getCookie(AsyncKey.loginType)
        .then((res) => {
          if (res === LoginType.WalletConnect) {
            walletConnectLogout();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [walletConnectLogout]);
  const overrides: any = {
    MuiPickersDay: {
      day: {
        color: 'var(--color-primary-text)',
      },
      daySelected: {
        backgroundColor: 'var(--color-stroke)',
      },
      dayDisabled: {
        color: 'var(--color-secondary-text)',
      },
      current: {
        color: 'var(--color-success)',
      },
    },
  };
  const materialTheme = createTheme({
    overrides,
    typography: {
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`,
      fontWeightMedium: 600,
      fontWeightBold: 'bold',
    },
  });

  return (
    <ThemeProvider theme={materialTheme}>
      <div>
        <Main />
        <AppToastNotification />
      </div>
    </ThemeProvider>
  );
}

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(undefined, mapActionsToProps)(App);
