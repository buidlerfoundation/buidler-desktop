import React, { useCallback, useEffect } from 'react';
import Main from './pages/Main';
import './App.scss';
import './styles/spacing.scss';
import './emoji.scss';
import path from 'path';
import AppToastNotification from './components/AppToastNotification';
import TextareaAutosize from 'react-textarea-autosize';
import GlobalVariable from './services/GlobalVariable';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core';
import { testSC } from './common/EthereumFunction';
import SocketUtils from './utils/SocketUtils';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import actions from './actions';

const usr = require('os').homedir();
const storage = require('electron-json-storage');

if (process.platform === 'darwin') {
  storage.setDataPath(
    `${usr}/Library/Application Support/today-remote/storage`
  );
} else {
  storage.setDataPath(path.join(__dirname, '../storage'));
}

type AppProps = {
  findUser: () => any;
  getInitial: () => any;
};

function App({ findUser, getInitial }: AppProps) {
  // console.log('XXX');
  // testSC();
  const history = useHistory();
  const user = useSelector((state) => state.user.userData);
  const initApp = useCallback(async () => {
    await getInitial();
    await findUser();
    history.replace('/home');
  }, [getInitial, findUser, history]);
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
