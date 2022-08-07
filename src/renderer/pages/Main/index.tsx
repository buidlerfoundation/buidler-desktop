import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import AppListener from 'renderer/components/AppListener';
import { useDispatch } from 'react-redux';
import {
  findTeamAndChannel,
  findUser,
  getInitial,
  logout,
  setCurrentTeam,
} from 'renderer/actions/UserActions';
import MainWrapper from './Layout';
import Home from '../Home';
import { AsyncKey, LoginType } from '../../common/AppConfig';
import { getCookie, removeCookie } from '../../common/Cookie';
import AppTitleBar from '../../shared/AppTitleBar';
import Started from '../Started';
import UnlockPrivateKey from '../UnlockPrivateKey';
import useAppDispatch from 'renderer/hooks/useAppDispatch';
import EmptyTeamView from 'renderer/components/EmptyTeamView';
import {
  createErrorMessageSelector,
  createLoadingSelector,
} from 'renderer/reducers/selectors';
import actionTypes from 'renderer/actions/ActionTypes';
import GoogleAnalytics from 'renderer/services/analytics/GoogleAnalytics';

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const errorUserSelector = createErrorMessageSelector([actionTypes.USER_PREFIX]);
const currentTeamLoadingSelector = createLoadingSelector([
  actionTypes.CURRENT_TEAM_PREFIX,
]);

const PublicRoute = ({ component: Component, ...rest }: any) => {
  const history = useHistory();
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking('Page Viewed', {
      category: 'Traffic',
      page_name: 'Login',
      source: query.get('ref') || '',
      path: window.location.pathname,
    });
  }, []);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (res) {
          history.replace('/');
        }
      })
      .catch(() => {
        history.replace('/started');
      });
  }, [history]);
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const [loading, setLoading] = useState(false);
  const match_community_id = rest?.computedMatch?.params?.match_community_id;
  const userData = useAppSelector((state) => state.user.userData);
  const privateKey = useAppSelector((state) => state.configs.privateKey);
  const userError = useAppSelector((state) => errorUserSelector(state));
  const currentTeamLoading = useAppSelector((state) =>
    currentTeamLoadingSelector(state)
  );
  const team = useAppSelector((state) => state.user.team);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const initApp = useCallback(async () => {
    if (rest.redirect) {
      setLoading(true);
    }
    const loginType = await getCookie(AsyncKey.loginType);
    if (
      typeof loginType === 'string' &&
      loginType === LoginType.WalletImport &&
      !privateKey
    ) {
      return;
    }
    if (!userData.user_id && !userError) {
      await dispatch(findUser());
      await dispatch(findTeamAndChannel(match_community_id));
    } else if (
      match_community_id &&
      currentTeam?.team_id !== match_community_id
    ) {
      const matchCommunity = team?.find(
        (t) => t.team_id === match_community_id
      );
      if (matchCommunity && !currentTeamLoading) {
        await dispatch(setCurrentTeam(matchCommunity));
      }
    }
    setLoading(false);
  }, [
    currentTeamLoading,
    rest.redirect,
    currentTeam?.team_id,
    dispatch,
    match_community_id,
    team,
    userData?.user_id,
    userError,
    privateKey,
  ]);
  useEffect(() => {
    if (window.location.pathname !== '/') {
      const query = new URLSearchParams(window.location.search);
      GoogleAnalytics.tracking('Page Viewed', {
        category: 'Traffic',
        page_name: 'Home',
        source: query.get('ref') || '',
        path: window.location.pathname,
      });
    }
  }, []);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then((res: any) => {
        if (typeof res === 'string' && !!res) {
          if (rest.path !== '/unlock') {
            initApp();
          }
        } else {
          history.replace({
            pathname: '/started',
            search: window.location.search,
          });
          dispatch(logout());
        }
      })
      .catch(() => {
        history.replace({
          pathname: '/started',
          search: window.location.search,
        });
        dispatch(logout());
      });
  }, [dispatch, history, initApp, rest.path]);
  if (loading)
    return (
      <div className="main-load-page">
        <AppTitleBar />
      </div>
    );
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const RedirectToHome = () => {
  const [isEmpty, setEmpty] = useState(false);
  const match = useRouteMatch<{
    match_community_id?: string;
  }>();
  const { match_community_id } = match.params;
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const channel = useMemo(
    () => channelMap[match_community_id || ''] || [],
    [channelMap, match_community_id]
  );
  const team = useAppSelector((state) => state.user.team);
  const lastChannel = useAppSelector((state) => state.user.lastChannel);
  const history = useHistory();
  const gotoChannel = useCallback(async () => {
    if (!team) return;
    setEmpty(false);
    let cookieChannelId = await getCookie(AsyncKey.lastChannelId);
    if (typeof cookieChannelId !== 'string') {
      cookieChannelId = null;
    }
    let channelId = cookieChannelId;
    let lastTeamId = await getCookie(AsyncKey.lastTeamId);
    if (typeof lastTeamId !== 'string') {
      lastTeamId = null;
    }
    let teamId = match_community_id || lastTeamId;
    if (match_community_id) {
      const matchCommunity = team.find(
        (el) => el.team_id === match_community_id
      );
      if (!matchCommunity) {
        removeCookie(AsyncKey.lastTeamId);
        history.replace('/channels');
        return;
      }
      const channelByTeam = lastChannel?.[match_community_id];
      channelId = channelByTeam?.channel_id;
    }
    const matchChannel = channel.find((el) => el.channel_id === channelId);
    if ((!channelId && !cookieChannelId) || !matchChannel) {
      channelId = channel?.[0]?.channel_id;
    }
    if (!teamId) {
      teamId = team?.[0]?.team_id;
    }
    if (channelId && teamId) {
      history.replace(`/channels/${teamId}/${channelId}`);
    } else if (teamId) {
      history.replace(`/channels/${teamId}`);
    } else {
      setEmpty(true);
    }
  }, [match_community_id, lastChannel, channel, team, history]);
  useEffect(() => {
    gotoChannel();
  }, [gotoChannel]);
  if (isEmpty && team?.length === 0) {
    return <EmptyTeamView />;
  }
  if (isEmpty && channel?.length === 0) {
    return <Home />;
  }
  return <AppTitleBar />;
};

const Main = () => {
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const dispatch = useDispatch();
  useEffect(() => {
    if (navigator.onLine) {
      dispatch(getInitial?.());
    }
  }, [dispatch]);
  if (!imgDomain) {
    return <div className="main-load-page" />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AppListener />
      <MainWrapper>
        <Switch>
          <PrivateRoute exact path="/" component={RedirectToHome} redirect />
          <PrivateRoute
            exact
            path="/channels"
            component={RedirectToHome}
            redirect
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id"
            component={RedirectToHome}
            redirect
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id"
            component={Home}
          />
          <PrivateRoute exact path="/unlock" component={UnlockPrivateKey} />
          <PublicRoute exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
