import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragDropContext } from 'react-beautiful-dnd';
import moment from 'moment';
import PageWrapper from 'renderer/components/PageWrapper';
import { useHistory } from 'react-router-dom';
import { createMemberChannelData } from 'renderer/helpers/ChannelHelper';
import { setCookie } from 'renderer/common/Cookie';
import { AsyncKey, SpaceBadge } from 'renderer/common/AppConfig';
import ModalOTP from 'renderer/components/ModalOTP';
import WalletConnectUtils from 'renderer/services/connectors/WalletConnectUtils';
import ModalCreateSpace from 'renderer/components/ModalCreateSpace';
import toast from 'react-hot-toast';
import { uniqBy } from 'lodash';
import { CreateSpaceData, Space } from 'renderer/models';
import ModalSpaceSetting from 'renderer/components/ModalSpaceSetting';
import actions from '../../actions';
import ModalCreateTask from '../../components/ModalCreateTask';
import SideBar from '../Main/Layout/SideBar';
import ChannelView from './container/ChannelView';
import TaskListView from './container/TaskListView';
import './index.scss';
import ModalCreateChannel from '../../components/ModalCreateChannel';
import {
  createLoadingSelector,
  createLoadMoreSelector,
} from '../../reducers/selectors';
import actionTypes from '../../actions/ActionTypes';
import HomeLoading from '../../components/HomeLoading';
import { PopoverItem } from '../../components/PopoverButton';
import ModalTaskView from '../../components/ModalTaskView';
import { groupTaskByFiltered } from '../../helpers/TaskHelper';
import ModalConversation from '../../components/ModalConversation';
import GlobalVariable from '../../services/GlobalVariable';
import ModalConfirmDeleteGroupChannel from '../../components/ModalConfirmDeleteGroupChannel';
import ModalConfirmDeleteChannel from '../../components/ModalConfirmDeleteChannel';
import ModalInviteMember from '../../components/ModalInviteMember';
import api from '../../api';
import EmptyView from './container/EmptyView';

type HomeProps = {
  team?: any;
  currentChannel: any;
  space: Array<any>;
  currentTeam: any;
  loading: boolean;
  createNewChannel: (teamId: string, body: any, groupName: string) => any;
  dragChannel: (channelId: string, groupId: string) => any;
  getTasks: (channelId: string) => any;
  getTaskFromUser: (userId: string, channelId: string, teamId: string) => any;
  getArchivedTasks: (
    channelId: string,
    userId?: string,
    teamId?: string
  ) => any;
  dropTask: (
    result: any,
    channelId: string,
    upVote: number,
    teamId: string
  ) => any;
  updateTask: (taskId: string, channelId: string, data: any) => any;
  tasks: Array<any>;
  archivedTasks: Array<any>;
  deleteTask: (taskId: string, channelId: string) => any;
  createTask: (channelId: string, body: any) => any;
  archivedCount?: number;
  addReact: (id: string, name: string, userId: string) => any;
  removeReact: (id: string, name: string, userId: string) => any;
  getMessages: (
    channelId: string,
    channelType: string,
    before?: string,
    isFresh?: boolean
  ) => any;
  getConversations: (
    parentId: string,
    before?: string,
    isFresh?: boolean
  ) => any;
  getActivities: (taskId: string) => any;
  setScrollData: (channelId: string, data: any) => any;
  messages: Array<any>;
  conversationData: any;
  activityData: any;
  loadMoreMessage: boolean;
  messageCanMore: boolean;
  scrollData?: any;
  channels: Array<any>;
  onRemoveAttachment: (
    channelId: string,
    messageId: string,
    fileId: string
  ) => any;
  setCurrentChannel?: (channel: any) => any;
  deleteMessage: (
    messageId: string,
    parentId: string,
    channelId: string
  ) => any;
  deleteChannel: (channelId: string) => any;
  updateChannel: (channelId: string, body: any) => any;
  createSpaceChannel: (teamId: string, body: any) => any;
  updateSpaceChannel: (spaceId: string, body: any) => any;
  uploadSpaceAvatar: (teamId: string, spaceId: string, file: any) => any;
  uploadChannelAvatar: (teamId: string, channelId: string, file: any) => any;
  deleteSpaceChannel: (group: any) => any;
  removeTeamMember: (teamId: string, userId: string) => any;
  teamUserData: Array<any>;
  createTeam?: (body: any) => any;
  updateTeam: (teamId: string, body: any) => any;
  deleteTeam: (teamId: string) => any;
  findUser: () => any;
  findTeamAndChannel: () => any;
  setCurrentTeam: (team: any) => any;
  getSpaceMembers: (spaceId: string) => any;
};

