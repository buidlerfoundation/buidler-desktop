import React, { useCallback, useEffect } from 'react';
import './App.scss';
import './styles/spacing.scss';
import './emoji.scss';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core';
import Main from './pages/Main';
import AppToastNotification from './shared/AppToastNotification';
import GlobalVariable from './services/GlobalVariable';
import SocketUtils from './utils/SocketUtils';
import WalletConnectUtils from './services/connectors/WalletConnectUtils';
import {
  clearData,
  GeneratedPrivateKey,
  getCookie,
  getDeviceCode,
} from './common/Cookie';
import { AsyncKey, LoginType } from './common/AppConfig';
import actionTypes from './actions/ActionTypes';
import api from './api';
import { getInitial, logout } from './actions/UserActions';
import useAppSelector from './hooks/useAppSelector';
import ErrorBoundary from './shared/ErrorBoundary';
import GoogleAnalytics from './services/analytics/GoogleAnalytics';

function App() {
  window.electron.cookies.setPath();
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const imgDomain = useAppSelector((state: any) => state.user.imgDomain);
  const initApp = useCallback(async () => {
    if (!imgDomain) {
      await dispatch(getInitial?.());
    }
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken && typeof accessToken === 'string') {
      history.replace('/channels');
    }
  }, [imgDomain, dispatch, history]);
  useEffect(() => {
    GoogleAnalytics.init();
  }, []);
  useEffect(() => {
    if (user.user_id) {
      GoogleAnalytics.identify(user);
    }
  }, [user]);
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
      if (!user.user_id) {
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
    const eventClick = (e: any) => {
      const href = e?.target?.href;
      if (href?.includes('channels/user')) {
        const { pathname } = history.location;
        if (pathname.includes('/message')) {
          history.replace(pathname.split('/message')[0]);
        }
        history.replace(`/channels/user/${href.split('/channels/user/')[1]}`);
        e.preventDefault();
      }
    };
    window.addEventListener('offline', eventOffline);
    window.addEventListener('online', eventOnline);
    window.addEventListener('paste', eventPaste);
    window.addEventListener('click', eventClick);
    return () => {
      window.removeEventListener('offline', eventOffline);
      window.removeEventListener('online', eventOnline);
      window.removeEventListener('paste', eventPaste);
      window.removeEventListener('click', eventClick);
    };
  }, [user, initApp, history]);
  const initGeneratedPrivateKey = useCallback(async () => {
    const generatedPrivateKey = await GeneratedPrivateKey();
    dispatch({
      type: actionTypes.SET_PRIVATE_KEY,
      payload: generatedPrivateKey,
    });
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
      dispatch(logout?.());
    });
  }, [dispatch]);
  useEffect(() => {
    getCookie(AsyncKey.loginType)
      .then((res) => {
        if (res === LoginType.WalletConnect) {
          WalletConnectUtils.init(walletConnectLogout);
          if (!WalletConnectUtils.connector?.connected) {
            walletConnectLogout();
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
      <ErrorBoundary>
        <Main />
        <AppToastNotification />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
