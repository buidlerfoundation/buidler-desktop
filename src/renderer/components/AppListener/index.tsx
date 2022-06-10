import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import actionTypes from 'renderer/actions/ActionTypes';
import { getCookie, setCookie } from 'renderer/common/Cookie';
import useAppSelector from 'renderer/hooks/useAppSelector';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import GlobalVariable from 'renderer/services/GlobalVariable';
import { useHistory } from 'react-router-dom';
import { AsyncKey } from 'renderer/common/AppConfig';

const AppListener = () => {
  const history = useHistory();
  const { spaceChannel } = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const openUrlListener = (data) => {
      dispatch({ type: actionTypes.SET_DATA_FROM_URL, payload: data });
    };
    const enterFullscreenListener = () => {
      dispatch({ type: actionTypes.UPDATE_FULL_SCREEN, payload: true });
    };
    const leaveFullscreenListener = () => {
      dispatch({ type: actionTypes.UPDATE_FULL_SCREEN, payload: false });
    };
    const windowFocusListener = async () => {
      GlobalVariable.isWindowFocus = true;
      const lastTime = await getCookie(AsyncKey.lastTimeFocus);
      const currentTime = new Date().getTime();
      if (
        lastTime &&
        currentTime - lastTime > 60000 * 30 &&
        !WalletConnectUtils?.connector?.connected
      ) {
        dispatch({ type: actionTypes.REMOVE_PRIVATE_KEY });
        history.replace('/unlock');
      }
    };
    const windowBlurListener = () => {
      setCookie(AsyncKey.lastTimeFocus, new Date().getTime());
      GlobalVariable.isWindowFocus = false;
    };
    window.electron.ipcRenderer.on('open-url', openUrlListener);
    window.electron.ipcRenderer.on('enter-fullscreen', enterFullscreenListener);
    window.electron.ipcRenderer.on('leave-fullscreen', leaveFullscreenListener);
    window.electron.ipcRenderer.on('window-focus', windowFocusListener);
    window.electron.ipcRenderer.on('window-blur', windowBlurListener);
    return () => {
      window.electron.ipcRenderer.removeListener('open-url', openUrlListener);
      window.electron.ipcRenderer.removeListener(
        'enter-fullscreen',
        enterFullscreenListener
      );
      window.electron.ipcRenderer.removeListener(
        'leave-fullscreen',
        leaveFullscreenListener
      );
      window.electron.ipcRenderer.removeListener(
        'window-focus',
        windowFocusListener
      );
      window.electron.ipcRenderer.removeListener(
        'window-blur',
        windowBlurListener
      );
    };
  }, [dispatch, history]);
  useEffect(() => {
    const unseenChannel = spaceChannel?.find?.((space) =>
      space.channels?.find((el) => !el.seen)
    );
    if (unseenChannel) {
      window.electron.ipcRenderer.sendMessage('show-badge', 'ping');
    } else {
      window.electron.ipcRenderer.sendMessage('hide-badge', 'ping');
    }
    // console.log('unseen channel: ', unseenChannel);
  }, [spaceChannel]);
  return null;
};

export default AppListener;
