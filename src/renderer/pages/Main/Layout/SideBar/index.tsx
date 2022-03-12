import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import './index.scss';
import images from '../../../../common/images';
import GroupTitle from './components/GroupTitle';
import MemberChild from './components/MemberChild';
import { connect } from 'react-redux';
import PopupMenuActions from './components/PopupMenuActions';
import Popover from '@material-ui/core/Popover';
import { createErrorMessageSelector } from '../../../../reducers/selectors';
import actionTypes from '../../../../actions/ActionTypes';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import GroupItem from './components/GroupItem';
import { useHistory } from 'react-router-dom';
import PopoverButton from '../../../../components/PopoverButton';
import {
  channelMenu,
  groupChannelMenu,
  memberMenu,
  privateChannelMenu,
} from '../../../../utils/Menu';
import ModalTeamSetting from '../../../../components/ModalTeamSetting';
import ModalConfirmDeleteTeam from '../../../../components/ModalConfirmDeleteTeam';

type SideBarProps = {
  team?: any;
  channel?: any;
  groupChannel?: any;
  currentChannel?: any;
  logout?: any;
  errorTeam?: any;
  userData?: any;
  teamUserData?: Array<any>;
  currentTeam?: any;
  onEditGroupChannel: (group: any) => void;
  onDeleteGroupChannel: (group: any) => void;
  onEditChannelName: (channel: any) => void;
  onDeleteChannel: (channel: any) => void;
  onEditChannelMember: (channel: any) => void;
  onInviteMember: () => void;
  onRemoveTeamMember: (user: any) => void;
  updateTeam: (teamId: string, body: any) => any;
  deleteTeam: (teamId: string) => any;
  findUser: () => any;
  findTeamAndChannel: () => any;
  onCreateChannel: (initGroup?: any) => void;
  onCreateGroupChannel: () => void;
};

