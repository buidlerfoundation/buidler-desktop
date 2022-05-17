import { ActionCreator, Dispatch } from 'redux';
import api from '../api';
import ActionTypes from './ActionTypes';
import { AsyncKey } from '../common/AppConfig';
import { getCookie, setCookie } from '../common/Cookie';
import ImageHelper from '../common/ImageHelper';
import SocketUtils from '../utils/SocketUtils';

export const getInitial: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const res = await api.getInitial();
    ImageHelper.initial(res.img_domain, res.img_config);
    dispatch({ type: ActionTypes.GET_INITIAL, payload: { data: res } });
  };

export const logout: ActionCreator<any> = () => (dispatch: Dispatch) => {
  SocketUtils.disconnect();
  dispatch({ type: ActionTypes.LOGOUT });
};

export const login: ActionCreator<any> =
  (code, callback: (res: boolean) => void) => async (dispatch: Dispatch) => {
    dispatch({ type: ActionTypes.LOGIN_REQUEST });
    const res = await api.loginWithGoogle(code);
    if (res.statusCode === 200) {
      setCookie(AsyncKey.accessTokenKey, res.token);
      // TODO: call api fetch user profile with token
      dispatch({ type: ActionTypes.LOGIN_SUCCESS });
      dispatch({ type: ActionTypes.USER_SUCCESS, payload: { user: res.data } });
      callback(true);
    } else {
      dispatch({ type: ActionTypes.LOGIN_FAIL });
      callback(false);
    }
  };

export const findUser = () => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.USER_REQUEST });
  const res = await api.findUser();
  if (res.statusCode === 200) {
    dispatch({ type: ActionTypes.USER_SUCCESS, payload: { user: res } });
  } else {
    dispatch({ type: ActionTypes.USER_FAIL });
  }
};

export const dragChannel =
  (channelId: string, groupId: string) => async (dispatch: Dispatch) => {
    const res = await api.updateChannel(channelId, {
      group_channel_id: groupId,
    });
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.UPDATE_GROUP_CHANNEL,
        payload: { channelId, groupId },
      });
    }
  };

export const findTeamAndChannel =
  (showLoading = true) =>
  async (dispatch: Dispatch) => {
    if (showLoading) {
      dispatch({ type: ActionTypes.TEAM_REQUEST });
    }
    const res = await api.findTeam();
    const lastTeamId = await getCookie(AsyncKey.lastTeamId);
    if (res.statusCode === 200) {
      if (res.data.length > 0) {
        const currentTeam =
          res.data.find((t: any) => t.team_id === lastTeamId) || res.data[0];
        const teamId = currentTeam.team_id;
        const resSpace = await api.getSpaceChannel(teamId);
        if (resSpace.statusCode === 200) {
          dispatch({
            type: ActionTypes.GROUP_CHANNEL,
            payload: resSpace.data,
          });
        }
        const resChannel = await api.findChannel(teamId);
        const lastChannelId = await getCookie(AsyncKey.lastChannelId);
        const teamUsersRes = await api.getTeamUsers(currentTeam.team_id);
        // const teamActivityRes = await api.getTeamActivity(currentTeam.team_id);
        // if (teamActivityRes.statusCode === 200) {
        //   dispatch({
        //     type: ActionTypes.GET_TEAM_ACTIVITY,
        //     payload: {
        //       teamId: currentTeam.team_id,
        //       activity: teamActivityRes.data,
        //     },
        //   });
        // }
        if (teamUsersRes.statusCode === 200) {
          dispatch({
            type: ActionTypes.GET_TEAM_USER,
            payload: {
              teamUsers: teamUsersRes.data,
              teamId: currentTeam.team_id,
            },
          });
        }
        SocketUtils.init(currentTeam.team_id);
        const directChannelUser = teamUsersRes?.data?.find(
          (u: any) => u.direct_channel === lastChannelId
        );
        dispatch({
          type: ActionTypes.SET_CURRENT_TEAM,
          payload: {
            team: currentTeam,
            lastChannelId,
            directChannelUser,
            resChannel,
            teamUsersRes,
          },
        });
        if (resChannel.statusCode === 200) {
          if (resChannel.data.length > 0) {
            dispatch({
              type: ActionTypes.CHANNEL_SUCCESS,
              payload: { channel: resChannel.data },
            });
          }
        } else {
          dispatch({
            type: ActionTypes.CHANNEL_FAIL,
          });
        }
      }
      dispatch({ type: ActionTypes.TEAM_SUCCESS, payload: { team: res.data } });
    } else {
      dispatch({ type: ActionTypes.TEAM_FAIL, payload: { message: res } });
      dispatch({
        type: ActionTypes.CHANNEL_FAIL,
      });
    }
  };

export const setCurrentChannel = (channel: any) => (dispatch: Dispatch) => {
  if (channel?.channel_id)
    setCookie(AsyncKey.lastChannelId, channel?.channel_id);
  dispatch({
    type: ActionTypes.SET_CURRENT_CHANNEL,
    payload: { channel },
  });
};

