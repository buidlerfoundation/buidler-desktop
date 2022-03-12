import storage from 'electron-json-storage';

export const clearData = (callback = () => {}) => storage.clear(callback);

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
