import React, { useEffect, useCallback, memo } from 'react';
import { useDispatch } from 'react-redux';
import { findUser } from 'renderer/actions/UserActions';
import { useHistory } from 'react-router-dom';
import './index.scss';
import { getCookie } from '../../common/Cookie';
import { AsyncKey } from '../../common/AppConfig';
import HomeLoading from '../../shared/HomeLoading';

const Splash = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const initApp = useCallback(async () => {
    await dispatch(findUser());
    history.replace('/home');
  }, [dispatch, history]);
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
  }, [history, initApp]);
  return <HomeLoading />;
};

export default memo(Splash);