export const updateChannel =
  (channelId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CHANNEL_REQUEST,
      payload: { channelId, body },
    });
    const res = await api.updateChannel(channelId, body);
    if (res.statusCode === 200) {
      dispatch({ type: ActionTypes.UPDATE_CHANNEL_SUCCESS, payload: res });
    } else {
      dispatch({ type: ActionTypes.UPDATE_CHANNEL_FAIL, payload: res });
    }
  };

export const deleteChannel =
  (channelId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.DELETE_CHANNEL_PREFIX,
      payload: { channelId },
    });
    const res = await api.deleteChannel(channelId);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.DELETE_CHANNEL_SUCCESS,
        payload: { ...res, channelId },
      });
    } else {
      dispatch({ type: ActionTypes.DELETE_CHANNEL_FAIL, payload: res });
    }
  };

export const createNewChannel =
  (teamId: string, body: any, groupName: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.CREATE_CHANNEL_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.createChannel(teamId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.CREATE_CHANNEL_SUCCESS,
        payload: {
          ...res,
          group_channel: {
            group_channel_name: groupName,
          },
        },
      });
    } else {
      dispatch({
        type: ActionTypes.CREATE_CHANNEL_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string
) => {
  dispatch({
    type: ActionTypes.CHANNEL_REQUEST,
  });
  const teamUsersRes = await api.getTeamUsers(team.team_id);
  let lastChannelId: any = null;
  if (channelId) {
    lastChannelId = channelId;
  } else {
    lastChannelId = await getCookie(AsyncKey.lastChannelId);
  }
  const resChannel = await api.findChannel(team.team_id);
  // const teamActivityRes = await api.getTeamActivity(team.team_id);
  // if (teamActivityRes.statusCode === 200) {
  //   dispatch({
  //     type: ActionTypes.GET_TEAM_ACTIVITY,
  //     payload: {
  //       teamId: team.team_id,
  //       activity: teamActivityRes.data,
  //     },
  //   });
  // }
  if (teamUsersRes.statusCode === 200) {
    dispatch({
      type: ActionTypes.GET_TEAM_USER,
      payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
    });
  }
  SocketUtils.changeTeam(team.team_id);
  dispatch({
    type: ActionTypes.SET_CURRENT_TEAM,
    payload: { team, resChannel, lastChannelId, teamUsersRes },
  });
  setCookie(AsyncKey.lastTeamId, team.team_id);
  const resSpace = await api.getSpaceChannel(team.team_id);
  if (resSpace.statusCode === 200) {
    dispatch({
      type: ActionTypes.GROUP_CHANNEL,
      payload: resSpace.data,
    });
  }
  if (resChannel.statusCode === 200) {
    if (resChannel.data.length > 0) {
      dispatch({
        type: ActionTypes.CHANNEL_SUCCESS,
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
        type: ActionTypes.CHANNEL_FAIL,
      });
    }
  }
};

export const setCurrentTeam =
  (team: any, channelId?: string) => async (dispatch: Dispatch) => {
    actionSetCurrentTeam(team, dispatch, channelId);
  };

export const deleteSpaceChannel =
  (spaceId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.DELETE_GROUP_CHANNEL_REQUEST,
      payload: { spaceId },
    });
    const res = await api.deleteSpaceChannel(spaceId);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.DELETE_GROUP_CHANNEL_SUCCESS,
        payload: { ...res, spaceId },
      });
    } else {
      dispatch({
        type: ActionTypes.DELETE_GROUP_CHANNEL_FAIL,
        payload: res,
      });
    }
  };

export const uploadChannelAvatar =
  (teamId: string, channelId: string, file: any) =>
  async (dispatch: Dispatch) => {
    const attachment = {
      file: URL.createObjectURL(file),
      loading: true,
      type: file.type,
    };
    dispatch({
      type: ActionTypes.UPDATE_CHANNEL_AVATAR_REQUEST,
      payload: { channelId, attachment },
    });
    const fileRes = await api.uploadFile(teamId, channelId, file);
    if (fileRes.statusCode === 200) {
      const res = await api.updateChannel(channelId, {
        channel_emoji: '',
        channel_image_url: fileRes.file_url,
      });
      if (res.statusCode === 200) {
        dispatch({
          type: ActionTypes.UPDATE_CHANNEL_AVATAR_SUCCESS,
          payload: res,
        });
      } else {
        dispatch({
          type: ActionTypes.UPDATE_CHANNEL_AVATAR_FAIL,
          payload: { message: res.message },
        });
      }
    } else {
      dispatch({
        type: ActionTypes.UPDATE_CHANNEL_AVATAR_FAIL,
        payload: { message: fileRes.message },
      });
    }
  };

