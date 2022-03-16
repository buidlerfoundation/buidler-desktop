import actionTypes from '../actions/ActionTypes';
import { AsyncKey } from '../common/AppConfig';
import { setCookie } from '../common/Cookie';

const initialState = {
  userData: null,
  team: null,
  channel: [],
  groupChannel: [],
  currentTeam: null,
  currentChannel: null,
  imgDomain: null,
  imgConfig: null,
  loginGoogleUrl: null,
  teamUserData: [],
  lastChannel: {},
};

const userReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserData: [...state.teamUserData, payload],
      };
    }
    case actionTypes.NEW_CHANNEL: {
      return {
        ...state,
        channel: [...state.channel, payload],
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        groupChannel: state.groupChannel.filter(
          (el) => el.group_channel_id !== payload.groupId
        ),
      };
    }
    case actionTypes.CREATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        groupChannel: [...state.groupChannel, payload],
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        groupChannel: state.groupChannel.map((el) => {
          if (el.group_channel_id === payload.group_channel_id) {
            return {
              ...el,
              ...payload,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.USER_ONLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map((el) => {
          if (el.user_id === user_id) {
            el.status = 'online';
          }
          return el;
        }),
      };
    }
    case actionTypes.USER_OFFLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map((el) => {
          if (el.user_id === user_id) {
            el.status = 'offline';
          }
          return el;
        }),
      };
    }
    case actionTypes.GET_INITIAL: {
      return {
        ...state,
        imgDomain: payload.data.img_domain,
        imgConfig: payload.data.img_config,
        loginGoogleUrl: payload.data.login_url,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        ...state,
        userData: null,
        team: null,
        channel: [],
        groupChannel: [],
        currentTeam: null,
        currentChannel: null,
        lastChannel: {},
        teamUserData: [],
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const { teamUsers, teamId } = payload;
      return {
        ...state,
        teamUserData: teamUsers,
      };
    }
    case actionTypes.USER_SUCCESS: {
      return {
        ...state,
        userData: payload.user,
      };
    }
    case actionTypes.GROUP_CHANNEL: {
      return {
        ...state,
        groupChannel: payload,
      };
    }
    case actionTypes.SET_CURRENT_TEAM: {
      const { lastChannelId, resChannel, directChannelUser, team } = payload;
      let channel;
      if (directChannelUser && lastChannelId) {
        const directChannel = resChannel.data.find(
          (c) => c?.channel_id === directChannelUser.direct_channel
        );
        channel = {
          channel_id: lastChannelId,
          channel_name: '',
          channel_type: 'Direct',
          seen: true,
          user: directChannelUser,
          channel_member: directChannel?.channel_member || [],
          notification_type:
            resChannel.data.find(
              (c) => c?.channel_id === directChannelUser.direct_channel
            )?.notification_type || 'Alert',
        };
      } else if (resChannel.data.length > 0) {
        channel =
          resChannel.data.find(
            (c) =>
              c.channel_id === lastChannelId ||
              c.channel_id === state.lastChannel?.[team.team_id]?.channel_id
          ) || resChannel.data.filter((c) => c.channel_type !== 'Direct')[0];
      }
      setCookie(AsyncKey.lastChannelId, channel?.channel_id);
      return {
        ...state,
        currentTeam: team,
        currentChannel: channel,
        lastChannel: {
          ...state.lastChannel,
          [team.team_id]: channel,
        },
      };
    }
    case actionTypes.CREATE_TEAM_SUCCESS: {
      return {
        ...state,
        team: [...(state.team || []), payload],
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      return {
        ...state,
        currentChannel: payload.channel,
        lastChannel: {
          ...state.lastChannel,
          [state?.currentTeam?.team_id]: payload.channel,
        },
        channel: state.channel.map((c) => {
          if (c?.channel_id === payload?.channel?.channel_id) {
            c.seen = true;
            c.notification_type = payload.channel.notification_type;
          }
          return c;
        }),
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL: {
      const { channelId, groupId } = payload;
      const group = state.groupChannel.find(
        (g) => g.group_channel_id === groupId
      );
      if (!group) return state;
      return {
        ...state,
        channel: state.channel.map((c) => {
          if (c.channel_id === channelId) {
            c.group_channel_id = groupId;
            c.group_channel = group;
          }
          return c;
        }),
      };
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const { channelId } = payload;
      return {
        ...state,
        channel: state.channel.map((c) => {
          if (c.channel_id === channelId) {
            c.seen = false;
          }
          return c;
        }),
      };
    }
    case actionTypes.TEAM_SUCCESS: {
      return {
        ...state,
        team: payload.team,
      };
    }
    case actionTypes.CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: payload.channel,
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const { currentChannel, channel } = state;
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const newChannel = channel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      let newCurrentChannel = currentChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel = newChannel?.[currentIdx] || newChannel?.[0];
        setCookie(AsyncKey.lastChannelId, newCurrentChannel?.channel_id);
      }
      return {
        ...state,
        channel: newChannel,
        currentChannel: newCurrentChannel,
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: state.channel.map((el) => {
          if (el.channel_id === payload.channel_id) {
            return { ...el, ...payload };
          }
          return el;
        }),
        currentChannel:
          state.currentChannel.channel_id === payload.channel_id
            ? { ...state.currentChannel, ...payload }
            : state.currentChannel,
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        currentChannel: payload,
        lastChannel: {
          ...state.lastChannel,
          [state.currentTeam.team_id]: payload,
        },
      };
    }
    case actionTypes.REMOVE_MEMBER_SUCCESS: {
      return {
        ...state,
        teamUserData: state.teamUserData.filter(
          (el) => el.user_id !== payload.userId
        ),
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      return {
        ...state,
        team: state.team.filter((el) => el.team_id !== payload.teamId),
      };
    }
    case actionTypes.USER_CHANNEL_SUCCESS: {
      return {
        ...state,
        userData: {
          ...state.userData,
          user_channels: payload.channels.map((el) => el.channel_id),
        },
      };
    }
    case actionTypes.UPDATE_TEAM_SUCCESS: {
      const { teamId, body } = payload;
      return {
        ...state,
        currentTeam:
          state.currentTeam.team_id === teamId
            ? { ...state.currentTeam, ...body }
            : state.currentTeam,
        team: state.team.map((el) => {
          if (el.team_id === teamId) {
            return {
              ...el,
              ...body,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.DELETE_TEAM_SUCCESS: {
      const { teamId } = payload;
      const newTeam = state.team.filter((el) => el.team_id !== teamId);
      return {
        ...state,
        currentTeam:
          state.currentTeam.team_id === teamId
            ? newTeam?.[0]
            : state.currentTeam,
        team: newTeam,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