const SideBar = forwardRef(
  (
    {
      team,
      channel,
      findTeamAndChannel,
      teamUserData,
      onCreateChannel,
      groupChannel,
      currentChannel,
      errorTeam,
      findUser,
      userData,
      logout,
      currentTeam,
      onCreateGroupChannel,
      onDeleteGroupChannel,
      onEditChannelName,
      onDeleteChannel,
      onEditChannelMember,
      onInviteMember,
      onEditGroupChannel,
      onRemoveTeamMember,
      updateTeam,
      deleteTeam,
    }: SideBarProps,
    ref
  ) => {
    const [openTeamSetting, setOpenTeamSetting] = useState(false);
    const [isCollapsed, setCollapsed] = useState(false);
    const [isOpenConfirmDeleteTeam, setOpenConfirmDeleteTeam] = useState(false);
    const toggleCollapsed = () => setCollapsed(!isCollapsed);
    const [selectedMenuChannel, setSelectedMenuChannel] = useState<any>(null);
    const [selectedMenuMember, setSelectedMenuMember] = useState<any>(null);
    const [
      selectedMenuGroupChannel,
      setSelectedMenuGroupChannel,
    ] = useState<any>(null);
    const bottomBodyRef = useRef<any>();
    const menuPrivateChannelRef = useRef<any>();
    const menuChannelRef = useRef<any>();
    const menuGroupChannelRef = useRef<any>();
    const menuMemberRef = useRef<any>();
    const history = useHistory();
    const [anchorPopupActions, setPopupActions] = useState(null);
    const openActions = Boolean(anchorPopupActions);
    const idPopupActions = openActions ? 'action-popover' : undefined;
    const role = teamUserData?.find?.((el) => el.user_id === userData?.user_id)
      ?.role;
    useEffect(() => {
      if (team == null && errorTeam === '') {
        findTeamAndChannel?.();
      }
    }, [team, errorTeam, findTeamAndChannel]);
    useEffect(() => {
      if (!userData) {
        findUser();
      }
    }, [userData, findUser]);
    const openPopupActions = (event: any) => {
      setPopupActions(event.currentTarget);
    };
    useImperativeHandle(ref, () => {
      return {
        scrollToBottom: () => {
          bottomBodyRef.current?.scrollIntoView?.({ behavior: 'smooth' });
        },
      };
    });
    const onSelectedMenu = (menu: any) => {
      switch (menu.value) {
        case 'Create channel': {
          onCreateChannel(selectedMenuGroupChannel);
          break;
        }
        case 'Create group channel': {
          onCreateGroupChannel();
          break;
        }
        case 'Edit group channel name': {
          onEditGroupChannel(selectedMenuGroupChannel);
          break;
        }
        case 'Delete group channel': {
          onDeleteGroupChannel(selectedMenuGroupChannel);
          break;
        }
        case 'Edit member': {
          onEditChannelMember(selectedMenuChannel);
          break;
        }
        case 'Edit channel name': {
          onEditChannelName(selectedMenuChannel);
          break;
        }
        case 'Delete channel': {
          onDeleteChannel(selectedMenuChannel);
          break;
        }
        case 'Remove member': {
          onRemoveTeamMember(selectedMenuMember);
          break;
        }
        default:
          break;
      }
      setSelectedMenuGroupChannel(null);
      setSelectedMenuChannel(null);
      setSelectedMenuMember(null);
    };
    const user = teamUserData?.find?.((u) => u.user_id === userData?.user_id);
    const onDeleteClick = () => {
      setOpenConfirmDeleteTeam(true);
    };
    const isOwner = role === 'Owner';
    return (
      <div id="sidebar">
        {team?.length > 0 ? (
          <div className={`sidebar-body ${isOwner && 'owner'}`}>
            {/* <div className="news-feed__container">
            <div className="border-news-feed">
              <div className="circle-news-feed" />
            </div>
            <span className="news-feed-text">NEWS FEED</span>
          </div> */}
            <Droppable droppableId="group-channel-container" isDropDisabled>
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {groupChannel.map((group: any, idx: number) => {
                      return (
                        <Draggable
                          key={group.group_channel_id}
                          draggableId={group.group_channel_id}
                          index={idx}
                          isDragDisabled
                        >
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <GroupItem
                                group={group}
                                channel={channel}
                                currentChannel={currentChannel}
                                onCreateChannel={onCreateChannel}
                                onContextGroupChannel={(e) => {
                                  setSelectedMenuGroupChannel(group);
                                  menuGroupChannelRef.current?.show(
                                    e.currentTarget,
                                    {
                                      x: e.pageX,
                                      y: e.pageY,
                                    }
                                  );
                                }}
                                onContextChannel={(e, c) => {
                                  setSelectedMenuChannel(c);
                                  if (c.channel_type === 'Public') {
                                    menuChannelRef.current?.show(
                                      e.currentTarget,
                                      {
                                        x: e.pageX,
                                        y: e.pageY,
                                      }
                                    );
                                  } else {
                                    menuPrivateChannelRef.current?.show(
                                      e.currentTarget,
                                      {
                                        x: e.pageX,
                                        y: e.pageY,
                                      }
                                    );
                                  }
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
            <div ref={bottomBodyRef} />
            <Droppable droppableId="member" isDropDisabled>
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <GroupTitle
                      title="MEMBER"
                      onCreateChannel={onInviteMember}
                      isCollapsed={isCollapsed}
                      toggleCollapsed={toggleCollapsed}
                    />
                    {!isCollapsed && (
                      <>
                        {user && (
                          <MemberChild
                            user={user}
                            isUnSeen={
                              channel.find(
                                (c: any) =>
                                  c?.channel_id === user.direct_channel
                              )?.seen === false
                            }
                            isSelected={
                              currentChannel?.channel_id ===
                                user.direct_channel ||
                              currentChannel?.user?.user_id === user.user_id
                            }
                            onPress={() => {
                              history.replace(`/home?user_id=${user.user_id}`);
                            }}
                          />
                        )}
                        {teamUserData
                          ?.filter?.((u) => u.user_id !== userData?.user_id)
                          ?.map?.((u) => (
                            <MemberChild
                              onContextChannel={(e) => {
                                setSelectedMenuMember(u);
                                menuMemberRef.current?.show(e.currentTarget, {
                                  x: e.pageX,
                                  y: e.pageY,
                                });
                              }}
                              user={u}
                              key={u.user_id}
                              isUnSeen={
                                channel.find(
                                  (c: any) => c?.channel_id === u.direct_channel
                                )?.seen === false
                              }
                              isSelected={
                                currentChannel?.channel_id ===
                                  u.direct_channel ||
                                currentChannel?.user?.user_id === u.user_id
                              }
                              onPress={() => {
                                history.replace(`/home?user_id=${u.user_id}`);
                              }}
                            />
                          ))}
                        <div
                          className="member-child-container normal-button"
                          onClick={onInviteMember}
                        >
                          <img
                            alt=""
                            src={images.icEditMember}
                            style={{ marginLeft: 30 }}
                          />
                          <span className="member-child__username ml10">
                            Invite member
                          </span>
                        </div>
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
        ) : (
          <div className={`sidebar-body ${isOwner && 'owner'}`} />
        )}
        {isOwner && (
          <div className="app-setting" onClick={() => setOpenTeamSetting(true)}>
            <img src={images.icSetting} alt="" />
            <div style={{ width: 8 }} />
            <span>Settings</span>
          </div>
        )}
        <ModalTeamSetting
          open={openTeamSetting}
          handleClose={() => setOpenTeamSetting(false)}
          team={currentTeam}
          updateTeam={updateTeam}
          onDeleteClick={onDeleteClick}
        />
        <PopoverButton
          popupOnly
          ref={menuGroupChannelRef}
          data={groupChannelMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuMemberRef}
          data={memberMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuChannelRef}
          data={channelMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <PopoverButton
          popupOnly
          ref={menuPrivateChannelRef}
          data={privateChannelMenu}
          onSelected={onSelectedMenu}
          onClose={() => {}}
        />
        <Popover
          elevation={0}
          id={idPopupActions}
          open={openActions}
          anchorEl={anchorPopupActions}
          onClose={() => setPopupActions(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <PopupMenuActions
            onCreateChannel={() => {
              setPopupActions(null);
              onCreateChannel();
            }}
            onLogout={() => logout?.()}
          />
        </Popover>
        <ModalConfirmDeleteTeam
          open={isOpenConfirmDeleteTeam}
          handleClose={() => setOpenConfirmDeleteTeam(false)}
          teamName={currentTeam?.team_display_name}
          onDelete={() => {
            deleteTeam(currentTeam?.team_id);
            setOpenConfirmDeleteTeam(false);
            setOpenTeamSetting(false);
          }}
        />
      </div>
    );
  }
);

const errorSelector = createErrorMessageSelector([actionTypes.TEAM_PREFIX]);

const mapStateToProps = (state: any) => {
  return {
    team: state.user.team,
    teamUserData: state.user.teamUserData,
    channel: state.user.channel,
    currentChannel: state.user.currentChannel,
    groupChannel: state.user.groupChannel,
    errorTeam: errorSelector(state),
    userData: state.user.userData,
    currentTeam: state.user.currentTeam,
  };
};

export default connect(mapStateToProps, undefined, null, {
  forwardRef: true,
})(SideBar);
