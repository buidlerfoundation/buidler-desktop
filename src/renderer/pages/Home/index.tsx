import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DragDropContext } from 'react-beautiful-dnd';
import actions from '../../actions';
import ModalCreateTask from '../../components/ModalCreateTask';
import SideBar from '../Main/Layout/SideBar';
import ChannelView from './container/ChannelView';
import TaskListView from './container/TaskListView';
import moment from 'moment';
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
import toast from 'react-hot-toast';
import ModalCreateGroupChannel from '../../components/ModalCreateGroupChannel';
import ModalConfirmDeleteGroupChannel from '../../components/ModalConfirmDeleteGroupChannel';
import ModalConfirmDeleteChannel from '../../components/ModalConfirmDeleteChannel';
import { uniqBy } from 'lodash';
import ModalInviteMember from '../../components/ModalInviteMember';
import api from '../../api';
import EmptyView from './container/EmptyView';
import ModalEditGroupChannel from '../../components/ModalEditGroupChannel';
import PageWrapper from 'renderer/components/PageWrapper';

type HomeProps = {
  team?: any;
  currentChannel: any;
  group: Array<any>;
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
  getMessages: (channelId: string, before?: string, isFresh?: boolean) => any;
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
  createGroupChannel: (teamId: string, body: any) => any;
  updateGroupChannel: (groupId: string, body: any) => any;
  deleteGroupChannel: (group: any) => any;
  removeTeamMember: (teamId: string, userId: string) => any;
  teamUserData: Array<any>;
  createTeam?: (body: any) => any;
  updateTeam: (teamId: string, body: any) => any;
  deleteTeam: (teamId: string) => any;
  findUser: () => any;
  findTeamAndChannel: () => any;
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
  group,
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
  createGroupChannel,
  deleteGroupChannel,
  teamUserData,
  createTeam,
  updateGroupChannel,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  findUser,
  findTeamAndChannel,
}: HomeProps) => {
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
  const [initialGroup, setInitialGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [channelDelete, setChannelDelete] = useState<any>(null);
  const [isOpenInvite, setOpenInvite] = useState(false);
  const [isOpenConfirmDeleteGroup, setOpenConfirmDeleteGroup] = useState(false);
  const [isOpenConfirmDeleteChannel, setOpenConfirmDeleteChannel] =
    useState(false);
  const [filter, setFilter] = useState(filterTask[0]);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [openCreateChannel, setOpenCreateChannel] = useState(false);
  const [openCreateGroupChannel, setOpenCreateGroupChannel] = useState(false);
  const [openEditGroupChannel, setOpenEditGroupChannel] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [openTaskView, setOpenTask] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const [openConversation, setOpenConversation] = useState(false);
  const onEditGroupChannel = async (groupChannelData: any) => {
    await updateGroupChannel(selectedGroup.group_channel_id, {
      group_channel_name: groupChannelData.name,
    });
    setOpenEditGroupChannel(false);
  };
  const onCreateGroupChannel = async (groupChannelData: any) => {
    await createGroupChannel(currentTeam.team_id, {
      group_channel_name: groupChannelData.name,
      order: group?.[group.length - 1].order + 1,
    });
    setOpenCreateGroupChannel(false);
    sideBarRef.current?.scrollToBottom?.();
  };
  const onCreateChannel = async (channelData: any) => {
    await createNewChannel(
      currentTeam.team_id,
      {
        channel_name: channelData.name,
        group_channel_id: channelData.group?.group_channel_id,
        channel_type: channelData.isPrivate ? 'Private' : 'Public',
      },
      channelData.group?.group_channel_name
    );
    setOpenCreateChannel(false);
  };
  const onDeleteTask = (task: any) => {
    if (!currentChannel?.channel_id) return;
    deleteTask(task.task_id, currentChannel?.channel_id);
  };
  const onUpdateStatus = (task: any) => {
    if (!currentChannel?.channel_id) return;
    updateTask(task.task_id, currentChannel?.channel_id, {
      status:
        task.status !== 'done' && task.status !== 'archived' ? 'done' : 'todo',
      team_id: currentTeam.team_id,
    });
  };
  const onCreateTask = (taskData: any, id: string) => {
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
  };
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
      if (currentChannel.channel_id) {
        getMessages(currentChannel.channel_id, undefined, true);
      }
    }
  }, [
    currentChannel?.user,
    currentChannel?.channel_id,
    getTasks,
    getTaskFromUser,
    getMessages,
    currentTeam?.team_id,
  ]);

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
      }
    };
    window.addEventListener('keydown', keyDownListener);
    return () => {
      window.removeEventListener('keydown', keyDownListener);
    };
  }, [updateTask, currentTeam?.team_id, currentChannel?.channel_id, hoverTask]);
  if (loading) {
    return <HomeLoading />;
  }
  const handleDragChannel = (result: any) => {
    const { draggableId, source, destination } = result;
    const groupId = destination.droppableId.split('group-channel-')[1];
    const sourceGroupId = source.droppableId.split('group-channel-')[1];
    if (groupId === sourceGroupId) return;
    dragChannel(draggableId, groupId);
  };
  const handleDragTaskToChannel = (result: any, task: any) => {
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
  };
  const onDragEnd = (result: any) => {
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
  };
  const onMoreMessage = () => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    getMessages(currentChannel.channel_id, lastMsg.createdAt);
  };
  const onReplyTask = (task: any) => {
    setReplyTask(task);
  };
  const openTaskDetail = (task: any) => {
    setOpenTask(true);
    setCurrentTask(task);
  };
  return (
    <PageWrapper>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="home-container">
          <SideBar
            ref={sideBarRef}
            onCreateChannel={(initGroup) => {
              setInitialGroup(initGroup);
              setOpenCreateChannel(true);
            }}
            onCreateGroupChannel={() => {
              setOpenCreateGroupChannel(true);
            }}
            onEditGroupChannel={(g) => {
              setSelectedGroup(g);
              setOpenEditGroupChannel(true);
            }}
            onDeleteGroupChannel={(g) => {
              setSelectedGroup(g);
              setOpenConfirmDeleteGroup(true);
            }}
            onDeleteChannel={(channel) => {
              setChannelDelete(channel);
              setOpenConfirmDeleteChannel(true);
            }}
            onRemoveTeamMember={(u) => {
              removeTeamMember(currentTeam.team_id, u.user_id);
            }}
            onEditChannelMember={(channel) => {
              setCurrentChannel?.(channel);
              channelViewRef.current.showSetting('edit-member');
            }}
            onEditChannelName={(channel) => {
              setCurrentChannel?.(channel);
              channelViewRef.current.showSetting('edit-name');
            }}
            onInviteMember={() => setOpenInvite(true)}
            deleteTeam={deleteTeam}
            updateTeam={updateTeam}
            findTeamAndChannel={findTeamAndChannel}
            findUser={findUser}
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
                  openConversation={(message) => {
                    setCurrentMessage(message);
                    setOpenConversation(true);
                  }}
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
                />
                <TaskListView
                  channelId={currentChannel?.channel_id}
                  getArchivedTasks={getArchivedTasks}
                  archivedCount={archivedCount}
                  teamId={currentTeam?.team_id}
                  tasks={tasks || []}
                  archivedTasks={archivedTasks || []}
                  onAddTask={(title) => {
                    setCurrentTitle(title);
                    setOpenCreateTask(true);
                  }}
                  onUpdateStatus={onUpdateStatus}
                  onHoverChange={(key, index) => setHoverInfo({ key, index })}
                  onHoverLeave={() => {
                    setHoverInfo({ key: null, index: null });
                  }}
                  filter={filter}
                  filterData={filterTask}
                  onUpdateFilter={(st) => setFilter(st)}
                  onDeleteTask={onDeleteTask}
                  onSelectTask={openTaskDetail}
                  updateTask={updateTask}
                  onAddReact={addReact}
                  onRemoveReact={removeReact}
                  onReplyTask={onReplyTask}
                  hoverTask={hoverTask}
                  directUserId={currentChannel?.user?.user_id}
                />
              </>
            ) : (
              <EmptyView createTeam={createTeam} />
            )}
          </div>

          <ModalConversation
            message={currentMessage}
            open={openConversation}
            handleClose={() => {
              setOpenConversation(false);
              setCurrentMessage(null);
            }}
            onAddReact={addReact}
            onRemoveReact={removeReact}
          />
          <ModalTaskView
            task={currentTask}
            conversations={conversationData?.[currentTask?.task_id] || []}
            open={openTaskView}
            handleClose={() => {
              setOpenTask(false);
              setCurrentTask(null);
            }}
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
            handleClose={() => {
              setCurrentTitle(null);
              setOpenCreateTask(false);
            }}
            currentTitle={currentTitle}
            currentTeam={currentTeam}
            currentChannel={currentChannel}
            channels={channels}
          />
          {openCreateGroupChannel && (
            <ModalCreateGroupChannel
              open={openCreateGroupChannel}
              handleClose={() => setOpenCreateGroupChannel(false)}
              onCreateGroupChannel={onCreateGroupChannel}
            />
          )}
          {openEditGroupChannel && (
            <ModalEditGroupChannel
              open={openEditGroupChannel}
              handleClose={() => setOpenEditGroupChannel(false)}
              onEditGroupChannel={onEditGroupChannel}
              groupName={selectedGroup?.group_channel_name}
            />
          )}
          {openCreateChannel && (
            <ModalCreateChannel
              group={group}
              onCreateChannel={onCreateChannel}
              open={openCreateChannel}
              handleClose={() => setOpenCreateChannel(false)}
              initialGroup={initialGroup}
            />
          )}
          {isOpenInvite && (
            <ModalInviteMember
              open={isOpenInvite}
              handleClose={() => setOpenInvite(false)}
              onInvite={async (emails) => {
                const res = await api.invitation(
                  currentTeam.team_id,
                  emails.split(', ')
                );
                if (res.statusCode === 200) {
                  toast.success('Invitation sent');
                }
                setOpenInvite(false);
              }}
            />
          )}
          <ModalConfirmDeleteChannel
            open={isOpenConfirmDeleteChannel}
            handleClose={() => setOpenConfirmDeleteChannel(false)}
            channelName={channelDelete?.channel_name}
            onDelete={async () => {
              if (!channelDelete?.channel_id) return;
              await deleteChannel(channelDelete?.channel_id);
              setChannelDelete(null);
              setOpenConfirmDeleteChannel(false);
            }}
          />
          <ModalConfirmDeleteGroupChannel
            open={isOpenConfirmDeleteGroup}
            groupName={selectedGroup?.group_channel_name}
            handleClose={() => setOpenConfirmDeleteGroup(false)}
            onDelete={async () => {
              if (!selectedGroup?.group_channel_id) return;
              await deleteGroupChannel(selectedGroup?.group_channel_id);
              setSelectedGroup(null);
              setOpenConfirmDeleteGroup(false);
            }}
          />
        </div>
      </DragDropContext>
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
    group: state.user.groupChannel,
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