export const uploadSpaceAvatar =
  (teamId: string, spaceId: string, file: any) =>
  async (dispatch: Dispatch) => {
    const attachment = {
      file: URL.createObjectURL(file),
      loading: true,
      type: file.type,
    };
    dispatch({
      type: ActionTypes.UPDATE_SPACE_AVATAR_REQUEST,
      payload: { spaceId, attachment },
    });
    const fileRes = await api.uploadFile(teamId, spaceId, file);
    if (fileRes.statusCode === 200) {
      const res = await api.updateSpaceChannel(spaceId, {
        space_emoji: '',
        space_image_url: fileRes.file_url,
      });
      if (res.statusCode === 200) {
        dispatch({
          type: ActionTypes.UPDATE_SPACE_AVATAR_SUCCESS,
          payload: res,
        });
      } else {
        dispatch({
          type: ActionTypes.UPDATE_SPACE_AVATAR_FAIL,
          payload: { message: res.message },
        });
      }
    } else {
      dispatch({
        type: ActionTypes.UPDATE_SPACE_AVATAR_FAIL,
        payload: { message: fileRes.message },
      });
    }
  };

export const updateSpaceChannel =
  (spaceId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_GROUP_CHANNEL_REQUEST,
      payload: { spaceId, body },
    });
    const res = await api.updateSpaceChannel(spaceId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.UPDATE_GROUP_CHANNEL_SUCCESS,
        payload: res,
      });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_GROUP_CHANNEL_FAIL,
        payload: res,
      });
    }
  };

export const createSpaceChannel =
  (teamId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.CREATE_GROUP_CHANNEL_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.createSpaceChannel(teamId, body);
    if (res.statusCode !== 200) {
      dispatch({
        type: ActionTypes.CREATE_CHANNEL_FAIL,
        payload: res,
      });
    }
  };

export const createTeam = (body: any) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.CREATE_TEAM_REQUEST,
    payload: { body },
  });
  const res = await api.createTeam(body);
  await actionSetCurrentTeam(res, dispatch);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.CREATE_TEAM_SUCCESS,
      payload: res,
    });
  } else {
    dispatch({
      type: ActionTypes.CREATE_TEAM_FAIL,
      payload: res,
    });
  }
};

export const removeTeamMember =
  (teamId: string, userId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.REMOVE_MEMBER_REQUEST,
      payload: { teamId, userId },
    });
    const res = await api.removeTeamMember(teamId, userId);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.REMOVE_MEMBER_SUCCESS,
        payload: { teamId, userId },
      });
    } else {
      dispatch({
        type: ActionTypes.REMOVE_MEMBER_FAIL,
        payload: res,
      });
    }
  };

export const leaveTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.LEAVE_TEAM_REQUEST,
    payload: { teamId },
  });
  const res = await api.leaveTeam(teamId);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.LEAVE_TEAM_SUCCESS,
      payload: { teamId },
    });
  } else {
    dispatch({
      type: ActionTypes.LEAVE_TEAM_FAIL,
      payload: res,
    });
  }
  return res.statusCode === 200;
};

export const updateUserChannel =
  (channels: Array<any>) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.USER_CHANNEL_REQUEST,
      payload: { channels },
    });
    const res = await api.updateUserChannel(
      channels.map((el) => el.channel_id)
    );
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.USER_CHANNEL_SUCCESS,
        payload: { channels },
      });
    } else {
      dispatch({
        type: ActionTypes.USER_CHANNEL_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const updateTeam =
  (teamId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_TEAM_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.updateTeam(teamId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.UPDATE_TEAM_SUCCESS,
        payload: { teamId, body, res },
      });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_TEAM_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const deleteTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.DELETE_TEAM_REQUEST,
    payload: { teamId },
  });
  const res = await api.removeTeam(teamId);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.DELETE_TEAM_SUCCESS,
      payload: { teamId, res },
    });
  } else {
    dispatch({
      type: ActionTypes.DELETE_TEAM_FAIL,
      payload: res,
    });
  }
  return res.statusCode === 200;
};

export const updateUser = (userData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.UPDATE_USER_REQUEST, payload: userData });
  const dataUpdate = {
    ens_asset: userData?.ensAsset,
    nft_asset: userData?.nftAsset
      ? {
          address: userData?.nftAsset?.asset_contract_address,
          token_id: userData?.nftAsset?.token_id,
        }
      : null,
    username: userData?.userName,
    avatar_url: userData?.avatarUrl,
  };
  try {
    const res = await api.updateUser(dataUpdate);
    if (res.statusCode === 200) {
      dispatch({ type: ActionTypes.UPDATE_USER_SUCCESS, payload: res });
    } else {
      dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: res.message });
    }
  } catch (error) {
    dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: error });
  }
};

export const getSpaceMembers =
  (spaceId: string) => async (dispatch: Dispatch) => {
    dispatch({ type: ActionTypes.SPACE_MEMBER_REQUEST, payload: spaceId });
    const res = await api.getSpaceMembers(spaceId);
    if (res.statusCode === 200) {
      dispatch({ type: ActionTypes.SPACE_MEMBER_SUCCESS, payload: res });
    } else {
      dispatch({ type: ActionTypes.SPACE_MEMBER_FAIL, payload: res });
    }
  };
