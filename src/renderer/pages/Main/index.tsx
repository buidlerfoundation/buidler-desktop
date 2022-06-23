import React, { useCallback, useEffect, useState } from 'react';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import AppListener from 'renderer/components/AppListener';
import { useDispatch } from 'react-redux';
import {
  findTeamAndChannel,
  findUser,
  getInitial,
  setCurrentTeam,
} from 'renderer/actions/UserActions';
import MainWrapper from './Layout';
import Home from '../Home';
import { AsyncKey } from '../../common/AppConfig';
import { getCookie } from '../../common/Cookie';
import AppTitleBar from '../../shared/AppTitleBar';
import Started from '../Started';
import UnlockPrivateKey from '../UnlockPrivateKey';
import useAppDispatch from 'renderer/hooks/useAppDispatch';
import EmptyTeamView from 'renderer/components/EmptyTeamView';

interface PrivateRouteProps {
  component: any;
  exact: boolean;
  path: string;
}

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  const match_community_id = rest?.computedMatch?.params?.match_community_id;
  const userData = useAppSelector((state) => state.user.userData);
  const team = useAppSelector((state) => state.user.team);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const initApp = useCallback(async () => {
    if (!userData?.user_id) {
      await dispatch(findUser());
      await dispatch(findTeamAndChannel(match_community_id));
    } else if (
      match_community_id &&
      currentTeam?.team_id !== match_community_id
    ) {
      const matchCommunity = team?.find(
        (t) => t.team_id === match_community_id
      );
      if (matchCommunity && matchCommunity?.team_id !== currentTeam?.team_id) {
        await dispatch(setCurrentTeam(matchCommunity));
      }
    }
  }, [
    currentTeam?.team_id,
    dispatch,
    match_community_id,
    team,
    userData?.user_id,
  ]);
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
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

const RedirectToHome = () => {
  const [isEmpty, setEmpty] = useState(false);
  const match = useRouteMatch<{
    match_community_id?: string;
  }>();
  const { match_community_id } = match.params;
  const channel = useAppSelector((state) => state.user.channel);
  const team = useAppSelector((state) => state.user.team);
  const lastChannel = useAppSelector((state) => state.user.lastChannel);
  const history = useHistory();
  const gotoChannel = useCallback(async () => {
    setEmpty(false);
    const cookieChannelId = await getCookie(AsyncKey.lastChannelId);
    let channelId = cookieChannelId;
    let teamId = match_community_id || (await getCookie(AsyncKey.lastTeamId));
    if (match_community_id) {
      const channelByTeam = lastChannel?.[match_community_id];
      channelId = channelByTeam?.channel_id;
    }
    if (!channelId && !cookieChannelId) {
      channelId = channel?.[0]?.channel_id;
    }
    if (!teamId) {
      teamId = team?.[0]?.team_id;
    }
    if (channelId && teamId) {
      history.replace(`/channels/${teamId}/${channelId}`);
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
          <PrivateRoute exact path="/channels" component={RedirectToHome} />
          <PrivateRoute
            exact
            path="/channels/:match_community_id"
            component={RedirectToHome}
          />
          <PrivateRoute
            exact
            path="/channels/:match_community_id/:match_channel_id"
            component={Home}
          />
          <PrivateRoute exact path="/unlock" component={UnlockPrivateKey} />
          <Route exact path="/started" component={Started} />
        </Switch>
      </MainWrapper>
    </div>
  );
};
export default Main;