const filterTask: Array<PopoverItem> = [
  {
    label: 'Status',
    value: 'Status',
  },
  { label: 'Due Date', value: 'Due Date' },
  { label: 'Channel', value: 'Channel' },
  { label: 'Assignee', value: 'Assignee' },
];

const Home = ({
  team,
  currentChannel,
  dragChannel,
  currentTeam,
  space,
  loading,
  createNewChannel,
  tasks,
  archivedTasks,
  getTasks,
  getTaskFromUser,
  dropTask,
  updateTask,
  deleteTask,
  createTask,
  getArchivedTasks,
  archivedCount,
  addReact,
  removeReact,
  getMessages,
  messages,
  getConversations,
  setScrollData,
  conversationData,
  loadMoreMessage,
  messageCanMore,
  scrollData,
  channels,
  getActivities,
  activityData,
  onRemoveAttachment,
  setCurrentChannel,
  deleteMessage,
  deleteChannel,
  updateChannel,
  createSpaceChannel,
  deleteSpaceChannel,
  teamUserData,
  createTeam,
  updateSpaceChannel,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  findUser,
  findTeamAndChannel,
  setCurrentTeam,
  uploadSpaceAvatar,
  uploadChannelAvatar,
  getSpaceMembers,
}: HomeProps) => {
  const dataFromUrl = useSelector((state: any) => state.configs.dataFromUrl);
  const dispatch = useDispatch();
  const privateKey = useSelector((state: any) => state.configs.privateKey);
  const history = useHistory();
  const inputRef = useRef<any>();
  const channelViewRef = useRef<any>();
  const sideBarRef = useRef<any>();
  const [replyTask, setReplyTask] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    key: string | null;
    index: number | null;
  }>({
    key: null,
    index: null,
  });
  const [hoverTask, setHoverTask] = useState<any>(null);
  const [initialSpace, setInitialSpace] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState<Space>(null);
  const [channelDelete, setChannelDelete] = useState<any>(null);
  const [isOpenInvite, setOpenInvite] = useState(false);
  const [isOpenConfirmDeleteSpace, setOpenConfirmDeleteSpace] = useState(false);
  const [isOpenConfirmDeleteChannel, setOpenConfirmDeleteChannel] =
    useState(false);
  const [filter, setFilter] = useState(filterTask[0]);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [openCreateChannel, setOpenCreateChannel] = useState(false);
  const [openCreateSpace, setOpenCreateSpace] = useState(false);
  const [openEditSpaceChannel, setOpenEditSpaceChannel] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [openTaskView, setOpenTask] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const [openConversation, setOpenConversation] = useState(false);
  const handleDragChannel = useCallback(
    (result: any) => {
      const { draggableId, source, destination } = result;
      const groupId = destination.droppableId.split('group-channel-')[1];
      const sourceGroupId = source.droppableId.split('group-channel-')[1];
      if (groupId === sourceGroupId) return;
      dragChannel(draggableId, groupId);
    },
    [dragChannel]
  );
  const handleDragTaskToChannel = useCallback(
    (result: any, task: any) => {
      const { draggableId, destination } = result;
      const groupId = destination.droppableId.split('group-channel-')[1];
      const channel = channels.filter((c) => c.group_channel_id === groupId)?.[
        destination.index - 1
      ];
      if (
        !channel ||
        !!task.channel.find((c: any) => c.channel_id === channel.channel_id)
      ) {
        return;
      }
      updateTask(draggableId, currentChannel?.channel_id, {
        channel: [...task.channel, channel],
        team_id: currentTeam.team_id,
      });
    },
    [channels, currentChannel?.channel_id, currentTeam?.team_id, updateTask]
  );
  const onDragEnd = useCallback(
    (result: any) => {
      if (!currentChannel?.channel_id || !result) return;
      const { draggableId, source, destination } = result;
      if (!destination) return;
      const task = tasks.find((t) => t.task_id === draggableId);
      if (destination.droppableId.includes('group-channel')) {
        if (source.droppableId.includes('group-channel')) {
          handleDragChannel(result);
        } else {
          handleDragTaskToChannel(result, task);
        }
        return;
      }
      let currentVote = task?.up_votes || 0;
      if (destination.droppableId !== 'archived') {
        const taskGrouped = groupTaskByFiltered(filter.value, tasks);
        if (source.droppableId === destination.droppableId) {
          if (source.index !== destination.index) {
            const sourceList = taskGrouped[source.droppableId];
            if (source.index < destination.index) {
              currentVote = sourceList[destination.index].up_votes - 1;
            } else {
              currentVote = sourceList[destination.index].up_votes + 1;
            }
          }
        } else {
          const destinationList = taskGrouped[destination.droppableId];
          if (destinationList.length === destination.index) {
            if (destinationList.length > 0) {
              currentVote =
                destinationList[destinationList.length - 1].up_votes - 1;
            }
          } else {
            currentVote = destinationList[destination.index].up_votes + 1;
          }
        }
      }
      dropTask(
        result,
        currentChannel.channel_id,
        currentVote,
        currentTeam.team_id
      );
    },
    [
      currentChannel?.channel_id,
      currentTeam?.team_id,
      dropTask,
      filter.value,
      handleDragChannel,
      handleDragTaskToChannel,
      tasks,
    ]
  );
  const handleOpenCreateChannel = useCallback((initSpace) => {
    setInitialSpace(initSpace);
    setOpenCreateChannel(true);
  }, []);
  const handleOpenCreateSpace = useCallback(() => {
    setOpenCreateSpace(true);
  }, []);
  const handleOpenEditSpace = useCallback((g) => {
    setSelectedSpace(g);
    setOpenEditSpaceChannel(true);
  }, []);
  const handleOpenDeleteSpace = useCallback(() => {
    setOpenConfirmDeleteSpace(true);
  }, []);
  const handleOpenDeleteChannel = useCallback((channel) => {
    setChannelDelete(channel);
    setOpenConfirmDeleteChannel(true);
  }, []);
  const handleRemoveTeamMember = useCallback(
    (u) => {
      removeTeamMember(currentTeam.team_id, u.user_id);
    },
    [removeTeamMember, currentTeam?.team_id]
  );
  const handleOpenEditChannelMember = useCallback(
    (channel) => {
      setCurrentChannel?.(channel);
      channelViewRef.current.showSetting('edit-member');
    },
    [setCurrentChannel]
  );
  const handleOpenEditChannelName = useCallback(
    (channel) => {
      setCurrentChannel?.(channel);
      channelViewRef.current.showSetting('edit-name');
    },
    [setCurrentChannel]
  );
  const handleOpenInviteMember = useCallback(() => setOpenInvite(true), []);
  const handleOpenConversation = useCallback((message) => {
    setCurrentMessage(message);
    setOpenConversation(true);
  }, []);
  const onMoreMessage = useCallback(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    getMessages(
      currentChannel.channel_id,
      currentChannel.channel_type,
      lastMsg.createdAt
    );
  }, [
    currentChannel?.channel_id,
    currentChannel?.channel_type,
    getMessages,
    messages,
  ]);
  const onDeleteTask = useCallback(
    (task: any) => {
      if (!currentChannel?.channel_id) return;
      deleteTask(task.task_id, currentChannel?.channel_id);
    },
    [deleteTask, currentChannel?.channel_id]
  );
  const onUpdateStatus = useCallback(
    (task: any, status: string) => {
      if (!currentChannel?.channel_id) return;
      updateTask(task.task_id, currentChannel?.channel_id, {
        status,
        team_id: currentTeam.team_id,
      });
    },
    [currentChannel?.channel_id, updateTask, currentTeam?.team_id]
  );
  const handleTaskHoverChange = useCallback(
    (key, index) => setHoverInfo({ key, index }),
    []
  );
  const handleTaskHoverLeave = useCallback(() => {
    setHoverInfo({ key: null, index: null });
  }, []);
  const handleTaskUpdateFilter = useCallback((st) => setFilter(st), []);
  const openTaskDetail = useCallback((task: any) => {
    setOpenTask(true);
    setCurrentTask(task);
  }, []);
  const onReplyTask = useCallback((task: any) => {
    setReplyTask(task);
  }, []);
  const handleAddTask = useCallback((title) => {
    setCurrentTitle(title);
    setOpenCreateTask(true);
  }, []);
  const handleCloseModalConversation = useCallback(() => {
    setOpenConversation(false);
    setCurrentMessage(null);
  }, []);
  const handleCloseModalTaskView = useCallback(() => {
    setOpenTask(false);
    setCurrentTask(null);
  }, []);
  const onCreateTask = useCallback(
    (taskData: any, id: string) => {
      const loadingAttachment = taskData.attachments.find(
        (att: any) => att.loading
      );
      if (loadingAttachment != null) {
        return;
      }
      const channel_ids = taskData.channels
        .filter((c: any) => c.channel_id !== currentChannel.channel_id)
        .map((c: any) => c.channel_id);
      if (
        currentChannel.channel_type !== 'Direct' &&
        currentChannel?.channel_id
      ) {
        channel_ids.unshift(currentChannel?.channel_id);
      }
      if (channel_ids.length === 0) {
        toast.error('Channels can not be empty');
        return;
      }
      if (!taskData?.title) {
        toast.error('Title can not be empty');
        return;
      }
      const body: any = {
        title: taskData?.title,
        notes: taskData?.notes,
        status: taskData?.currentStatus?.id,
        due_date: taskData?.dueDate
          ? moment(taskData?.dueDate || new Date()).format(
              'YYYY-MM-DD HH:mm:ss.SSSZ'
            )
          : null,
        channel_ids,
        assignee_id: taskData?.assignee?.user_id,
        attachments: taskData.attachments.map((att: any) => att.url),
        team_id: currentTeam.team_id,
      };
      if (id !== '') {
        body.task_id = id;
      }
      createTask(currentChannel?.channel_id, body);
      setOpenCreateTask(false);
    },
    [
      createTask,
      currentChannel?.channel_id,
      currentChannel?.channel_type,
      currentTeam?.team_id,
    ]
  );
  const handleCloseModalCreateTask = useCallback(() => {
    setCurrentTitle(null);
    setOpenCreateTask(false);
  }, []);
  const handleCloseModalCreateSpace = useCallback(
    () => setOpenCreateSpace(false),
    []
  );
  const onCreateSpace = useCallback(
    async (spaceData: CreateSpaceData) => {
      let error = '';
      let body = {
        space_name: spaceData.name,
        space_type: spaceData.spaceType === 'Exclusive' ? 'Private' : 'Public',
        space_id: spaceData.spaceId,
        space_emoji: spaceData.emoji,
        space_image_url: spaceData.url,
      };
      if (spaceData.spaceType === 'Exclusive') {
        if (!spaceData.spaceBadgeId) {
          error = 'Badge can not be empty';
        } else if (!spaceData.condition) {
          error = 'NFT can not be empty';
        } else if (
          !spaceData.condition.amount &&
          !spaceData.condition.amountInput
        ) {
          error = 'NFT amount can not be empty';
        }
        if (error) {
          toast.error(error);
          return null;
        }
        const badge = SpaceBadge.find((el) => el.id === spaceData.spaceBadgeId);
        body = {
          ...body,
          space_conditions: [
            {
              contract_address: spaceData.condition?.address,
              amount:
                spaceData.condition?.amount || spaceData.condition?.amountInput,
            },
          ],
          space_description: spaceData.description,
          icon_color: badge?.color,
          icon_sub_color: badge?.backgroundColor,
        };
      }
      await createSpaceChannel(currentTeam.team_id, body);
      setOpenCreateSpace(false);
      sideBarRef.current?.scrollToBottom?.();
      return null;
    },
    [createSpaceChannel, currentTeam?.team_id]
  );
  const handleCloseModalEditSpace = useCallback(
    () => setOpenEditSpaceChannel(false),
    []
  );
  const onEditSpaceChannel = useCallback(
    async (spaceData: any) => {
      await updateSpaceChannel(selectedSpace.space_id, {
        space_name: spaceData.name,
      });
      setOpenEditSpaceChannel(false);
    },
    [selectedSpace?.space_id, updateSpaceChannel]
  );
  const onCreateChannel = useCallback(
    async (channelData: any) => {
      const body: any = {
        channel_name: channelData.name,
        space_id: channelData.space?.space_id,
        channel_type: channelData.isPrivate ? 'Private' : 'Public',
      };
      if (channelData.isPrivate) {
        const { res } = await createMemberChannelData(channelData.members);
        body.channel_member_data = res;
      }
      const success = await createNewChannel(
        currentTeam.team_id,
        body,
        channelData.space?.space_name
      );
      if (success) setOpenCreateChannel(false);
    },
    [createNewChannel, currentTeam?.team_id]
  );
  const handleCloseModalCreateChannel = useCallback(
    () => setOpenCreateChannel(false),
    []
  );
  const handleCloseModalInviteMember = useCallback(
    () => setOpenInvite(false),
    []
  );
  const handleCloseModalDeleteChannel = useCallback(
    () => setOpenConfirmDeleteChannel(false),
    []
  );
  const handleDeleteChannel = useCallback(async () => {
    if (!channelDelete?.channel_id) return;
    await deleteChannel(channelDelete?.channel_id);
    setChannelDelete(null);
    setOpenConfirmDeleteChannel(false);
  }, [channelDelete?.channel_id, deleteChannel]);
  const handleCloseModalConfirmDeleteSpace = useCallback(() => {
    setOpenConfirmDeleteSpace(false);
  }, []);
  const handleDeleteSpace = useCallback(async () => {
    if (!selectedSpace?.space_id) return;
    await deleteSpaceChannel(selectedSpace?.space_id);
    setSelectedSpace(null);
    setOpenConfirmDeleteSpace(false);
  }, [deleteSpaceChannel, selectedSpace?.space_id]);
  const handleDataFromUrl = useCallback(async () => {
    if (dataFromUrl?.includes('invitation=')) {
      const invitationId = dataFromUrl.split('=')[1];
      const res = await api.acceptInvitation(invitationId);
      if (res.statusCode === 200) {
        toast.success('You have successfully joined new team.');
        dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
        setCookie(AsyncKey.lastTeamId, res.team_id);
        findTeamAndChannel();
      }
    }
  }, [dataFromUrl, dispatch, findTeamAndChannel]);
  useEffect(() => {
    if (dataFromUrl) handleDataFromUrl();
  }, [dataFromUrl, handleDataFromUrl]);
  useEffect(() => {
    inputRef.current?.focus();
    if (currentChannel?.channel_id || currentChannel?.user) {
      setOpenTask(false);
      if (currentChannel?.user) {
        getTaskFromUser(
          currentChannel.user.user_id,
          currentChannel.channel_id || currentChannel.user.user_id,
          currentTeam?.team_id
        );
      } else {
        getTasks(currentChannel.channel_id);
      }
      if (currentChannel.channel_id && privateKey) {
        getMessages(
          currentChannel.channel_id,
          currentChannel.channel_type,
          undefined,
          true
        );
      }
    }
  }, [
    currentChannel?.user,
    currentChannel?.channel_id,
    currentChannel?.channel_type,
    getTasks,
    getTaskFromUser,
    getMessages,
    currentTeam?.team_id,
    privateKey,
  ]);

  useEffect(() => {
    if (currentChannel?.space_id) {
      getSpaceMembers?.(currentChannel?.space_id);
    }
  }, [currentChannel?.space_id, getSpaceMembers]);

  useEffect(() => {
    if (currentMessage) {
      setCurrentMessage(
        messages.find((msg) => msg.message_id === currentMessage.message_id)
      );
    }
  }, [messages, currentMessage]);

  useEffect(() => {
    const taskGrouped: any = groupTaskByFiltered(filter.value, tasks);
    let res: any = null;
    if (hoverInfo.key != null && hoverInfo.index != null) {
      res =
        hoverInfo?.key === 'archived'
          ? archivedTasks?.[hoverInfo.index]
          : taskGrouped?.[hoverInfo?.key]?.[hoverInfo?.index];
    }
    setHoverTask(res);
  }, [hoverInfo.key, hoverInfo.index, filter.value, tasks, archivedTasks]);

  useEffect(() => {
    // if (hoverTask) {
    //   inputRef.current?.blur();
    // }
    const keyDownListener = (e: any) => {
      if (e.key === 'Escape') {
        setOpenCreateTask(false);
        setOpenCreateChannel(false);
      } else if (e.metaKey && e.key === 't') {
        setOpenCreateTask(true);
      } else if (e.key === 'a') {
        if (GlobalVariable.isInputFocus) return;
        if (hoverTask) {
          if (!currentChannel?.channel_id) return;
          if (hoverTask?.status === 'archived') {
            updateTask(hoverTask.task_id, currentChannel?.channel_id, {
              status: 'todo',
              team_id: currentTeam.team_id,
            });
            setHoverInfo((current) => ({
              ...current,
              index: current.index ? current.index - 1 : null,
            }));
          } else {
            updateTask(hoverTask.task_id, currentChannel?.channel_id, {
              status: 'archived',
              team_id: currentTeam.team_id,
            });
          }
        }
      } else if (e.key === 'd') {
        if (GlobalVariable.isInputFocus) return;
        if (hoverTask?.status === 'todo') {
          if (!currentChannel?.channel_id) return;
          updateTask(hoverTask.task_id, currentChannel?.channel_id, {
            status: 'doing',
            team_id: currentTeam.team_id,
          });
        } else if (hoverTask?.status === 'doing') {
          if (!currentChannel?.channel_id) return;
          updateTask(hoverTask.task_id, currentChannel?.channel_id, {
            status: 'done',
            team_id: currentTeam.team_id,
          });
        } else if (
          hoverTask?.status === 'done' ||
          hoverTask?.status === 'archived'
        ) {
          if (!currentChannel?.channel_id) return;
          updateTask(hoverTask.task_id, currentChannel?.channel_id, {
            status: 'doing',
            team_id: currentTeam.team_id,
          });
          setHoverInfo((current) => ({
            ...current,
            index: current.index ? current.index - 1 : null,
          }));
        }
      } else if (
        e.metaKey &&
        e.key === 'l' &&
        !WalletConnectUtils?.connector?.connected
      ) {
        dispatch({ type: actionTypes.REMOVE_PRIVATE_KEY });
        history.replace('/unlock');
      }
    };
    window.addEventListener('keydown', keyDownListener);
    return () => {
      window.removeEventListener('keydown', keyDownListener);
    };
  }, [
    updateTask,
    history,
    currentTeam?.team_id,
    currentChannel?.channel_id,
    hoverTask,
    dispatch,
  ]);
  if (loading) {
    return <HomeLoading />;
  }

  return (
    <PageWrapper>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="home-container">
          <SideBar
            ref={sideBarRef}
            onCreateChannel={handleOpenCreateChannel}
            onCreateGroupChannel={handleOpenCreateSpace}
            onEditGroupChannel={handleOpenEditSpace}
            onDeleteChannel={handleOpenDeleteChannel}
            onRemoveTeamMember={handleRemoveTeamMember}
            onEditChannelMember={handleOpenEditChannelMember}
            onEditChannelName={handleOpenEditChannelName}
            onInviteMember={handleOpenInviteMember}
            deleteTeam={deleteTeam}
            updateTeam={updateTeam}
            findTeamAndChannel={findTeamAndChannel}
            findUser={findUser}
            updateSpaceChannel={updateSpaceChannel}
            uploadSpaceAvatar={uploadSpaceAvatar}
            updateChannel={updateChannel}
            uploadChannelAvatar={uploadChannelAvatar}
          />

          <div className="home-body">
            {team?.length > 0 ? (
              <>
                <ChannelView
                  ref={channelViewRef}
                  inputRef={inputRef}
                  currentChannel={currentChannel}
                  messages={uniqBy(messages, 'message_id')}
                  currentTeam={currentTeam}
                  createTask={createTask}
                  openConversation={handleOpenConversation}
                  onMoreMessage={onMoreMessage}
                  loadMoreMessage={loadMoreMessage}
                  messageCanMore={messageCanMore}
                  scrollData={scrollData}
                  setScrollData={setScrollData}
                  replyTask={replyTask}
                  setReplyTask={setReplyTask}
                  onAddReact={addReact}
                  onRemoveReact={removeReact}
                  openTaskView={openTaskView}
                  onSelectTask={openTaskDetail}
                  onRemoveAttachment={onRemoveAttachment}
                  setCurrentChannel={setCurrentChannel}
                  isOpenConversation={openConversation}
                  deleteMessage={deleteMessage}
                  deleteChannel={deleteChannel}
                  updateChannel={updateChannel}
                  channel={channels}
                  teamUserData={teamUserData}
                  uploadChannelAvatar={uploadChannelAvatar}
                />
                {currentChannel.channel_type !== 'Direct' && (
                  <TaskListView
                    channelId={currentChannel?.channel_id}
                    getArchivedTasks={getArchivedTasks}
                    archivedCount={archivedCount}
                    teamId={currentTeam?.team_id}
                    tasks={tasks || []}
                    archivedTasks={archivedTasks || []}
                    onAddTask={handleAddTask}
                    onUpdateStatus={onUpdateStatus}
                    onHoverChange={handleTaskHoverChange}
                    onHoverLeave={handleTaskHoverLeave}
                    filter={filter}
                    filterData={filterTask}
                    onUpdateFilter={handleTaskUpdateFilter}
                    onDeleteTask={onDeleteTask}
                    onSelectTask={openTaskDetail}
                    updateTask={updateTask}
                    onAddReact={addReact}
                    onRemoveReact={removeReact}
                    onReplyTask={onReplyTask}
                    hoverTask={hoverTask}
                    directUserId={currentChannel?.user?.user_id}
                  />
                )}
              </>
            ) : (
              <EmptyView
                createTeam={createTeam}
                findTeamAndChannel={findTeamAndChannel}
              />
            )}
          </div>

          <ModalConversation
            message={currentMessage}
            open={openConversation}
            handleClose={handleCloseModalConversation}
            onAddReact={addReact}
            onRemoveReact={removeReact}
          />
          <ModalTaskView
            task={currentTask}
            conversations={conversationData?.[currentTask?.task_id] || []}
            open={openTaskView}
            handleClose={handleCloseModalTaskView}
            teamId={currentTeam?.team_id}
            channelId={currentChannel?.channel_id}
            updateTask={updateTask}
            getConversations={getConversations}
            getActivities={getActivities}
            activities={activityData?.[currentTask?.task_id]?.data || []}
            onDeleteTask={onDeleteTask}
          />
          <ModalCreateTask
            onCreateTask={onCreateTask}
            open={openCreateTask}
            handleClose={handleCloseModalCreateTask}
            currentTitle={currentTitle}
            currentTeam={currentTeam}
            currentChannel={currentChannel}
            channels={channels}
          />
          <ModalCreateSpace
            open={openCreateSpace}
            handleClose={handleCloseModalCreateSpace}
            onCreateSpace={onCreateSpace}
          />
          <ModalSpaceSetting
            open={openEditSpaceChannel}
            handleClose={handleCloseModalEditSpace}
            onDeleteClick={handleOpenDeleteSpace}
            space={selectedSpace}
            updateSpaceChannel={updateSpaceChannel}
          />
          <ModalCreateChannel
            space={space}
            onCreateChannel={onCreateChannel}
            open={openCreateChannel}
            handleClose={handleCloseModalCreateChannel}
            initialSpace={initialSpace}
          />
          <ModalInviteMember
            open={isOpenInvite}
            handleClose={handleCloseModalInviteMember}
          />
          <ModalConfirmDeleteChannel
            open={isOpenConfirmDeleteChannel}
            handleClose={handleCloseModalDeleteChannel}
            channelName={channelDelete?.channel_name}
            onDelete={handleDeleteChannel}
          />
          <ModalConfirmDeleteGroupChannel
            open={isOpenConfirmDeleteSpace}
            spaceName={selectedSpace?.space_name}
            handleClose={handleCloseModalConfirmDeleteSpace}
            onDelete={handleDeleteSpace}
          />
        </div>
      </DragDropContext>
      <ModalOTP />
    </PageWrapper>
  );
};

