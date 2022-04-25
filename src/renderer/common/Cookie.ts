import storage from 'electron-json-storage';
import { getUniqueId } from 'renderer/helpers/GenerateUUID';
import { AsyncKey } from './AppConfig';

export const clearData = (callback = () => {}) => {
  storage.remove(AsyncKey.accessTokenKey, () => {});
  storage.remove(AsyncKey.lastTeamId, () => {});
  storage.remove(AsyncKey.ivKey, () => {});
  storage.remove(AsyncKey.encryptedDataKey, () => {});
  storage.remove(AsyncKey.lastChannelId, () => {});
  storage.remove(AsyncKey.encryptedSeedKey, () => {});
  storage.remove(AsyncKey.deviceCode, () => {});
  callback?.();
};

export const setCookie = (key: string, val: any) => {
  storage.set(key, val, (err) => {});
};

export const getCookie = async (key: string) => {
  return new Promise((resolve, reject) => {
    storage.get(key, (err, data) => {
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
