import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import useCurrentCommunity from 'renderer/hooks/useCurrentCommunity';
import ErrorPage from 'renderer/shared/ErrorBoundary/ErrorPage';
import NoInternetPage from 'renderer/shared/NoInternetPage';

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const errorUserSelector = createErrorMessageSelector([actionTypes.USER_PREFIX]);
const currentTeamLoadingSelector = createLoadingSelector([
  actionTypes.CURRENT_TEAM_PREFIX,
]);
const currentTeamErrorSelector = createErrorMessageSelector([
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
        if (res && typeof res === 'string') {
          history.replace('/');
        }
      })
      .catch(() => {
        history.replace('/started');
      });
  }, [history]);
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const PrivateRoute = memo(
  ({ component: Component, ...rest }: PrivateRouteProps) => {
    const match_community_id = useMemo(
      () => rest?.computedMatch?.params?.match_community_id,
      [rest?.computedMatch?.params?.match_community_id]
    );
    const match_channel_id = useMemo(
      () => rest?.computedMatch?.params?.match_channel_id,
      [rest?.computedMatch?.params?.match_channel_id]
    );
    const userData = useAppSelector((state) => state.user.userData);
    const privateKey = useAppSelector((state) => state.configs.privateKey);
    const userError = useAppSelector((state) => errorUserSelector(state));
    const currentTeamLoading = useAppSelector((state) =>
      currentTeamLoadingSelector(state)
    );
    const currentTeamError = useAppSelector((state) =>
      currentTeamErrorSelector(state)
    );
    const team = useAppSelector((state) => state.user.team);
    const currentTeam = useCurrentCommunity();
    const dispatch = useAppDispatch();
    const history = useHistory();
    const initApp = useCallback(async () => {
      const loginType = await getCookie(AsyncKey.loginType);
      if (
        typeof loginType === 'string' &&
        loginType === LoginType.WalletImport &&
        !privateKey
      ) {
        history.replace({
          pathname: '/unlock',
        });
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
        if (
          matchCommunity &&
          !currentTeamLoading &&
          !currentTeamError &&
          match_channel_id
        ) {
          await dispatch(setCurrentTeam(matchCommunity));
        }
      }
    }, [
      privateKey,
      userData.user_id,
      userError,
      match_community_id,
      currentTeam?.team_id,
      history,
      dispatch,
      team,
      currentTeamLoading,
      currentTeamError,
      match_channel_id,
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
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }
);

const communityRequestingSelector = createLoadingSelector([
  actionTypes.TEAM_PREFIX,
]);

const RedirectToHome = memo(() => {
  const [isEmpty, setEmpty] = useState(false);
  const match = useRouteMatch<{
    match_community_id?: string;
  }>();
  const { match_community_id } = match.params;
  const dispatch = useAppDispatch();
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const channel = useMemo(
    () => channelMap[match_community_id || ''],
    [channelMap, match_community_id]
  );
  const communityRequesting = useAppSelector((state) =>
    communityRequestingSelector(state)
  );
  const team = useAppSelector((state) => state.user.team);
  const lastChannel = useAppSelector((state) => state.user.lastChannel);
  const history = useHistory();
  const gotoChannel = useCallback(async () => {
    if (!team || communityRequesting) return;
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
      if (!channel) {
        await dispatch(findTeamAndChannel(match_community_id));
      }
    }
    const matchChannel = channel?.find?.((el) => el.channel_id === channelId);
    if ((!channelId && !cookieChannelId) || !matchChannel) {
      channelId = channel?.[0]?.channel_id;
    }
    if (!teamId) {
      teamId = team?.[1]?.team_id;
    }
    if (channelId && teamId) {
      history.replace(`/channels/${teamId}/${channelId}`);
    } else if (teamId) {
      history.replace(`/channels/${teamId}`);
      setEmpty(true);
    } else {
      setEmpty(true);
    }
  }, [
    team,
    communityRequesting,
    match_community_id,
    channel,
    lastChannel,
    history,
    dispatch,
  ]);
  useEffect(() => {
    gotoChannel();
  }, [gotoChannel]);
  if (isEmpty && team?.length === 0) {
    return (
      <>
        <AppTitleBar />
        <EmptyTeamView />
      </>
    );
  }
  if (isEmpty && channel?.length === 0) {
    return <Home />;
  }
  return <AppTitleBar />;
});

const Main = () => {
  const imgDomain = useAppSelector((state) => state.user.imgDomain);
  const somethingWrong = useAppSelector(
    (state) => state.configs.somethingWrong
  );
  const internetConnection = useAppSelector(
    (state) => state.configs.internetConnection
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (navigator.onLine) {
      dispatch(getInitial?.());
    }
  }, [dispatch]);
  if (!internetConnection || !navigator.onLine) return <NoInternetPage />;
  if (somethingWrong) return <ErrorPage />;
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
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id/:entity_type/:entity_id"
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
