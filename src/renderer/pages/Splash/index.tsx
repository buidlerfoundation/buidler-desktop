import React, { useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import './index.scss';
import { useHistory } from 'react-router-dom';
import { getCookie } from '../../common/Cookie';
import { AsyncKey } from '../../common/AppConfig';
import HomeLoading from '../../components/HomeLoading';

type SplashProps = {
  findUser: () => any;
  findTeamAndChannel: () => any;
  getInitial: () => any;
};

const Splash = ({ getInitial, findUser, findTeamAndChannel }: SplashProps) => {
  const eventConnection = useRef<any>(null);
  const history = useHistory();
  const initApp = useCallback(async () => {
    await getInitial();
    await findUser();
    await findTeamAndChannel();
    history.replace('/home');
  }, [getInitial, findUser, findTeamAndChannel, history]);
  useEffect(() => {
    return () => {
      if (eventConnection.current)
        window.removeEventListener('online', eventConnection.current);
    };
  }, []);
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then(async (res: any) => {
        if (Object.keys(res || {}).length === 0) {
          history.replace('/started');
        } else {
          if (navigator.onLine) {
            initApp();
          } else {
            eventConnection.current = window.addEventListener('online', () => {
              initApp();
            });
          }
          return null;
        }
        return null;
      })
      .catch((e) => {
        console.log(e);
        // history.replace('/started');
      });
  }, [history, initApp, findUser]);
  return <HomeLoading />;
};

const mapStateToProps = (state: any) => {
  return {};
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(Splash);
