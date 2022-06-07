import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import AppListener from 'renderer/components/AppListener';
import MainWrapper from './Layout';
import Home from '../Home';
import { AsyncKey } from '../../common/AppConfig';
import { getCookie } from '../../common/Cookie';
import Splash from '../Splash';
import actions from '../../actions';
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

type MainProps = {
  getInitial?: () => () => void;
};

const Main = ({ getInitial }: MainProps) => {
  const imgDomain = useSelector((state: any) => state.user.imgDomain);
  useEffect(() => {
    getInitial?.();
  }, [getInitial]);
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
const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(null, mapActionsToProps)(Main);
