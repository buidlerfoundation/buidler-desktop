import toast from 'react-hot-toast';
import actionTypes from 'renderer/actions/ActionTypes';
import GoogleAnalytics from 'renderer/services/analytics/GoogleAnalytics';
import GlobalVariable from 'renderer/services/GlobalVariable';
import store from 'renderer/store';
import SocketUtils from 'renderer/utils/SocketUtils';
import api from '.';
import AppConfig, {
  AsyncKey,
  importantApis,
  whiteListRefreshTokenApis,
} from '../common/AppConfig';
import { clearData, getCookie, setCookie } from '../common/Cookie';

const METHOD_GET = 'get';
const METHOD_POST = 'post';
const METHOD_PUT = 'put';
const METHOD_DELETE = 'delete';
const METHOD_PATCH = 'patch';

const handleError = (message: string, apiData: any) => {
  const { uri, fetchOptions } = apiData;
  const compareUri = `${fetchOptions.method}-${uri}`;
  const importantApi = importantApis.find((el) => {
    if (el.exact) {
      return compareUri === el.uri;
    }
    return compareUri.includes(el.uri);
  });
  if (importantApi) {
    store.dispatch({ type: actionTypes.SOMETHING_WRONG });
    throw new Error('Something wrong');
  } else {
    toast.error(message);
  }
};

const handleRefreshToken = async () => {
  const refreshTokenExpire = await getCookie(AsyncKey.refreshTokenExpire);
  const refreshToken = await getCookie(AsyncKey.refreshTokenKey);
  if (
    !refreshTokenExpire ||
    !refreshToken ||
    new Date().getTime() / 1000 > refreshTokenExpire
  ) {
    return false;
  }
  const refreshTokenRes = await api.refreshToken(refreshToken);
  if (refreshTokenRes.success) {
    await setCookie(AsyncKey.accessTokenKey, refreshTokenRes?.data?.token);
    await setCookie(
      AsyncKey.refreshTokenKey,
      refreshTokenRes?.data?.refresh_token
    );
    await setCookie(
      AsyncKey.tokenExpire,
      refreshTokenRes?.data?.token_expire_at
    );
    await setCookie(
      AsyncKey.refreshTokenExpire,
      refreshTokenRes?.data?.refresh_token_expire_at
    );
    SocketUtils.init();
  }
  return refreshTokenRes.success;
};

async function requestAPI<T = any>(
  method: string,
  uri: string,
  body?: any,
  serviceBaseUrl?: string
): Promise<{
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
}> {
  if (GlobalVariable.sessionExpired) {
    return {
      success: false,
      statusCode: 403,
    };
  }
  if (!whiteListRefreshTokenApis.includes(`${method}-${uri}`)) {
    const expireTokenTime = await getCookie(AsyncKey.tokenExpire);
    if (!expireTokenTime || new Date().getTime() / 1000 > expireTokenTime) {
      const success = await handleRefreshToken();
      if (!success) {
        if (!GlobalVariable.sessionExpired) {
          GlobalVariable.sessionExpired = true;
          toast.error('Session expired');
          clearData(() => {
            window.location.reload();
          });
        }
        return {
          success: false,
          statusCode: 403,
        };
      }
    }
  }
  // Build API header
  const headers: any = {
    Accept: '*/*',
    'Access-Control-Allow-Origin': '*',
  };
  if (body instanceof FormData) {
    // headers['Content-Type'] = 'multipart/form-data';
    // headers = {};
  } else {
    headers['Content-Type'] = 'application/json';
  }

  // Build API url
  let apiUrl = '';
  if (serviceBaseUrl) {
    apiUrl = serviceBaseUrl + uri;
  } else {
    apiUrl = AppConfig.apiBaseUrl + uri;
  }

  // Get access token and attach it to API request's header
  try {
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    if (accessToken != null) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.log('No token is stored');
    }
  } catch (e: any) {
    console.log(e);
  }

  // Build API body
  let contentBody = null;
  if (
    method.toLowerCase() === METHOD_POST ||
    method.toLowerCase() === METHOD_PUT ||
    method.toLowerCase() === METHOD_DELETE ||
    method.toLowerCase() === METHOD_PATCH
  ) {
    if (body) {
      if (body instanceof FormData) {
        contentBody = body;
      } else {
        contentBody = JSON.stringify(body);
      }
    }
  }
  // Construct fetch options
  const fetchOptions = { method, headers, body: contentBody };
  // Run the fetching
  return fetch(apiUrl, fetchOptions)
    .then((res) => {
      return res
        .json()
        .then((data) => {
          if (res.status !== 200) {
            return handleError(data.message || data, { uri, fetchOptions });
          }
          if (data.length >= 0) {
            return { data, statusCode: res.status };
          }
          return { ...data, statusCode: res.status };
        })
        .catch((err) => {
          return { message: err, statusCode: res.status };
        });
    })
    .catch((err) => {
      GoogleAnalytics.trackingError(
        uri,
        method.toLowerCase(),
        err.message || '',
        err.statusCode,
        body
      );
      const msg = err.message || err;
      if (!msg.includes('aborted')) {
        handleError(msg, { uri, fetchOptions });
      }
      return {
        message: msg,
      };
    });
}

const timeRequestMap: { [key: string]: any } = {};

const ApiCaller = {
  get<T>(url: string, baseUrl?: string) {
    return requestAPI<T>(METHOD_GET, url, undefined, baseUrl);
  },

  post<T>(url: string, data?: any, baseUrl?: string) {
    return requestAPI<T>(METHOD_POST, url, data, baseUrl);
  },

  patch<T>(url: string, data?: any, baseUrl?: string) {
    return requestAPI<T>(METHOD_PATCH, url, data, baseUrl);
  },

  put<T>(url: string, data?: any, baseUrl?: string) {
    return requestAPI<T>(METHOD_PUT, url, data, baseUrl);
  },

  delete<T>(url: string, data?: any, baseUrl?: string) {
    return requestAPI<T>(METHOD_DELETE, url, data, baseUrl);
  },

  getWithLatestResponse(url: string, baseUrl?: string): Promise<any> {
    const currentTime = new Date().getTime();
    if (!timeRequestMap[url]) {
      timeRequestMap[url] = {
        requestTime: currentTime,
      };
    } else {
      timeRequestMap[url].requestTime = currentTime;
    }
    return new Promise((resolve) => {
      return requestAPI(METHOD_GET, url, undefined, baseUrl).then(
        (res: any) => {
          const { requestTime } = timeRequestMap[url] || {};
          if (requestTime !== currentTime) {
            return resolve({ statusCode: 400, cancelled: true });
          }
          delete timeRequestMap[url];
          return resolve(res);
        }
      );
    });
  },

  postWithLatestResponse(
    url: string,
    data?: any,
    baseUrl?: string
  ): Promise<any> {
    const currentTime = new Date().getTime();
    if (!timeRequestMap[url]) {
      timeRequestMap[url] = {
        requestTime: currentTime,
      };
    } else {
      timeRequestMap[url].requestTime = currentTime;
    }
    return new Promise((resolve) => {
      return requestAPI(METHOD_POST, url, data, baseUrl).then((res: any) => {
        const { requestTime } = timeRequestMap[url] || {};
        if (requestTime !== currentTime) {
          return resolve({ statusCode: 400, cancelled: true });
        }
        delete timeRequestMap[url];
        return resolve(res);
      });
    });
  },
};

export default ApiCaller;
