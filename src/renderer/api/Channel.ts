import ApiCaller from './ApiCaller';

export const createChanel = (teamId: string, body: any) =>
  ApiCaller.post(`channel/${teamId}`, body);

export const createGroupChannel = (teamId: string, body: any) =>
  ApiCaller.post(`group/${teamId}`, body);

export const updateGroupChannel = (groupId: string, body: any) =>
  ApiCaller.put(`group/${groupId}`, body);

export const deleteGroupChannel = (groupId: string) =>
  ApiCaller.delete(`group/${groupId}`);

export const getChannels = (teamId: string) =>
  ApiCaller.get(`channel/${teamId}`);

export const updateChannel = (id: string, body: any) =>
  ApiCaller.put(`channel/${id}`, body);

export const deleteChannel = (id: string) => ApiCaller.delete(`channel/${id}`);

export const updateChannelNotification = (
  channelId: string,
  notificationType: string
) => {
  return ApiCaller.post(`channel/${channelId}/notification`, {
    notification_type: notificationType,
  });
};

export const addUserToChannel = (channelId: string, userId: string) =>
  ApiCaller.post(`channel/${channelId}/member/${userId}`);

export const removeUserFromChannel = (channelId: string, userId: string) =>
  ApiCaller.delete(`channel/${channelId}/member/${userId}`);

export const updateChannelMember = (channelId: string, body: any) =>
  ApiCaller.put(`channel/${channelId}/member`, body);
