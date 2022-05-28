import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';

type PageWrapperProps = {
  children: any;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const privateKey = useSelector((state: any) => state.configs.privateKey);
  const currentChannel = useSelector((state: any) => state.user.currentChannel);
  const history = useHistory();
  useEffect(() => {
    if (!privateKey && !WalletConnectUtils.connector.connected) {
      history.replace('/unlock');
    }
  }, [privateKey, history]);
  // useEffect(() => {
  //   if (!currentChannel) {
  //     history.replace('/');
  //   }
  // }, [currentChannel, history]);
  if (WalletConnectUtils.connector.connected || privateKey)
    return <div>{children}</div>;
  return <div className="page-wrapper-container" />;
};

export default PageWrapper;
