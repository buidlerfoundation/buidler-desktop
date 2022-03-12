import React, { useState } from 'react';
import NormalButton from '../NormalButton';
import Popover from '@material-ui/core/Popover';
import './index.scss';
import images from '../../common/images';
import GroupChannelPopup from '../GroupChannelPopup';
import AppInput from '../AppInput';

type CreateChannelViewProps = {
  onCancel: () => void;
  onCreate: () => void;
  channelData: any;
  update: (key: string, val: any) => void;
  group: Array<any>;
};

const CreateChannelView = ({
  onCancel,
  onCreate,
  channelData,
  update,
  group,
}: CreateChannelViewProps) => {
  const [anchorPopupGroupChannel, setPopupGroupChannel] = useState(null);
  const openGroupChannel = Boolean(anchorPopupGroupChannel);
  const idPopupGroupChannel = openGroupChannel
    ? 'group-channel-popover'
    : undefined;

  const openGroupChannelSelection = (event: any) => {
    setPopupGroupChannel(event.currentTarget);
  };

  return (
    <div className="create-channel-view__container">
      <span className="create-channel__title">Create channel</span>
      <div style={{ height: 35 }} />
      <AppInput
        className="app-input-highlight"
        placeholder="Enter channel name"
        onChange={(e) =>
          update('name', e.target.value.toLowerCase().replaceAll(' ', '-'))
        }
        value={channelData?.name}
        autoFocus
      />
      <div style={{ height: 10 }} />
      <div
        className="input-channel-item__container normal-button row__space-between"
        onClick={openGroupChannelSelection}
      >
        <span className="add-channel-group">
          {channelData?.group?.group_channel_name || 'Add Channel to Group'}
        </span>
        <img className="group-title__icon" alt="" src={images.icCollapse} />
      </div>
      <div style={{ height: 30 }} />
      <div className="row__center">
        <span className="private-channel">Private Channel</span>
        <div style={{ width: 15 }} />
        <div
          style={{ display: 'flex' }}
          onClick={() => {
            update('isPrivate', !channelData.isPrivate);
          }}
        >
          <img
            src={
              channelData.isPrivate ? images.icCheckMain : images.icCheckOutline
            }
            alt=""
          />
        </div>
      </div>
      <div className="channel__bottom">
        <NormalButton title="Cancel" onPress={onCancel} type="normal" />
        <div style={{ width: 10 }} />
        <NormalButton title="Create channel" onPress={onCreate} type="main" />
      </div>
      <Popover
        elevation={0}
        id={idPopupGroupChannel}
        open={openGroupChannel}
        anchorEl={anchorPopupGroupChannel}
        onClose={() => setPopupGroupChannel(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <GroupChannelPopup
          group={group}
          onSelect={(item) => {
            update('group', item);
            setPopupGroupChannel(null);
          }}
        />
      </Popover>
    </div>
  );
};

export default CreateChannelView;
