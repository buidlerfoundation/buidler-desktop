import { getUniqueId } from 'renderer/helpers/GenerateUUID';
import { AsyncKey } from './AppConfig';

export const clearData = (callback = () => {}) =>
  window.electron.cookies.clear(callback);

export const setCookie = (key: string, val: any) => {
  return new Promise((resolve, reject) => {
    window.electron.cookies.set(key, val, (err) => {
      return resolve(err);
    });
  });
};

export const getCookie = async (key: string) => {
  return new Promise((resolve, reject) => {
    window.electron.cookies.get(key, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

export const getDeviceCode = async () => {
  const current = await getCookie(AsyncKey.deviceCode);
  if (typeof current === 'string') {
    return current;
  }
  const uuid = getUniqueId();
  setCookie(AsyncKey.deviceCode, uuid);
  return uuid;
};
