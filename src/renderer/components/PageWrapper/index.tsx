import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useAppSelector from 'renderer/hooks/useAppSelector';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';

type PageWrapperProps = {
  children: any;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const privateKey = useAppSelector((state) => state.configs.privateKey);
  const history = useHistory();
  useEffect(() => {
    if (!privateKey && !WalletConnectUtils.connector?.connected) {
      history.replace('/unlock');
    }
  }, [privateKey, history]);
  if (WalletConnectUtils.connector?.connected || privateKey)
    return <div>{children}</div>;
  return <div className="page-wrapper-container" />;
};

export default PageWrapper;
