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
  removeCookie,
  setCookie,
} from './common/Cookie';
import { AsyncKey, LoginType } from './common/AppConfig';
import actionTypes from './actions/ActionTypes';
import api from './api';
import { acceptTeam, getInitial, logout } from './actions/UserActions';
import useAppSelector from './hooks/useAppSelector';
import ErrorBoundary from './shared/ErrorBoundary';
import GoogleAnalytics from './services/analytics/GoogleAnalytics';
import { initialSpaceToggle } from './actions/SideBarActions';
import { sameDAppURL } from './helpers/LinkHelper';
import useCurrentChannel from './hooks/useCurrentChannel';
import { getBlockIntoViewByElement } from './helpers/MessageHelper';
import toast from 'react-hot-toast';

function App() {
  window.electron.cookies.setPath();
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user.userData);
  const imgDomain = useAppSelector((state: any) => state.user.imgDomain);
  const currentChannel = useCurrentChannel();
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
    dispatch(initialSpaceToggle());
  }, [dispatch]);
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
      dispatch({
        type: actionTypes.UPDATE_INTERNET_CONNECTION,
        payload: false,
      });
      SocketUtils.socket?.disconnect?.();
    };
    const eventOnline = () => {
      dispatch({
        type: actionTypes.UPDATE_INTERNET_CONNECTION,
        payload: true,
      });
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
    const eventClick = async (e: any) => {
      const href = e?.target?.href || e?.target?.parentElement?.href;
      if (sameDAppURL(href, currentChannel?.dapp_integration_url)) {
        e.preventDefault();
      } else if (href?.includes('channels/user')) {
        dispatch({
          type: actionTypes.UPDATE_CURRENT_USER_PROFILE_ID,
          payload: href.split('/channels/user/')[1],
        });
      } else if (href?.includes('https://community.buidler.app')) {
        const path = href.replace('https://community.buidler.app', '');
        if (`#${path}` === window.location.hash && path?.includes('message')) {
          const messageId = path?.split('message/')?.[1];
          if (messageId) {
            const element = document.getElementById(messageId);
            element?.scrollIntoView({
              behavior: 'smooth',
              block: getBlockIntoViewByElement(element),
            });
            dispatch({
              type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
              payload: messageId,
            });
          }
        } else {
          history.push(path);
        }
      } else if (href?.includes('buidler.link')) {
        e.preventDefault();
        const url = new URL(href);
        const communityUrl = url.pathname.substring(1);
        const invitationRef = url.searchParams.get('ref');
        const profileRes = await api.getProfile(communityUrl);
        const teamId = profileRes?.data?.profile?.team_id;
        const userId = profileRes?.data?.profile?.user_id;
        if (userId) {
          dispatch({
            type: actionTypes.UPDATE_CURRENT_USER_PROFILE_ID,
            payload: userId,
          });
        } else if (teamId) {
          const invitationRes = await api.invitation(teamId);
          const invitationUrl = invitationRes.data?.invitation_url;
          const invitationId = invitationUrl?.substring(
            invitationUrl?.lastIndexOf('/') + 1
          );
          if (!invitationId) {
            toast.error('Invalid invitation link');
            return;
          }
          const res: any = await dispatch(
            acceptTeam(invitationId, invitationRef)
          );
          if (res.statusCode === 200 && !!res.data?.team_id) {
            toast.success('You have successfully joined new community.');
            removeCookie(AsyncKey.lastChannelId);
            setCookie(AsyncKey.lastTeamId, teamId);
            history.push(`/channels/${teamId}`);
          }
        }
      } else if (href) {
        window.open(href, '_blank');
      }
      e.preventDefault();
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
  }, [user, initApp, history, dispatch, currentChannel?.dapp_integration_url]);
  const initGeneratedPrivateKey = useCallback(async () => {
    const generatedPrivateKey = await GeneratedPrivateKey();
    dispatch({
      type: actionTypes.SET_PRIVATE_KEY,
      payload: generatedPrivateKey,
    });
  }, [dispatch]);
  useEffect(() => {
    getCookie(AsyncKey.socketConnectKey)
      .then((res) => {
        if (typeof res === 'boolean' && res) {
          initGeneratedPrivateKey();
        }
      })
      .catch(() => {});
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
        dispatch({ type: actionTypes.UPDATE_LOGIN_TYPE, payload: res });
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
  }, [dispatch, walletConnectLogout]);
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
