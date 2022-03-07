import React, { useEffect } from 'react';
import { Switch, Route, HashRouter, useHistory } from 'react-router-dom';
import MainWrapper from './Layout';
import Home from '../Home';
import LoginScreen from '../Login';
import { AsyncKey } from '../../common/AppConfig';
import { getCookie } from '../../common/Cookie';
import Splash from '../Splash';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { connect } from 'react-redux';
import CreateTeam from '../CreateTeam';
import AppTitleBar from '../../components/AppTitleBar';

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
          history.replace('/login');
        }
        return null;
      })
      .catch(() => {
        history.replace('/login');
      });
  }, [history]);
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

type MainProps = {
  getInitial?: () => () => void;
};

const Main = ({ getInitial }: MainProps) => {
  useEffect(() => {
    getInitial?.();
  }, []);
  return (
    <HashRouter>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <AppTitleBar />
        <MainWrapper>
          <Switch>
            <Route exact path="/" component={Splash} />
            <PrivateRoute exact path="/home" component={Home} />
            <Route exact path="/login" component={LoginScreen} />
            <Route exact path="/create-team" component={CreateTeam} />
          </Switch>
        </MainWrapper>
      </div>
    </HashRouter>
  );
};
const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(null, mapActionsToProps)(Main);
