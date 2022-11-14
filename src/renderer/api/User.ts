import {
  BalanceApiData,
  Channel,
  CollectibleDataApi,
  Contract,
  InitialApiData,
  NFTCollectionDataApi,
  NotificationData,
  NotificationFilterType,
  SpaceCollectionData,
  Token,
  TokenPrice,
  TransactionApiData,
  UserData,
  UserNFTCollection,
  UserRoleType,
} from 'renderer/models';
import { ConfigNotificationRequestBody } from 'renderer/models/request';
import ApiCaller from './ApiCaller';
import Caller from './Caller';

export const loginWithGoogle = (code: string) =>
  ApiCaller.post('user', { code });

export const findUser = async () => {
  return Caller.get<UserData>('user');
};

export const findTeam = () => ApiCaller.get('user/team');

export const getGroupChannel = (teamId: string) =>
  ApiCaller.get(`group/${teamId}`);

export const getSpaceChannel = (teamId: string, controller?: AbortController) =>
  Caller.get<Array<Space>>(`space/${teamId}`, undefined, controller);

export const findChannel = (teamId: string, controller?: AbortController) =>
  Caller.get<Array<Channel>>(`channel/${teamId}`, undefined, controller);

export const getInitial = () => Caller.get<InitialApiData>(`initial`);

export const updateChannel = (id: string, data: any) =>
  ApiCaller.put(`channel/${id}`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  ApiCaller.delete(`team/${teamId}/member`, { user_ids: [userId] });

export const leaveTeam = (teamId: string) =>
  ApiCaller.delete(`team/${teamId}/leave`);

export const updateUserChannel = (channelIds: Array<string>) =>
  ApiCaller.put(`user/channel`, { channel_ids: channelIds });

export const requestNonce = (pubKey: string) =>
  ApiCaller.post('user/nonce', { public_key: pubKey });

export const requestNonceWithAddress = (address: string) =>
  Caller.post<{ message: string }>('user/address', { address });

export const verifyNonce = (message: string, signature: string) =>
  Caller.post<{
    avatar_url: string;
    user_id: string;
    user_name: string;
  }>('user', { message, signature });

export const getCollectibles = (page = 1, limit = 10) => {
  return Caller.get<CollectibleDataApi>(`user/nft?page=${page}&limit=${limit}`);
};

export const updateUser = (data: any) => ApiCaller.put('user', data);

export const verifyOtp = (data: any) =>
  ApiCaller.post('user/device/verify', data);

export const syncChannelKey = (data: any) =>
  ApiCaller.post('user/device/sync', data);

export const acceptInvitation = (invitationId: string) =>
  Caller.post<Community>(`team/invitation/${invitationId}/accept`);

export const removeDevice = (body: any) =>
  ApiCaller.delete('user/device', body);

export const getNFTCollection = () =>
  ApiCaller.get<Array<UserNFTCollection>>('user/nft-collection');

export const getSpaceCondition = (spaceId: string) =>
  Caller.get<Array<SpaceCollectionData>>(`space/${spaceId}/condition`);

export const fetchWalletBalance = () =>
  Caller.get<BalanceApiData>('user/balance');

export const fetchTransaction = (params: { page?: number; limit?: number }) => {
  const { page = 1, limit = 20 } = params;
  return Caller.get<Array<TransactionApiData>>(
    `user/transaction?page=${page}&limit=${limit}`
  );
};

export const fetchNFTCollection = () =>
  Caller.get<Array<NFTCollectionDataApi>>('user/nft-collection/group');

export const getUserDetail = (userId: string, teamId: string) =>
  Caller.get<UserData>(`user/${userId}/team/${teamId}`);

export const importToken = (address: string) =>
  Caller.post<Token>(`user/balance/${address}`);

export const searchToken = (address: string) =>
  Caller.get<Contract>(`contract/${address}`);

export const findUserByAddress = (params: {
  address?: string;
  username?: string;
}) => {
  let url = 'user/search';
  if (params.address) {
    url += `?address=${params.address}`;
  } else if (params.username) {
    url += `?username=${params.username}`;
  }
  return Caller.get<Array<UserData>>(url);
};

export const getTokenPrice = (contractAddress: string) =>
  Caller.get<TokenPrice>(`price/${contractAddress}`);

export const getGasPrice = () => Caller.get<number>('price/gas');

export const getGasLimit = (tx) =>
  Caller.post<number>('price/estimate/gas', tx);

export const getMembersByRole = (
  teamId: string,
  roles: Array<UserRoleType> = [],
  params: {
    userName?: string;
    page?: number;
  } = {}
) => {
  const { userName, page } = params;
  let url = `team/${teamId}/role?page=${page || 1}&limit=50`;
  roles.forEach((el) => {
    url += `&roles[]=${el}`;
  });
  if (userName) {
    url += `&username=${userName}`;
  }
  return Caller.get<Array<UserData>>(url);
};

export const modifyRole = (
  teamId: string,
  role: string,
  body: { user_ids_to_add?: Array<string>; user_ids_to_remove?: Array<string> }
) => {
  return Caller.put(`team/${teamId}/${role}`, body);
};

export const addPendingTx = (tx: TransactionApiData) =>
  Caller.post<TransactionApiData>('user/transaction', tx);

export const refreshToken = (token: string) => {
  return Caller.post<{
    token: string;
    token_expire_at: number;
    refresh_token: string;
    refresh_token_expire_at: number;
  }>('user/refresh', undefined, undefined, undefined, {
    'Refresh-Token': token,
  });
};

export const getNotification = (
  filterType: NotificationFilterType,
  before?: string
) => {
  let uri = 'notifications?page[size]=20';
  if (filterType === 'Mention') {
    uri +=
      '&notification_types[]=channel_mention&notification_types[]=post_mention';
  } else if (filterType === 'Unread') {
    uri += '&is_read=false';
  }
  if (before) {
    uri += `&page[before]=${before}`;
  }
  return Caller.get<NotificationData[]>(uri);
};

export const readNotification = (notificationId: string) =>
  Caller.put(`notifications/${notificationId}`);

export const readAllNotification = () => Caller.put('notifications');

export const deleteNotification = (notificationId: string) =>
  Caller.delete(`notifications/${notificationId}`);

export const configNotificationFromTask = (
  pinPostId: string,
  data: ConfigNotificationRequestBody
) => Caller.post(`notifications/task/${pinPostId}`, data);
