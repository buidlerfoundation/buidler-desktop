import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

type PageWrapperProps = {
  children: any;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
  const privateKey = useSelector((state: any) => state.configs.privateKey);
  const history = useHistory();
  useEffect(() => {
    if (!privateKey) {
      history.replace('/unlock');
    }
  }, [privateKey, history]);
  return <div>{children}</div>;
};

export default PageWrapper;
