import React, { useEffect } from 'react';
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

const usr = require('os').homedir();
const storage = require('electron-json-storage');

if (process.platform === 'darwin') {
  storage.setDataPath(
    `${usr}/Library/Application Support/today-remote/storage`
  );
} else {
  storage.setDataPath(path.join(__dirname, '../storage'));
}

function App() {
  // console.log('XXX');
  // testSC();
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
    window.addEventListener('offline', () => {
      SocketUtils.socket?.disconnect?.();
    });
    window.addEventListener('paste', (e: any) => {
      e.preventDefault();
      if (!e.clipboardData.types.includes('Files')) {
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    });
  }, []);
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

export default App;
