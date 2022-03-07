import React, { useEffect } from 'react';
import Main from './pages/Main';
import './App.global.scss';
import './styles/spacing.global.scss';
import './emoji.global.scss';
import path from 'path';
import AppToastNotification from './components/AppToastNotification';
import TextareaAutosize from 'react-textarea-autosize';
import GlobalVariable from './services/GlobalVariable';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';

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
  const materialTheme = createMuiTheme({
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