const loadingSelector = createLoadingSelector([
  actionTypes.TEAM_PREFIX,
  actionTypes.CHANNEL_PREFIX,
]);

const loadMoreMessageSelector = createLoadMoreSelector([
  actionTypes.MESSAGE_PREFIX,
]);

const mapStateToProps = (state: any) => {
  const channelId =
    state.user?.currentChannel?.channel_id ||
    state.user?.currentChannel?.user?.user_id;
  return {
    team: state.user.team,
    userData: state.user.userData,
    teamUserData: state.user.teamUserData,
    currentChannel: state.user.currentChannel,
    currentTeam: state.user.currentTeam,
    space: state.user.spaceChannel,
    loading: loadingSelector(state),
    tasks: channelId ? state.task.taskData?.[channelId]?.tasks || [] : [],
    channels: state.user.channel,
    messages: channelId
      ? state.message.messageData?.[channelId]?.data || []
      : [],
    messageCanMore: channelId
      ? state.message.messageData?.[channelId]?.canMore || false
      : false,
    scrollData: channelId
      ? state.message.messageData?.[channelId]?.scrollData || {}
      : {},
    loadMoreMessage: loadMoreMessageSelector(state),
    conversationData: state.message.conversationData,
    activityData: state.activity.activityData,
    archivedTasks: channelId
      ? state.task.taskData?.[channelId]?.archivedTasks || []
      : [],
    archivedCount: channelId
      ? state.task.taskData?.[channelId]?.archivedCount
      : null,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(Home);
