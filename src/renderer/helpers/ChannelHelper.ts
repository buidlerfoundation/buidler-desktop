import { ethers, utils } from 'ethers';
import EthCrypto from 'eth-crypto';
import { getCookie, setCookie } from 'renderer/common/Cookie';
import { AsyncKey } from 'renderer/common/AppConfig';
import store from 'renderer/store';

const testData = {
  'cc388ba9-bdee-44af-849e-4cc1b670b2b2': [
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
  ],
  'aa3532a9-ab39-4dc5-b167-29ef3da2fdef': [
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
  ],
  'd1489ab6-08b5-4319-a728-b3b29a408de0': [
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
    {
      key: '{"iv":"099cfdb2852b525920220b1880d0922c","ephemPublicKey":"04a13cbbc47af728862e6061a8c091f267194ae4eee7dae556322bbec25e183381c5360e3f94a28b9d83dd889a7c78dfe73614bb575e4f8e9bff327aaa6c3810b2","ciphertext":"03151cf3164ea30fbc79362511260c5d207c2ff199690044110750bd8061b0ee89d1bb258776dbbcc9f892e7242e9233ec4c420bfa29b4f63ad5a4804b50f46a44d40ec4e6f444461a25ff06732b133a","mac":"013584bd513e19604b5fcdd599e22eb79843152f7dca1ef48a8a2b6e0f413db1"}',
      timestamp: 1649670068309,
    },
  ],
};

export const encryptMessage = async (str: string, key: string) => {
  const pubKey = utils.computePublicKey(key, true);
  const res = await EthCrypto.encryptWithPublicKey(pubKey.slice(2), str);
  return JSON.stringify(res);
};

export const decryptMessage = async (str: string, key: string) => {
  const res = await EthCrypto.decryptWithPrivateKey(key, JSON.parse(str));
  return res;
};

const memberData = async (
  member: any,
  privateKey: string,
  timestamp: number
) => {
  const key = await EthCrypto.encryptWithPublicKey(
    member.user_id.slice(2),
    privateKey
  );
  return {
    key: JSON.stringify(key),
    timestamp,
    user_id: member.user_id,
  };
};

export const createMemberChannelData = async (members: Array<any>) => {
  const { privateKey } = ethers.Wallet.createRandom();
  const timestamp = new Date().getTime();
  const req = members.map((el) => memberData(el, privateKey, timestamp));
  const res = await Promise.all(req);
  return res;
};

export const getChannelPrivateKey = async (
  encrypted: string,
  privateKey: string
) => {
  const res = await EthCrypto.decryptWithPrivateKey(
    privateKey,
    JSON.parse(encrypted)
  );
  return res;
};

export const storePrivateChannel = async (
  channelId: string,
  key: string,
  timestamp: number
) => {
  const current = await getCookie(AsyncKey.channelPrivateKey);
  let res: any = {};
  if (typeof current === 'string') {
    res = JSON.parse(current);
  }
  res[channelId] = [...(res?.[channelId] || []), { key, timestamp }];
  setCookie(AsyncKey.channelPrivateKey, JSON.stringify(res));
};

const decryptPrivateChannel = async (item: any, privateKey: string) => {
  const key = await getChannelPrivateKey(item.key, privateKey);
  return {
    key,
    timestamp: item.timestamp,
    channelId: item.channelId,
  };
};

export const getPrivateChannel = async (privateKey: string) => {
  const current = await getCookie(AsyncKey.channelPrivateKey);
  // const current = JSON.stringify(testData);
  let dataLocal: any = {};
  if (typeof current === 'string') {
    dataLocal = JSON.parse(current);
  } else {
    return {};
  }
  let req: Array<any> = [];
  Object.keys(dataLocal).forEach((k) => {
    req = [
      ...req,
      ...(dataLocal?.[k]?.map?.((el: any) => ({ channelId: k, ...el })) || []),
    ];
  });
  req = req.map((el) => decryptPrivateChannel(el, privateKey));
  const res = await Promise.all(req);
  return res.reduce((result, val) => {
    const { channelId, key, timestamp } = val;
    if (result[channelId]) {
      const prev = result[channelId];
      prev[prev.length - 1] = { ...prev[prev.length - 1], expire: timestamp };
      result[channelId] = [...prev, { key, timestamp }];
    } else {
      result[channelId] = [{ key, timestamp }];
    }
    return result;
  }, {});
};

export const normalizeMessageItem = async (
  item: any,
  key: string,
  channelId: string
) => {
  const content = await decryptMessage(item.content, key);
  const plain_text = await decryptMessage(item.plain_text, key);
  if (item?.conversation_data?.length > 0) {
    item.conversation_data = await normalizeMessageData(
      item.conversation_data,
      channelId
    );
  }
  return {
    ...item,
    content,
    plain_text,
  };
};

export const normalizeMessageData = async (
  messages: Array<any>,
  channelId: string
) => {
  const configs: any = store.getState()?.configs;
  const { channelPrivateKey } = configs;
  const keys = channelPrivateKey?.[channelId] || [];
  if (keys.length === 0) return [];
  const req = messages.map((el) =>
    normalizeMessageItem(
      el,
      findKey(keys, new Date(el.createdAt).getTime()).key,
      channelId
    )
  );
  return Promise.all(req);
};

const findKey = (keys: Array<any>, created: number) => {
  return keys.find((el) => {
    if (el.expire) {
      return el.timestamp <= created && el.expire >= created;
    }
    return true;
  });
};
