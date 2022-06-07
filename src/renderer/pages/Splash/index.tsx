import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useHistory } from 'react-router-dom';
import actions from '../../actions';
import './index.scss';
import { getCookie } from '../../common/Cookie';
import { AsyncKey } from '../../common/AppConfig';
import HomeLoading from '../../components/HomeLoading';

type SplashProps = {
  findUser: () => any;
};

const Splash = ({ findUser }: SplashProps) => {
  const history = useHistory();
  const initApp = useCallback(async () => {
    await findUser();
    history.replace('/home');
  }, [findUser, history]);
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

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(undefined, mapActionsToProps)(Splash);
