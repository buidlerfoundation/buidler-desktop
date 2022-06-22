import React, { useCallback, useEffect, useState } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { Switch, Route, useHistory } from 'react-router-dom';
import AppListener from 'renderer/components/AppListener';
import { useDispatch } from 'react-redux';
import { findUser, getInitial } from 'renderer/actions/UserActions';
import MainWrapper from './Layout';
import Home from '../Home';
import { AsyncKey } from '../../common/AppConfig';
import { getCookie } from '../../common/Cookie';
import AppTitleBar from '../../shared/AppTitleBar';
import Started from '../Started';
import UnlockPrivateKey from '../UnlockPrivateKey';
import useAppDispatch from 'renderer/hooks/useAppDispatch';

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const userData = useAppSelector((state) => state.user.userData);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const initApp = useCallback(async () => {
    if (!userData?.user_id) {
      await dispatch(findUser());
    }
    setLoading(false);
  }, [dispatch, userData?.user_id]);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (typeof res === 'string' && !!res) {
          initApp();
        } else {
          history.replace('/started');
        }
      })
      .catch(() => {
        history.replace('/started');
      });
  }, [history, initApp]);
  if (loading) return <div className="main-load-page" />;
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const RedirectToHome = () => {
  const history = useHistory();
  useEffect(() => {
    history.replace('/channels');
  }, [history]);
  return null;
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
          <PrivateRoute exact path="/" component={RedirectToHome} />
          <PrivateRoute exact path="/channels/:match_id" component={Home} />
          <PrivateRoute exact path="/channels" component={Home} />
          <PrivateRoute exact path="/unlock" component={UnlockPrivateKey} />
          <Route exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
