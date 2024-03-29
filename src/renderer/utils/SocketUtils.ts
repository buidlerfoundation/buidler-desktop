import actionTypes from '../actions/ActionTypes';
import AppConfig, { AsyncKey } from '../common/AppConfig';
import { getCookie, setCookie } from '../common/Cookie';
import store from '../store';
import { ipcRenderer } from 'electron';
import toast from 'react-hot-toast';
import api from '../api';
import { createRefreshSelector } from '../reducers/selectors';
import GlobalVariable from '../services/GlobalVariable';
import { Dispatch } from 'redux';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';

const SocketIO = require('socket.io-client');

const getTasks = async (channelId: string, dispatch: Dispatch) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTasks(channelId),
      api.getArchivedTaskCount(channelId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: 'Error', taskRes, archivedCountRes },
      });
    }
  } catch (e) {
    dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
  }
};

const getTaskFromUser = async (
  userId: string,
  channelId: string,
  teamId: string,
  dispatch: Dispatch
) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTaskFromUser(userId, teamId),
      api.getArchivedTaskCountFromUser(userId, teamId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: 'Error', taskRes, archivedCountRes },
      });
    }
  } catch (e) {
    dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
  }
};

const getMessages = async (channelId: string, dispatch: Dispatch) => {
  const messageRes = await api.getMessages(channelId, 50);
  if (messageRes.statusCode === 200) {
    dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: { data: messageRes.data, channelId },
    });
  }
};

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string
) => {
  const teamUsersRes = await api.getTeamUsers(team.team_id);
  let lastChannelId: any = null;
  if (channelId) {
    lastChannelId = channelId;
  } else {
    lastChannelId = await getCookie(AsyncKey.lastChannelId);
  }
  const resChannel = await api.findChannel(team.team_id);
  if (teamUsersRes.statusCode === 200) {
    dispatch({
      type: actionTypes.GET_TEAM_USER,
      payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
    });
  }
  const directChannelUser = teamUsersRes?.data?.find(
    (u: any) => u.direct_channel === lastChannelId
  );
  dispatch({
    type: actionTypes.SET_CURRENT_TEAM,
    payload: { team, resChannel, directChannelUser, lastChannelId },
  });
  setCookie(AsyncKey.lastTeamId, team.team_id);
  const resGroupChannel = await api.getGroupChannel(team.team_id);
  if (resGroupChannel.statusCode === 200) {
    dispatch({
      type: actionTypes.GROUP_CHANNEL,
      payload: resGroupChannel.data,
    });
  }
  if (resChannel.statusCode === 200) {
    if (resChannel.data.length > 0) {
      dispatch({
        type: actionTypes.CHANNEL_SUCCESS,
        payload: {
          channel: resChannel.data.map((c: any) => {
            if (c.channel_id === lastChannelId) {
              c.seen = true;
            }
            return c;
          }),
        },
      });
    } else {
      dispatch({
        type: actionTypes.CHANNEL_FAIL,
      });
    }
  }
};

const loadMessageIfNeeded = async () => {
  const refreshSelector = createRefreshSelector([actionTypes.MESSAGE_PREFIX]);
  const user: any = store.getState()?.user;
  const { currentChannel } = user;
  const refresh = refreshSelector(store.getState());
  if (!currentChannel || refresh) return;
  store.dispatch({
    type: actionTypes.MESSAGE_FRESH,
    payload: { channelId: currentChannel.channel_id },
  });
  const messageRes = await api.getMessages(currentChannel.channel_id);
  if (messageRes.statusCode === 200) {
    store.dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: {
        data: messageRes.data,
        channelId: currentChannel.channel_id,
        isFresh: true,
      },
    });
  }
};

