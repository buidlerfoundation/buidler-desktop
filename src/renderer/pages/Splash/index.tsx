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
  findTeamAndChannel: (showLoading?: boolean) => any;
  getInitial: () => any;
};

const Splash = ({ getInitial, findUser, findTeamAndChannel }: SplashProps) => {
  const history = useHistory();
  const initApp = useCallback(
    async (showLoading = true) => {
      await getInitial();
      await findUser();
      history.replace('/home');
    },
    [getInitial, findUser, history]
  );
  useEffect(() => {
    getCookie(AsyncKey.accessTokenKey)
      .then(async (res: any) => {
        if (Object.keys(res || {}).length === 0) {
          history.replace('/started');
        } else {
          if (navigator.onLine) {
            initApp();
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
