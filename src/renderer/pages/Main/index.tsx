import React, { useEffect } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { Switch, Route, useHistory } from 'react-router-dom';
import AppListener from 'renderer/components/AppListener';
import { useDispatch } from 'react-redux';
import { getInitial } from 'renderer/actions/UserActions';
import MainWrapper from './Layout';
import Home from '../Home';
import { AsyncKey } from '../../common/AppConfig';
import { getCookie } from '../../common/Cookie';
import Splash from '../Splash';
import AppTitleBar from '../../components/AppTitleBar';
import Started from '../Started';
import UnlockPrivateKey from '../UnlockPrivateKey';

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const history = useHistory();
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (Object.keys(res || {}).length === 0) {
          history.replace('/started');
        }
        return null;
      })
      .catch(() => {
        history.replace('/started');
      });
  }, [history]);
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const Main = () => {
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getInitial?.());
  }, [dispatch]);
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AppTitleBar />
      <AppListener />
      <MainWrapper>
        <Switch>
          <Route exact path="/" component={Splash} />
          <PrivateRoute exact path="/home" component={Home} />
          <PrivateRoute exact path="/unlock" component={UnlockPrivateKey} />
          <Route exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