class SocketUtil {
  socket: any = null;
  firstLoad = false;
  async init(teamId?: string) {
    if (this.socket?.connected) return;
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    this.socket = SocketIO(
      `${AppConfig.baseUrl}`,
      {
        query: { token: accessToken },
      },
      {
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );
    this.socket.on('connect', () => {
      if (this.firstLoad) {
        this.reloadData();
      }
      this.firstLoad = true;
      this.listenSocket();
      this.socket.on('disconnect', (reason: string) => {
        this.socket.off('ON_NEW_MESSAGE');
        this.socket.off('ON_NEW_TASK');
        this.socket.off('ON_UPDATE_TASK');
        this.socket.off('ON_ERROR');
        this.socket.off('ON_EDIT_MESSAGE');
        this.socket.off('ON_USER_ONLINE');
        this.socket.off('ON_USER_OFFLINE');
        this.socket.off('ON_DELETE_TASK');
        this.socket.off('ON_DELETE_MESSAGE');
        this.socket.off('ON_REACTION_ADDED');
        this.socket.off('ON_REACTION_REMOVED');
        this.socket.off('ON_USER_JOIN_TEAM');
        this.socket.off('ON_CREATE_NEW_CHANNEL');
        this.socket.off('ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL');
        this.socket.off('ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL');
        this.socket.off('disconnect');
      });
      loadMessageIfNeeded();
      const user: any = store.getState()?.user;
      const { currentTeam } = user || {};
      this.socket.emit('ONLINE', { team_id: teamId || currentTeam?.team_id });
    });
  }
  reloadData = () => {
    const user: any = store.getState()?.user;
    const { currentTeam, currentChannel } = user;
    if (currentTeam && currentChannel) {
      console.log('XXX: reload from socket');
      actionSetCurrentTeam(
        currentTeam,
        store.dispatch,
        currentChannel.channel_id
      );
      // load message
      getMessages(currentChannel.channel_id, store.dispatch);
      // load task
      if (currentChannel?.user) {
        getTaskFromUser(
          currentChannel.user.user_id,
          currentChannel.channel_id || currentChannel.user.user_id,
          currentTeam?.team_id,
          store.dispatch
        );
      } else {
        getTasks(currentChannel.channel_id, store.dispatch);
      }
    }
  };
  listenSocket() {
    this.socket.on('ON_CREATE_NEW_CHANNEL', (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam } = user;
      if (currentTeam.team_id === data.team_id) {
        store.dispatch({
          type: actionTypes.NEW_CHANNEL,
          payload: data,
        });
      }
    });
    this.socket.on('ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL', (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam, channel, userData } = user;
      if (currentTeam.team_id === data.team_id) {
        const isExistChannel = !!channel.find(
          (el: any) => el.channel_id === data.channel_id
        );
        if (isExistChannel) {
          store.dispatch({
            type: actionTypes.UPDATE_CHANNEL_SUCCESS,
            payload: data.channel,
          });
        } else if (
          !!data.channel_member.find((el: string) => el === userData.user_id)
        ) {
          store.dispatch({
            type: actionTypes.NEW_CHANNEL,
            payload: data.channel,
          });
        }
      }
    });
    this.socket.on('ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL', (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam, channel, userData } = user;
      if (currentTeam.team_id === data.team_id) {
        const isExistChannel = !!channel.find(
          (el: any) => el.channel_id === data.channel_id
        );
        if (
          isExistChannel &&
          !data.channel_member.find((el: string) => el === userData.user_id)
        ) {
          store.dispatch({
            type: actionTypes.DELETE_CHANNEL_SUCCESS,
            payload: { channelId: data.channel.channel_id },
          });
        }
      }
    });
    this.socket.on('ON_USER_JOIN_TEAM', (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam } = user;
      if (currentTeam.team_id === data.team_id) {
        store.dispatch({
          type: actionTypes.NEW_USER,
          payload: data.user,
        });
      }
    });
    this.socket.on('ON_REACTION_ADDED', (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      store.dispatch({
        type: actionTypes.ADD_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
        },
      });
    });
    this.socket.on('ON_REACTION_REMOVED', (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      store.dispatch({
        type: actionTypes.REMOVE_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
        },
      });
    });
    this.socket.on('ON_USER_ONLINE', (data: any) => {
      store.dispatch({
        type: actionTypes.USER_ONLINE,
        payload: data,
      });
    });
    this.socket.on('ON_USER_OFFLINE', (data: any) => {
      store.dispatch({
        type: actionTypes.USER_OFFLINE,
        payload: data,
      });
    });
    this.socket.on('ON_DELETE_MESSAGE', (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_MESSAGE,
        payload: {
          messageId: data.message_id,
          channelId: data.channel_id,
          parentId: data.parent_id,
        },
      });
    });
    this.socket.on('ON_DELETE_TASK', (data: any) => {
      data.channel_ids.forEach((el: string) => {
        store.dispatch({
          type: actionTypes.DELETE_TASK_REQUEST,
          payload: {
            taskId: data.task_id,
            channelId: el,
          },
        });
      });
    });
    this.socket.on('ON_USER_OFFLINE', (data: any) => {});
    this.socket.on('ON_NEW_MESSAGE', (data: any) => {
      const { message_data, notification_data } = data;
      const { notification_type } = notification_data;
      const user: any = store.getState()?.user;
      const {
        userData,
        team,
        currentTeam,
        teamUserData,
        channel,
        currentChannel,
      } = user;
      const messageData: any = store.getState()?.message.messageData;
      if (!currentChannel.channel_id) {
        store.dispatch({
          type: actionTypes.SET_CURRENT_CHANNEL,
          payload: {
            channel: {
              ...currentChannel,
              channel_id: message_data.channel_id,
              user: {
                ...currentChannel.user,
                direct_channel: message_data.channel_id,
              },
            },
          },
        });
        setCookie(AsyncKey.lastChannelId, message_data.channel_id);
      } else if (
        userData?.user_id !== notification_data?.sender_data?.user_id
      ) {
        if (notification_type !== 'Muted') {
          if (currentChannel.channel_id !== message_data.channel_id) {
            store.dispatch({
              type: actionTypes.MARK_UN_SEEN_CHANNEL,
              payload: {
                channelId: message_data.channel_id,
              },
            });
          }
        }
        ipcRenderer.removeAllListeners('notification-click');
        if (
          notification_type === 'Alert' &&
          (currentChannel.channel_id !== message_data.channel_id ||
            !GlobalVariable.isWindowFocus)
        ) {
          ipcRenderer.send('doing-notification', {
            title: `${notification_data?.channel_name} (${notification_data?.team_name})`,
            body: notification_data.body,
            icon: notification_data?.sender_data?.avatar_url,
            subtitle:
              normalizeUserName(notification_data?.sender_data?.user_name) ||
              'Message',
          });
        }
        const teamNotification = team.find(
          (t: any) => t.team_id === notification_data.team_id
        );
        const channelNotification = channel.find(
          (c: any) => c.channel_id === message_data.channel_id
        );
        if (channelNotification?.channel_type === 'Direct') {
          channelNotification.user = teamUserData.find(
            (u: any) =>
              u.user_id ===
              channelNotification.channel_member.find(
                (el: string) => el !== userData?.user_id
              )
          );
        }
        if (currentChannel.channel_id === message_data.channel_id) {
          const { scrollData } = messageData?.[currentChannel.channel_id] || {};
          if (scrollData?.showScrollDown) {
            store.dispatch({
              type: actionTypes.SET_CHANNEL_SCROLL_DATA,
              payload: {
                channelId: currentChannel.channel_id,
                data: {
                  showScrollDown: scrollData?.showScrollDown,
                  unreadCount: (scrollData?.unreadCount || 0) + 1,
                },
              },
            });
          }
        }
        if (
          teamNotification &&
          currentChannel.channel_id !== message_data.channel_id
        ) {
          ipcRenderer.on('notification-click', (_) => {
            if (currentTeam.team_id === notification_data.team_id) {
              store.dispatch({
                type: actionTypes.SET_CURRENT_CHANNEL,
                payload: { channel: channelNotification },
              });
            } else {
              this.setTeamFromNotification(
                teamNotification,
                message_data.channel_id,
                store.dispatch
              );
            }
          });
        }
      }
      store.dispatch({
        type: actionTypes.RECEIVE_MESSAGE,
        payload: { data: message_data },
      });
    });
    this.socket.on('ON_NEW_TASK', (data: any) => {
      if (!data) return;
      const user: any = store.getState()?.user;
      const { currentChannel } = user || {};
      store.dispatch({
        type: actionTypes.CREATE_TASK_SUCCESS,
        payload: {
          res: data,
          channelId:
            currentChannel?.user?.user_id === data?.assignee_id
              ? currentChannel?.channel_id
              : data?.channel?.[0]?.channel_id,
        },
      });
    });
    this.socket.on('ON_EDIT_MESSAGE', (data: any) => {
      if (!data) return;
      store.dispatch({
        type: actionTypes.EDIT_MESSAGE,
        payload: { data },
      });
    });
    this.socket.on('ON_UPDATE_TASK', (data: any) => {
      if (!data) return;
      const user: any = store.getState()?.user;
      const { currentChannel } = user || {};
      store.dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: data.task_id,
          data: {
            [data.updated_key]: data[data.updated_key],
            comment_count: data.comment_count,
          },
          channelId:
            currentChannel?.user?.direct_channel ||
            data?.channel?.[0]?.channel_id,
          channelUserId:
            data.updated_key === 'assignee_id' &&
            currentChannel?.user?.direct_channel
              ? currentChannel?.user?.user_id
              : null,
        },
      });
    });
    this.socket.on('ON_ERROR', (data: any) => {
      toast.error(data);
    });
  }
  async changeTeam(teamId: string) {
    if (!this.socket) {
      await this.init(teamId);
      return;
    }
    this.socket.emit('ONLINE', { team_id: teamId });
  }
  sendMessage = (message: {
    channel_id: string;
    content: string;
    plain_text: string;
    mentions?: Array<any>;
    message_id?: string;
  }) => {
    this.socket.emit('NEW_MESSAGE', message);
  };

  setTeamFromNotification = async (
    team: any,
    channelId: string,
    dispatch: any
  ) => {
    dispatch({
      type: actionTypes.CHANNEL_REQUEST,
    });
    const teamUsersRes = await api.getTeamUsers(team.team_id);
    let lastChannelId = null;
    if (channelId) {
      lastChannelId = channelId;
    } else {
      lastChannelId = await getCookie(AsyncKey.lastChannelId);
    }
    const resChannel = await api.findChannel(team.team_id);
    if (teamUsersRes.statusCode === 200) {
      dispatch({
        type: actionTypes.GET_TEAM_USER,
        payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
      });
    }
    this.changeTeam(team.team_id);
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: { team, resChannel, lastChannelId },
    });
    setCookie(AsyncKey.lastTeamId, team.team_id);
    const resGroupChannel = await api.getGroupChannel(team.team_id);
    if (resGroupChannel.statusCode === 200) {
      dispatch({
        type: actionTypes.GROUP_CHANNEL,
        payload: resGroupChannel.data,
      });
    }
    if (resChannel.statusCode === 200) {
      if (resChannel.data.length > 0) {
        dispatch({
          type: actionTypes.CHANNEL_SUCCESS,
          payload: { channel: resChannel.data },
        });
      } else {
        dispatch({
          type: actionTypes.CHANNEL_FAIL,
        });
      }
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket?.disconnect?.();
      this.socket = null;
    }
  };
}

export default new SocketUtil();
