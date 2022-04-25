import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import './index.scss';
import TeamItem from './TeamItem';
import GlobalVariable from '../../services/GlobalVariable';
import images from '../../common/images';
import ModalTeam from '../ModalTeam';
import ModalUserSetting from '../ModalUserSetting';
import PopoverButton from '../PopoverButton';
import { clearData } from '../../common/Cookie';
import { useHistory, useLocation } from 'react-router-dom';
import ModalBackup from '../ModalBackup';

type AppTitleBarProps = {
  team?: Array<any>;
  currentTeam?: any;
  setCurrentTeam?: (team: any) => any;
  imgDomain?: string;
  channels?: Array<any>;
  createTeam?: (body: any) => any;
  leaveTeam?: (teamId: string) => any;
  userData?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  logout?: () => any;
  updateUser?: (userData: any) => any;
  privateKey?: string;
};

const AppTitleBar = ({
  team,
  currentTeam,
  setCurrentTeam,
  imgDomain,
  channels,
  createTeam,
  leaveTeam,
  userData,
  currentChannel,
  updateUserChannel,
  logout,
  updateUser,
  privateKey,
}: AppTitleBarProps) => {
  const history = useHistory();
  const location = useLocation();
  const teamMenu = [
    {
      label: 'Leave team',
      value: 'Leave team',
      icon: images.icLeaveTeam,
    },
  ];
  const menuTeamRef = useRef<any>();
  const [isFullscreen, setFullscreen] = useState(false);
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const [isOpenModalUser, setOpenModalUser] = useState(false);
  const [isOpenModalBackup, setOpenModalBackup] = useState(false);
  const [selectedMenuTeam, setSelectedMenuTeam] = useState<any>(null);
  const [hoverTeam, setHoverTeam] = useState(false);
  const setTeam = useCallback(
    (t: any) => {
      history.replace('/home');
      setCurrentTeam?.(t);
    },
    [setCurrentTeam, history]
  );
  useEffect(() => {
    const listener = (event: any) => {
      if (event.metaKey) {
        const { key } = event;
        const num = parseInt(key);
        if (
          !isNaN(num) &&
          typeof num === 'number' &&
          num <= (team?.length || 0)
        ) {
          if (currentTeam.team_id !== team?.[num - 1].team_id)
            setTeam(team?.[num - 1]);
        }
      }
    };
    const enterFullscreenListener = () => {
      setFullscreen(true);
    };
    const leaveFullscreenListener = () => {
      setFullscreen(false);
    };
    const windowFocusListener = () => {
      GlobalVariable.isWindowFocus = true;
    };
    const windowBlurListener = () => {
      GlobalVariable.isWindowFocus = false;
    };
    document.addEventListener('keydown', listener);
    ipcRenderer.on('enter-fullscreen', enterFullscreenListener);
    ipcRenderer.on('leave-fullscreen', leaveFullscreenListener);
    ipcRenderer.on('window-focus', windowFocusListener);
    ipcRenderer.on('window-blur', windowBlurListener);
    const unseenChannel = channels?.find?.((el) => !el.seen);
    console.log('Unseen channel: ', unseenChannel);
    if (unseenChannel) {
      ipcRenderer.send('show-badge', 'ping');
    } else {
      ipcRenderer.send('hide-badge', 'ping');
    }
    return () => {
      ipcRenderer.removeListener('enter-fullscreen', enterFullscreenListener);
      ipcRenderer.removeListener('leave-fullscreen', leaveFullscreenListener);
      ipcRenderer.removeListener('window-focus', windowFocusListener);
      ipcRenderer.removeListener('window-blur', windowBlurListener);
      document.removeEventListener('keydown', listener);
    };
  }, [team, setTeam, currentTeam, channels]);
  const onSelectedMenu = async (menu: any) => {
    switch (menu.value) {
      case 'Leave team': {
        const nextTeam =
          currentTeam.team_id === selectedMenuTeam.team_id
            ? team?.filter?.((el) => el.team_id !== currentTeam.team_id)?.[0]
            : null;
        const success = await leaveTeam?.(selectedMenuTeam.team_id);
        if (nextTeam && success) {
          setTeam(nextTeam);
        }
        break;
      }
      default:
        break;
    }
    setSelectedMenuTeam(null);
  };

  const onBackupPress = () => {
    setOpenModalUser(false);
    setOpenModalBackup(true);
  };

  if (!privateKey) {
    return (
      <div
        id="title-bar"
        className={location.pathname === '/unlock' ? 'hide' : ''}
      />
    );
  }
  return (
    <div id="title-bar">
      <div style={{ width: !isFullscreen ? 100 : 0 }} />
      <div
        className="list-team hide-scroll-bar"
        onMouseEnter={() => setHoverTeam(true)}
        onMouseLeave={() => setHoverTeam(false)}
      >
        {imgDomain &&
          team?.map?.((t) => {
            const isSelected = t.team_id === currentTeam.team_id;
            return (
              <TeamItem
                key={t.team_id}
                isSelected={isSelected}
                t={t}
                onChangeTeam={() => {
                  if (currentTeam.team_id !== t.team_id) setTeam(t);
                }}
                onContextMenu={(e) => {
                  setSelectedMenuTeam(t);
                  menuTeamRef.current?.show(e.currentTarget, {
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
              />
            );
          })}
        {hoverTeam && (
          <div
            className="normal-button create-team-button"
            onClick={() => setOpenModalTeam(true)}
          >
            <img alt="" src={images.icPlus} />
          </div>
        )}
      </div>
      {userData && (
        <div className="action-right">
          <div
            className="action-item normal-button"
            style={{ marginRight: 10 }}
            onClick={() => history.replace('/started')}
          >
            <img src={images.icSearch} alt="" />
          </div>
          <div
            className="action-item normal-button"
            onClick={() => setOpenModalUser(true)}
          >
            <img src={images.icUser} alt="" />
          </div>
        </div>
      )}
      <ModalTeam
        open={isOpenModalTeam}
        handleClose={() => setOpenModalTeam(false)}
        onCreateTeam={async (body) => {
          await createTeam?.({
            team_id: body.teamId,
            team_display_name: body.name,
            team_icon: body.teamIcon?.url,
          });
          setOpenModalTeam(false);
        }}
      />
      <ModalUserSetting
        open={isOpenModalUser}
        handleClose={() => setOpenModalUser(false)}
        user={userData}
        currentChannel={currentChannel}
        updateUserChannel={updateUserChannel}
        channels={channels}
        updateUser={updateUser}
        onLogout={() => {
          clearData(() => {
            setOpenModalUser(false);
            history.replace('/started');
            logout?.();
          });
        }}
        onBackupPress={onBackupPress}
      />
      <ModalBackup
        open={isOpenModalBackup}
        handleClose={() => setOpenModalBackup(false)}
      />
      <PopoverButton
        popupOnly
        ref={menuTeamRef}
        data={teamMenu}
        onSelected={onSelectedMenu}
        onClose={() => {}}
      />
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    team: state.user.team,
    currentTeam: state.user.currentTeam,
    imgDomain: state.user.imgDomain,
    channels: state.user.channel,
    userData: state.user.userData,
    currentChannel: state.user.currentChannel,
    privateKey: state.configs.privateKey,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(AppTitleBar);
